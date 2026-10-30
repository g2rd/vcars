import { getPromotions, type Promotion } from "@/content/promotions";
import { formatKg, formatPln, formatVolume } from "@/lib/format";
import { lowestDailyRateNet } from "@/lib/pricing";
import { vehicleName, type Vehicle, type VehicleImage } from "@/modules/vehicles/types";

/** Slajd karuzeli na stronie głównej: auto z floty albo promocja. */
export type HeroSlide =
  | {
      kind: "vehicle";
      id: string;
      href: string;
      image: VehicleImage;
      title: string;
      detail: string;
      price: string;
    }
  | {
      kind: "promo";
      id: string;
      href: string;
      image: VehicleImage;
      badge: string;
      title: string;
      text: string;
      cta: string;
    };

/** Tyle aut w karuzeli wystarcza, żeby pokazać flotę, a nie zamienić paska w galerię. */
export const MAX_VEHICLE_SLIDES = 7;

type Options = {
  /** Auto pokazywane jako pierwsze (np. najchętniej wynajmowane). */
  featuredSlug?: string;
  promotions?: readonly Promotion[];
  maxVehicles?: number;
};

/**
 * Kolejność aut: najpierw wyróżnione, potem po jednym z każdej kategorii (żeby od razu
 * było widać różnorodność floty), na końcu pozostałe.
 */
function orderForVariety(vehicles: readonly Vehicle[], featuredSlug?: string): Vehicle[] {
  const featured = featuredSlug ? vehicles.find((v) => v.slug === featuredSlug) : undefined;
  const seenCategories = new Set<string>(featured ? [featured.categorySlug] : []);
  const firstPerCategory: Vehicle[] = [];
  const others: Vehicle[] = [];

  for (const vehicle of vehicles) {
    if (vehicle === featured) continue;
    if (seenCategories.has(vehicle.categorySlug)) {
      others.push(vehicle);
    } else {
      seenCategories.add(vehicle.categorySlug);
      firstPerCategory.push(vehicle);
    }
  }

  return [...(featured ? [featured] : []), ...firstPerCategory, ...others];
}

export function buildHeroSlides(vehicles: readonly Vehicle[], options: Options = {}): HeroSlide[] {
  const { featuredSlug, maxVehicles = MAX_VEHICLE_SLIDES } = options;
  const promotions = options.promotions ?? getPromotions(vehicles);
  // Auto bez zdjęcia nie ma czego pokazać w karuzeli (ma swoją kartę w liście floty).
  const withPhoto = vehicles.filter((v) => v.images.length > 0);

  const slides: HeroSlide[] = orderForVariety(withPhoto, featuredSlug)
    .slice(0, maxVehicles)
    .map((vehicle) => ({
      kind: "vehicle" as const,
      id: vehicle.slug,
      href: `/flota/${vehicle.slug}`,
      image: vehicle.images[0],
      title: vehicleName(vehicle),
      detail: `${formatVolume(vehicle.cargoVolumeM3)} · ${formatKg(vehicle.payloadKg)} ładowności`,
      price: `od ${formatPln(lowestDailyRateNet(vehicle.priceTiers))} netto / doba`,
    }));

  if (slides.length === 0) return [];
  // Domyślne tło promocji to zdjęcie ostatniego auta, czyli najdalsze od pierwszego slajdu.
  const defaultPromoImage = slides[slides.length - 1].image;

  for (const promotion of promotions) {
    const photoOwner = promotion.photoVehicleSlug
      ? withPhoto.find((v) => v.slug === promotion.photoVehicleSlug)
      : undefined;
    const at = Math.min(Math.max(promotion.position ?? 1, 0), slides.length);

    slides.splice(at, 0, {
      kind: "promo",
      id: `promo-${promotion.id}`,
      href: promotion.href,
      image: photoOwner?.images[0] ?? defaultPromoImage,
      badge: promotion.badge,
      title: promotion.title,
      text: promotion.text,
      cta: promotion.cta,
    });
  }

  return slides;
}
