# Etapy prac i postęp

Plik odwzorowuje zakres z umowy (§ 2–§ 4) i służy do bieżącego monitorowania prac: co jest
zrobione, co zostało i co czeka na materiały lub decyzję klienta. Aktualizujemy go po każdym
odbiorze, ważnej zmianie albo ustaleniu z klientem.

> **Ważne:** ceny, terminy płatności i warunki abonamentu są wyłącznie w umowie. Tego pliku nie
> uzupełniamy o kwoty, bo repozytorium jest publiczne. Dane firmy i floty w repozytorium są
> przykładowe (tryb demo), dopóki klient nie dostarczy własnych.

Stan na: **2026-10-30**

| Etap | Zakres (wg umowy) | Status | Zamówiony |
|---|---|---|---|
| **1** | Strona internetowa, domena, hosting | 🟡 strona gotowa jako demo, czeka na akceptację klienta i materiały | tak |
| **2** | Panel administracyjny i wizytówka Google | 🟡 panel zbudowany, czeka na wdrożenie, szkolenie i wizytówkę | tak |
| **3** | Moduł zarządzania flotą | ⬜ nie rozpoczęty | opcja (zamówienie e-mailem) |
| – | Abonament (hosting, wsparcie, drobne poprawki) | ⬜ startuje po Odbiorze Etapu 1 | – |

Legenda: `[x]` zrobione · `[ ]` do zrobienia · 🟡 w trakcie · ⬜ nie rozpoczęte · ⏸ czeka na klienta

---

## Etap 1 – strona, domena, hosting (§ 2)

Status: 🟡 **demo gotowe do wstępnej akceptacji**; do Odbioru brakuje materiałów klienta, domeny i
hostingu produkcyjnego.

### Strona internetowa (responsywna: telefon, tablet, komputer)

- [x] Strona główna (wyszukiwarka terminu, kategorie, polecane auta, FAQ, obszar działania)
- [x] Karuzela na górze strony głównej: auta z floty (cena od, link do karty) i slajdy z promocjami
      lub bonusami; przewija się sama (pauza po dotknięciu, najechaniu i na przycisku), przesuwa
      palcem, ma kropki i strzałki. Promocje są w pliku konfiguracji `src/content/promotions.ts`
      (przykładowa promocja w demo wylicza się z cen floty)
- [x] Lista aut i karty pojazdów (parametry, cennik z progami, wyposażenie, zdjęcia)
- [x] Strony kategorii (małe dostawcze, furgony, duże furgony, kontenery z windą)
- [x] Cennik (na telefonie karty, na komputerze tabela)
- [x] Zasady wynajmu: „Jak wynająć” oraz szablony regulaminu i polityki prywatności
- [x] Kontakt: telefon, e-mail, godziny, adres, przycisk „Prowadź do nas” (nawigacja Google)
      i mapa Google ładowana dopiero po kliknięciu
- [x] Formularz zapytania o termin (walidacja, ochrona przed botami)
- [x] Podejście mobile first: sprawdzone w widoku 375 px, bez przewijania w poziomie, cele
      dotykowe ≥ 44 px, dolny pasek „Zadzwoń / Zapytaj o termin”
- [ ] Sprawdzenie na prawdziwych telefonach (iOS Safari, Chrome na Androidzie)
- [ ] Potwierdzenie, że po wyborze sekcji z menu mobilnego ekran ustawia się na górze strony
      (wprowadzono poprawkę; do weryfikacji na urządzeniu)

### Oferta początkowa (do 10 pojazdów)

- [x] Demo z 9 przykładowymi pojazdami i zdjęciami poglądowymi (Wikimedia Commons)
- [ ] ⏸ Dane pojazdów od klienta (model, parametry, ceny, kaucja, limit km)
- [ ] ⏸ Zdjęcia pojazdów klienta (zastępują poglądowe; strona `/zrodla-zdjec` do usunięcia)

### Pozycjonowanie (podstawowa optymalizacja)

