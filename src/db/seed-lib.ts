import { demoCategories, demoVehicles } from "../modules/vehicles/demo-data";
import {
  vehicleCategories,
  vehicleImages,
  vehiclePriceTiers,
  vehicles,
} from "./schema";
import type { Db } from "./types";

/**
 * Zastępuje katalog floty danymi demonstracyjnymi (w jednej transakcji).
 * Zapytania klientów (`inquiries`) nie są ruszane – FK ustawia `vehicle_id` na NULL.
 */
export async function seedDatabase(db: Db): Promise<{ categories: number; vehicles: number }> {
  await db.transaction(async (tx) => {
    await tx.delete(vehicleImages);
    await tx.delete(vehiclePriceTiers);
    await tx.delete(vehicles);
    await tx.delete(vehicleCategories);

    await tx.insert(vehicleCategories).values(
      demoCategories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        h1: c.h1,
        summary: c.summary,
        intro: c.intro,
        useCases: c.useCases,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
        bodyType: c.bodyType,
        sortOrder: c.sortOrder,
      })),
    );

    const categoryIds = new Map(demoCategories.map((c) => [c.slug, c.id]));

    await tx.insert(vehicles).values(
      demoVehicles.map((v) => {
        const categoryId = categoryIds.get(v.categorySlug);
        if (!categoryId) throw new Error(`Nieznana kategoria „${v.categorySlug}" w ${v.slug}`);
        return {
          id: v.id,
          slug: v.slug,
          categoryId,
          make: v.make,
          model: v.model,
          variant: v.variant,
          year: v.year,
          summary: v.summary,
          description: v.description,
          idealFor: v.idealFor,
          features: v.features,
          payloadKg: v.payloadKg,
          grossWeightKg: v.grossWeightKg,
          cargoVolumeM3: v.cargoVolumeM3.toFixed(1),
          cargoLengthMm: v.cargo.lengthMm,
          cargoWidthMm: v.cargo.widthMm,
          cargoHeightMm: v.cargo.heightMm,
          seats: v.seats,
          fuel: v.fuel,
          gearbox: v.gearbox,
          licenseCategory: v.licenseCategory,
          bodyType: v.bodyType,
          palette: v.palette,
          kmLimitPerDay: v.kmLimitPerDay,
          extraKmPriceGrosze: v.extraKmPriceGrosze,
          depositGrosze: v.depositGrosze,
          status: v.status,
          seoTitle: v.seoTitle ?? null,
          seoDescription: v.seoDescription ?? null,
          sortOrder: v.sortOrder,
          updatedAt: new Date(v.updatedAt),
        };
      }),
    );

    await tx.insert(vehiclePriceTiers).values(
      demoVehicles.flatMap((v) =>
        v.priceTiers.map((t) => ({
          vehicleId: v.id,
          minDays: t.minDays,
          pricePerDayNet: t.pricePerDayNet,
        })),
      ),
    );

    const images = demoVehicles.flatMap((v) =>
      v.images.map((img, index) => ({ vehicleId: v.id, ...img, sortOrder: index })),
    );
    if (images.length > 0) await tx.insert(vehicleImages).values(images);
  });

  return { categories: demoCategories.length, vehicles: demoVehicles.length };
}
