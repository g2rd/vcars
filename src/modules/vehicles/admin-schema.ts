import { z } from "zod";
import { isValidSlug, slugify } from "@/lib/slug";
import type { VehicleInput } from "./admin";
import {
  BODY_TYPES,
  FUELS,
  GEARBOXES,
  LICENSE_CATEGORIES,
  PALETTES,
  VEHICLE_STATUSES,
  type PriceTier,
} from "./types";

/** „219", „219,50", „1 200.5" → grosze (21900, 21950, 120050); `NaN`, gdy to nie kwota. */
export function parseMoneyToGrosze(value: string): number {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return Number.NaN;
  return Math.round(Number(normalized) * 100);
}

/** Grosze → tekst do pola formularza: 21950 → „219,50", 21900 → „219". */
export function groszeToField(grosze: number): string {
  const zloty = grosze / 100;
  return Number.isInteger(zloty) ? String(zloty) : zloty.toFixed(2).replace(".", ",");
}

const toLines = (value: string): string[] =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

/** Akapity oddzielone pustą linią; pojedyncze enter-y wewnątrz akapitu stają się spacjami. */
const toParagraphs = (value: string): string[] =>
  value
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s*\r?\n\s*/g, " ").trim())
    .filter(Boolean);

const required = "To pole jest wymagane.";

function text(max: number) {
  return z.string({ error: required }).trim().min(1, required).max(max, `Maksymalnie ${max} znaków.`);
}

function optionalText(max: number) {
  return z.string().trim().max(max, `Maksymalnie ${max} znaków.`);
}

function integer(min: number, max: number) {
  return z
    .string({ error: required })
    .trim()
    .min(1, required)
    .transform((v) => Number(v.replace(/\s/g, "")))
    .pipe(
      z
        .number({ error: "Podaj liczbę." })
        .int("Podaj liczbę całkowitą.")
        .min(min, `Minimum: ${min}.`)
        .max(max, `Maksimum: ${max}.`),
    );
}

function decimal(min: number, max: number) {
  return z
    .string({ error: required })
    .trim()
    .min(1, required)
    .transform((v) => Number(v.replace(/\s/g, "").replace(",", ".")))
    .pipe(z.number({ error: "Podaj liczbę." }).min(min, `Minimum: ${min}.`).max(max, `Maksimum: ${max}.`));
}

function money(maxZloty: number) {
  return z
    .string({ error: required })
    .trim()
    .min(1, required)
    .transform(parseMoneyToGrosze)
    .pipe(
      z
        .number({ error: "Podaj kwotę, np. 219 lub 219,50." })
        .min(0)
        .max(maxZloty * 100, `Maksimum: ${maxZloty} zł.`),
    );
}

const fieldsSchema = z.object({
  categoryId: z.uuid({ error: "Wybierz kategorię." }),
  make: text(40),
  model: text(60),
  variant: optionalText(60),
  slug: optionalText(80),
  year: integer(1990, new Date().getFullYear() + 1),
  summary: text(160),
  description: z
    .string({ error: required })
    .transform(toParagraphs)
    .pipe(
      z
        .array(z.string().max(800, "Akapit może mieć maks. 800 znaków."))
        .min(1, "Dodaj opis auta.")
        .max(6, "Maksymalnie 6 akapitów."),
    ),
  idealFor: z
    .string()
    .transform(toLines)
    .pipe(z.array(z.string().max(80, "Maks. 80 znaków w linii.")).max(8, "Maksymalnie 8 pozycji.")),
  features: z
    .string()
    .transform(toLines)
    .pipe(z.array(z.string().max(60, "Maks. 60 znaków w linii.")).max(20, "Maksymalnie 20 pozycji.")),
  payloadKg: integer(100, 8000),
  grossWeightKg: integer(500, 12000),
  cargoVolumeM3: decimal(0.5, 60),
  cargoLengthMm: integer(500, 9000),
  cargoWidthMm: integer(500, 3000),
  cargoHeightMm: integer(500, 3500),
  seats: integer(1, 9),
  fuel: z.enum(FUELS, { error: "Wybierz rodzaj paliwa." }),
  gearbox: z.enum(GEARBOXES, { error: "Wybierz skrzynię biegów." }),
  licenseCategory: z.enum(LICENSE_CATEGORIES, { error: "Wybierz kategorię prawa jazdy." }),
  bodyType: z.enum(BODY_TYPES, { error: "Wybierz typ nadwozia." }),
  palette: z.enum(PALETTES, { error: "Wybierz kolor ilustracji." }),
  kmLimitPerDay: integer(0, 5000),
  extraKmPrice: money(50),
  deposit: money(100000),
  status: z.enum(VEHICLE_STATUSES, { error: "Wybierz dostępność." }),
  seoTitle: optionalText(60),
  seoDescription: optionalText(160),
  sortOrder: integer(0, 999),
});

