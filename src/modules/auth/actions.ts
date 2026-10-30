"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { formError, formSuccess, type AdminFormState } from "@/modules/admin/form-state";
import { ADMIN_PATH, LOGIN_PATH } from "./constants";
import {
  clearSessionCookie,
  getAuthService,
  isAdminAvailable,
  readSessionToken,
  requireUser,
  setSessionCookie,
} from "./session";

const loginSchema = z.object({
  email: z.email({ error: "Podaj poprawny adres e-mail." }),
  password: z.string({ error: "Podaj hasło." }).min(1, "Podaj hasło."),
});

/** Przekierowanie po zalogowaniu tylko w obrębie panelu (ochrona przed open redirect). */
function safeNext(next: unknown): string {
  if (typeof next !== "string") return ADMIN_PATH;
  if (!next.startsWith(`${ADMIN_PATH}/`) && next !== ADMIN_PATH) return ADMIN_PATH;
  if (next.startsWith("//") || next.startsWith(LOGIN_PATH)) return ADMIN_PATH;
  return next;
}

function formatRetry(retryAt: Date): string {
  return retryAt.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Warsaw",
  });
}

export async function loginAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!isAdminAvailable()) {
    return formError("Panel wymaga bazy danych. Ustaw DATABASE_URL (zob. README).");
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return formError("Sprawdź dane logowania.", z.flattenError(parsed.error).fieldErrors, {
      email: String(formData.get("email") ?? ""),
    });
  }

  const userAgent = (await headers()).get("user-agent") ?? undefined;
  const result = await (await getAuthService()).login(
    parsed.data.email,
    parsed.data.password,
    userAgent,
  );

  if (!result.ok) {
    const values = { email: parsed.data.email };
    if (result.reason === "locked") {
      return formError(
        `Zbyt wiele nieudanych prób. Konto jest zablokowane do ${formatRetry(result.retryAt)}.`,
        undefined,
        values,
      );
    }
    // Ten sam komunikat dla złego hasła i nieznanego e-maila.
    return formError("Nieprawidłowy e-mail lub hasło.", undefined, values);
  }

  await setSessionCookie(result.token, result.expiresAt);
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  const token = await readSessionToken();
  if (token) await (await getAuthService()).logout(token);
  await clearSessionCookie();
  redirect(LOGIN_PATH);
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Podaj obecne hasło."),
    next: z.string().min(1, "Podaj nowe hasło."),
    confirm: z.string().min(1, "Powtórz nowe hasło."),
  })
  .refine((v) => v.next === v.confirm, {
    path: ["confirm"],
    message: "Hasła nie są takie same.",
  });

export async function changePasswordAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formError("Sprawdź zaznaczone pola.", z.flattenError(parsed.error).fieldErrors);
  }

  const result = await (await getAuthService()).changePassword(
    user.id,
    parsed.data.current,
    parsed.data.next,
    (await readSessionToken()) ?? undefined,
  );
  if (!result.ok) return formError(result.error, { current: [result.error] });

  return formSuccess("Hasło zmienione. Pozostałe urządzenia zostały wylogowane.");
}
