/**
 * Konto szefa dla LOKALNEGO środowiska deweloperskiego i demo u klienta.
 *
 * Używa go wyłącznie `npm run db:local` (przy pierwszym uruchomieniu pustej bazy)
 * oraz `npm run admin:create -- --demo`. Na produkcji załóż prawdziwe konto
 * (`npm run admin:create -- --email ... --name ...`) i NIE używaj tych danych.
 */
export const DEMO_ADMIN = {
  email: "szef@vcars.example",
  name: "Szef (demo)",
  password: "vcars-demo-2026",
} as const;