- [x] Unikalne tytuły i opisy stron, `canonical`, Open Graph
- [x] Dane strukturalne (firma lokalna, oferta, okruszki), mapa strony, `robots.txt`, `llms.txt`
- [x] Prawdziwy kod 404 dla nieistniejących adresów
- [x] Lokalizacja: Zabrze, miasta ościenne i Górny Śląsk (adres w demo tymczasowy)
- [ ] Zgłoszenie mapy strony w Google Search Console (po uruchomieniu domeny)
- [ ] Włączenie indeksowania (`isDemo: false` i `ALLOW_INDEXING=true`) dopiero po uzupełnieniu danych

### Domena i hosting

- [ ] ⏸ Wybór nazwy domeny z klientem
- [ ] Rejestracja domeny na dane Zamawiającego i certyfikat SSL (HTTPS)
- [ ] Hosting produkcyjny: serwer, baza danych, trwałe miejsce na zdjęcia, kopie zapasowe
- [x] Tymczasowe demo pod publicznym linkiem do pokazania klientowi (nietrwałe, tylko do akceptacji)

### Materiały od klienta (§ 2, ostatni akapit)

- [ ] ⏸ Teksty, logo, dane firmy (adres, telefon, e-mail, godziny, NIP)
- [ ] ⏸ Cenniki i warunki najmu
- [ ] ⏸ Regulamin i polityka prywatności (Wykonawca nie świadczy usług prawnych)

### Odbiór Etapu 1

- [ ] Klient akceptuje wygląd i zakres demo
- [ ] Uruchomienie na domenie klienta z jego danymi i zdjęciami
- [ ] Powiadomienie o gotowości do odbioru i potwierdzenie (5 dni roboczych)
- [ ] Start abonamentu (od pierwszego dnia miesiąca po Odbiorze)

---

## Etap 2 – panel administracyjny i wizytówka Google (§ 3)

Status: 🟡 **panel zbudowany i przetestowany**; zostaje wdrożenie produkcyjne, szkolenie i wizytówka.

### Panel administracyjny

- [x] Logowanie, role właściciel i pracownik (hasła scrypt, blokada po 5 błędnych próbach,
      sesje w bazie, ochrona każdej strony i akcji)
- [x] Flota: dodawanie, edycja, ukrywanie, usuwanie (tylko właściciel), oznaczanie niedostępności
- [x] Pełny formularz auta: opisy, parametry, cennik z progami za dobę, kaucja, limit km, SEO
- [x] Zdjęcia wgrywane z telefonu (aparat lub galeria), kolejność, opisy
- [x] Zapytania z formularza ze statusami: nowe, w kontakcie, zamknięte (plakietka z liczbą nowych)
- [x] Samodzielne publikowanie zmian: strona, mapa strony i podglądy odświeżają się od razu
- [x] Zmiana hasła, wylogowanie z innych urządzeń
- [x] Wygląd mobile first (dolna nawigacja, duże przyciski, szybkie akcje na karcie auta)
- [ ] Konta pracowników (do 3): na razie zakłada je Wykonawca poleceniem CLI; panel nie ma
      jeszcze ekranu zarządzania użytkownikami
- [ ] Ograniczenie liczby prób na formularzach (rate limiting)

### Wdrożenie panelu

- [ ] Baza danych na produkcji i trwały dysk lub magazyn plików na zdjęcia
- [ ] Konto właściciela (nie dane demo z repozytorium)
- [ ] Umowa powierzenia przetwarzania danych osobowych (art. 28 RODO) przed uruchomieniem
- [ ] Powiadomienie e-mail o nowym zapytaniu (nie ma go w zakresie umowy; do decyzji, jako
      zmiana zakresu wg § 8)

### Szkolenie i dokumentacja

- [ ] Szkolenie online do 1,5 godziny
- [ ] Instrukcja obsługi panelu

### Wizytówka Google (Profil Firmy)

- [ ] Założenie lub przejęcie wizytówki (wymaga udziału klienta w weryfikacji)
- [ ] Uzupełnienie: kategorie, godziny, opis, zdjęcia
- [ ] Powiązanie ze stroną (link w danych firmy, `sameAs` w danych strukturalnych)
- [ ] Bing Places (opcjonalnie)

### Tryb aplikacji (PWA)

- [x] Kod PWA przygotowany (manifest, service worker, ekran offline), ale **wyłączony**:
      strona i panel nie są obecnie instalowalne na telefonie
- [ ] Decyzja z klientem, w którym etapie włączamy instalację (flaga `ENABLE_PWA=true`)

