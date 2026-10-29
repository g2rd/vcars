import { createHash, randomBytes } from "node:crypto";

/** Losowy token sesji (256 bitów) trafiający do ciasteczka. */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** W bazie przechowujemy tylko hasz tokenu – wyciek bazy nie daje dostępu do sesji. */
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
