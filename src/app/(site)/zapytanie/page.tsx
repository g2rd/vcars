import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { InquiryForm } from "@/components/site/inquiry-form";
import { PhoneIcon } from "@/components/ui/icons";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCategories, getVehicles } from "@/modules/vehicles/queries";
import { vehicleName } from "@/modules/vehicles/types";

// Strona konwersji bez wartości dla wyszukiwarki (parametry w URL) – noindex.
export const metadata: Metadata = buildMetadata({
  title: "Zapytaj o termin",
  description: `Wybierz auto i termin, a potwierdzimy dostępność i cenę wynajmu w ${site.address.cityLocative}.`,
  path: "/zapytanie",
  noindex: true,
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Czyta parametry zapytania (dane dynamiczne), dlatego renderuje się w <Suspense>. */
async function InquiryFormLoader({ searchParams }: { searchParams: SearchParams }) {
  const [params, vehicles, categories] = await Promise.all([
    searchParams,
    getVehicles(),
    getCategories(),
  ]);

  const auto = first(params.auto);
  const od = first(params.od);
  const doDate = first(params.do);
  const kategoria = first(params.kategoria);

  const vehicleSlug = vehicles.some((v) => v.slug === auto) ? auto : undefined;
  const category = categories.find((c) => c.slug === kategoria);

  return (
    <InquiryForm
      vehicles={vehicles.map((v) => ({ slug: v.slug, name: vehicleName(v) }))}
      defaults={{
        vehicleSlug,
        startDate: od && ISO_DATE.test(od) ? od : undefined,
        endDate: doDate && ISO_DATE.test(doDate) ? doDate : undefined,
        message:
          !vehicleSlug && category ? `Interesuje mnie kategoria: ${category.name}.` : undefined,
      }}
    />
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-[4.5rem] rounded-ui bg-mist" />
      ))}
    </div>
  );
}

export default function InquiryPage({ searchParams }: { searchParams: SearchParams }) {
  const crumbs = [
    { name: "Strona główna", path: "/" },
    { name: "Zapytaj o termin", path: "/zapytanie" },
  ];

  return (
    <div className="container-page py-6 md:py-10">
      <Breadcrumbs items={crumbs} />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <div>
          <h1 className="type-heading">Zapytaj o termin</h1>
          <p className="mt-3 max-w-xl text-subheading text-slate">
            Podaj auto i daty – potwierdzimy dostępność oraz cenę netto, zwykle w ciągu kilku
            godzin w dni robocze.
          </p>
          <div className="mt-8">
            <Suspense fallback={<FormSkeleton />}>
              <InquiryFormLoader searchParams={searchParams} />
            </Suspense>
          </div>
        </div>

        <aside className="h-fit rounded-ui bg-mist p-6" aria-label="Pilne sprawy">
          <h2 className="text-subheading font-medium">Potrzebujesz busa od ręki?</h2>
          <p className="mt-2 text-body-sm text-slate">
            Zadzwoń – sprawdzimy wolne auta na bieżąco.
          </p>
          <a
            href={`tel:${site.phone.e164}`}
            className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-ui bg-ink px-4 py-3 text-body text-paper hover:bg-charcoal"
          >
            <PhoneIcon width={18} height={18} />
            {site.phone.display}
          </a>
          <ul className="mt-5 space-y-1 text-body-sm text-slate">
            {site.openingHours.map((hours) => (
              <li key={hours.label}>{hours.label}</li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
