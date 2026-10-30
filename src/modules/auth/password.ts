import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

/**
 * Hasła haszujemy scryptem z biblioteki standardowej Node (bez zależności).
 * Parametry są zapisane w haszu, więc można je podnieść bez unieważniania
 * istniejących haseł. Format: `scrypt$N$r$p$sól(base64)$hasz(base64)`.
 */
const N = 2 ** 16;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const MAX_MEMORY = 256 * 1024 * 1024;

function derive(password: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(
      password.normalize("NFKC"),
      salt,
      KEY_LENGTH,
      { N: n, r, p, maxmem: MAX_MEMORY },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P);
  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !n || !r || !p || !salt || !hash) return false;

  const expected = Buffer.from(hash, "base64");
  const actual = await derive(password, Buffer.from(salt, "base64"), Number(n), Number(r), Number(p));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

let dummyHash: Promise<string> | undefined;

/**
 * Hasz „na niby" do porównania, gdy konto nie istnieje – dzięki temu czas
 * odpowiedzi nie zdradza, czy dany e-mail jest zarejestrowany.
 */
export function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword("nieistniejące-konto");
  return dummyHash;
}

export const MIN_PASSWORD_LENGTH = 10;

/** Zwraca komunikat błędu albo `null`, gdy hasło spełnia wymagania. */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`;
  }
  if (password.length > 200) return "Hasło jest zbyt długie.";
  if (new Set(password).size < 5) return "Hasło jest zbyt proste – użyj różnych znaków.";
  return null;
}

const PASSWORD_ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Losowe hasło bez znaków łatwych do pomylenia (0/O, 1/l/I). */
export function generatePassword(length = 16): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length]).join("");
}
