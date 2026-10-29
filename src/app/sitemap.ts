import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { absoluteUrl } from "@/lib/seo/metadata";
import { getCategories, getVehicles } from "@/modules/vehicles/queries";

/**
 * Sitemap generowana z danych. `lastModified` pochodzi z realnych dat zmian
 * (auta: `updatedAt`, treści statyczne: `site.contentUpdatedAt`) – bez
 * „dzisiejszej daty", bo fałszywe lastmod uczy Google ignorować ten sygnał.
 * Stron noindex (np. /zapytanie, regulamin) celowo tu nie ma.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, vehicles] = await Promise.all([getCategories(), getVehicles()]);

  const staticDate = new Date(site.contentUpdatedAt);
  const latestFleetChange = new Date(
    vehicles.map((v) => v.updatedAt).sort().at(-1) ?? site.contentUpdatedAt,
  );

  return [
    { url: absoluteUrl("/"), lastModified: latestFleetChange },
    { url: absoluteUrl("/flota"), lastModified: latestFleetChange },
    ...categories.map((category) => ({
      url: absoluteUrl(`/wynajem/${category.slug}`),
      lastModified: latestFleetChange,
    })),
    ...vehicles.map((vehicle) => ({
      url: absoluteUrl(`/flota/${vehicle.slug}`),
      lastModified: new Date(vehicle.updatedAt),
      // Mapa zdjęć: pomaga w indeksowaniu w Grafice Google.
      ...(vehicle.images.length > 0
        ? { images: vehicle.images.map((image) => absoluteUrl(image.url)) }
        : {}),
    })),
    { url: absoluteUrl("/cennik"), lastModified: latestFleetChange },
    { url: absoluteUrl("/jak-wynajac"), lastModified: staticDate },
    { url: absoluteUrl("/kontakt"), lastModified: staticDate },
  ];
}
