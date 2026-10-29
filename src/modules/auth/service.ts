import { and, eq, gt, lt, ne } from "drizzle-orm";
import { sessions, users } from "@/db/schema";
import type { Db } from "@/db/types";
import { getDummyHash, hashPassword, validatePasswordStrength, verifyPassword } from "./password";
import { generateSessionToken, hashSessionToken } from "./token";

export type UserRole = "owner" | "staff";

/** Dane użytkownika dostępne w aplikacji – bez hasza i liczników blokady. */
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000;
export const MAX_FAILED_LOGINS = 5;
export const LOCK_DURATION_MS = 15 * 60 * 1000;

export type LoginResult =
  | { ok: true; token: string; expiresAt: Date; user: AuthUser }
  | { ok: false; reason: "invalid" }
  | { ok: false; reason: "locked"; retryAt: Date };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Logika uwierzytelniania niezależna od Next.js: baza i zegar są wstrzykiwane,
 * dzięki czemu całość testujemy na PGlite bez uruchamiania aplikacji.
 */
export function createAuthService(db: Db, clock: () => Date = () => new Date()) {
  return {
    async createUser(input: {
      email: string;
      name: string;
      role?: UserRole;
      password: string;
    }): Promise<AuthUser> {
      const weakness = validatePasswordStrength(input.password);
      if (weakness) throw new Error(weakness);

      const email = normalizeEmail(input.email);
      const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
      if (existing) throw new Error("Konto z tym adresem e-mail już istnieje.");

      const [row] = await db
        .insert(users)
        .values({
          email,
          name: input.name.trim(),
          role: input.role ?? "staff",
          passwordHash: await hashPassword(input.password),
        })
        .returning({ id: users.id, email: users.email, name: users.name, role: users.role });
      return row;
    },

    async countUsers(): Promise<number> {
      const rows = await db.select({ id: users.id }).from(users);
      return rows.length;
    },

    async login(email: string, password: string, userAgent?: string): Promise<LoginResult> {
      const now = clock();
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizeEmail(email)))
        .limit(1);

      if (!user || !user.isActive) {
        // Porównanie z hashem „na niby" wyrównuje czas odpowiedzi.
        await verifyPassword(password, await getDummyHash());
        return { ok: false, reason: "invalid" };
      }

      if (user.lockedUntil && user.lockedUntil > now) {
        return { ok: false, reason: "locked", retryAt: user.lockedUntil };
      }

      if (!(await verifyPassword(password, user.passwordHash))) {
        // Po wygaśnięciu blokady licznik startuje od zera.
        const previous = user.lockedUntil && user.lockedUntil <= now ? 0 : user.failedLoginCount;
        const failed = previous + 1;
        const lockedUntil = failed >= MAX_FAILED_LOGINS ? new Date(now.getTime() + LOCK_DURATION_MS) : null;

        await db
          .update(users)
          .set({ failedLoginCount: lockedUntil ? 0 : failed, lockedUntil })
          .where(eq(users.id, user.id));

        return lockedUntil
          ? { ok: false, reason: "locked", retryAt: lockedUntil }
          : { ok: false, reason: "invalid" };
      }

      const token = generateSessionToken();
      const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
      await db.insert(sessions).values({
        userId: user.id,
        tokenHash: hashSessionToken(token),
        expiresAt,
        userAgent: userAgent?.slice(0, 300) ?? null,
      });
      await db
        .update(users)
        .set({ failedLoginCount: 0, lockedUntil: null, lastLoginAt: now })
        .where(eq(users.id, user.id));

      return {
        ok: true,
        token,
        expiresAt,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      };
    },

    /** Zwraca użytkownika dla ważnej sesji albo `null`. */
    async validateSession(token: string): Promise<AuthUser | null> {
      const [row] = await db
        .select({ id: users.id, email: users.email, name: users.name, role: users.role, active: users.isActive })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(and(eq(sessions.tokenHash, hashSessionToken(token)), gt(sessions.expiresAt, clock())))
        .limit(1);

      if (!row || !row.active) return null;
      return { id: row.id, email: row.email, name: row.name, role: row.role };
    },

    async logout(token: string): Promise<void> {
      await db.delete(sessions).where(eq(sessions.tokenHash, hashSessionToken(token)));
    },

    /** Zmienia hasło i wylogowuje wszystkie inne sesje tego użytkownika. */
    async changePassword(
      userId: string,
      currentPassword: string,
      newPassword: string,
      keepToken?: string,
    ): Promise<{ ok: true } | { ok: false; error: string }> {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
        return { ok: false, error: "Obecne hasło jest nieprawidłowe." };
      }
      const weakness = validatePasswordStrength(newPassword);
      if (weakness) return { ok: false, error: weakness };

      await db
        .update(users)
        .set({ passwordHash: await hashPassword(newPassword) })
        .where(eq(users.id, userId));

      await db
        .delete(sessions)
        .where(
          keepToken
            ? and(eq(sessions.userId, userId), ne(sessions.tokenHash, hashSessionToken(keepToken)))
            : eq(sessions.userId, userId),
        );
      return { ok: true };
    },

    async purgeExpiredSessions(): Promise<void> {
      await db.delete(sessions).where(lt(sessions.expiresAt, clock()));
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
