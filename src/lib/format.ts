/** Formatowanie wartości do wyświetlania (pl-PL). Kwoty trzymamy w groszach. */

const plnWhole = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});
const plnExact = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  minimumFractionDigits: 2,
});

export function formatPln(grosze: number): string {
  return (grosze % 100 === 0 ? plnWhole : plnExact).format(grosze / 100);
}

export function formatVolume(m3: number): string {
  const digits = Number.isInteger(m3) ? 0 : 1;
  return `${m3.toLocaleString("pl-PL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} m³`;
}

export function formatKg(kg: number): string {
  return `${kg.toLocaleString("pl-PL")} kg`;
}

export function formatMetersFromMm(mm: number): string {
  return `${(mm / 1000).toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} m`;
}

export function formatKm(km: number): string {
  return `${km.toLocaleString("pl-PL")} km`;
}

/** Zwraca słowo w odpowiedniej formie liczby: 1 doba, 2 doby, 5 dób. */
export function pluralPl(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n);
  if (abs === 1) return one;
  const lastTwo = abs % 100;
  const last = abs % 10;
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return few;
  return many;
}
