import { site } from "@/config/site";

/** Adres do wyszukiwarki Map Google (bez „ul.", bo przedrostek tylko utrudnia dopasowanie). */
const place = `${site.address.street.replace(/^ul\.\s*/i, "")}, ${site.address.postalCode} ${site.address.city}`;

/**
 * Nawigacja do wypożyczalni. Na telefonie otwiera aplikację Mapy Google z trasą
 * od bieżącej lokalizacji, na komputerze – mapy w przeglądarce.
 */
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place)}&travelmode=driving`;

/** Pinezka na mapie (do danych strukturalnych `hasMap`). */
export const mapPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

/** Adres ramki z mapą (bez klucza API). Ładujemy go dopiero po kliknięciu użytkownika. */
export const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(place)}&hl=pl&z=16&output=embed`;
