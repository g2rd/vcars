import { and, asc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { vehicleCategories, vehicleImages, vehiclePriceTiers, vehicles } from "@/db/schema";
import type { Db } from "@/db/types";
import { lowestDailyRateNet } from "@/lib/pricing";
import {
  vehicleName,
  type BodyType,
  type Fuel,
  type Gearbox,
  type LicenseCategory,
  type Palette,
  type PriceTier,
  type VehicleStatus,
} from "./types";

/** Dane auta edytowane w panelu (to, co zapisuje formularz). */
export type VehicleInput = {
  slug: string;
  categoryId: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  summary: string;
  description: string[];
  idealFor: string[];
  features: string[];
  payloadKg: number;
  grossWeightKg: number;
  cargoVolumeM3: number;
  cargo: { lengthMm: number; widthMm: number; heightMm: number };
  seats: number;
  fuel: Fuel;
  gearbox: Gearbox;
  licenseCategory: LicenseCategory;
  bodyType: BodyType;
  palette: Palette;
  priceTiers: PriceTier[];
  kmLimitPerDay: number;
  extraKmPriceGrosze: number;
  depositGrosze: number;
  status: VehicleStatus;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  sortOrder: number;
};

export type AdminVehicleImage = {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  credit: string | null;
  sortOrder: number;
};

export type AdminVehicle = VehicleInput & {
  id: string;
  updatedAt: string;
  images: AdminVehicleImage[];
};

export type AdminVehicleSummary = {
  id: string;
  slug: string;
  name: string;
  categoryName: string;
  status: VehicleStatus;
  isPublished: boolean;
  fromNetGrosze: number;
  photo: { url: string; alt: string } | null;
  updatedAt: string;
};

export type FleetFilter = "all" | "visible" | "hidden" | "unavailable";

export type FleetStats = {
  total: number;
  visible: number;
  hidden: number;
  unavailable: number;
};

function toRow(input: VehicleInput) {
  return {
    slug: input.slug,
    categoryId: input.categoryId,
    make: input.make,
    model: input.model,
    variant: input.variant,
    year: input.year,
    summary: input.summary,
    description: input.description,
    idealFor: input.idealFor,
    features: input.features,
    payloadKg: input.payloadKg,
    grossWeightKg: input.grossWeightKg,
    cargoVolumeM3: input.cargoVolumeM3.toFixed(1),
    cargoLengthMm: input.cargo.lengthMm,
    cargoWidthMm: input.cargo.widthMm,
    cargoHeightMm: input.cargo.heightMm,
    seats: input.seats,
    fuel: input.fuel,
    gearbox: input.gearbox,
    licenseCategory: input.licenseCategory,
    bodyType: input.bodyType,
    palette: input.palette,
    kmLimitPerDay: input.kmLimitPerDay,
    extraKmPriceGrosze: input.extraKmPriceGrosze,
    depositGrosze: input.depositGrosze,
    status: input.status,
    isPublished: input.isPublished,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    sortOrder: input.sortOrder,
  };
}

export async function listCategoryOptions(db: Db): Promise<{ id: string; name: string; slug: string }[]> {
  return db
    .select({ id: vehicleCategories.id, name: vehicleCategories.name, slug: vehicleCategories.slug })
    .from(vehicleCategories)
    .orderBy(asc(vehicleCategories.sortOrder), asc(vehicleCategories.name));
}

export async function listAdminVehicles(
  db: Db,
  options: { query?: string; filter?: FleetFilter } = {},
): Promise<AdminVehicleSummary[]> {
  const conditions = [];
  const filter = options.filter ?? "all";
  if (filter === "visible") conditions.push(eq(vehicles.isPublished, true));
  if (filter === "hidden") conditions.push(eq(vehicles.isPublished, false));
  if (filter === "unavailable") conditions.push(eq(vehicles.status, "unavailable"));

  const query = options.query?.trim();
  if (query) {
    const pattern = `%${query.replace(/[%_\\]/g, "\\$&")}%`;
    conditions.push(
      or(
        ilike(vehicles.make, pattern),
        ilike(vehicles.model, pattern),
        ilike(vehicles.variant, pattern),
        ilike(vehicles.slug, pattern),
      ),
    );
  }

  const rows = await db.query.vehicles.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { category: true, priceTiers: true, images: true },
    orderBy: [asc(vehicles.sortOrder), asc(vehicles.make), asc(vehicles.model)],
  });

  return rows.map((row) => {
    const photo = [...row.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
    return {
      id: row.id,
      slug: row.slug,
      name: vehicleName(row),
      categoryName: row.category.name,
      status: row.status,
      isPublished: row.isPublished,
      fromNetGrosze: lowestDailyRateNet(row.priceTiers),
      photo: photo ? { url: photo.url, alt: photo.alt } : null,
      updatedAt: row.updatedAt.toISOString(),
    };
  });
}

