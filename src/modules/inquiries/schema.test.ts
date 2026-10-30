import { describe, expect, it } from "vitest";
import { inquirySchema } from "./schema";

const valid = {
  name: "Jan Kowalski",
  email: "jan@example.com",
  phone: "+48 500 111 222",
  consent: "on",
};

describe("inquirySchema", () => {
  it("przyjmuje minimalne poprawne zapytanie", () => {
    expect(inquirySchema.safeParse(valid).success).toBe(true);
  });

  it("wymaga zgody na kontakt", () => {
    const result = inquirySchema.safeParse({ ...valid, consent: undefined });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain("Zgoda na kontakt jest wymagana.");
    }
  });

  it("odrzuca niepoprawny e-mail i telefon z komunikatami po polsku", () => {
    const result = inquirySchema.safeParse({ ...valid, email: "nie-email", phone: "12" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Podaj poprawny adres e-mail.");
      expect(messages).toContain("Podaj poprawny numer telefonu.");
    }
  });

  it("odrzuca zwrot wcześniejszy niż odbiór", () => {
    const result = inquirySchema.safeParse({
      ...valid,
      startDate: "2026-11-12",
      endDate: "2026-11-10",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(["endDate"]);
  });

  it("odrzuca wypełniony honeypot", () => {
    expect(inquirySchema.safeParse({ ...valid, website: "http://spam" }).success).toBe(false);
  });
});
