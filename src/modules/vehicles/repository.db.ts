import { asc, eq } from "drizzle-orm";
import {
  vehicleCategories,
  vehicleImages,
  vehiclePriceTiers,
  vehicles,
} from "@/db/schema";
import type { Db } from "@/db/types";
import type { VehicleRepository } from "./repository";
import type { Category, Vehicle } from "./types";

type CategoryRow = typeof vehicleCategories.$inferSelect;
type VehicleRow = typeof vehicles.$inferSelect & {
  category: CategoryRow;
  priceTiers: (typeof vehiclePriceTiers.$inferSelect)[];
  images: (typeof vehicleImages.$inferSelect)[];
};

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    h1: row.h1,
    summary: row.summary,
    intro: row.intro,
    useCases: row.useCases,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    bodyType: row.bodyType,
    sortOrder: row.sortOrder,
  };
}

function toVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    slug: row.slug,
    categorySlug: row.category.slug,
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
    // `numeric` wraca z Postgresa jako string.
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
    images: [...row.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => ({
        url: i.url,
        alt: i.alt,
        width: i.width,
        height: i.height,
        ...(i.credit ? { credit: i.credit } : {}),
        ...(i.sourceUrl ? { sourceUrl: i.sourceUrl } : {}),
      })),
    ...(row.seoTitle ? { seoTitle: row.seoTitle } : {}),
    ...(row.seoDescription ? { seoDescription: row.seoDescription } : {}),
    sortOrder: row.sortOrder,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function createDbVehicleRepository(db: Db): VehicleRepository {
  return {
    async listCategories() {
      const rows = await db
        .select()
        .from(vehicleCategories)
        .orderBy(asc(vehicleCategories.sortOrder), asc(vehicleCategories.name));
      return rows.map(toCategory);
    },
    async listVehicles() {
      const rows = await db.query.vehicles.findMany({
        where: eq(vehicles.isPublished, true),
        with: { category: true, priceTiers: true, images: true },
        orderBy: [asc(vehicles.sortOrder), asc(vehicles.make), asc(vehicles.model)],
      });
      return rows.map(toVehicle);
    },
  };
}
