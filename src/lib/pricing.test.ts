import { describe, expect, it } from "vitest";
import { formatPln, formatVolume, pluralPl, tieLastWord } from "./format";
import { highestDailyRateNet, lowestDailyRateNet, quote, tierFor, withVat } from "./pricing";

const tiers = [
  { minDays: 1, pricePerDayNet: 21900 },
  { minDays: 2, pricePerDayNet: 19900 },
  { minDays: 4, pricePerDayNet: 18900 },
  { minDays: 8, pricePerDayNet: 17500 },
];

describe("tierFor", () => {
  it("wybiera największy próg nieprzekraczający liczby dób", () => {
    expect(tierFor(tiers, 1).pricePerDayNet).toBe(21900);
    expect(tierFor(tiers, 3).pricePerDayNet).toBe(19900);
    expect(tierFor(tiers, 4).pricePerDayNet).toBe(18900);
    expect(tierFor(tiers, 30).pricePerDayNet).toBe(17500);
  });

  it("nie zależy od kolejności progów na wejściu", () => {
    expect(tierFor([...tiers].reverse(), 5).pricePerDayNet).toBe(18900);
  });

  it("rzuca błąd dla pustej listy progów", () => {
    expect(() => tierFor([], 1)).toThrow();
  });
});

describe("stawki i wycena", () => {
  it("zwraca najniższą i najwyższą stawkę dobową", () => {
    expect(lowestDailyRateNet(tiers)).toBe(17500);
    expect(highestDailyRateNet(tiers)).toBe(21900);
  });

  it("liczy VAT zaokrąglając do grosza", () => {
    expect(withVat(10000, 0.23)).toBe(12300);
    expect(withVat(21900, 0.23)).toBe(26937);
  });

  it("wycenia najem: stawka z progu × liczba dób + VAT", () => {
    const q = quote(tiers, 3, 0.23);
    expect(q).toEqual({
      days: 3,
      dailyNet: 19900,
      totalNet: 59700,
      vat: 13731,
      totalGross: 73431,
    });
  });

  it("traktuje niepoprawną liczbę dób jak minimum jedną dobę", () => {
    expect(quote(tiers, 0, 0.23).days).toBe(1);
    expect(quote(tiers, 2.9, 0.23).days).toBe(2);
  });
});

describe("formatowanie", () => {
  it("formatuje kwoty w złotych z groszy", () => {
    expect(formatPln(21900).replace(/\s/g, " ")).toBe("219 zł");
    expect(formatPln(6050).replace(/\s/g, " ")).toBe("60,50 zł");
  });

  it("formatuje pojemność z przecinkiem", () => {
    expect(formatVolume(6.8)).toBe("6,8 m³");
    expect(formatVolume(13)).toBe("13 m³");
  });

  it("odmienia słowa przez liczebnik", () => {
    expect(pluralPl(1, "doba", "doby", "dób")).toBe("doba");
    expect(pluralPl(3, "doba", "doby", "dób")).toBe("doby");
    expect(pluralPl(5, "doba", "doby", "dób")).toBe("dób");
    expect(pluralPl(12, "doba", "doby", "dób")).toBe("dób");
    expect(pluralPl(22, "doba", "doby", "dób")).toBe("doby");
  });

  it("wiąże ostatni wyraz twardą spacją, żeby numer domu nie zostawał sam w wierszu", () => {
    expect(tieLastWord("ul. Dionizego Trocera 20")).toBe("ul. Dionizego Trocera 20");
    expect(tieLastWord("Zabrze")).toBe("Zabrze");
  });
});
