import type { Metadata } from "next";
import { site } from "@/config/site";
import { env } from "@/lib/env";

/** Maks. długość <title> wraz z szablonem „… | VCars" (Google obcina ok. 60 znaków). */
export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 160;
const TITLE_SUFFIX = ` | ${site.name}`;
export const MAX_PAGE_TITLE_LENGTH = MAX_TITLE_LENGTH - TITLE_SUFFIX.length;

/** Bezwzględny URL strony (bez końcowego ukośnika – spójnie z kanonicznymi). */
export function absoluteUrl(path: string = "/"): string {
  if (path === "/" || path === "") return env.siteUrl;
  return `${env.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetadataInput = {
  title: string;
  description: string;
  /** Ścieżka kanoniczna, np. `/flota/ford-transit-custom-l2h1`. */
  path: string;
  /** Użyj tytułu bez szablonu „… | VCars" (np. strona główna). */
  absoluteTitle?: boolean;
  noindex?: boolean;
  /**
   * `"default"` – obrazek OG całego serwisu (`/opengraph-image`);
   * `"segment"` – nie ustawiaj obrazka, bo segment ma własny plik
   * `opengraph-image` (np. karta auta), który Next dołoży sam.
   */
  image?: "default" | "segment";
};

const DEFAULT_OG_ALT = `${site.name} – ${site.tagline} ${site.address.city}`;

/**
 * Buduje komplet metadanych strony: title, description, canonical, Open Graph,
 * Twitter oraz (opcjonalnie) noindex.
 *
 * Next.js scala metadane płytko po kluczach najwyższego poziomu: strona, która
 * ustawia własny `openGraph`, nie dziedziczy obrazka z layoutu. Dlatego obrazek
 * podajemy tu jawnie (albo zostawiamy go plikowi `opengraph-image` segmentu).
 */
export function buildMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noindex = false,
  image = "default",
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = absoluteTitle ? title : `${title}${TITLE_SUFFIX}`;
  const images =
    image === "default"
      ? [{ url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: DEFAULT_OG_ALT }]
      : undefined;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: fullTitle,
      description,
      siteName: site.name,
      locale: site.locale,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(images ? { images } : {}),
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
