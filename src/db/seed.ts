/**
 * `npm run db:seed` – wgrywa dane demo do bazy z DATABASE_URL.
 * Na produkcji wymaga flagi `--force`, bo zastępuje katalog floty.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { seedDatabase } from "./seed-lib";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Brak DATABASE_URL. Skopiuj .env.example do .env.local i uzupełnij.");
    process.exit(1);
  }
  if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) {
    console.error("NODE_ENV=production: seed nadpisze katalog floty. Dodaj --force, jeśli to zamierzone.");
    process.exit(1);
  }

  const client = postgres(url, { max: 1 });
  try {
    const result = await seedDatabase(drizzle(client, { schema }));
    console.info(`Gotowe: ${result.categories} kategorii, ${result.vehicles} pojazdów.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
