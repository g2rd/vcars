/**
 * Model domenowy floty. Te typy są kontraktem między warstwą danych
 * (demo-data / Drizzle) a UI – panel admina będzie je tylko zapisywał.
 * Wszystkie kwoty w groszach, wszystkie daty jako ISO string (serializowalne
 * dla `use cache`).
 */

export const BODY_TYPES = ["compact", "panel", "panel-long", "luton"] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export const FUELS = ["diesel", "petrol", "electric", "hybrid"] as const;
export type Fuel = (typeof FUELS)[number];

export const GEARBOXES = ["manual", "automatic"] as const;
export type Gearbox = (typeof GEARBOXES)[number];

export const LICENSE_CATEGORIES = ["B", "C1"] as const;
export type LicenseCategory = (typeof LICENSE_CATEGORIES)[number];

export const VEHICLE_STATUSES = ["available", "unavailable"] as const;
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

/** Paleta ilustracji (do czasu, gdy auto dostanie prawdziwe zdjęcia). */
export const PALETTES = ["orange", "teal", "cobalt", "sand", "brown"] as const;
export type Palette = (typeof PALETTES)[number];

export type PriceTier = {
  /** Od ilu dób obowiązuje stawka. */
  minDays: number;
  /** Cena netto za dobę, w groszach. */
  pricePerDayNet: number;
};

export type VehicleImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
  /** Autor i licencja, np. „Jan Kowalski, CC BY-SA 4.0" – wymagane przy zdjęciach z licencją CC. */
  credit?: string;
  /** Strona źródłowa zdjęcia (opis, autor, licencja). */
  sourceUrl?: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  /** Nagłówek H1 strony kategorii. */
  h1: string;
  summary: string;
  /** Akapity wstępu – unikalna treść strony kategorii. */
  intro: string[];
  useCases: string[];
  seoTitle: string;
  seoDescription: string;
  bodyType: BodyType;
  sortOrder: number;
};

export type Vehicle = {
  id: string;
  slug: string;
  categorySlug: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  summary: string;
  /** Akapity opisu – unikalna treść każdej karty auta. */
  description: string[];
  idealFor: string[];
  features: string[];
  payloadKg: number;
  /** Dopuszczalna masa całkowita (DMC). */
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
  images: VehicleImage[];
  /** Opcjonalne nadpisanie tytułu/opisu SEO z panelu admina. */
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
  updatedAt: string;
};

export function vehicleName(v: Pick<Vehicle, "make" | "model" | "variant">): string {
  return [v.make, v.model, v.variant].filter(Boolean).join(" ");
}

export const FUEL_LABELS: Record<Fuel, string> = {
  diesel: "Diesel",
  petrol: "Benzyna",
  electric: "Elektryczny",
  hybrid: "Hybryda",
};

export const GEARBOX_LABELS: Record<Gearbox, string> = {
  manual: "Manualna",
  automatic: "Automatyczna",
};