function parseTiers(days: string[], prices: string[]): { tiers: PriceTier[]; error?: string } {
  const tiers: PriceTier[] = [];
  const rowCount = Math.max(days.length, prices.length);

  for (let i = 0; i < rowCount; i++) {
    const rawDays = (days[i] ?? "").trim();
    const rawPrice = (prices[i] ?? "").trim();
    if (!rawDays && !rawPrice) continue; // pusty wiersz ignorujemy

    const minDays = Number(rawDays);
    const price = parseMoneyToGrosze(rawPrice);
    if (!Number.isInteger(minDays) || minDays < 1 || minDays > 365) {
      return { tiers, error: `Wiersz ${i + 1}: liczba dób musi być całkowita (1–365).` };
    }
    if (Number.isNaN(price) || price <= 0) {
      return { tiers, error: `Wiersz ${i + 1}: podaj cenę większą od zera, np. 219 lub 219,50.` };
    }
    tiers.push({ minDays, pricePerDayNet: price });
  }

  if (tiers.length === 0) return { tiers, error: "Dodaj co najmniej jedną stawkę." };
  const uniqueDays = new Set(tiers.map((t) => t.minDays));
  if (uniqueDays.size !== tiers.length) {
    return { tiers, error: "Każdy próg dób może wystąpić tylko raz." };
  }
  if (!uniqueDays.has(1)) {
    return { tiers, error: "Potrzebna jest stawka za 1 dobę (próg „od 1 doby”)." };
  }
  return { tiers: tiers.sort((a, b) => a.minDays - b.minDays) };
}

export type VehicleFormResult =
  | { ok: true; data: VehicleInput }
  | { ok: false; fieldErrors: Record<string, string[]> };

/** Zamienia dane z formularza auta na `VehicleInput` albo zwraca błędy pól po polsku. */
export function parseVehicleForm(formData: FormData): VehicleFormResult {
  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("tier") && key !== "isPublished") raw[key] = value;
  }

  const parsed = fieldsSchema.safeParse(raw);
  const fieldErrors: Record<string, string[]> = parsed.success
    ? {}
    : z.flattenError(parsed.error).fieldErrors;

  const { tiers, error: tierError } = parseTiers(
    formData.getAll("tierDays").map(String),
    formData.getAll("tierPrice").map(String),
  );
  if (tierError) fieldErrors.priceTiers = [tierError];

  if (!parsed.success) return { ok: false, fieldErrors };
  const v = parsed.data;

  const slug = v.slug ? v.slug : slugify([v.make, v.model, v.variant].filter(Boolean).join(" "));
  if (!isValidSlug(slug)) {
    fieldErrors.slug = ["Adres może zawierać małe litery, cyfry i myślniki (np. ford-transit-custom-l2h1)."];
  }
  if (v.payloadKg >= v.grossWeightKg) {
    fieldErrors.payloadKg = ["Ładowność musi być mniejsza niż DMC."];
  }
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    data: {
      slug,
      categoryId: v.categoryId,
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
      cargoVolumeM3: v.cargoVolumeM3,
      cargo: { lengthMm: v.cargoLengthMm, widthMm: v.cargoWidthMm, heightMm: v.cargoHeightMm },
      seats: v.seats,
      fuel: v.fuel,
      gearbox: v.gearbox,
      licenseCategory: v.licenseCategory,
      bodyType: v.bodyType,
      palette: v.palette,
      priceTiers: tiers,
      kmLimitPerDay: v.kmLimitPerDay,
      extraKmPriceGrosze: v.extraKmPrice,
      depositGrosze: v.deposit,
      status: v.status,
      isPublished: formData.get("isPublished") === "on",
      seoTitle: v.seoTitle || null,
      seoDescription: v.seoDescription || null,
      sortOrder: v.sortOrder,
    },
  };
}
