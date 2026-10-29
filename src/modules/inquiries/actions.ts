"use server";

import { z } from "zod";
import { env } from "@/lib/env";
import { getInquiryRepository } from "./provider";
import { INQUIRY_FIELDS, inquirySchema } from "./schema";
import type { InquiryFormState } from "./types";

const SUCCESS_MESSAGE =
  "Dziękujemy! Dostaliśmy Twoje zapytanie i odezwiemy się najszybciej, jak to możliwe.";

/** Dzisiejsza data w strefie Europe/Warsaw (YYYY-MM-DD) – do walidacji „nie w przeszłości". */
function todayInWarsaw(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
}

/**
 * Server Action formularza zapytania. Działa także bez JavaScript
 * (progresywne ulepszenie przez `useActionState`).
 */
export async function submitInquiry(
  _previous: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  // Puste pola traktujemy jak brak wartości.
  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && value.trim() !== "") raw[key] = value.trim();
  }

  // Honeypot wypełniony = bot. Udajemy sukces i nic nie zapisujemy.
  if (raw.website) return { status: "success", message: SUCCESS_MESSAGE };

  const values = Object.fromEntries(INQUIRY_FIELDS.map((key) => [key, raw[key] ?? ""]));
  const parsed = inquirySchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Sprawdź zaznaczone pola i spróbuj ponownie.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const today = todayInWarsaw();
  const { startDate, endDate } = parsed.data;
  if ((startDate && startDate < today) || (endDate && endDate < today)) {
    return {
      status: "error",
      message: "Sprawdź zaznaczone pola i spróbuj ponownie.",
      fieldErrors: {
        [startDate && startDate < today ? "startDate" : "endDate"]: [
          "Wybierz datę od dzisiaj wzwyż.",
        ],
      },
      values,
    };
  }

  const { id, persisted } = await (
    await getInquiryRepository()
  ).create({
    vehicleSlug: parsed.data.vehicleSlug,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    startDate,
    endDate,
    message: parsed.data.message,
    consentAt: new Date(),
  });

  // Miejsce na powiadomienie właściciela (e-mail / SMS / push) – panel admina.
  console.info(`[inquiry] nowe zapytanie ${id} (zapisane: ${persisted})`);

  return {
    status: "success",
    message:
      persisted || env.databaseUrl
        ? SUCCESS_MESSAGE
        : `${SUCCESS_MESSAGE} (Tryb demo: zapytanie nie zostało zapisane – brak DATABASE_URL.)`,
  };
}
