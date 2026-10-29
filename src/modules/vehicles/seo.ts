import { site } from "@/config/site";
import { formatKg, formatPln, formatVolume } from "@/lib/format";
import { lowestDailyRateNet } from "@/lib/pricing";
import { MAX_PAGE_TITLE_LENGTH } from "@/lib/seo/metadata";
import { vehicleName, type Vehicle } from "./types";

/**
 * Tytuł i opis SEO karty auta. Wartości z panelu admina (`seoTitle`,
 * `seoDescription`) mają pierwszeństwo; w przeciwnym razie składamy je z danych,
 * dbając o limit długości tytułu (szablon dopisze „| VCars").
 */
export function vehicleSeo(v: Vehicle): { title: string; description: string } {
  const name = vehicleName(v);
  const candidates = [
    v.seoTitle,
    `${name} – wynajem ${site.address.city}`,
    `${name} – wynajem`,
    name,
  ].filter((t): t is string => Boolean(t));
  const title = candidates.find((t) => t.length <= MAX_PAGE_TITLE_LENGTH) ?? name;

  const description =
    v.seoDescription ??
    `Wynajem ${name} w ${site.address.cityLocative}: ${formatVolume(v.cargoVolumeM3)}, ładowność ${formatKg(v.payloadKg)}, od ${formatPln(lowestDailyRateNet(v.priceTiers))} netto za dobę. Zapytaj o termin i odbierz auto bez kolejek.`;

  return { title, description };
}
