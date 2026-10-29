import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getVehicleRepository } from "./provider";
import type { Category, Vehicle } from "./types";

/**
 * Zapytania dla stron publicznych. Każde jest cache'owane (`use cache`) i
 * oznaczone tagami – panel admina po zapisie wywoła `updateTag("vehicles")`
 * (lub `vehicle:<slug>`), a strony i sitemap odświeżą się natychmiast.
 */

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  return (await getVehicleRepository()).listCategories();
}

export async function getCategory(slug: string): Promise<Category | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  const categories = await (await getVehicleRepository()).listCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getVehicles(): Promise<Vehicle[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("vehicles");
  return (await getVehicleRepository()).listVehicles();
}

export async function getVehicle(slug: string): Promise<Vehicle | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("vehicles", `vehicle:${slug}`);
  const all = await (await getVehicleRepository()).listVehicles();
  return all.find((v) => v.slug === slug) ?? null;
}

export async function getVehiclesByCategory(categorySlug: string): Promise<Vehicle[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("vehicles");
  const all = await (await getVehicleRepository()).listVehicles();
  return all.filter((v) => v.categorySlug === categorySlug);
}

/** Auta z tej samej kategorii, potem pozostałe – do sekcji „Zobacz też". */
export async function getRelatedVehicles(slug: string, limit = 3): Promise<Vehicle[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("vehicles");
  const all = await (await getVehicleRepository()).listVehicles();
  const current = all.find((v) => v.slug === slug);
  if (!current) return [];
  const others = all.filter((v) => v.slug !== slug);
  const sameCategory = others.filter((v) => v.categorySlug === current.categorySlug);
  const rest = others.filter((v) => v.categorySlug !== current.categorySlug);
  return [...sameCategory, ...rest].slice(0, limit);
}
