import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sessions, users } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/db";
import {
  createAuthService,
  LOCK_DURATION_MS,
  MAX_FAILED_LOGINS,
  SESSION_TTL_MS,
  type AuthService,
} from "./service";

const PASSWORD = "Hasło-Szefa-2026";

let db: Db;
let close: () => Promise<void>;
let now = new Date("2026-11-01T08:00:00.000Z");
let auth: AuthService;

const advance = (ms: number) => {
  now = new Date(now.getTime() + ms);
};

beforeAll(async () => {
  ({ db, close } = await createTestDb());
  auth = createAuthService(db, () => now);
  await auth.createUser({ email: "Szef@Vcars.example", name: "Szef", role: "owner", password: PASSWORD });
});

afterAll(() => close());

describe("konta", () => {
  it("zapisuje e-mail małymi literami i nie trzyma hasła jawnie", async () => {
    const [row] = await db.select().from(users);
    expect(row.email).toBe("szef@vcars.example");
    expect(row.passwordHash).not.toContain(PASSWORD);
    expect(row.role).toBe("owner");
  });

  it("odrzuca duplikat i zbyt słabe hasło", async () => {
    await expect(
      auth.createUser({ email: " SZEF@vcars.example ", name: "Inny", password: PASSWORD }),
    ).rejects.toThrow(/już istnieje/);
    await expect(
      auth.createUser({ email: "nowy@vcars.example", name: "Nowy", password: "krótkie" }),
    ).rejects.toThrow(/co najmniej/);
  });
});

describe("logowanie i sesje", () => {
  it("loguje poprawnymi danymi (bez względu na wielkość liter w e-mailu) i tworzy sesję", async () => {
    const result = await auth.login("SZEF@vcars.example", PASSWORD, "Vitest");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.user).toMatchObject({ email: "szef@vcars.example", role: "owner" });
    expect(result.expiresAt.getTime()).toBe(now.getTime() + SESSION_TTL_MS);

    // W bazie jest hasz tokenu, nie sam token.
    const stored = await db.select().from(sessions);
    expect(stored.some((s) => s.tokenHash === result.token)).toBe(false);

    expect(await auth.validateSession(result.token)).toMatchObject({ email: "szef@vcars.example" });
  });

  it("nie zdradza, czy konto istnieje: ten sam wynik dla złego hasła i nieznanego e-maila", async () => {
    expect(await auth.login("szef@vcars.example", "złe-hasło-123")).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(await auth.login("nikt@vcars.example", PASSWORD)).toEqual({ ok: false, reason: "invalid" });
  });

  it("unieważnia sesję po wygaśnięciu i po wylogowaniu", async () => {
    const login = await auth.login("szef@vcars.example", PASSWORD);
    if (!login.ok) throw new Error("logowanie powinno się udać");

    advance(SESSION_TTL_MS - 1000);
    expect(await auth.validateSession(login.token)).not.toBeNull();
    advance(2000);
    expect(await auth.validateSession(login.token)).toBeNull();

    const second = await auth.login("szef@vcars.example", PASSWORD);
    if (!second.ok) throw new Error("logowanie powinno się udać");
    await auth.logout(second.token);
    expect(await auth.validateSession(second.token)).toBeNull();
  });

  it("odrzuca nieznany token i konto wyłączone", async () => {
    expect(await auth.validateSession("zmyślony-token")).toBeNull();

    const login = await auth.login("szef@vcars.example", PASSWORD);
    if (!login.ok) throw new Error("logowanie powinno się udać");
    await db.update(users).set({ isActive: false }).where(eq(users.email, "szef@vcars.example"));
    expect(await auth.validateSession(login.token)).toBeNull();
    expect((await auth.login("szef@vcars.example", PASSWORD)).ok).toBe(false);
    await db.update(users).set({ isActive: true }).where(eq(users.email, "szef@vcars.example"));
  });
});

describe("blokada po nieudanych próbach", () => {
  it("blokuje konto na 15 minut po 5 błędach, a potem je odblokowuje", async () => {
    for (let i = 1; i < MAX_FAILED_LOGINS; i++) {
      expect(await auth.login("szef@vcars.example", "zle-haslo-xyz")).toEqual({
        ok: false,
        reason: "invalid",
      });
    }
    const fifth = await auth.login("szef@vcars.example", "zle-haslo-xyz");
    expect(fifth).toMatchObject({ ok: false, reason: "locked" });

    // Podczas blokady nawet poprawne hasło nie działa.
    expect(await auth.login("szef@vcars.example", PASSWORD)).toMatchObject({
      ok: false,
      reason: "locked",
    });

    advance(LOCK_DURATION_MS + 1000);
    expect((await auth.login("szef@vcars.example", PASSWORD)).ok).toBe(true);
  });

  it("zeruje licznik po udanym logowaniu", async () => {
    await auth.login("szef@vcars.example", "zle-haslo-xyz");
    await auth.login("szef@vcars.example", PASSWORD);
    const [row] = await db.select().from(users).where(eq(users.email, "szef@vcars.example"));
    expect(row.failedLoginCount).toBe(0);
    expect(row.lockedUntil).toBeNull();
  });
});

describe("zmiana hasła", () => {
  it("wymaga obecnego hasła, egzekwuje siłę i wylogowuje pozostałe sesje", async () => {
    const keep = await auth.login("szef@vcars.example", PASSWORD);
    const other = await auth.login("szef@vcars.example", PASSWORD);
    if (!keep.ok || !other.ok) throw new Error("logowanie powinno się udać");
    const user = keep.user;

    expect(await auth.changePassword(user.id, "nie-to-hasło", "NoweHasło-2027", keep.token)).toEqual({
      ok: false,
      error: "Obecne hasło jest nieprawidłowe.",
    });
    expect(await auth.changePassword(user.id, PASSWORD, "krótkie", keep.token)).toMatchObject({
      ok: false,
    });

    expect(await auth.changePassword(user.id, PASSWORD, "NoweHasło-2027", keep.token)).toEqual({ ok: true });
    expect(await auth.validateSession(keep.token)).not.toBeNull();
    expect(await auth.validateSession(other.token)).toBeNull();

    expect((await auth.login("szef@vcars.example", PASSWORD)).ok).toBe(false);
    expect((await auth.login("szef@vcars.example", "NoweHasło-2027")).ok).toBe(true);
  });
});
