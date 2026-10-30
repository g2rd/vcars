import { formatPln } from "@/lib/format";
import { lowestDailyRateNet } from "@/lib/pricing";
import type { Vehicle } from "@/modules/vehicles/types";

/**
 * Promocje i bonusy pokazywane w karuzeli na stronie głównej, jako slajdy wsunięte
 * między auta. Dodaj wpis, a pojawi się nowy slajd. Pusta lista oznacza karuzelę samej floty.
 *
 * UWAGA: promocja poniżej to PRZYKŁAD do wersji demo (liczy się z cen floty, więc nie
 * kłamie). Przed uruchomieniem zastąp ją prawdziwą ofertą klienta albo usuń.
 */
export type Promotion = {
  id: string;
  /** Plakietka na slajdzie, np. „Promocja" albo „Bonus". */
  badge: string;
  title: string;
  text: string;
  /** Napis na linku w slajdzie. */
  cta: string;
  href: string;
  /** Slug auta, którego zdjęcie jest tłem slajdu (domyślnie zdjęcie ostatniego auta w karuzeli). */
  photoVehicleSlug?: string;
  /** Miejsce w karuzeli: 0 = pierwszy slajd, 1 = po pierwszym aucie (domyślnie). */
  position?: number;
};

export function getPromotions(vehicles: readonly Vehicle[]): Promotion[] {
  if (vehicles.length === 0) return [];
  const cheapestLongRental = Math.min(...vehicles.map((v) => lowestDailyRateNet(v.priceTiers)));

  return [
    {
      id: "dluzszy-najem",
      badge: "Promocja",
      title: "Im dłużej, tym taniej",
      text: `Przy dłuższym najmie stawki już od ${formatPln(cheapestLongRental)} netto za dobę.`,
      cta: "Zapytaj o termin",
      href: "/zapytanie",
      position: 1,
    },
  ];
}
