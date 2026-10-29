"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { submitInquiry } from "@/modules/inquiries/actions";
import { initialInquiryState } from "@/modules/inquiries/types";

type InquiryFormProps = {
  vehicles: { slug: string; name: string }[];
  defaults?: {
    vehicleSlug?: string;
    startDate?: string;
    endDate?: string;
    message?: string;
  };
};

const labelClass = "mb-1.5 block text-body-sm font-medium";
const inputBase =
  "w-full rounded-ui border bg-paper px-4 py-3 text-body text-ink placeholder:text-iron";

function fieldClass(hasError: boolean): string {
  return cn(inputBase, hasError ? "border-2 border-ink" : "border border-iron");
}

/**
 * Formularz zapytania o termin. Waliduje serwer (Server Action + Zod), a
 * formularz działa także bez JavaScript. Po błędzie pola wracają wypełnione.
 */
export function InquiryForm({ vehicles, defaults = {} }: InquiryFormProps) {
  const [state, formAction, isPending] = useActionState(submitInquiry, initialInquiryState);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-ui bg-mist p-6">
        <h2 className="text-heading-sm">Zapytanie wysłane</h2>
        <p className="mt-3 text-body text-slate">{state.message}</p>
        <Button href="/" variant="secondary" className="mt-6">
          Wróć na stronę główną
        </Button>
      </div>
    );
  }

  const errors = state.status === "error" ? state.fieldErrors : {};
  const values = state.status === "error" ? state.values : null;
  const value = (key: keyof NonNullable<InquiryFormProps["defaults"]> | "name" | "email" | "phone") =>
    values ? (values[key] ?? "") : ((defaults as Record<string, string | undefined>)[key] ?? "");

  const describe = (name: string) => (errors[name]?.length ? `${name}-error` : undefined);
  const fieldError = (name: string) =>
    errors[name]?.length ? (
      <p id={`${name}-error`} className="mt-1.5 text-body-sm font-medium text-ink">
        {errors[name][0]}
      </p>
    ) : null;

  return (
    <form action={formAction} className="space-y-5" noValidate={false}>
      {state.status === "error" && (
        <p role="alert" className="rounded-ui border-2 border-ink p-4 text-body font-medium">
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="vehicleSlug" className={labelClass}>
          Auto
        </label>
        <select
          id="vehicleSlug"
          name="vehicleSlug"
          defaultValue={value("vehicleSlug")}
          className={fieldClass(false)}
        >
          <option value="">Jeszcze nie wiem – doradźcie</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.slug} value={vehicle.slug}>
              {vehicle.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className={labelClass}>
            Odbiór
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={value("startDate")}
            aria-invalid={Boolean(errors.startDate)}
            aria-describedby={describe("startDate")}
            className={fieldClass(Boolean(errors.startDate))}
          />
          {fieldError("startDate")}
        </div>
        <div>
          <label htmlFor="endDate" className={labelClass}>
            Zwrot
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={value("endDate")}
            aria-invalid={Boolean(errors.endDate)}
            aria-describedby={describe("endDate")}
            className={fieldClass(Boolean(errors.endDate))}
          />
          {fieldError("endDate")}
        </div>
      </div>

      <div>
        <label htmlFor="name" className={labelClass}>
          Imię i nazwisko
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          defaultValue={value("name")}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describe("name")}
          className={fieldClass(Boolean(errors.name))}
        />
        {fieldError("name")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelClass}>
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            defaultValue={value("phone")}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describe("phone")}
            className={fieldClass(Boolean(errors.phone))}
          />
          {fieldError("phone")}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            defaultValue={value("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describe("email")}
            className={fieldClass(Boolean(errors.email))}
          />
          {fieldError("email")}
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Wiadomość <span className="font-normal text-slate">(opcjonalnie)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          defaultValue={value("message")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describe("message")}
          className={fieldClass(Boolean(errors.message))}
          placeholder="Co przewozisz, skąd i dokąd, czy potrzebujesz pasów lub windy?"
        />
        {fieldError("message")}
      </div>

      {/* Honeypot: niewidoczny dla ludzi, boty go wypełniają. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Nie wypełniaj tego pola
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label className="flex items-start gap-3 text-body-sm">
          <input
            type="checkbox"
            name="consent"
            required
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={describe("consent")}
            className="mt-0.5 size-5 shrink-0 accent-black"
          />
          <span>
            Wyrażam zgodę na kontakt w sprawie tego zapytania. Administratorem danych jest{" "}
            {site.legalName}. Szczegóły w{" "}
            <Link href="/polityka-prywatnosci" className="underline underline-offset-2">
              polityce prywatności
            </Link>
            .
          </span>
        </label>
        {fieldError("consent")}
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Wysyłanie…" : "Wyślij zapytanie"}
      </Button>
    </form>
  );
}
