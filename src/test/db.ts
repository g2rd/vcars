import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "@/db/schema";
import type { Db } from "@/db/types";

/**
 * Świeża baza Postgres w pamięci (PGlite) z zastosowanymi migracjami –
 * bez Dockera i bez żadnej konfiguracji.
 */
export async function createTestDb(): Promise<{ db: Db; close: () => Promise<void> }> {
  const client = new PGlite();
  const pglite = drizzle(client, { schema });
  await migrate(pglite, {
    migrationsFolder: fileURLToPath(new URL("../../drizzle", import.meta.url)),
  });
  return { db: pglite as unknown as Db, close: () => client.close() };
}
