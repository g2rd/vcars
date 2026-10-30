"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import {
  CheckboxField,
  FormAlert,
  SelectField,
  TextAreaField,
  TextField,
  errorsFor,
  valueFor,
} from "@/components/admin/fields";
import { PriceTiersField } from "@/components/admin/price-tiers-field";
import { SubmitButton } from "@/components/admin/submit-button";
import { idleState, type AdminFormState } from "@/modules/admin/form-state";
import { groszeToField } from "@/modules/vehicles/admin-schema";
import type { AdminVehicle } from "@/modules/vehicles/admin";
import {
  BODY_TYPES,
  FUELS,
  FUEL_LABELS,
  GEARBOXES,
  GEARBOX_LABELS,
  LICENSE_CATEGORIES,
  PALETTES,
  VEHICLE_STATUSES,
} from "@/modules/vehicles/types";

const BODY_LABELS: Record<(typeof BODY_TYPES)[number], string> = {
  compact: "Mały van",
  panel: "Furgon",
  "panel-long": "Długi furgon / wysoki dach",
  luton: "Kontener (luton)",
};
const PALETTE_LABELS: Record<(typeof PALETTES)[number], string> = {
  orange: "Pomarańczowy",
  teal: "Morski",
  cobalt: "Niebieski",
  sand: "Piaskowy",
  brown: "Brązowy",
};
const STATUS_LABELS: Record<(typeof VEHICLE_STATUSES)[number], string> = {
  available: "Dostępne do wynajęcia",
  unavailable: "Chwilowo niedostępne",
};

type Action = (previous: AdminFormState, formData: FormData) => Promise<AdminFormState>;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-ui bg-paper p-5">
      <h2 className="text-subheading font-medium">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

type FormProps = {
  action: Action;
  categories: { id: string; name: string }[];
  initial?: AdminVehicle;
  submitLabel: string;
};

