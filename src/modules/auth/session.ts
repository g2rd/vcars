import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { env } from "@/lib/env";
import { ADMIN_PATH, LOGIN_PATH, SESSION_COOKIE } from "./constants";
import { createAuthService, SESSION_TTL_MS, type AuthService, type AuthUser } from "./service";

/** Panel działa wyłącznie z bazą danych (zapisy, konta, sesje). */
export function isAdminAvailable(): boolean {
  return Boolean(env.databaseUrl);
}

export async function getAuthService(): Promise<AuthService> {
  const { getDb } = await import("@/db/client");
  return createAuthService(getDb());
}

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: ADMIN_PATH,
    expires: expiresAt,
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE, path: ADMIN_PATH });
}

export async function readSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Bieżący użytkownik (albo `null`). `cache` z Reacta zapamiętuje wynik w obrębie
 * jednego żądania, więc layout, strona i akcje nie odpytują bazy wielokrotnie.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  if (!isAdminAvailable()) return null;
  const token = await readSessionToken();
  if (!token) return null;
  return (await getAuthService()).validateSession(token);
});

/**
 * Ochrona strony i Server Action: bez ważnej sesji przekierowuje na logowanie.
 * Wołamy ją blisko danych w KAŻDEJ stronie i akcji, a nie tylko w layoucie
 * (layout nie renderuje się ponownie przy nawigacji, więc nie jest barierą).
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_PATH);
  return user;
}

/** Operacje zarezerwowane dla szefa (np. usuwanie aut). */
export async function requireOwner(): Promise<AuthUser> {
  const user = await requireUser();
  if (user.role !== "owner") redirect(ADMIN_PATH);
  return user;
}
