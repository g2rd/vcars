# VCars – wypożyczalnia samochodów dostawczych

Strona internetowa wypożyczalni busów i aut dostawczych **wraz z panelem administracyjnym dla szefa**
(PWA, mobile first). „Wariant A" z planu wdrożenia: jedna aplikacja Next.js + PostgreSQL, bez multi-tenant.

> **Status:** wersja demonstracyjna. Dane firmy i floty są przykładowe, zdjęcia poglądowe
> (Wikimedia Commons), a indeksowanie przez wyszukiwarki jest wyłączone.

## Stack

| Warstwa | Wybór |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components, Proxy), React 19, TypeScript |
| Styl | Tailwind CSS 4, system projektowy opisany w `docs/ARCHITECTURE.md` |
| Dane | PostgreSQL + Drizzle ORM (migracje w `drizzle/`) |
| Panel | własne sesje (scrypt + cookie httpOnly), Server Actions, Zod 4, sharp (zdjęcia) |
| Testy | Vitest 5 (w tym testy na PGlite – Postgres w pamięci, bez Dockera) |

## Szybki start

Wymagany Node.js ≥ 22.

```bash
npm install
npm run dev
```

Otwórz <http://localhost:3000>. Bez konfiguracji działa **tryb demo samej strony**: flota z pliku
`src/modules/vehicles/demo-data.ts`, a zapytania z formularza trafiają tylko do logu serwera.
**Panel administracyjny wymaga bazy danych** (zapisy, konta, sesje).

### Z bazą danych i panelem (bez Dockera)

```bash
cp .env.example .env.local      # DATABASE_URL jest już ustawiony na bazę lokalną
npm run db:local                # okno 1: Postgres na porcie 5433 + migracje + dane demo
npm run dev                     # okno 2: strona i panel (uruchom ponownie po zmianie .env.local)
```

Panel: <http://localhost:3000/admin>. Przy pierwszym starcie pustej bazy `db:local` zakłada konto
szefa do wypróbowania – login i hasło są w `src/db/demo-credentials.ts` (tylko środowisko lokalne).
Dane bazy leżą w `.data/postgres` (poza gitem) i zostają między uruchomieniami.

Wolisz Docker? `docker compose up -d`, w `.env.local` ustaw
`DATABASE_URL=postgres://vcars:vcars@localhost:5432/vcars`, potem `npm run db:migrate` i `npm run db:seed`.

### Prawdziwe konto szefa (staging / produkcja)

```bash
npm run admin:create -- --email szef@firma.pl --name "Jan Kowalski"
```

Bez `--password` wygeneruje losowe hasło i wypisze je jednorazowo. `--role staff` zakłada konto
pracownika (bez prawa usuwania aut).

## Skrypty

| Komenda | Opis |
|---|---|
| `npm run dev` / `build` / `start` | uruchomienie, build produkcyjny, serwer produkcyjny |
| `npm run lint` / `typecheck` | ESLint, TypeScript |
| `npm test` | testy jednostkowe i integracyjne (PGlite) |
| `npm run db:local` | lokalny Postgres (embedded-postgres) z migracjami i danymi demo |
| `npm run db:generate` | nowa migracja po zmianie `src/db/schema.ts` |
| `npm run db:migrate` / `db:seed` / `db:studio` | migracje, seed (zastępuje katalog floty), podgląd danych |
| `npm run admin:create` | zakłada konto w panelu |

## Panel administracyjny (`/admin`)

Zbudowany dla telefonu (dolny pasek zakładek, duże cele dotykowe), na komputerze z menu bocznym.

- **Dziś** – nowe zapytania, liczba aut w ofercie / niedostępnych / ukrytych, ostatnie zapytania.
- **Flota** – lista z wyszukiwarką i filtrami; jednym dotknięciem *ukryj/pokaż na stronie* oraz
  *dostępne/niedostępne*; formularz auta (dane, opis, wyposażenie, cennik z progami za dobę, kaucja,
  limit km, SEO); zdjęcia z telefonu (aparat/galeria, kolejność, opisy); usuwanie (tylko szef).
- **Zapytania** – skrzynka klientów: telefon i e-mail jednym dotknięciem, statusy
  *nowe / w kontakcie / zamknięte*, plakietka z liczbą nowych w menu.
- **Konto** – zmiana hasła (wylogowuje inne urządzenia), wylogowanie.
- **PWA** – manifest w zakresie `/admin`, ikony (w tym maskable), service worker z ekranem offline.
  Na telefonie: menu przeglądarki → „Dodaj do ekranu głównego". Service worker nie cache'uje danych
  panelu, tylko niezmienne zasoby.

Każda zmiana w panelu od razu odświeża stronę publiczną, sitemapę, `llms.txt` i obrazy OG
(unieważnienie cache przez `updateTag`).

### Bezpieczeństwo panelu

- Hasła: scrypt (N=2¹⁶) z solą, minimum 10 znaków; ten sam komunikat dla złego hasła i nieznanego
  e-maila; blokada konta na 15 min po 5 błędnych próbach.
- Sesje: losowy token w ciasteczku `httpOnly`, `SameSite=Lax`, `Secure` na produkcji, ścieżka
  `/admin`; w bazie tylko hasz tokenu; ważność 14 dni; zmiana hasła kasuje pozostałe sesje.
- Dwie warstwy ochrony: `proxy.ts` natychmiast przekierowuje (307) niezalogowanych, a **każda strona
  i każda Server Action** sama weryfikuje sesję w bazie (`requireUser()` / `requireOwner()`).
