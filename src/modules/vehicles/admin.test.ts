import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { inquiries, vehicleImages, vehiclePriceTiers, vehicles } from "@/db/schema";
import { seedDatabase } from "@/db/seed-lib";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/db";
import { createDbInquiryRepository } from "@/modules/inquiries/repository";
import {
  addVehicleImage,
  categoryExists,
  createVehicle,
  deleteVehicle,
  getAdminVehicle,
  getFleetStats,
  isSlugTaken,
  listAdminVehicles,
  listCategoryOptions,
  moveVehicleImage,
  removeVehicleImage,
  setVehicleFlags,
  updateVehicle,
  updateVehicleImageAlt,
  type VehicleInput,
} from "./admin";
import { demoCategories, demoVehicles } from "./demo-data";
import { createDbVehicleRepository } from "./repository.db";

let db: Db;
let close: () => Promise<void>;

const FURGON = demoCategories.find((c) => c.slug === "furgon")!;

const newVehicle = (overrides: Partial<VehicleInput> = {}): VehicleInput => ({
  slug: "ford-transit-courier-l1",
  categoryId: FURGON.id,
  make: "Ford",
  model: "Transit Courier",
  variant: "L1",
  year: 2024,
  summary: "Mały i zwrotny van do miasta.",
  description: ["Pierwszy akapit.", "Drugi akapit."],
  idealFor: ["Dostawy w mieście"],
  features: ["Klimatyzacja", "Bluetooth i USB"],
  payloadKg: 700,
  grossWeightKg: 2300,
  cargoVolumeM3: 2.9,
  cargo: { lengthMm: 1900, widthMm: 1500, heightMm: 1200 },
  seats: 2,
  fuel: "diesel",
  gearbox: "manual",
  licenseCategory: "B",
  bodyType: "compact",
  palette: "teal",
  priceTiers: [
    { minDays: 1, pricePerDayNet: 14900 },
    { minDays: 4, pricePerDayNet: 12900 },
  ],
  kmLimitPerDay: 250,
  extraKmPriceGrosze: 60,
  depositGrosze: 150000,
  status: "available",
  isPublished: true,
  seoTitle: null,
  seoDescription: null,
  sortOrder: 20,
  ...overrides,
});

beforeAll(async () => {
  ({ db, close } = await createTestDb());
  await seedDatabase(db);
});

afterAll(() => close());

describe("lista i statystyki floty", () => {
  it("listuje wszystkie auta z najniższą ceną, kategorią i zdjęciem", async () => {
    const list = await listAdminVehicles(db);
    expect(list).toHaveLength(demoVehicles.length);
    const transit = list.find((v) => v.slug === "ford-transit-custom-l2h1")!;
    expect(transit).toMatchObject({
      name: "Ford Transit Custom L2H1",
      categoryName: "Furgony",
      fromNetGrosze: 17500,
      isPublished: true,
      status: "available",
    });
    expect(transit.photo?.url).toBe("/vehicles/ford-transit-custom-l2h1.jpg");
  });

  it("wyszukuje po marce, modelu i wersji bez względu na wielkość liter", async () => {
    expect((await listAdminVehicles(db, { query: "TRANSIT" })).map((v) => v.slug)).toEqual([
      "ford-transit-custom-l2h1",
    ]);
    expect(await listAdminVehicles(db, { query: "l3h2" })).toHaveLength(2);
    expect(await listAdminVehicles(db, { query: "nie-ma-takiego" })).toHaveLength(0);
  });

  it("traktuje znaki specjalne w wyszukiwaniu dosłownie (bez wildcardów SQL)", async () => {
    expect(await listAdminVehicles(db, { query: "%" })).toHaveLength(0);
    expect(await listAdminVehicles(db, { query: "_" })).toHaveLength(0);
  });

  it("zlicza auta widoczne, ukryte i niedostępne oraz filtruje po nich", async () => {
    const slug = "opel-vivaro-l2";
    const [vivaro] = await db.select({ id: vehicles.id }).from(vehicles).where(eq(vehicles.slug, slug));
    await setVehicleFlags(db, vivaro.id, { isPublished: false });
    await setVehicleFlags(db, vivaro.id, { status: "unavailable" });

    const stats = await getFleetStats(db);
    expect(stats).toEqual({
      total: demoVehicles.length,
      visible: demoVehicles.length - 1,
      hidden: 1,
      unavailable: 1,
    });
    expect((await listAdminVehicles(db, { filter: "hidden" })).map((v) => v.slug)).toEqual([slug]);
    expect((await listAdminVehicles(db, { filter: "unavailable" })).map((v) => v.slug)).toEqual([slug]);
    expect(await listAdminVehicles(db, { filter: "visible" })).toHaveLength(demoVehicles.length - 1);

    // Ukryte auto znika z publicznej oferty – to widzi klient na stronie.
    const publicSlugs = (await createDbVehicleRepository(db).listVehicles()).map((v) => v.slug);
    expect(publicSlugs).not.toContain(slug);

    await setVehicleFlags(db, vivaro.id, { isPublished: true, status: "available" });
  });
});

