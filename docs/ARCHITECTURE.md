# Architektura

Wariant A: jedna aplikacja Next.js (strona publiczna + w przyszłości panel admina) i PostgreSQL.
Bez multi-tenant. Poniżej decyzje, które sprawiają, że rozbudowa nie wymaga przepisywania.

## Przepływ danych

```
Strona (Server Components)
   └─ modules/vehicles/queries.ts      'use cache' + cacheLife('hours') + cacheTag('vehicles')
        └─ provider.ts                 DATABASE_URL? Postgres : dane demo
             ├─ repository.db.ts       Drizzle → Postgres (PGlite w testach)
             └─ repository.static.ts   demo-data.ts (+ demo-photos.ts)
```

- UI zna tylko interfejs `VehicleRepository` – źródło danych jest wymienne.
- Typy domenowe (`modules/vehicles/types.ts`) są wspólnym kontraktem; kwoty w groszach, daty ISO.
- Test `repository.db.test.ts` dowodzi, że repozytorium Postgres zwraca dokładnie to samo co tryb demo.

## Cache i odświeżanie (Next.js 16 Cache Components)

Dane są cache'owane per funkcja (`use cache`) z tagami `vehicles`, `vehicle:<slug>`, `categories`.
Panel admina po zapisie wywołuje `updateTag("vehicles")` (Server Action) – strony, sitemap,
`llms.txt` i obrazy OG odświeżą się od razu, bez ponownego buildu.

Strony auta i kategorii mają `generateStaticParams` (prerender znanych adresów) oraz
`instant = false`: nieznany adres zwraca **prawdziwe HTTP 404** (zamiast soft-404 po streamingu).
Formularz `/zapytanie` czyta `searchParams`, więc renderuje się w `<Suspense>` (partial prerender).

## System projektowy

Styl „monochromatyczny kiosk transportowy" (źródło: Refero): biała kanwa, czarne belki
(nawigacja, stopka, pasek akcji), hairline 1 px zamiast cieni, promień 8 px (pigułka tylko na
CTA w nawigacji), nagłówki o wadze 400. Jedyny chromatyczny element UI to aktywna zakładka
(`#9dcdd6`); kolor dają zdjęcia i płaskie ilustracje. Tokeny: `src/app/globals.css`
(`@theme`), skala typograficzna 12/14/16/18/24/36/52 px, kontener 1200 px, siatka 4 px.
Czcionka: Inter (zamiennik własnościowego kroju z referencji).

## Plan rozbudowy: panel administracyjny (PWA)

Miejsca zaczepienia są już gotowe:

| Potrzeba | Gdzie |
|---|---|
| Trasy panelu | `src/app/(admin)/admin/` – osobny layout, `noindex`, wykluczone w `robots.txt` |
| Zapis floty | tabele `vehicles`, `vehicle_price_tiers`, `vehicle_images` (z atrybucją), `vehicle_categories` |
| Zapytania klientów | tabela `inquiries` (status `new/contacted/closed`), zapis już działa |
| Walidacja | schematy Zod w `modules/*/schema.ts` – ten sam kontrakt dla formularzy admina |
| Mutacje | wzorzec Server Action z `modules/inquiries/actions.ts` + `updateTag(...)` |
| SEO z panelu | pola `seoTitle` / `seoDescription` auta (już obsługiwane w `vehicleSeo`) |
| Publikacja | `vehicles.is_published` (szkic bez usuwania auta) |

Kolejność prac:

1. **Auth i role** (właściciel / pracownik): sesje w bazie, ochrona tras `/admin` w `proxy.ts`,
   2FA/passkeys dla właściciela. Nowe tabele przez `npm run db:generate`.
2. **CRUD floty** mobile first: lista, edycja auta, wgrywanie zdjęć (S3/R2 + `next/image`),
   progi cenowe, status dostępności. Po zapisie `updateTag("vehicles")`.
3. **Skrzynka zapytań**: lista, zmiana statusu, powiadomienia (web push + e-mail/SMS).
4. **PWA**: manifest z `scope: "/admin"`, ikony PNG 192/512 (maskable), service worker (Serwist),
   web push (VAPID). Na iOS push działa po dodaniu aplikacji do ekranu początkowego.
5. **Kalendarz i rezerwacje**: tabela `bookings` z ograniczeniem wykluczającym
   (`tstzrange` + `EXCLUDE USING gist`) – blokada podwójnej rezerwacji na poziomie bazy.
6. **Moduł floty** (terminy leasingu, ubezpieczeń, przeglądów, raty, raporty rentowności) wg
   planu: jedna encja `Obligation` + nocny job + powiadomienia.

Gdyby kiedyś trzeba było przejść na SaaS (Wariant B/C), najdroższe są: dodanie `tenant_id`
+ RLS do każdej tabeli, mapowanie domen na tenantów i wyniesienie konfiguracji z `config/site.ts`
do bazy. Dlatego dostęp do danych jest już za interfejsami, a konfiguracja firmy w jednym pliku.
