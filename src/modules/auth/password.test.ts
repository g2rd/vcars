import { describe, expect, it } from "vitest";
import {
  generatePassword,
  hashPassword,
  MIN_PASSWORD_LENGTH,
  validatePasswordStrength,
  verifyPassword,
} from "./password";
import { generateSessionToken, hashSessionToken } from "./token";

describe("hasła", () => {
  it("haszuje z solą i poprawnie weryfikuje", async () => {
    const hash = await hashPassword("Mocne-hasło-123");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("Mocne-hasło-123", hash)).toBe(true);
    expect(await verifyPassword("Mocne-hasło-124", hash)).toBe(false);
    // Ta sama treść daje inny hasz (losowa sól).
    expect(await hashPassword("Mocne-hasło-123")).not.toBe(hash);
  });

  it("odrzuca uszkodzony lub obcy format hasza zamiast rzucać błąd", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "bcrypt$10$abc")).toBe(false);
    expect(await verifyPassword("x", "scrypt$1$2")).toBe(false);
  });

  it("wymusza minimalną siłę hasła", () => {
    expect(validatePasswordStrength("krótkie")).toMatch(/co najmniej/);
    expect(validatePasswordStrength("aaaaaaaaaaaa")).toMatch(/zbyt proste/);
    expect(validatePasswordStrength("a".repeat(201))).toMatch(/zbyt długie/);
    expect(validatePasswordStrength("DobreHasło2026")).toBeNull();
  });

  it("generuje losowe hasła spełniające wymagania", () => {
    const first = generatePassword();
    expect(first).toHaveLength(16);
    expect(first.length).toBeGreaterThanOrEqual(MIN_PASSWORD_LENGTH);
    expect(first).not.toBe(generatePassword());
    expect(validatePasswordStrength(first)).toBeNull();
  });
});

describe("tokeny sesji", () => {
  it("są losowe, a w bazie ląduje tylko ich hasz", () => {
    const token = generateSessionToken();
    expect(token.length).toBeGreaterThanOrEqual(43);
    expect(token).not.toBe(generateSessionToken());
    const hash = hashSessionToken(token);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain(token);
    expect(hashSessionToken(token)).toBe(hash);
  });
});