describe("dodawanie, edycja i usuwanie auta", () => {
  it("zapisuje nowe auto z progami cenowymi i odczytuje je w tej samej postaci", async () => {
    const input = newVehicle();
    const created = await createVehicle(db, input);

    const stored = await getAdminVehicle(db, created.id);
    expect(stored).toMatchObject({ ...input, id: created.id, images: [] });
    expect(await isSlugTaken(db, input.slug)).toBe(true);
    expect(await isSlugTaken(db, input.slug, created.id)).toBe(false);

    // Nowe auto od razu trafia do publicznej oferty.
    const publicVehicle = (await createDbVehicleRepository(db).listVehicles()).find(
      (v) => v.slug === input.slug,
    );
    expect(publicVehicle?.priceTiers).toEqual(input.priceTiers);
  });

  it("aktualizuje pola i zastępuje progi cenowe, zwracając stary i nowy slug", async () => {
    const created = await createVehicle(db, newVehicle({ slug: "auto-do-edycji", model: "Do edycji" }));
    const result = await updateVehicle(
      db,
      created.id,
      newVehicle({
        slug: "auto-po-edycji",
        model: "Po edycji",
        status: "unavailable",
        priceTiers: [{ minDays: 1, pricePerDayNet: 19900 }],
        sortOrder: 5,
      }),
    );
    expect(result).toEqual({ previousSlug: "auto-do-edycji", slug: "auto-po-edycji" });

    const stored = await getAdminVehicle(db, created.id);
    expect(stored).toMatchObject({
      slug: "auto-po-edycji",
      model: "Po edycji",
      status: "unavailable",
      sortOrder: 5,
      priceTiers: [{ minDays: 1, pricePerDayNet: 19900 }],
    });
    const tiers = await db.select().from(vehiclePriceTiers).where(eq(vehiclePriceTiers.vehicleId, created.id));
    expect(tiers).toHaveLength(1);

    expect(await updateVehicle(db, "00000000-0000-4000-8000-00000000dead", newVehicle())).toBeNull();
  });

  it("nie pozwala na duplikat adresu URL (ograniczenie w bazie)", async () => {
    await expect(createVehicle(db, newVehicle({ slug: "ford-transit-courier-l1" }))).rejects.toThrow();
  });

  it("usuwa auto razem z cennikiem i zdjęciami, a zapytania klientów zostają", async () => {
    const created = await createVehicle(db, newVehicle({ slug: "auto-do-usuniecia", model: "Do usunięcia" }));
    await addVehicleImage(db, created.id, { url: "/media/vehicles/x.jpg", alt: "Zdjęcie", width: 1600, height: 1000 });
    const inquiry = await createDbInquiryRepository(db).create({
      vehicleSlug: "auto-do-usuniecia",
      name: "Jan Kowalski",
      email: "jan@example.com",
      phone: "500111222",
      consentAt: new Date(),
    });

    const removed = await deleteVehicle(db, created.id);
    expect(removed).toEqual({ slug: "auto-do-usuniecia", imageUrls: ["/media/vehicles/x.jpg"] });

    expect(await getAdminVehicle(db, created.id)).toBeNull();
    expect(await db.select().from(vehiclePriceTiers).where(eq(vehiclePriceTiers.vehicleId, created.id))).toHaveLength(0);
    expect(await db.select().from(vehicleImages).where(eq(vehicleImages.vehicleId, created.id))).toHaveLength(0);

    const [kept] = await db.select().from(inquiries).where(eq(inquiries.id, inquiry.id));
    expect(kept.vehicleId).toBeNull();

    expect(await deleteVehicle(db, created.id)).toBeNull();
  });

  it("sprawdza istnienie kategorii i zwraca listę do wyboru", async () => {
    expect(await categoryExists(db, FURGON.id)).toBe(true);
    expect(await categoryExists(db, "00000000-0000-4000-8000-00000000dead")).toBe(false);
    expect((await listCategoryOptions(db)).map((c) => c.slug)).toEqual(
      demoCategories.map((c) => c.slug),
    );
  });
});

describe("zdjęcia auta", () => {
  it("dodaje zdjęcia po kolei, zmienia kolejność i opis oraz usuwa", async () => {
    const created = await createVehicle(db, newVehicle({ slug: "auto-ze-zdjeciami", model: "Ze zdjęciami" }));
    const photo = (n: number) => ({ url: `/media/vehicles/${n}.jpg`, alt: `Zdjęcie ${n}`, width: 1600, height: 1000 });

    const a = await addVehicleImage(db, created.id, photo(1));
    const b = await addVehicleImage(db, created.id, photo(2));
    const c = await addVehicleImage(db, created.id, photo(3));
    expect(a?.slug).toBe("auto-ze-zdjeciami");

    const order = async () => (await getAdminVehicle(db, created.id))!.images.map((i) => i.url.at(-5));
    expect(await order()).toEqual(["1", "2", "3"]);

    await moveVehicleImage(db, c!.id, "up");
    expect(await order()).toEqual(["1", "3", "2"]);
    await moveVehicleImage(db, c!.id, "up");
    await moveVehicleImage(db, c!.id, "up"); // już pierwsze – bez zmian
    expect(await order()).toEqual(["3", "1", "2"]);
    await moveVehicleImage(db, b!.id, "down"); // ostatnie – bez zmian
    expect(await order()).toEqual(["3", "1", "2"]);

    expect(await updateVehicleImageAlt(db, a!.id, "Nowy opis")).toEqual({ slug: "auto-ze-zdjeciami" });
    const removed = await removeVehicleImage(db, b!.id);
    expect(removed).toEqual({ url: "/media/vehicles/2.jpg", slug: "auto-ze-zdjeciami" });

    const stored = await getAdminVehicle(db, created.id);
    expect(stored!.images.map((i) => [i.url.at(-5), i.sortOrder, i.alt])).toEqual([
      ["3", 0, "Zdjęcie 3"],
      ["1", 1, "Nowy opis"],
    ]);

    expect(await addVehicleImage(db, "00000000-0000-4000-8000-00000000dead", photo(9))).toBeNull();
    expect(await removeVehicleImage(db, "00000000-0000-4000-8000-00000000dead")).toBeNull();
  });
});
