import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { MAX_DESCRIPTION_LENGTH, MAX_PAGE_TITLE_LENGTH } from "@/lib/seo/metadata";
import { demoCategories, demoVehicles } from "./demo-data";
import { vehicleSeo } from "./seo";

describe("integralność danych demo", () => {
  it("ma unikalne identyfikatory i slugi", () => {
    const ids = [...demoCategories, ...demoVehicles].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    const slugs = demoVehicles.map((v) => v.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of [...slugs, ...demoCategories.map((c) => c.slug)]) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("przypisuje każde auto do istniejącej kategorii, a każda kategoria ma auta", () => {
    const categorySlugs = new Set(demoCategories.map((c) => c.slug));
    for (const v of demoVehicles) expect(categorySlugs.has(v.categorySlug)).toBe(true);
    for (const c of demoCategories) {
      expect(demoVehicles.some((v) => v.categorySlug === c.slug)).toBe(true);
    }
  });

  it("ma sensowne progi cenowe: od 1 doby, malejące wraz z długością najmu", () => {
    for (const v of demoVehicles) {
      const sorted = [...v.priceTiers].sort((a, b) => a.minDays - b.minDays);
      expect(sorted[0].minDays).toBe(1);
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].pricePerDayNet).toBeLessThanOrEqual(sorted[i - 1].pricePerDayNet);
      }
    }
  });

  it("ma spójne parametry techniczne", () => {
    for (const v of demoVehicles) {
      expect(v.payloadKg).toBeLessThan(v.grossWeightKg);
      if (v.licenseCategory === "B") expect(v.grossWeightKg).toBeLessThanOrEqual(3500);
      const { lengthMm, widthMm, heightMm } = v.cargo;
      const computed = (lengthMm * widthMm * heightMm) / 1e9;
      // Wymiary mają zgadzać się z deklarowaną pojemnością w granicach 10%.
      expect(Math.abs(computed - v.cargoVolumeM3) / v.cargoVolumeM3).toBeLessThan(0.1);
    }
  });

  it("ma unikalne opisy – brak zduplikowanej treści między kartami", () => {
    const paragraphs = demoVehicles.flatMap((v) => v.description);
    expect(new Set(paragraphs).size).toBe(paragraphs.length);
  });
});

describe("zdjęcia poglądowe", () => {
  const publicDir = fileURLToPath(new URL("../../../public", import.meta.url));

  it("każde auto ma zdjęcie z opisem alternatywnym i atrybucją", () => {
    for (const v of demoVehicles) {
      expect(v.images, v.slug).toHaveLength(1);
      const [image] = v.images;
      expect(image.alt.length).toBeGreaterThan(10);
      expect(image.credit).toMatch(/, (CC0|CC BY(-SA)? [\d.]+( DE)?)$/);
      expect(image.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });

  it("pliki istnieją, są JPEG-iem i mają zadeklarowane wymiary", async () => {
    for (const v of demoVehicles) {
      const [image] = v.images;
      const file = path.join(publicDir, image.url);
      expect(existsSync(file), image.url).toBe(true);
      const meta = await sharp(file).metadata();
      expect(meta.format).toBe("jpeg");
      expect({ w: meta.width, h: meta.height }, image.url).toEqual({
        w: image.width,
        h: image.height,
      });
      // Lekkie pliki – żeby repozytorium i strona nie puchły.
      expect(statSync(file).size).toBeLessThan(400 * 1024);
    }
  });
});

describe("metadane SEO z danych", () => {
  it("mieści tytuły i opisy aut w limitach wyszukiwarek", () => {
    const titles = new Set<string>();
    for (const v of demoVehicles) {
      const { title, description } = vehicleSeo(v);
      expect(title.length).toBeLessThanOrEqual(MAX_PAGE_TITLE_LENGTH);
      expect(description.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
      expect(description.length).toBeGreaterThan(70);
      titles.add(title);
    }
    expect(titles.size).toBe(demoVehicles.length);
  });

  it("mieści tytuły i opisy kategorii w limitach", () => {
    for (const c of demoCategories) {
      expect(c.seoTitle.length).toBeLessThanOrEqual(MAX_PAGE_TITLE_LENGTH);
      expect(c.seoDescription.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    }
  });

  it("preferuje tytuł i opis nadpisane w panelu admina", () => {
    const [vehicle] = demoVehicles;
    const seo = vehicleSeo({ ...vehicle, seoTitle: "Własny tytuł", seoDescription: "Własny opis" });
    expect(seo).toEqual({ title: "Własny tytuł", description: "Własny opis" });
  });
});
