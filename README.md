# VCars – wypożyczalnia samochodów dostawczych

Strona internetowa wypożyczalni busów i aut dostawczych: **Wariant A** z planu wdrożenia
(jedna aplikacja Next.js + PostgreSQL, bez multi-tenant), przygotowana tak, by panel admina
(PWA) można było dołożyć bez przebudowy.

> **Status:** wersja demonstracyjna. Dane firmy i floty są przykładowe, zdjęcia poglądowe
> (Wikimedia Commons), a indeksowanie przez wyszukiwarki jest wyłączone.

## Stack

| Warstwa | Wybór |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components), React 19, TypeScript |
| Styl | Tailwind CSS 4, system projektowy wg `docs/ARCHITECTURE.md#system-projektowy` |
| Dane | PostgreSQL + Drizzle ORM (migracje w `drizzle/`) |
| Walidacja | Zod 4 |
| Testy | Vitest 5 (w tym test integracyjny na PGlite – Postgres w pamięci, bez Dockera) |

## Szybki start

Wymagany Node.js ≥ 22.

```bash
npm install
npm run dev
```

Otwórz <http://localhost:3000>. Bez żadnej konfiguracji aplikacja działa w **trybie demo**:
katalog floty pochodzi z `src/modules/vehicles/demo-data.ts`, a zapytania z formularza trafiają
tylko do logu serwera (nie są zapisywane).

### Tryb z bazą danych

```bash
cp .env.example .env.local     # ustaw DATABASE_URL
docker compose up -d           # lokalny Postgres 17
npm run db:migrate             # stosuje migracje z drizzle/
npm run db:seed                # wgrywa dane demo do bazy
npm run dev
```

Z ustawionym `DATABASE_URL` strona czyta flotę z Postgresa, a zapytania klientów zapisują się w
tabeli `inquiries`. Nic w UI się nie zmienia – źródło danych podmienia `modules/vehicles/provider.ts`.

## Skrypty

| Komenda | Opis |
|---|---|
| `npm run dev` / `build` / `start` | uruchomienie, build produkcyjny, serwer produkcyjny |
| `npm run lint` / `typecheck` | ESLint, TypeScript |
| `npm test` | testy jednostkowe + integracyjne (PGlite) |
| `npm run db:generate` | nowa migracja po zmianie `src/db/schema.ts` |
| `npm run db:migrate` / `db:seed` / `db:studio` | migracje, seed, podgląd danych |

## Struktura

```
src/
  app/
    (site)/          strony publiczne (header, stopka, JSON-LD całego serwisu)
    (admin)/admin/   miejsce na panel admina (noindex, osobny layout)
    sitemap.ts, robots.ts, manifest.ts, llms.txt/, opengraph-image.tsx
  modules/
    vehicles/        model domenowy, zapytania z cache, repozytoria (demo / Postgres)
    inquiries/       formularz zapytania: Zod + Server Action + repozytoria
  db/                schemat Drizzle, klient, seed
  lib/seo/           metadane, JSON-LD, bezpiecznik indeksowania
  config/site.ts     dane firmy (NAP), nawigacja, zasady najmu
  components/        ui, site, seo, illustrations
drizzle/             migracje SQL
docs/ARCHITECTURE.md decyzje i plan rozbudowy o panel admina
```

## SEO – co jest wbudowane

- **Metadane na każdej stronie:** unikalny `title` i `description` w limitach (testy pilnują
  długości), `canonical`, Open Graph i Twitter, `lang="pl"`, `og:locale`.
- **Dane strukturalne (JSON-LD, w HTML z serwera):** `AutoRental` (NAP, godziny, geo, obszar
  działania, katalog), `WebSite`, `WebPage`/`CollectionPage`/`ContactPage`, `BreadcrumbList`,
  `ItemList`, `Product` + `Offer` (stawka dobowa netto) dla każdego auta.
- **Techniczne:** `sitemap.xml` z prawdziwymi datami zmian i mapą zdjęć, `robots.txt`,
  `llms.txt`, obrazy OG (statyczne, ze zdjęciem auta), manifest, ikony, nagłówki bezpieczeństwa
  (HSTS, CSP na produkcji).
- **Struktura pod frazy lokalne:** strony kategorii (`/wynajem/<kategoria>`) i kart aut
  (`/flota/<slug>`) z unikalną treścią, okruszki, linkowanie wewnętrzne.
- **Wydajność (Core Web Vitals):** prerender statyczny, `next/image` ze stałymi proporcjami
  (brak CLS), obrazek hero z `preload`, minimum JS po stronie klienta.
- **Bezpiecznik indeksowania:** domyślnie `noindex` + `Disallow: /`. Włączenie
  `ALLOW_INDEXING=true` z danymi demo w `config/site.ts` kończy build błędem.

## Zanim strona trafi do klienta produkcyjnie

1. Uzupełnij `src/config/site.ts` (nazwa, adres, telefon, e-mail, godziny, współrzędne z min.
   5 miejscami po przecinku, obszar działania, profile społecznościowe) i ustaw `isDemo: false`.
2. Ustaw `NEXT_PUBLIC_SITE_URL` i dopiero wtedy `ALLOW_INDEXING=true`.
3. Zastąp zdjęcia poglądowe zdjęciami floty klienta (`modules/vehicles/demo-photos.ts` →
   panel admina) i usuń stronę `/zrodla-zdjec`.
4. Podmień szablony `/regulamin` i `/polityka-prywatnosci` na teksty od prawnika.
5. Załóż i zweryfikuj Profil Firmy w Google oraz Bing Places, dodaj adresy do `site.social`,
   zgłoś `sitemap.xml` w Google Search Console i Bing Webmaster Tools.
6. Zweryfikuj ceny, warunki najmu i parametry aut z klientem – wszystko w repo jest przykładowe.

## Zdjęcia

Zdjęcia w `public/vehicles/` pochodzą z Wikimedia Commons (licencje CC0 oraz CC BY-SA, autorzy
i linki w `modules/vehicles/demo-photos.ts` i na `/zrodla-zdjec`). Są **poglądowe** – model lub
wersja nadwozia może różnić się od faktycznego auta w ofercie.

## Znane ograniczenia i następne kroki

- Brak panelu admina, rezerwacji z kalendarzem dostępności, płatności online i powiadomień –
  patrz `docs/ARCHITECTURE.md`.
- Formularz zapytania ma honeypot i walidację, ale nie ma limitu zapytań (rate limiting) ani
  powiadomienia właściciela (e-mail/SMS/push) – punkt zaczepienia jest w `modules/inquiries/actions.ts`.
- Obrazy OG ze zdjęciem to PNG ok. 0,5 MB; część komunikatorów (np. WhatsApp) może wtedy nie
  pokazać podglądu. W razie potrzeby wygeneruj lżejsze (JPEG) lub użyj ilustracji.
- CSP używa `'unsafe-inline'` dla skryptów; docelowo warto przejść na nonce.
