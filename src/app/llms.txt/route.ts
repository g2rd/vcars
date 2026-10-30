import { site } from "@/config/site";
import { formatKg, formatPln, formatVolume } from "@/lib/format";
import { lowestDailyRateNet } from "@/lib/pricing";
import { absoluteUrl } from "@/lib/seo/metadata";
import { getCategories, getVehicles } from "@/modules/vehicles/queries";
import { vehicleName } from "@/modules/vehicles/types";

/**
 * /llms.txt – zwięzły opis serwisu dla asystentów AI i agentów (format
 * llmstxt.org): kim jesteśmy, co oferujemy i gdzie jest szczegółowa treść.
 */
export async function GET() {
  const [categories, vehicles] = await Promise.all([getCategories(), getVehicles()]);

  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name} to wypożyczalnia samochodów dostawczych w ${site.address.cityLocative} (${site.address.street}). Ceny podajemy netto za dobę, wszystkie auta prowadzi się na prawie jazdy kategorii B. Kontakt: ${site.phone.display}, ${site.email}.`,
    "",
    "## Strony",
    "",
    `- [Flota](${absoluteUrl("/flota")}): wszystkie auta do wynajęcia`,
    `- [Cennik](${absoluteUrl("/cennik")}): stawki za dobę, kaucje, limity kilometrów`,
    `- [Jak wynająć](${absoluteUrl("/jak-wynajac")}): dokumenty, wiek kierowcy, zasady zwrotu`,
    `- [Kontakt](${absoluteUrl("/kontakt")}): adres, godziny otwarcia, formularz`,
    "",
    "## Kategorie",
    "",
    ...categories.map(
      (c) => `- [${c.name}](${absoluteUrl(`/wynajem/${c.slug}`)}): ${c.summary}`,
    ),
    "",
    "## Flota",
    "",
    ...vehicles.map(
      (v) =>
        `- [${vehicleName(v)}](${absoluteUrl(`/flota/${v.slug}`)}): ${formatVolume(v.cargoVolumeM3)}, ${formatKg(v.payloadKg)}, od ${formatPln(lowestDailyRateNet(v.priceTiers))} netto / doba`,
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
