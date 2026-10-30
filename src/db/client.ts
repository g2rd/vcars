import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";
import type { Db } from "./types";

// Moduł jest przeładowywany przy HMR w trybie dev – trzymamy pulę na `globalThis`,
// żeby każde odświeżenie nie otwierało nowych połączeń do bazy.
const globalForDb = globalThis as unknown as { __vcarsDb?: Db };

/** Leniwie otwiera pulę połączeń; rzuca, gdy nie ustawiono DATABASE_URL. */
export function getDb(): Db {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL nie jest ustawiony – aplikacja działa w trybie demo.");
  }
  globalForDb.__vcarsDb ??= drizzle(postgres(env.databaseUrl, { max: 10 }), { schema });
  return globalForDb.__vcarsDb;
}
