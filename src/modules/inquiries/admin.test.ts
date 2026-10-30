import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { seedDatabase } from "@/db/seed-lib";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/db";
import { countInquiriesByStatus, listInquiries, setInquiryStatus } from "./admin";
import { createDbInquiryRepository } from "./repository";

let db: Db;
let close: () => Promise<void>;
const ids: string[] = [];

beforeAll(async () => {
  ({ db, close } = await createTestDb());
  await seedDatabase(db);

  const repo = createDbInquiryRepository(db);
  const base = { email: "klient@example.com", phone: "+48 500 111 222", consentAt: new Date() };
  // Kolejność tworzenia = kolejność w czasie; lista ma pokazywać najnowsze pierwsze.
  for (const input of [
    { ...base, name: "Anna Nowak", vehicleSlug: "ford-transit-custom-l2h1", startDate: "2026-11-10", endDate: "2026-11-12", message: "Potrzebuję na przeprowadzkę." },
    { ...base, name: "Piotr Wiśniewski" },
    { ...base, name: "Ewa Zielińska", vehicleSlug: "fiat-ducato-l3h2" },
  ]) {
    ids.push((await repo.create(input)).id);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
});

afterAll(() => close());

describe("skrzynka zapytań", () => {
  it("listuje od najnowszych i dołącza auto, na które pytał klient", async () => {
    const list = await listInquiries(db);
    expect(list.map((i) => i.name)).toEqual(["Ewa Zielińska", "Piotr Wiśniewski", "Anna Nowak"]);

    const anna = list.find((i) => i.name === "Anna Nowak")!;
    expect(anna).toMatchObject({
      status: "new",
      startDate: "2026-11-10",
      endDate: "2026-11-12",
      message: "Potrzebuję na przeprowadzkę.",
      vehicle: { slug: "ford-transit-custom-l2h1", name: "Ford Transit Custom L2H1" },
    });
    expect(list.find((i) => i.name === "Piotr Wiśniewski")?.vehicle).toBeNull();
  });

  it("zmienia status zapytania i zlicza je według statusów", async () => {
    expect(await countInquiriesByStatus(db)).toEqual({ new: 3, contacted: 0, closed: 0 });

    expect(await setInquiryStatus(db, ids[0], "contacted")).toBe(true);
    expect(await setInquiryStatus(db, ids[1], "closed")).toBe(true);
    expect(await countInquiriesByStatus(db)).toEqual({ new: 1, contacted: 1, closed: 1 });

    expect((await listInquiries(db, { status: "contacted" })).map((i) => i.name)).toEqual(["Anna Nowak"]);
    expect((await listInquiries(db, { status: "new" })).map((i) => i.name)).toEqual(["Ewa Zielińska"]);
  });

  it("zwraca false dla nieistniejącego zapytania i respektuje limit", async () => {
    expect(await setInquiryStatus(db, "00000000-0000-4000-8000-00000000dead", "closed")).toBe(false);
    expect(await listInquiries(db, { limit: 2 })).toHaveLength(2);
  });
});
