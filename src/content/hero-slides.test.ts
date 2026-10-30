import { describe, expect, it } from "vitest";
import { demoVehicles } from "@/modules/vehicles/demo-data";
import { buildHeroSlides, MAX_VEHICLE_SLIDES } from "./hero-slides";
import { getPromotions, type Promotion } from "./promotions";

const promo = (overrides: Partial<Promotion> = {}): Promotion => ({
  id: "test",
  badge: "Bonus",
  title: "Tytuł",
  text: "Opis",
  cta: "Sprawdź",
  href: "/zapytanie",
  ...overrides,
});

const vehicleSlides = (slides: ReturnType<typeof buildHeroSlides>) =>
  slides.filter((s) => s.kind === "vehicle");

describe("buildHeroSlides", () => {
  it("zaczyna od wyróżnionego auta, a potem pokazuje po jednym z każdej kategorii", () => {
    const slides = vehicleSlides(
      buildHeroSlides(demoVehicles, { featuredSlug: "ford-transit-custom-l2h1", promotions: [] }),
    );
    const categories = new Set(demoVehicles.map((v) => v.categorySlug));
    const firstCategories = slides
      .slice(0, categories.size)
      .map((s) => demoVehicles.find((v) => v.slug === s.id)!.categorySlug);

    expect(slides[0].id).toBe("ford-transit-custom-l2h1");
    expect(new Set(firstCategories).size).toBe(categories.size);
  });

  it("ogranicza liczbę aut i nie dubluje żadnego", () => {
    const slides = vehicleSlides(buildHeroSlides(demoVehicles, { promotions: [] }));
    expect(slides.length).toBeLessThanOrEqual(MAX_VEHICLE_SLIDES);
    expect(new Set(slides.map((s) => s.id)).size).toBe(slides.length);
  });

  it("pomija auta bez zdjęcia", () => {
    const noPhoto = { ...demoVehicles[0], images: [] };
    const slides = buildHeroSlides([noPhoto, ...demoVehicles.slice(1)], { promotions: [] });
    expect(slides.some((s) => s.id === noPhoto.slug)).toBe(false);
  });

  it("zwraca pustą listę, gdy nie ma żadnego auta ze zdjęciem (nawet z promocją)", () => {
    expect(buildHeroSlides([], { promotions: [promo()] })).toEqual([]);
    expect(
      buildHeroSlides(
        demoVehicles.map((v) => ({ ...v, images: [] })),
        { promotions: [promo()] },
      ),
    ).toEqual([]);
  });

  it("wstawia promocję po pierwszym aucie, a position 0 daje ją na początek", () => {
    const after = buildHeroSlides(demoVehicles, { promotions: [promo()] });
    expect(after[0].kind).toBe("vehicle");
    expect(after[1].kind).toBe("promo");

    const first = buildHeroSlides(demoVehicles, { promotions: [promo({ position: 0 })] });
    expect(first[0].kind).toBe("promo");
  });

  it("promocja nie ma tego samego zdjęcia co sąsiednie auto, o ile nie wskazano inaczej", () => {
    const slides = buildHeroSlides(demoVehicles, { promotions: [promo()] });
    expect(slides[1].image.url).not.toBe(slides[0].image.url);
  });

  it("używa zdjęcia wskazanego auta jako tła promocji", () => {
    const slides = buildHeroSlides(demoVehicles, {
      promotions: [promo({ photoVehicleSlug: "fiat-doblo-cargo-l2" })],
    });
    const promoSlide = slides.find((s) => s.kind === "promo")!;
    expect(promoSlide.image.url).toBe(
      demoVehicles.find((v) => v.slug === "fiat-doblo-cargo-l2")!.images[0].url,
    );
  });

  it("slajd auta prowadzi do jego karty i pokazuje cenę netto", () => {
    const [slide] = vehicleSlides(buildHeroSlides(demoVehicles, { promotions: [] }));
    expect(slide.href).toBe(`/flota/${slide.id}`);
    expect(slide.kind === "vehicle" && slide.price).toMatch(/^od .+ netto \/ doba$/);
  });
});

describe("getPromotions", () => {
  it("przykładowa promocja liczy się z cen floty, a bez floty jej nie ma", () => {
    expect(getPromotions([])).toEqual([]);
    const [only] = getPromotions(demoVehicles);
    expect(only.text).toMatch(/od .+ netto za dobę/);
  });
});