export async function getFleetStats(db: Db): Promise<FleetStats> {
  const [row] = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
      visible: sql<number>`count(*) filter (where ${vehicles.isPublished})`.mapWith(Number),
      hidden: sql<number>`count(*) filter (where not ${vehicles.isPublished})`.mapWith(Number),
      unavailable: sql<number>`count(*) filter (where ${vehicles.status} = 'unavailable')`.mapWith(Number),
    })
    .from(vehicles);
  return row;
}

export async function getAdminVehicle(db: Db, id: string): Promise<AdminVehicle | null> {
  const row = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, id),
    with: { priceTiers: true, images: true },
  });
  if (!row) return null;

  return {
    id: row.id,
    updatedAt: row.updatedAt.toISOString(),
    slug: row.slug,
    categoryId: row.categoryId,
    make: row.make,
    model: row.model,
    variant: row.variant,
    year: row.year,
    summary: row.summary,
    description: row.description,
    idealFor: row.idealFor,
    features: row.features,
    payloadKg: row.payloadKg,
    grossWeightKg: row.grossWeightKg,
    cargoVolumeM3: Number(row.cargoVolumeM3),
    cargo: {
      lengthMm: row.cargoLengthMm,
      widthMm: row.cargoWidthMm,
      heightMm: row.cargoHeightMm,
    },
    seats: row.seats,
    fuel: row.fuel,
    gearbox: row.gearbox,
    licenseCategory: row.licenseCategory,
    bodyType: row.bodyType,
    palette: row.palette,
    priceTiers: [...row.priceTiers]
      .sort((a, b) => a.minDays - b.minDays)
      .map((t) => ({ minDays: t.minDays, pricePerDayNet: t.pricePerDayNet })),
    kmLimitPerDay: row.kmLimitPerDay,
    extraKmPriceGrosze: row.extraKmPriceGrosze,
    depositGrosze: row.depositGrosze,
    status: row.status,
    isPublished: row.isPublished,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    sortOrder: row.sortOrder,
    images: [...row.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => ({
        id: i.id,
        url: i.url,
        alt: i.alt,
        width: i.width,
        height: i.height,
        credit: i.credit,
        sortOrder: i.sortOrder,
      })),
  };
}

export async function isSlugTaken(db: Db, slug: string, exceptId?: string): Promise<boolean> {
  const rows = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .where(exceptId ? and(eq(vehicles.slug, slug), ne(vehicles.id, exceptId)) : eq(vehicles.slug, slug))
    .limit(1);
  return rows.length > 0;
}

export async function categoryExists(db: Db, id: string): Promise<boolean> {
  const rows = await db
    .select({ id: vehicleCategories.id })
    .from(vehicleCategories)
    .where(eq(vehicleCategories.id, id))
    .limit(1);
  return rows.length > 0;
}

export async function createVehicle(db: Db, input: VehicleInput): Promise<{ id: string; slug: string }> {
  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(vehicles)
      .values(toRow(input))
      .returning({ id: vehicles.id, slug: vehicles.slug });
    await tx.insert(vehiclePriceTiers).values(
      input.priceTiers.map((tier) => ({
        vehicleId: created.id,
        minDays: tier.minDays,
        pricePerDayNet: tier.pricePerDayNet,
      })),
    );
    return created;
  });
}

/** Zwraca poprzedni i nowy slug (do unieważnienia cache) albo `null`, gdy auta nie ma. */
export async function updateVehicle(
  db: Db,
  id: string,
  input: VehicleInput,
): Promise<{ previousSlug: string; slug: string } | null> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ slug: vehicles.slug })
      .from(vehicles)
      .where(eq(vehicles.id, id))
      .limit(1);
    if (!existing) return null;

    await tx.update(vehicles).set(toRow(input)).where(eq(vehicles.id, id));
    await tx.delete(vehiclePriceTiers).where(eq(vehiclePriceTiers.vehicleId, id));
    await tx.insert(vehiclePriceTiers).values(
      input.priceTiers.map((tier) => ({
        vehicleId: id,
        minDays: tier.minDays,
        pricePerDayNet: tier.pricePerDayNet,
      })),
    );
    return { previousSlug: existing.slug, slug: input.slug };
  });
}

/** Szybka zmiana widoczności/dostępności z listy aut. */
export async function setVehicleFlags(
  db: Db,
  id: string,
  flags: { isPublished?: boolean; status?: VehicleStatus },
): Promise<{ slug: string } | null> {
  const [row] = await db
    .update(vehicles)
    .set(flags)
    .where(eq(vehicles.id, id))
    .returning({ slug: vehicles.slug });
  return row ?? null;
}