/** Formularz dodawania/edycji auta. Walidacja po stronie serwera, komunikaty przy polach. */
export function VehicleForm({ action, categories, initial, submitLabel }: FormProps) {
  const [state, formAction] = useActionState(action, idleState);

  const text = (name: string, fallback: string | number = "") => valueFor(state, name, String(fallback));
  const err = (name: string) => errorsFor(state, name);

  const tierRows = (() => {
    if (state.status === "error" && state.values) {
      const days = [state.values.tierDays ?? []].flat();
      const prices = [state.values.tierPrice ?? []].flat();
      const length = Math.max(days.length, prices.length);
      if (length > 0) {
        return Array.from({ length }, (_, i) => ({ days: days[i] ?? "", price: prices[i] ?? "" }));
      }
    }
    return (initial?.priceTiers ?? [{ minDays: 1, pricePerDayNet: 0 }]).map((tier) => ({
      days: String(tier.minDays),
      price: tier.pricePerDayNet > 0 ? groszeToField(tier.pricePerDayNet) : "",
    }));
  })();

  const checked =
    state.status === "error" && state.values ? state.values.isPublished === "on" : (initial?.isPublished ?? true);

  return (
    <form action={formAction} className="space-y-5">
      <FormAlert state={state} />

      <Section title="Podstawowe informacje">
        <SelectField
          name="categoryId"
          label="Kategoria"
          defaultValue={text("categoryId", initial?.categoryId ?? categories[0]?.id ?? "")}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          error={err("categoryId")}
          className="md:col-span-2"
        />
        <TextField name="make" label="Marka" defaultValue={text("make", initial?.make)} error={err("make")} required />
        <TextField name="model" label="Model" defaultValue={text("model", initial?.model)} error={err("model")} required />
        <TextField
          name="variant"
          label="Wersja"
          hint="np. L2H1 – opcjonalnie."
          optional
          defaultValue={text("variant", initial?.variant)}
          error={err("variant")}
        />
        <TextField
          name="year"
          label="Rok produkcji"
          inputMode="numeric"
          defaultValue={text("year", initial?.year ?? new Date().getFullYear())}
          error={err("year")}
          required
        />
        <TextField
          name="slug"
          label="Adres strony (URL)"
          hint="Zostaw puste, a utworzymy go z nazwy auta (np. ford-transit-custom-l2h1)."
          optional
          defaultValue={text("slug", initial?.slug)}
          error={err("slug")}
          className="md:col-span-2"
        />
        <TextField
          name="summary"
          label="Krótki opis (na kartach i w Google)"
          hint="Jedno zdanie, do 160 znaków."
          defaultValue={text("summary", initial?.summary)}
          error={err("summary")}
          className="md:col-span-2"
          required
        />
      </Section>

      <Section title="Opis na stronie">
        <TextAreaField
          name="description"
          label="Opis auta"
          hint="Akapity oddziel pustą linią. Unikalny opis każdego auta pomaga w Google."
          rows={7}
          defaultValue={text("description", initial?.description.join("\n\n"))}
          error={err("description")}
          className="md:col-span-2"
        />
        <TextAreaField
          name="idealFor"
          label="Do czego się nadaje"
          hint="Każda pozycja w osobnej linii."
          rows={4}
          optional
          defaultValue={text("idealFor", initial?.idealFor.join("\n"))}
          error={err("idealFor")}
        />
        <TextAreaField
          name="features"
          label="Wyposażenie"
          hint="Każda pozycja w osobnej linii."
          rows={4}
          optional
          defaultValue={text("features", initial?.features.join("\n"))}
          error={err("features")}
        />
      </Section>

      <Section title="Dane techniczne">
        <TextField name="payloadKg" label="Ładowność (kg)" inputMode="numeric" defaultValue={text("payloadKg", initial?.payloadKg)} error={err("payloadKg")} required />
        <TextField name="grossWeightKg" label="DMC (kg)" inputMode="numeric" hint="Dopuszczalna masa całkowita." defaultValue={text("grossWeightKg", initial?.grossWeightKg)} error={err("grossWeightKg")} required />
        <TextField name="cargoVolumeM3" label="Pojemność (m³)" inputMode="decimal" defaultValue={text("cargoVolumeM3", initial?.cargoVolumeM3.toString().replace(".", ","))} error={err("cargoVolumeM3")} required />
        <TextField name="seats" label="Liczba miejsc" inputMode="numeric" defaultValue={text("seats", initial?.seats ?? 3)} error={err("seats")} required />
        <TextField name="cargoLengthMm" label="Długość przestrzeni (mm)" inputMode="numeric" defaultValue={text("cargoLengthMm", initial?.cargo.lengthMm)} error={err("cargoLengthMm")} required />
        <TextField name="cargoWidthMm" label="Szerokość przestrzeni (mm)" inputMode="numeric" defaultValue={text("cargoWidthMm", initial?.cargo.widthMm)} error={err("cargoWidthMm")} required />
        <TextField name="cargoHeightMm" label="Wysokość przestrzeni (mm)" inputMode="numeric" defaultValue={text("cargoHeightMm", initial?.cargo.heightMm)} error={err("cargoHeightMm")} required />
        <SelectField name="fuel" label="Paliwo" defaultValue={text("fuel", initial?.fuel ?? "diesel")} options={FUELS.map((v) => ({ value: v, label: FUEL_LABELS[v] }))} error={err("fuel")} />
        <SelectField name="gearbox" label="Skrzynia biegów" defaultValue={text("gearbox", initial?.gearbox ?? "manual")} options={GEARBOXES.map((v) => ({ value: v, label: GEARBOX_LABELS[v] }))} error={err("gearbox")} />
        <SelectField name="licenseCategory" label="Prawo jazdy" defaultValue={text("licenseCategory", initial?.licenseCategory ?? "B")} options={LICENSE_CATEGORIES.map((v) => ({ value: v, label: `Kategoria ${v}` }))} error={err("licenseCategory")} />
      </Section>

      <Section title="Cennik i warunki">
        <PriceTiersField initialRows={tierRows} error={err("priceTiers")} />
        <TextField name="kmLimitPerDay" label="Limit km na dobę" inputMode="numeric" defaultValue={text("kmLimitPerDay", initial?.kmLimitPerDay ?? 250)} error={err("kmLimitPerDay")} required />
        <TextField name="extraKmPrice" label="Cena za km ponad limit (zł netto)" inputMode="decimal" defaultValue={text("extraKmPrice", initial ? groszeToField(initial.extraKmPriceGrosze) : "0,60")} error={err("extraKmPrice")} required />
        <TextField name="deposit" label="Kaucja (zł)" inputMode="decimal" defaultValue={text("deposit", initial ? groszeToField(initial.depositGrosze) : "2000")} error={err("deposit")} required />
      </Section>

      <Section title="Widoczność">
        <SelectField
          name="status"
          label="Dostępność"
          defaultValue={text("status", initial?.status ?? "available")}
          options={VEHICLE_STATUSES.map((v) => ({ value: v, label: STATUS_LABELS[v] }))}
          error={err("status")}
        />
        <TextField
          name="sortOrder"
          label="Kolejność na liście"
          hint="Mniejsza liczba = wyżej."
          inputMode="numeric"
          defaultValue={text("sortOrder", initial?.sortOrder ?? 0)}
          error={err("sortOrder")}
        />
        <div className="md:col-span-2">
          <CheckboxField
            name="isPublished"
            label="Pokaż auto na stronie"
            description="Odznacz, żeby ukryć auto bez usuwania (np. na czas serwisu)."
            defaultChecked={checked}
          />
        </div>
      </Section>

      <details className="rounded-ui bg-paper p-5" open={Boolean(err("seoTitle") || err("seoDescription"))}>
        <summary className="cursor-pointer text-subheading font-medium">
          Zaawansowane: SEO i ilustracja zastępcza
        </summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextField
            name="seoTitle"
            label="Tytuł w Google"
            hint="Zostaw puste – utworzymy go automatycznie. Do 60 znaków."
            optional
            defaultValue={text("seoTitle", initial?.seoTitle ?? "")}
            error={err("seoTitle")}
            className="md:col-span-2"
          />
          <TextAreaField
            name="seoDescription"
            label="Opis w Google"
            hint="Zostaw puste – utworzymy go automatycznie. Do 160 znaków."
            optional
            rows={3}
            defaultValue={text("seoDescription", initial?.seoDescription ?? "")}
            error={err("seoDescription")}
            className="md:col-span-2"
          />
          <SelectField name="bodyType" label="Nadwozie (ilustracja)" defaultValue={text("bodyType", initial?.bodyType ?? "panel")} options={BODY_TYPES.map((v) => ({ value: v, label: BODY_LABELS[v] }))} error={err("bodyType")} />
          <SelectField name="palette" label="Kolor ilustracji" defaultValue={text("palette", initial?.palette ?? "orange")} options={PALETTES.map((v) => ({ value: v, label: PALETTE_LABELS[v] }))} error={err("palette")} />
          <p className="text-caption text-slate md:col-span-2">
            Ilustracja pokazuje się tylko wtedy, gdy auto nie ma jeszcze zdjęcia.
          </p>
        </div>
      </details>

      <div className="sticky bottom-20 z-10 flex gap-3 rounded-ui bg-paper p-3 md:bottom-4">
        <SubmitButton className="flex-1 md:flex-none">{submitLabel}</SubmitButton>
        <Link
          href="/admin/flota"
          className="inline-flex min-h-12 items-center justify-center rounded-ui border border-iron px-4 text-body hover:bg-mist"
        >
          Anuluj
        </Link>
      </div>
    </form>
  );
}
