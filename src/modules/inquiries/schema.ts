import { z } from "zod";

/**
 * Walidacja formularza zapytania. Używana po stronie serwera (Server Action);
 * te same komunikaty błędów trafiają do UI.
 */
export const inquirySchema = z
  .object({
    name: z
      .string({ error: "Podaj imię i nazwisko." })
      .trim()
      .min(2, "Podaj imię i nazwisko.")
      .max(120, "Imię i nazwisko jest zbyt długie."),
    email: z
      .email({ error: "Podaj poprawny adres e-mail." })
      .max(200, "Adres e-mail jest zbyt długi."),
    phone: z
      .string({ error: "Podaj numer telefonu." })
      .trim()
      .regex(/^\+?[\d\s-]{9,20}$/, "Podaj poprawny numer telefonu."),
    vehicleSlug: z.string().max(120).optional(),
    startDate: z.iso.date({ error: "Podaj poprawną datę odbioru." }).optional(),
    endDate: z.iso.date({ error: "Podaj poprawną datę zwrotu." }).optional(),
    message: z.string().trim().max(2000, "Wiadomość może mieć maks. 2000 znaków.").optional(),
    consent: z.literal("on", { error: "Zgoda na kontakt jest wymagana." }),
    /** Honeypot – prawdziwi użytkownicy go nie widzą, więc zostaje pusty. */
    website: z.string().max(0).optional(),
  })
  .refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, {
    path: ["endDate"],
    message: "Data zwrotu nie może być wcześniejsza niż data odbioru.",
  });

export type InquiryInput = z.infer<typeof inquirySchema>;

/** Pola, które odsyłamy do formularza po błędzie (bez zgody i honeypota). */
export const INQUIRY_FIELDS = [
  "name",
  "email",
  "phone",
  "vehicleSlug",
  "startDate",
  "endDate",
  "message",
] as const;
