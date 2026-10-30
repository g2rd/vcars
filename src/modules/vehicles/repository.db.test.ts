import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as schema from "@/db/schema";
import { seedDatabase } from "@/db/seed-lib";
import type { Db } from "@/db/types";
import { createDbInquiryRepository } from "@/modules/inquiries/repository";
import { demoCategories, demoVehicles } from "./demo-data";
import { createDbVehicleRepository } from "./repository.db";
import { createStaticVehicleRepository } from "./repository.static";

/**
 * Test integracyjny na prawdziwym Postgresie (PGlite, w pamięci – bez Dockera):
 * stosuje wygenerowane migracje, wgrywa seed i sprawdza, że repozytorium DB
 * zwraca dokładnie to samo, co tryb demo.
 */
let client: PGlite;
let db: Db;

beforeAll(async () => {
  client = new PGlite();
  const pglite = drizzle(client, { schema });
  await migrate(pglite, {
    migrationsFolder: fileURLToPath(new URL("../../../drizzle", import.meta.url)),
  });
  db = pglite as unknown as Db;
  await seedDatabase(db);
});

afterAll(async () => {
  await client.close();
});

describe("repozytorium Postgres", () => {
  it("zwraca te same kategorie co tryb demo", async () => {
    const fromDb = await createDbVehicleRepository(db).listCategories();
    const fromDemo = await createStaticVehicleRepository().listCategories();
    expect(fromDb).toEqual(fromDemo);
    expect(fromDb).toHaveLength(demoCategories.length);
  });

  it("zwraca te same pojazdy co tryb demo (progi, wymiary, daty)", async () => {
    const fromDb = await createDbVehicleRepository(db).listVehicles();
    const fromDemo = await createStaticVehicleRepository().listVehicles();
    expect(fromDb).toEqual(fromDemo);
    expect(fromDb).toHaveLength(demoVehicles.length);
  });

  it("pomija pojazdy nieopublikowane", async () => {
    await client.query("UPDATE vehicles SET is_published = false WHERE slug = $1", [
      demoVehicles[0].slug,
    ]);
    const visible = await createDbVehicleRepository(db).listVehicles();
    expect(visible.map((v) => v.slug)).not.toContain(demoVehicles[0].slug);
    await client.query("UPDATE vehicles SET is_published = true WHERE slug = $1", [
      demoVehicles[0].slug,
    ]);
  });

  it("zapisuje zapytanie powiązane z autem i przeżywa ponowny seed", async () => {
    const repo = createDbInquiryRepository(db);
    const created = await repo.create({
      vehicleSlug: demoVehicles[2].slug,
      name: "Jan Kowalski",
      email: "jan@example.com",
      phone: "+48 500 111 222",
      startDate: "2026-11-10",
      endDate: "2026-11-12",
      consentAt: new Date(),
    });
    expect(created.persisted).toBe(true);

    const [row] = (
      await client.query<{ vehicle_id: string | null; status: string }>(
        "SELECT vehicle_id, status FROM inquiries WHERE id = $1",
        [created.id],
      )
    ).rows;
    expect(row.vehicle_id).toBe(demoVehicles[2].id);
    expect(row.status).toBe("new");

    await seedDatabase(db);
    const after = await client.query("SELECT 1 FROM inquiries WHERE id = $1", [created.id]);
    expect(after.rows).toHaveLength(1);
  });

  it("zapisuje zapytanie bez auta (np. z formularza kontaktowego)", async () => {
    const created = await createDbInquiryRepository(db).create({
      name: "Anna Nowak",
      email: "anna@example.com",
      phone: "500111222",
      consentAt: new Date(),
    });
    expect(created.persisted).toBe(true);
  });
});
