import "server-only";
import { site } from "@/config/site";
import { env } from "@/lib/env";
import { mapPlaceUrl } from "@/lib/maps";
import { highestDailyRateNet, lowestDailyRateNet } from "@/lib/pricing";
import { absoluteUrl } from "@/lib/seo/metadata";
import {
  FUEL_LABELS,
  GEARBOX_LABELS,
  vehicleName,
  type Category,
  type Vehicle,
} from "@/modules/vehicles/types";

export type JsonLdNode = Record<string, unknown>;

export const BUSINESS_ID = `${env.siteUrl}/#business`;
export const WEBSITE_ID = `${env.siteUrl}/#website`;

export function jsonLdGraph(...nodes: JsonLdNode[]): JsonLdNode {
  return { "@context": "https://schema.org", "@graph": nodes };
}

const toDecimal = (grosze: number): string => (grosze / 100).toFixed(2);

/** Firma (AutoRental ⊂ LocalBusiness) – NAP, godziny, obszar działania, katalog. */
export function businessNode(input: {
  categories: Pick<Category, "name" | "slug">[];
  vehicles: Pick<Vehicle, "priceTiers">[];
}): JsonLdNode {
  const lowest = Math.min(...input.vehicles.map((v) => lowestDailyRateNet(v.priceTiers)));
  const highest = Math.max(...input.vehicles.map((v) => highestDailyRateNet(v.priceTiers)));

  return {
    "@type": "AutoRental",
    "@id": BUSINESS_ID,
    name: site.name,
    legalName: site.legalName,
    url: env.siteUrl,
    description: site.description,
    image: [absoluteUrl("/opengraph-image")],
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo.svg"),
      width: 512,
      height: 512,
    },
    telephone: site.phone.e164,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    hasMap: mapPlaceUrl,
    openingHoursSpecification: site.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...h.days],
      opens: h.opens,
      closes: h.closes,
    })),
    priceRange: `${Math.round(lowest / 100)}-${Math.round(highest / 100)} PLN`,
    currenciesAccepted: "PLN",
    paymentAccepted: site.rental.paymentMethods.join(", "),
    areaServed: site.serviceAreas.map((name) => ({ "@type": "City", name })),
    knowsLanguage: site.language,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Flota do wynajmu",
      itemListElement: input.categories.map((c) => ({
        "@type": "OfferCatalog",
        name: c.name,
        url: absoluteUrl(`/wynajem/${c.slug}`),
      })),
    },
    ...(site.social.length > 0 ? { sameAs: [...site.social] } : {}),
  };
}

export function websiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: env.siteUrl,
    name: site.name,
    inLanguage: site.inLanguage,
    publisher: { "@id": BUSINESS_ID },
  };
}

type WebPageType = "WebPage" | "CollectionPage" | "ContactPage" | "AboutPage";

export function webPageNode(input: {
  type?: WebPageType;
  path: string;
  name: string;
  description: string;
  hasBreadcrumb?: boolean;
}): JsonLdNode {
  const url = absoluteUrl(input.path);
  return {
    "@type": input.type ?? "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: site.inLanguage,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": BUSINESS_ID },
    ...(input.hasBreadcrumb ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbNode(path: string, items: BreadcrumbItem[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(path)}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function itemListNode(
  path: string,
  name: string,
  items: { name: string; path: string }[],
): JsonLdNode {
  return {
    "@type": "ItemList",
    "@id": `${absoluteUrl(path)}#list`,
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

/** Karta auta jako Product z ofertą wynajmu (stawka dobowa netto). */
export function vehicleProductNode(vehicle: Vehicle, category: Pick<Category, "name">): JsonLdNode {
  const path = `/flota/${vehicle.slug}`;
  const url = absoluteUrl(path);
  const name = vehicleName(vehicle);
  const price = toDecimal(lowestDailyRateNet(vehicle.priceTiers));

  return {
    "@type": "Product",
    "@id": `${url}#product`,
    name,
    description: [vehicle.summary, ...vehicle.description].join(" "),
    url,
    sku: vehicle.slug,
    category: category.name,
    brand: { "@type": "Brand", name: vehicle.make },
    model: vehicle.model,
    productionDate: String(vehicle.year),
    image:
      vehicle.images.length > 0
        ? vehicle.images.map((img) => absoluteUrl(img.url))
        : [absoluteUrl(`${path}/opengraph-image`)],
    additionalProperty: [
      { "@type": "PropertyValue", name: "Ładowność", value: vehicle.payloadKg, unitCode: "KGM" },
      {
        "@type": "PropertyValue",
        name: "Dopuszczalna masa całkowita",
        value: vehicle.grossWeightKg,
        unitCode: "KGM",
      },
      {
        "@type": "PropertyValue",
        name: "Pojemność przestrzeni ładunkowej",
        value: vehicle.cargoVolumeM3,
        unitCode: "MTQ",
      },
      { "@type": "PropertyValue", name: "Liczba miejsc", value: vehicle.seats },
      { "@type": "PropertyValue", name: "Paliwo", value: FUEL_LABELS[vehicle.fuel] },
      { "@type": "PropertyValue", name: "Skrzynia biegów", value: GEARBOX_LABELS[vehicle.gearbox] },
      { "@type": "PropertyValue", name: "Kategoria prawa jazdy", value: vehicle.licenseCategory },
    ],
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "PLN",
      price,
      availability:
        vehicle.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price,
        priceCurrency: "PLN",
        unitCode: "DAY",
        valueAddedTaxIncluded: false,
      },
      seller: { "@id": BUSINESS_ID },
    },
  };
}

/** Serializacja do `<script type="application/ld+json">` bezpieczna dla HTML. */
export function serializeJsonLd(data: JsonLdNode): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
