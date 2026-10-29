/**
 * Dane firmy i ustawienia serwisu – jedno źródło prawdy dla NAP (nazwa, adres,
 * telefon), JSON-LD, stopki i metadanych.
 *
 * UWAGA: wszystkie dane poniżej są DEMONSTRACYJNE. Przed publikacją:
 *  1. podmień dane firmy (adres, telefon, godziny, współrzędne, obszar działania),
 *  2. ustaw `isDemo: false`,
 *  3. dopiero wtedy ustaw ALLOW_INDEXING=true (dopóki `isDemo` jest true,
 *     build z włączonym indeksowaniem zakończy się błędem – zob. lib/seo/indexing.ts).
 */
export const site = {
  isDemo: true,

  name: "VCars",
  legalName: "VCars (dane demonstracyjne)",
  tagline: "Wynajem samochodów dostawczych",
  description:
    "Wynajem busów i aut dostawczych w Warszawie: furgony, duże furgony, kontenery z windą. Ceny netto, szybki odbiór, umowa bez kolejek.",

  language: "pl",
  locale: "pl_PL",
  inLanguage: "pl-PL",

  /** Data ostatniej istotnej zmiany treści statycznych (używana jako <lastmod> w sitemap). */
  contentUpdatedAt: "2026-10-29",

  phone: { display: "+48 500 000 000", e164: "+48500000000" },
  email: "kontakt@vcars.example",

  address: {
    street: "ul. Przykładowa 1",
    postalCode: "00-001",
    city: "Warszawa",
    cityLocative: "Warszawie",
    region: "mazowieckie",
    countryCode: "PL",
  },
  /** Min. 5 miejsc po przecinku – tego oczekuje Google dla `geo`. */
  geo: { latitude: 52.22977, longitude: 21.01178 },

  openingHours: [
    {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
      label: "Pon.–pt. 8:00–18:00",
    },
    { days: ["Saturday"], opens: "09:00", closes: "14:00", label: "Sob. 9:00–14:00" },
  ],

  serviceAreas: ["Warszawa", "Piaseczno", "Pruszków", "Marki", "Legionowo"],

  /** Adresy profili (Facebook, Google Business Profile, LinkedIn…) → `sameAs` w JSON-LD. */
  social: [] as string[],

  rental: {
    vatRate: 0.23,
    kmLimitPerDay: 250,
    extraKmPriceGrosze: 60,
    minDriverAge: 21,
    minLicenseYears: 2,
    paymentMethods: ["przelew bankowy", "karta płatnicza", "BLIK"],
  },

  seo: {
    /**
     * `true` dopisuje do robots.txt blokadę crawlerów trenujących modele AI
     * (GPTBot, ClaudeBot, Google-Extended, CCBot…). Boty wyszukiwarek AI
     * (OAI-SearchBot, Claude-SearchBot, PerplexityBot) pozostają dozwolone.
     */
    blockAiTrainingCrawlers: false,
  },
} as const;

export const mainNav = [
  { href: "/flota", label: "Flota" },
  { href: "/cennik", label: "Cennik" },
  { href: "/jak-wynajac", label: "Jak wynająć" },
  { href: "/kontakt", label: "Kontakt" },
] as const;