### Odbiór Etapu 2

- [ ] Klient przechodzi scenariusze: dodanie auta, zdjęcia z telefonu, zmiana ceny, obsługa zapytania
- [ ] Powiadomienie o gotowości do odbioru i potwierdzenie (5 dni roboczych)

---

## Etap 3 – moduł zarządzania flotą (§ 4)

Status: ⬜ **nie rozpoczęty**, to opcja zamawiana e-mailem. Po zleceniu Strony potwierdzają
szczegółowy zakres i harmonogram.

### Zakres (co najmniej)

- [ ] Ewidencja pojazdów: dane, dokumenty, przebieg (część podstawowych danych jest już w Etapie 2)
- [ ] Terminy z przypomnieniami: przeglądy, OC/AC, koniec leasingu, raty leasingu i kredytu,
      serwis, koniec wynajmu
- [ ] Powiadomienia push na telefon oraz e-mail o zbliżających się terminach
- [ ] Kalendarz wynajmów i dostępności aut, rezerwacje, dane klientów
- [ ] Umowy wynajmu w PDF oraz protokół wydania i zwrotu auta na telefonie (zdjęcia, licznik, podpis)
- [ ] Koszty i przychody każdego pojazdu, raporty i wykresy (zarobki, wykorzystanie floty,
      rentowność), eksport do XLSX i PDF
- [ ] Role i uprawnienia użytkowników (podstawowe role właściciel/pracownik są już w panelu)
- [ ] Włączenie trybu PWA i powiadomień push (instalacja na telefonie)

### Podział na odbiory (wg umowy)

1. Część obejmująca ewidencję, terminy i powiadomienia
2. Pozostała część i Odbiór końcowy

### Poza zakresem Etapu 3 (wycena osobna)

- Integracje z księgowością i KSeF
- GPS i telematyka
- Płatności i rezerwacje online dla klientów
- Aplikacje w sklepach Google Play i App Store

Punkty zaczepienia w kodzie i proponowana kolejność prac: [ARCHITECTURE.md](ARCHITECTURE.md),
sekcja „Co dalej”.

---

## Abonament i utrzymanie

- [ ] Start po Odbiorze Etapu 1
- [ ] Hosting, kopie zapasowe, certyfikat SSL, odnawianie domeny
- [ ] Wsparcie i drobne poprawki w limicie godzin z umowy
- Nowe funkcje i większe zmiany: wycena przed rozpoczęciem prac (§ 8), poza abonamentem

---

## Dziennik prac

| Data | Co zrobiono |
|---|---|
| 2026-10-29 | Projekt i budowa strony demo (Next.js, SEO, system projektowy), zdjęcia poglądowe |
| 2026-10-29 | Panel administracyjny: logowanie, flota, zdjęcia, zapytania, konto; testy; lokalna baza |
| 2026-10-30 | Lokalizacja zmieniona na Zabrze i Śląsk (adres tymczasowy: ul. Dionizego Trocera 20) |
| 2026-10-30 | Audyt mobilny strony i panelu (cennik jako karty, większe cele dotykowe i teksty) |
| 2026-10-30 | Mapa Google na żądanie i przycisk „Prowadź do nas” (strona główna i kontakt) |
| 2026-10-30 | Instalacja PWA wyłączona (to późniejszy etap), poprawka przewijania po zmianie strony |
| 2026-10-30 | Publiczne demo dla klienta (tymczasowy link) do wstępnej akceptacji |
| 2026-10-30 | Karuzela aut i promocji na stronie głównej (automatyczne przewijanie, mobile first) |

## Otwarte decyzje i pytania do klienta

- Nazwa domeny i dane firmy (adres, godziny, NIP)
- Zdjęcia i dane pojazdów (lista do 10 aut w Etapie 1)
- Kto zakłada wizytówkę Google i kto potwierdza weryfikację
- Czy chcemy powiadomienia e-mail o nowych zapytaniach już w Etapie 2
- Kiedy włączamy instalację aplikacji na telefonie (PWA)
- Kto i jak zmienia promocje w karuzeli: na razie plik konfiguracji (zmienia Wykonawca), edycja
  promocji w panelu administracyjnym byłaby osobną funkcją do wyceny (§ 8)
