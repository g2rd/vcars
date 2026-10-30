# Architektura

Wariant A: jedna aplikacja Next.js (strona publiczna + panel administracyjny) i PostgreSQL.
Bez multi-tenant. Poniżej decyzje, które pozwalają rozwijać system bez przepisywania.

## Przepływ danych

```
Strona publiczna (Server Components)
   └─ modules/vehicles/queries.ts      'use cache' + cacheLife('hours') + cacheTag('vehicles')
        └─ provider.ts                 DATABASE_URL? Postgres : dane demo
             ├─ repository.db.ts       Drizzle → Postgres (PGlite w testach)
             └─ repository.static.ts   demo-data.ts (+ demo-photos.ts)

Panel (/admin)
   strona / Server Action → requireUser() → modules/*/admin.ts (Drizzle) → updateTag(...)
```

- UI strony zna tylko interfejs `VehicleRepository` – źródło danych jest wymienne.
- Typy domenowe (`modules/vehicles/types.ts`) to wspólny kontrakt; kwoty w groszach, daty ISO.
- Funkcje `admin.ts` przyjmują bazę jako argument (`Db`), więc testujemy je na PGlite bez Dockera.
- `repository.db.test.ts` dowodzi, że repozytorium Postgres zwraca dokładnie to samo co tryb demo.

## Cache i odświeżanie (Next.js 16 Cache Components)

Dane publiczne są cache'owane per funkcja (`use cache`) z tagami `vehicles`, `vehicle:<slug>`,
`categories`. Każda zmiana w panelu (Server Action) wywołuje `updateTag(...)` – strony, sitemap,
`llms.txt` i obrazy OG odświeżają się od razu, bez ponownego buildu. Nowe auto jest dostępne
natychmiast (`dynamicParams`), także gdy nie było prerenderowane przy buildzie.

Strony panelu czytają ciasteczko sesji, więc są dynamiczne: statyczny szkielet (`<Suspense>`) +
treść po sprawdzeniu sesji. Formularz `/zapytanie` czyta `searchParams` i też leży w `<Suspense>`.

### Statusy HTTP (SEO)

Strumieniowana strona zaczyna odpowiedź od `200`, więc samo `notFound()` w stronie auta daje przy
pierwszym trafieniu `200 + noindex` (soft 404). Dlatego `src/proxy.ts` przed renderem sprawdza,
czy auto/kategoria istnieje (`lib/page-exists.ts`: zapytanie po indeksowanym slugu, wynik pozytywny
cache'owany 30 s, negatywny nigdy; przy błędzie bazy ruch jest wpuszczany) i zwraca prawdziwe
`404`. `notFound()` w stronach zostaje jako druga linia obrony.

## Uwierzytelnianie

- `modules/auth/service.ts` – logika bez zależności od Next.js (baza i zegar wstrzykiwane).
- `modules/auth/session.ts` – ciasteczko, `getCurrentUser()` (memoizowane `cache()` w obrębie
  żądania), `requireUser()`, `requireOwner()`.
- Tabele `users` (rola `owner`/`staff`, licznik prób, blokada czasowa) i `sessions` (hasz tokenu).
- Ochrona warstwowa: `proxy.ts` (307 bez ciasteczka) + weryfikacja w bazie w każdej stronie i akcji.
  Layout panelu to tylko wygoda (powłoka, plakietka) – nie jest barierą, bo nie renderuje się
  ponownie przy nawigacji.

## System projektowy

Styl „monochromatyczny kiosk transportowy" (źródło: Refero): biała kanwa, czarne belki
(nawigacja, stopka, pasek akcji), hairline 1 px zamiast cieni, promień 8 px (pigułka tylko na
CTA w nawigacji), nagłówki o wadze 400. Jedyny chromatyczny element UI to aktywna zakładka
(`#9dcdd6`); kolor dają zdjęcia i płaskie ilustracje. Tokeny: `src/app/globals.css`
(`@theme`), skala typograficzna 12/14/16/18/24/36/52 px, kontener 1200 px, siatka 4 px.
Czcionka: Inter (zamiennik własnościowego kroju z referencji). Panel używa tych samych tokenów;
błędy formularzy oznaczamy grubszą czarną ramką i tekstem (bez dodatkowych kolorów).

## Zdjęcia

`modules/media`: `images.ts` (walidacja po zawartości, obrót EXIF, 1600 px, JPEG, usunięcie
metadanych) i `storage.ts` (dysk w `MEDIA_DIR`, losowe nazwy UUID, ochrona przed wyjściem poza
katalog). Serwuje je `app/media/[...path]/route.ts` z cache `immutable`. Jeśli hosting nie ma
trwałego dysku, wystarczy podmienić `storage.ts` (zapisz / usuń / rozwiąż ścieżkę) na S3/R2.

## Co dalej (kolejność proponowana)

1. **Powiadomienia o nowych zapytaniach**: web push (VAPID; na iOS po dodaniu aplikacji do ekranu
   początkowego) + e-mail/SMS jako zapas. Punkt zaczepienia: `modules/inquiries/actions.ts`.
2. **Kalendarz i rezerwacje**: tabela `bookings` z ograniczeniem wykluczającym
   (`tstzrange` + `EXCLUDE USING gist`) – blokada podwójnej rezerwacji na poziomie bazy.
3. **Moduł floty**: terminy leasingu, ubezpieczeń, przeglądów, raty i wynajmów – jedna encja
   `Obligation` + nocny job + powiadomienia; potem raporty rentowności i prognoza cash flow.
4. **Protokół wydania/zwrotu** na telefonie (zdjęcia szkód, licznik, podpis) – działa offline
   (kolejka w IndexedDB).
5. **Zarządzanie użytkownikami** w panelu, 2FA/passkeys dla szefa, dziennik zmian.
6. **Rate limiting** formularza zapytania i logowania per IP.

Gdyby kiedyś trzeba było przejść na SaaS (Wariant B/C), najdroższe są: dodanie `tenant_id`
+ RLS do każdej tabeli, mapowanie domen na tenantów i wyniesienie konfiguracji z `config/site.ts`
do bazy. Dlatego dostęp do danych jest już za interfejsami, a konfiguracja firmy w jednym pliku.
