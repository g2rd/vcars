/**
 * Zdjęcia poglądowe do wersji demonstracyjnej – z Wikimedia Commons, na
 * licencjach CC0 lub CC BY-SA (wymagana atrybucja, pokazujemy ją przy zdjęciu
 * oraz na stronie /zrodla-zdjec). Pliki leżą w `public/vehicles/`.
 *
 * Po wdrożeniu panelu admina klient wgrywa własne zdjęcia floty, a ten plik
 * przestaje być potrzebny.
 */
import type { VehicleImage } from "./types";

const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}`;

export const demoPhotos: Record<string, VehicleImage> = {
  "renault-kangoo-van-l1": {
    url: "/vehicles/renault-kangoo-van-l1.jpg",
    alt: "Biały Renault Kangoo Van – widok z przodu pod kątem",
    width: 1600,
    height: 1015,
    credit: "Alexander Migl, CC BY-SA 4.0",
    sourceUrl: commons("Renault Kangoo III Rapid IMG 6292.jpg"),
  },
  "fiat-doblo-cargo-l2": {
    url: "/vehicles/fiat-doblo-cargo-l2.jpg",
    alt: "Biały Fiat Doblò Cargo XL z podwyższonym dachem – widok z przodu pod kątem",
    width: 1600,
    height: 1031,
    credit: "Mr.choppers, CC BY-SA 3.0",
    sourceUrl: commons("2012 Fiat Doblò Cargo XL 1.6 105 Multijet Halmstad.jpg"),
  },
  "ford-transit-custom-l2h1": {
    url: "/vehicles/ford-transit-custom-l2h1.jpg",
    alt: "Biały Ford Transit Custom – widok z przodu pod kątem",
    width: 1600,
    height: 913,
    credit: "Alexander-93, CC BY-SA 4.0",
    sourceUrl: commons("Ford Transit Custom (2023) 1X7A1645.jpg"),
  },
  "opel-vivaro-l2": {
    url: "/vehicles/opel-vivaro-l2.jpg",
    alt: "Żółty Opel Vivaro – widok z przodu pod kątem",
    width: 1600,
    height: 1065,
    credit: "Alexander-93, CC BY-SA 4.0",
    sourceUrl: commons("Opel Vivaro C IMG 9843.jpg"),
  },
  "fiat-ducato-l3h2": {
    url: "/vehicles/fiat-ducato-l3h2.jpg",
    alt: "Biały Fiat Ducato w wersji furgon z wysokim dachem – widok z przodu pod kątem",
    width: 1600,
    height: 979,
    credit: "M 93, CC BY-SA 3.0 DE",
    sourceUrl: commons(
      "Fiat Ducato Kastenwagen 130 Multijet (III, Facelift) – Frontansicht, 13. Juli 2014, Düsseldorf.jpg",
    ),
  },
  "renault-master-l3h2": {
    url: "/vehicles/renault-master-l3h2.jpg",
    alt: "Biały Renault Master z wysokim dachem i długą zabudową",
    width: 1600,
    height: 1067,
    credit: "Spielvogel, CC0",
    sourceUrl: commons("Renault Master III 2018.jpg"),
  },
  "volkswagen-crafter-l4h3": {
    url: "/vehicles/volkswagen-crafter-l4h3.jpg",
    alt: "Srebrny Volkswagen Crafter z wysokim dachem – widok z przodu pod kątem",
    width: 1600,
    height: 1064,
    credit: "Spielvogel, CC0",
    sourceUrl: commons("2016 Volkswagen Crafter. Spielvogel.jpg"),
  },
  "mercedes-sprinter-kontener-z-winda": {
    url: "/vehicles/mercedes-sprinter-kontener-z-winda.jpg",
    alt: "Biały Mercedes Sprinter z zabudową kontenerową typu luton",
    width: 1600,
    height: 1179,
    credit: "Vauxford, CC BY-SA 4.0",
    sourceUrl: commons("2019 Mercedes-Benz Sprinter Luton Van 2.1.jpg"),
  },
  "iveco-daily-kontener-4-2-m-z-winda": {
    url: "/vehicles/iveco-daily-kontener-4-2-m-z-winda.jpg",
    alt: "Niebieski Iveco Daily z zabudową kontenerową",
    width: 1600,
    height: 1064,
    credit: "Spielvogel, CC0",
    sourceUrl: commons("Daily 2016 Kofferaufbau 70C18.jpg"),
  },
};
