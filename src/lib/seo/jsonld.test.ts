import { describe, expect, it } from "vitest";
import { demoCategories, demoVehicles } from "@/modules/vehicles/demo-data";
import { env } from "@/lib/env";
import {
  BUSINESS_ID,
  breadcrumbNode,
  businessNode,
  itemListNode,
  jsonLdGraph,
  serializeJsonLd,
  vehicleProductNode,
  webPageNode,
  websiteNode,
  type JsonLdNode,
} from "./jsonld";
import { absoluteUrl, buildMetadata } from "./metadata";

/** Typy wycofane z wyników rozszerzonych Google (zob. skill seo-schema). */
const DEPRECATED_TYPES = ["HowTo", "SpecialAnnouncement", "ClaimReview", "VehicleListing"];

function collect(value: unknown, visit: (key: string, v: unknown) => void): void {
  if (Array.isArray(value)) {
    for (const item of value) collect(item, visit);
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      visit(key, child);
      collect(child, visit);
    }
  }
}

// Węzły JSON-LD sprawdzamy po polach, więc luźny typ jest tu świadomym wyborem.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = Record<string, any>;

const [vehicle] = demoVehicles;
const category = demoCategories.find((c) => c.slug === vehicle.categorySlug)!;

const graph = jsonLdGraph(
  businessNode({ categories: demoCategories, vehicles: demoVehicles }),
  websiteNode(),
  webPageNode({
    path: `/flota/${vehicle.slug}`,
    name: "Strona",
    description: "Opis",
    hasBreadcrumb: true,
  }),
  breadcrumbNode(`/flota/${vehicle.slug}`, [
    { name: "Strona główna", path: "/" },
    { name: "Flota", path: "/flota" },
  ]),
  itemListNode("/flota", "Flota", demoVehicles.map((v) => ({ name: v.model, path: `/flota/${v.slug}` }))),
  vehicleProductNode(vehicle, category),
);

describe("JSON-LD", () => {
  it("ma @context schema.org i typ w każdym węźle grafu", () => {
    expect(graph["@context"]).toBe("https://schema.org");
    for (const node of graph["@graph"] as JsonLdNode[]) {
      expect(node["@type"]).toBeTruthy();
    }
  });

  it("nie używa wycofanych typów ani tekstów-zaślepek", () => {
    const json = JSON.stringify(graph);
    for (const type of DEPRECATED_TYPES) expect(json).not.toContain(`"${type}"`);
    expect(json).not.toMatch(/\[(Business Name|City|Phone|Address|Your|INSERT|URL|Email)/i);
    expect(json).not.toMatch(/\bREPLACE(_[A-Z]+)*\b/);
  });

  it("używa wyłącznie bezwzględnych adresów URL", () => {
    collect(graph, (key, value) => {
      if ((key === "url" || key === "item") && typeof value === "string") {
        expect(value).toMatch(/^https?:\/\//);
      }
    });
  });

  it("opisuje firmę kompletnym NAP, geo i godzinami otwarcia", () => {
    const business = (graph["@graph"] as JsonLdNode[])[0] as Loose;
    expect(business["@id"]).toBe(BUSINESS_ID);
    expect(business["@type"]).toBe("AutoRental");
    expect(business.telephone).toMatch(/^\+48\d{9}$/);
    expect(business.address.streetAddress).toBeTruthy();
    expect(business.address.addressLocality).toBeTruthy();
    expect(business.geo.latitude.toString().split(".")[1].length).toBeGreaterThanOrEqual(5);
    expect(business.openingHoursSpecification.length).toBeGreaterThan(0);
    expect(business.priceRange.length).toBeLessThan(100);
  });

  it("buduje Product z ofertą wynajmu w PLN netto za dobę", () => {
    const product = (graph["@graph"] as JsonLdNode[]).at(-1) as Loose;
    expect(product["@type"]).toBe("Product");
    expect(product.offers.priceCurrency).toBe("PLN");
    expect(product.offers.price).toMatch(/^\d+\.\d{2}$/);
    expect(product.offers.priceSpecification.unitCode).toBe("DAY");
    expect(product.offers.priceSpecification.valueAddedTaxIncluded).toBe(false);
    expect(product.offers.availability).toBe("https://schema.org/InStock");
    expect(product.offers.seller).toEqual({ "@id": BUSINESS_ID });
  });

  it("numeruje okruszki od 1 i kończy na bieżącej stronie", () => {
    const crumbs = breadcrumbNode("/flota", [
      { name: "Strona główna", path: "/" },
      { name: "Flota", path: "/flota" },
    ]) as Loose;
    expect(crumbs.itemListElement.map((i: { position: number }) => i.position)).toEqual([1, 2]);
    expect(crumbs.itemListElement[1].item).toBe(absoluteUrl("/flota"));
  });

  it("zabezpiecza serializację przed wstrzyknięciem </script>", () => {
    const out = serializeJsonLd({ "@type": "Thing", name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });
});

describe("buildMetadata", () => {
  it("ustawia canonical, Open Graph i Twitter spójnie z adresem strony", () => {
    const meta = buildMetadata({ title: "Cennik", description: "Opis", path: "/cennik" });
    expect(meta.alternates?.canonical).toBe(`${env.siteUrl}/cennik`);
    expect(meta.openGraph?.url).toBe(`${env.siteUrl}/cennik`);
    expect(meta.openGraph?.title).toBe("Cennik | VCars");
    expect(meta.robots).toBeUndefined();
  });

  it("podaje jawnie obrazek OG, bo strona z własnym openGraph nie dziedziczy go z layoutu", () => {
    const meta = buildMetadata({ title: "Cennik", description: "Opis", path: "/cennik" });
    expect(meta.openGraph?.images).toEqual([
      expect.objectContaining({ url: `${env.siteUrl}/opengraph-image`, width: 1200, height: 630 }),
    ]);
    expect(meta.twitter?.images).toBeDefined();
  });

  it("zostawia obrazek plikowi segmentu, gdy image=segment", () => {
    const meta = buildMetadata({
      title: "Auto",
      description: "Opis",
      path: "/flota/auto",
      image: "segment",
    });
    expect(meta.openGraph?.images).toBeUndefined();
    expect(meta.twitter?.images).toBeUndefined();
  });

  it("ustawia noindex tylko na żądanie i pozwala pominąć szablon tytułu", () => {
    const meta = buildMetadata({
      title: "Zapytanie",
      description: "Opis",
      path: "/zapytanie",
      noindex: true,
      absoluteTitle: true,
    });
    expect(meta.robots).toEqual({ index: false, follow: false });
    expect(meta.title).toEqual({ absolute: "Zapytanie" });
  });

  it("kanoniczny adres strony głównej nie ma końcowego ukośnika", () => {
    expect(absoluteUrl("/")).toBe(env.siteUrl);
    expect(absoluteUrl("/").endsWith("/")).toBe(false);
  });
});
