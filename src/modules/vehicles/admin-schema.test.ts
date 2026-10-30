import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";
import { groszeToField, parseMoneyToGrosze, parseVehicleForm } from "./admin-schema";

const CATEGORY_ID = "00000000-0000-4000-8000-0000000000c2";

function formData(overrides: Record<string, string | string[]> = {}): FormData {
  const base: Record<string, string | string[]> = {
    categoryId: CATEGORY_ID,
    make: "Ford",
    model: "Transit Courier",
    variant: "L1",
    slug: "",
    year: "2024",
    summary: "Mały i zwrotny van do miasta.",
    description: "Pierwszy akapit opisu.\n\nDrugi akapit,\nz łamaniem linii.",
    idealFor: "Dostawy w mieście\nCatering\n",
    features: "Klimatyzacja\nBluetooth i USB",
    payloadKg: "700",
    grossWeightKg: "2 300",
    cargoVolumeM3: "2,9",
    cargoLengthMm: "1900",
    cargoWidthMm: "1500",
    cargoHeightMm: "1200",
    seats: "2",
    fuel: "diesel",
    gearbox: "manual",
    licenseCategory: "B",
    bodyType: "compact",
    palette: "teal",
    kmLimitPerDay: "250",
    extraKmPrice: "0,60",
    deposit: "1 500",
    status: "available",
    seoTitle: "",
    seoDescription: "",
    sortOrder: "0",
    isPublished: "on",
    tierDays: ["1", "2", "4"],
    tierPrice: ["149", "139,50", "129"],
    ...overrides,
  };

  const data = new FormData();
  for (const [key, value] of Object.entries(base)) {
    for (const item of Array.isArray(value) ? value : [value]) data.append(key, item);
  }
  return data;
}

describe("kwoty", () => {
  it("zamienia złotówki na grosze (przecinek, kropka, spacje)", () => {
    expect(parseMoneyToGrosze("219")).toBe(21900);
    expect(parseMoneyToGrosze("219,50")).toBe(21950);
    expect(parseMoneyToGrosze("219.5")).toBe(21950);
    expect(parseMoneyToGrosze("1 200")).toBe(120000);
    expect(parseMoneyToGrosze("0,60")).toBe(60);
  });

  it("odrzuca nie-kwoty", () => {
    for (const bad of ["", "abc", "12,345", "-5", "1,2,3"]) {
      expect(parseMoneyToGrosze(bad), bad).toBeNaN();
    }
  });

  it("formatuje grosze do pola formularza", () => {
    expect(groszeToField(21900)).toBe("219");
    expect(groszeToField(21950)).toBe("219,50");
    expect(groszeToField(60)).toBe("0,60");
  });
});

describe("slugify", () => {
  it("usuwa polskie znaki i porządkuje separatory", () => {
    expect(slugify("Fiat Doblò Cargo L2")).toBe("fiat-doblo-cargo-l2");
    expect(slugify("  Łódź – Żółw / Ćma  ")).toBe("lodz-zolw-cma");
    expect(slugify("Kontener 4,2 m z windą")).toBe("kontener-4-2-m-z-winda");
  });
});

describe("parseVehicleForm", () => {
  it("parsuje poprawny formularz do danych auta", () => {
    const result = parseVehicleForm(formData());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { data } = result;

    expect(data.slug).toBe("ford-transit-courier-l1");
    expect(data.grossWeightKg).toBe(2300);
    expect(data.cargoVolumeM3).toBe(2.9);
    expect(data.extraKmPriceGrosze).toBe(60);
    expect(data.depositGrosze).toBe(150000);
    expect(data.description).toEqual(["Pierwszy akapit opisu.", "Drugi akapit, z łamaniem linii."]);
    expect(data.idealFor).toEqual(["Dostawy w mieście", "Catering"]);
    expect(data.priceTiers).toEqual([
      { minDays: 1, pricePerDayNet: 14900 },
      { minDays: 2, pricePerDayNet: 13950 },
      { minDays: 4, pricePerDayNet: 12900 },
    ]);
    expect(data.isPublished).toBe(true);
    expect(data.seoTitle).toBeNull();
  });

  it("odczytuje odznaczoną widoczność jako ukryte auto", () => {
    const data = formData();
    data.delete("isPublished");
    const result = parseVehicleForm(data);
    expect(result.ok && result.data.isPublished).toBe(false);
  });

  it("zwraca błędy po polsku dla pól wymaganych i liczb", () => {
    const result = parseVehicleForm(formData({ make: "", payloadKg: "dużo", year: "1900" }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fieldErrors.make).toEqual(["To pole jest wymagane."]);
    expect(result.fieldErrors.payloadKg?.[0]).toBe("Podaj liczbę.");
    expect(result.fieldErrors.year?.[0]).toMatch(/Minimum/);
  });

  it("wymaga ładowności mniejszej niż DMC", () => {
    const result = parseVehicleForm(formData({ payloadKg: "2400", grossWeightKg: "2300" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.payloadKg).toEqual(["Ładowność musi być mniejsza niż DMC."]);
  });

  it("pilnuje progów cenowych", () => {
    const cases: Array<[Record<string, string[]>, RegExp]> = [
      [{ tierDays: [], tierPrice: [] }, /co najmniej jedną/],
      [{ tierDays: ["2", "4"], tierPrice: ["139", "129"] }, /1 dobę/],
      [{ tierDays: ["1", "1"], tierPrice: ["149", "139"] }, /tylko raz/],
      [{ tierDays: ["1", "2"], tierPrice: ["149", "abc"] }, /Wiersz 2/],
      [{ tierDays: ["1", "x"], tierPrice: ["149", "139"] }, /Wiersz 2/],
      [{ tierDays: ["1"], tierPrice: ["0"] }, /większą od zera/],
    ];
    for (const [overrides, pattern] of cases) {
      const result = parseVehicleForm(formData(overrides));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.fieldErrors.priceTiers?.[0]).toMatch(pattern);
    }
  });

  it("ignoruje puste wiersze progów i sortuje pozostałe", () => {
    const result = parseVehicleForm(
      formData({ tierDays: ["4", "", "1"], tierPrice: ["129", "", "149"] }),
    );
    expect(result.ok && result.data.priceTiers.map((t) => t.minDays)).toEqual([1, 4]);
  });

  it("odrzuca niepoprawny adres URL (slug)", () => {
    const result = parseVehicleForm(formData({ slug: "Zły Adres!" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.slug?.[0]).toMatch(/małe litery/);
  });

  it("odrzuca nieznane wartości list wyboru", () => {
    const result = parseVehicleForm(formData({ fuel: "wodór", categoryId: "nie-uuid" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.fuel).toBeDefined();
      expect(result.fieldErrors.categoryId).toEqual(["Wybierz kategorię."]);
    }
  });
});
