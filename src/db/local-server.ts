/**
 * `npm run db:local` – lokalny Postgres bez Dockera (pakiet embedded-postgres).
 *
 * Uruchamia prawdziwy serwer Postgres na porcie 5433 z danymi w `.data/postgres`,
 * stosuje migracje z `drizzle/` i – przy pustej bazie – wgrywa dane demo.
 * Zostaw to okno otwarte na czas pracy; Ctrl+C zatrzymuje bazę (dane zostają).
 *
 * Tylko do rozwoju. Na produkcji użyj zarządzanego Postgresa (DATABASE_URL).
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import EmbeddedPostgres from "embedded-postgres";
import postgres from "postgres";
import { createAuthService } from "../modules/auth/service";
import { DEMO_ADMIN } from "./demo-credentials";
import * as schema from "./schema";
import { seedDatabase } from "./seed-lib";

const PORT = Number(process.env.LOCAL_DB_PORT ?? 5433);
const USER = "vcars";
const PASSWORD = "vcars";
const DATABASE = "vcars";
const DATA_DIR = path.resolve(".data", "postgres");
export const LOCAL_DATABASE_URL = `postgres://${USER}:${PASSWORD}@localhost:${PORT}/${DATABASE}`;

const server = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: USER,
  password: PASSWORD,
  port: PORT,
  persistent: true,
  // Bez tego initdb bierze locale Windows (np. WIN1250) i baza odrzuca znaki spoza strony kodowej.
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

async function main() {
  const firstRun = !existsSync(path.join(DATA_DIR, "PG_VERSION"));
  if (firstRun) {
    console.info("Inicjalizacja bazy w", DATA_DIR);
    await server.initialise();
  }
  await server.start();

  if (firstRun) await server.createDatabase(DATABASE);

  const client = postgres(LOCAL_DATABASE_URL, { max: 1 });
  try {
    const db = drizzle(client, { schema });
    await migrate(db, { migrationsFolder: path.resolve("drizzle") });

    const [{ count }] = await client<{ count: number }[]>`SELECT count(*)::int AS count FROM vehicles`;
    if (count === 0) {
      const seeded = await seedDatabase(db);
      console.info(`Wgrano dane demo: ${seeded.vehicles} aut w ${seeded.categories} kategoriach.`);
    }

    // Lokalne konto szefa do wypróbowania panelu (dane w demo-credentials.ts).
    const auth = createAuthService(db);
    if ((await auth.countUsers()) === 0) {
      await auth.createUser({ ...DEMO_ADMIN, role: "owner" });
      console.info(`Założono konto demo panelu: ${DEMO_ADMIN.email} (hasło w src/db/demo-credentials.ts).`);
    }
  } finally {
    await client.end();
  }

  console.info(`\nPostgres działa: ${LOCAL_DATABASE_URL}`);
  console.info("Ustaw tę wartość jako DATABASE_URL w .env.local. Ctrl+C zatrzymuje bazę.\n");

  const shutdown = async () => {
    console.info("\nZatrzymywanie bazy…");
    await server.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch(async (error) => {
  console.error(error);
  await server.stop().catch(() => undefined);
  process.exit(1);
});
