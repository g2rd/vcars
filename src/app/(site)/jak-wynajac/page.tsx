import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { FaqList } from "@/components/site/faq-list";
import { CheckIcon } from "@/components/ui/icons";
import { site } from "@/config/site";
import { faq } from "@/content/faq";
import { breadcrumbNode, jsonLdGraph, webPageNode } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

const PATH = "/jak-wynajac";
const TITLE = "Jak wynająć busa – warunki i dokumenty";
const DESCRIPTION = `Jak wynająć auto dostawcze w ${site.address.cityLocative}: wymagane dokumenty, wiek kierowcy, kaucja, ubezpieczenie i zasady zwrotu. Sprawdź, zanim zarezerwujesz.`;

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

const requirements = [
  `Ukończone ${site.rental.minDriverAge} lat i prawo jazdy od minimum ${site.rental.minLicenseYears} lat`,
  "Prawo jazdy kategorii B (wszystkie auta mają DMC do 3,5 t)",
  "Dowód osobisty lub paszport",
  "Dla firm: NIP i dane osoby upoważnionej do odbioru",
  "Kaucja w wysokości podanej na karcie auta",
];

export default function HowToRentPage() {
  const crumbs = [
    { name: "Strona główna", path: "/" },
    { name: "Jak wynająć", path: PATH },
  ];

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          webPageNode({ path: PATH, name: TITLE, description: DESCRIPTION, hasBreadcrumb: true }),
          breadcrumbNode(PATH, crumbs),
        )}
      />

      <div className="container-page py-6 md:py-10">
        <Breadcrumbs items={crumbs} />
        <h1 className="type-heading mt-6">Jak wynająć busa – warunki i dokumenty</h1>
        <p className="mt-3 max-w-2xl text-subheading text-slate">
          Wynajem trwa kilka minut, jeśli masz przy sobie właściwe dokumenty. Oto wszystko, co warto
          wiedzieć przed rezerwacją.
        </p>

        <section className="mt-12 grid gap-8 md:grid-cols-2" aria-labelledby="wymagania">
          <div>
            <h2 id="wymagania" className="text-heading-sm">
              Czego potrzebujesz
            </h2>
            <ul className="mt-5 space-y-3">
              {requirements.map((item) => (
                <li key={item} className="flex items-start gap-3 text-body">
                  <CheckIcon width={18} height={18} className="mt-1 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-ui bg-mist p-6">
            <h2 className="text-heading-sm">Odbiór i zwrot</h2>
            <p className="mt-3 text-body text-slate">
              Auto odbierasz i zwracasz w naszej wypożyczalni przy {site.address.street},{" "}
              {site.address.city}. Przy wydaniu spisujemy protokół ze stanem licznika, paliwa i
              ewentualnych uszkodzeń – tak samo przy zwrocie, dzięki czemu obie strony wiedzą, w
              jakim stanie jest pojazd.
            </p>
            <p className="mt-3 text-body text-slate">
              Auto oddajesz z takim poziomem paliwa, z jakim je odebrałeś. Godziny otwarcia:{" "}
              {site.openingHours.map((h) => h.label).join(", ")}.
            </p>
          </div>
        </section>

        <section className="mt-14" aria-labelledby="pytania">
          <h2 id="pytania" className="type-heading">
            Pytania i odpowiedzi
          </h2>
          <div className="mt-8 max-w-3xl">
            <FaqList items={faq} />
          </div>
        </section>
      </div>

      <CtaBand />
    </>
  );
}
