import type { PriceTier } from "@/modules/vehicles/types";

/** Progi cenowe posortowane rosnąco po `minDays`. */
function sortTiers(tiers: readonly PriceTier[]): PriceTier[] {
  if (tiers.length === 0) throw new Error("Pojazd musi mieć co najmniej jeden próg cenowy.");
  return [...tiers].sort((a, b) => a.minDays - b.minDays);
}

/** Próg obowiązujący dla danej liczby dób (największy `minDays` <= dni). */
export function tierFor(tiers: readonly PriceTier[], days: number): PriceTier {
  const sorted = sortTiers(tiers);
  let match = sorted[0];
  for (const tier of sorted) {
    if (tier.minDays <= days) match = tier;
  }
  return match;
}

/** Najniższa stawka dobowa netto (do komunikatu „od X zł"). */
export function lowestDailyRateNet(tiers: readonly PriceTier[]): number {
  return Math.min(...sortTiers(tiers).map((t) => t.pricePerDayNet));
}

export function highestDailyRateNet(tiers: readonly PriceTier[]): number {
  return Math.max(...sortTiers(tiers).map((t) => t.pricePerDayNet));
}

export function withVat(netGrosze: number, vatRate: number): number {
  return Math.round(netGrosze * (1 + vatRate));
}

export type Quote = {
  days: number;
  dailyNet: number;
  totalNet: number;
  vat: number;
  totalGross: number;
};

export function quote(tiers: readonly PriceTier[], days: number, vatRate: number): Quote {
  const rentalDays = Math.max(1, Math.floor(days));
  const dailyNet = tierFor(tiers, rentalDays).pricePerDayNet;
  const totalNet = dailyNet * rentalDays;
  const totalGross = withVat(totalNet, vatRate);
  return { days: rentalDays, dailyNet, totalNet, vat: totalGross - totalNet, totalGross };
}