- Zdjęcia: sprawdzany jest faktyczny format pliku, rozmiar, obrót wg EXIF; zapis jako JPEG ≤ 1600 px
  bez metadanych (w tym lokalizacji GPS); serwowane z `/media/…` z blokadą wychodzenia poza katalog.

## Struktura

```
src/
  app/
    (site)/            strony publiczne (header, stopka, JSON-LD całego serwisu)
    (admin)/admin/     panel: login, (panel)/ – strony dla zalogowanych, manifest, offline
    media/[...path]/   serwowanie zdjęć wgranych z panelu
    sitemap.ts, robots.ts, manifest.ts, llms.txt/, opengraph-image.tsx
  proxy.ts             404 dla nieznanych adresów + wstępna ochrona /admin
  modules/
    vehicles/          model, zapytania z cache, repozytoria, administracja flotą (admin*.ts)
    inquiries/         formularz publiczny + skrzynka w panelu
    auth/              hasła, sesje, logowanie, blokada
    media/             przetwarzanie i zapis zdjęć
  db/                  schemat Drizzle, klient, seed, lokalny Postgres, tworzenie kont
  lib/seo/             metadane, JSON-LD, bezpiecznik indeksowania
  config/site.ts       dane firmy (NAP), nawigacja, zasady najmu
  components/          ui, site, admin, seo, illustrations
drizzle/               migracje SQL
public/admin/          service worker i ikony PWA
docs/ARCHITECTURE.md   decyzje i plan dalszych prac
```

## SEO – co jest wbudowane

- **Metadane na każdej stronie:** unikalny `title` i `description` w limitach (testy pilnują
  długości), `canonical`, Open Graph i Twitter, `lang="pl"`, `og:locale`.
- **Dane strukturalne (JSON-LD, w HTML z serwera):** `AutoRental` (NAP, godziny, geo, obszar
  działania, katalog), `WebSite`, `WebPage`/`CollectionPage`/`ContactPage`, `BreadcrumbList`,
  `ItemList`, `Product` + `Offer` (stawka dobowa netto) dla każdego auta.
- **Techniczne:** `sitemap.xml` z prawdziwymi datami zmian i mapą zdjęć, `robots.txt`,
  `llms.txt`, obrazy OG ze zdjęciem auta, manifest, ikony, nagłówki bezpieczeństwa (HSTS, CSP na
  produkcji), **prawdziwe HTTP 404** dla nieznanych i ukrytych aut (`proxy.ts`).
- **Struktura pod frazy lokalne:** strony kategorii (`/wynajem/<kategoria>`) i kart aut
  (`/flota/<slug>`) z unikalną treścią, okruszki, linkowanie wewnętrzne.
- **Wydajność (Core Web Vitals):** prerender, `next/image` ze stałymi proporcjami (brak CLS),
  obrazek hero z `preload`, minimum JS po stronie klienta.
- **Bezpiecznik indeksowania:** domyślnie `noindex` + `Disallow: /`. Włączenie
  `ALLOW_INDEXING=true` z danymi demo w `config/site.ts` kończy build błędem.

## Zanim strona trafi do klienta produkcyjnie

1. Uzupełnij `src/config/site.ts` (nazwa, adres, telefon, e-mail, godziny, współrzędne z min.
   5 miejscami po przecinku, obszar działania, profile społecznościowe) i ustaw `isDemo: false`.
2. Ustaw `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL` (zarządzany Postgres, backupy), `MEDIA_DIR`
   (trwały dysk) i dopiero wtedy `ALLOW_INDEXING=true`.
3. Załóż prawdziwe konto szefa (`admin:create`) i **nie używaj** danych z `demo-credentials.ts`.
4. Zastąp zdjęcia poglądowe zdjęciami floty klienta (wgrywa je szef w panelu) i usuń `/zrodla-zdjec`.
5. Podmień szablony `/regulamin` i `/polityka-prywatnosci` na teksty od prawnika.
6. Załóż i zweryfikuj Profil Firmy w Google oraz Bing Places, dodaj adresy do `site.social`,
   zgłoś `sitemap.xml` w Google Search Console i Bing Webmaster Tools.
7. Zweryfikuj ceny, warunki najmu i parametry aut z klientem – wszystko w repo jest przykładowe.

## Zdjęcia

Zdjęcia demo w `public/vehicles/` pochodzą z Wikimedia Commons (licencje CC0 oraz CC BY-SA, autorzy
i linki w `modules/vehicles/demo-photos.ts` i na `/zrodla-zdjec`). Są **poglądowe**. Zdjęcia
wgrywane z panelu trafiają do `MEDIA_DIR` (domyślnie `.data/media`).

## Znane ograniczenia i następne kroki

- Zdjęcia z panelu są na dysku serwera. Na hostingu bez trwałego dysku podmień
  `modules/media/storage.ts` na S3/R2 (interfejs jest celowo mały).
- Brak rezerwacji z kalendarzem dostępności, płatności online, powiadomień push/e-mail/SMS
  o nowych zapytaniach oraz modułu terminów floty (leasing, OC, przeglądy, raty) – plan w
  `docs/ARCHITECTURE.md`.
- Formularz zapytania ma honeypot i walidację, ale nie ma limitu zapytań (rate limiting).
- Jedno konto szefa zakłada się z CLI; nie ma jeszcze zarządzania użytkownikami w panelu.
- Obrazy OG ze zdjęciem to PNG ok. 0,5 MB; część komunikatorów (np. WhatsApp) może nie pokazać
  podglądu. CSP używa `'unsafe-inline'` dla skryptów; docelowo warto przejść na nonce.