/** Usuwa auto; zwraca slug i adresy zdjęć (do posprzątania plików). Zapytania klientów zostają. */
export async function deleteVehicle(
  db: Db,
  id: string,
): Promise<{ slug: string; imageUrls: string[] } | null> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .select({ slug: vehicles.slug })
      .from(vehicles)
      .where(eq(vehicles.id, id))
      .limit(1);
    if (!row) return null;

    const images = await tx
      .select({ url: vehicleImages.url })
      .from(vehicleImages)
      .where(eq(vehicleImages.vehicleId, id));
    await tx.delete(vehicles).where(eq(vehicles.id, id));
    return { slug: row.slug, imageUrls: images.map((i) => i.url) };
  });
}

export async function addVehicleImage(
  db: Db,
  vehicleId: string,
  image: { url: string; alt: string; width: number; height: number },
): Promise<{ id: string; slug: string } | null> {
  return db.transaction(async (tx) => {
    const [vehicle] = await tx
      .select({ slug: vehicles.slug })
      .from(vehicles)
      .where(eq(vehicles.id, vehicleId))
      .limit(1);
    if (!vehicle) return null;

    const [last] = await tx
      .select({ max: sql<number>`coalesce(max(${vehicleImages.sortOrder}), -1)`.mapWith(Number) })
      .from(vehicleImages)
      .where(eq(vehicleImages.vehicleId, vehicleId));

    const [created] = await tx
      .insert(vehicleImages)
      .values({ vehicleId, ...image, sortOrder: last.max + 1 })
      .returning({ id: vehicleImages.id });
    return { id: created.id, slug: vehicle.slug };
  });
}

/** Usuwa wpis o zdjęciu; zwraca jego adres (do usunięcia pliku) i slug auta. */
export async function removeVehicleImage(
  db: Db,
  imageId: string,
): Promise<{ url: string; slug: string } | null> {
  return db.transaction(async (tx) => {
    const [image] = await tx
      .select({ url: vehicleImages.url, vehicleId: vehicleImages.vehicleId })
      .from(vehicleImages)
      .where(eq(vehicleImages.id, imageId))
      .limit(1);
    if (!image) return null;

    const [vehicle] = await tx
      .select({ slug: vehicles.slug })
      .from(vehicles)
      .where(eq(vehicles.id, image.vehicleId));
    await tx.delete(vehicleImages).where(eq(vehicleImages.id, imageId));
    return { url: image.url, slug: vehicle.slug };
  });
}

/** Przesuwa zdjęcie o jedno miejsce; pierwsze zdjęcie jest zdjęciem głównym. */
export async function moveVehicleImage(
  db: Db,
  imageId: string,
  direction: "up" | "down",
): Promise<{ slug: string } | null> {
  return db.transaction(async (tx) => {
    const [image] = await tx
      .select({ vehicleId: vehicleImages.vehicleId })
      .from(vehicleImages)
      .where(eq(vehicleImages.id, imageId))
      .limit(1);
    if (!image) return null;

    const ordered = await tx
      .select({ id: vehicleImages.id })
      .from(vehicleImages)
      .where(eq(vehicleImages.vehicleId, image.vehicleId))
      .orderBy(asc(vehicleImages.sortOrder), asc(vehicleImages.id));

    const index = ordered.findIndex((i) => i.id === imageId);
    const target = direction === "up" ? index - 1 : index + 1;
    if (target >= 0 && target < ordered.length) {
      [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    }
    // Zapis całej kolejności na nowo – naprawia też ewentualne dziury w numeracji.
    for (const [position, item] of ordered.entries()) {
      await tx.update(vehicleImages).set({ sortOrder: position }).where(eq(vehicleImages.id, item.id));
    }

    const [vehicle] = await tx
      .select({ slug: vehicles.slug })
      .from(vehicles)
      .where(eq(vehicles.id, image.vehicleId));
    return { slug: vehicle.slug };
  });
}

export async function updateVehicleImageAlt(
  db: Db,
  imageId: string,
  alt: string,
): Promise<{ slug: string } | null> {
  const [image] = await db
    .update(vehicleImages)
    .set({ alt })
    .where(eq(vehicleImages.id, imageId))
    .returning({ vehicleId: vehicleImages.vehicleId });
  if (!image) return null;
  const [vehicle] = await db
    .select({ slug: vehicles.slug })
    .from(vehicles)
    .where(eq(vehicles.id, image.vehicleId));
  return { slug: vehicle.slug };
}
