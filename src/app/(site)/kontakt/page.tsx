import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { InquiryForm } from "@/components/site/inquiry-form";
import { ClockIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { site } from "@/config/site";
import { breadcrumbNode, jsonLdGraph, webPageNode } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { getVehicles } from "@/modules/vehicles/queries";
import { vehicleName } from "@/modules/vehicles/types";

const PATH = "/kontakt";
const TITLE = `Kontakt i dojazd – wypożyczalnia ${site.address.city}`;
const DESCRIPTION = `Wypożyczalnia aut dostawczych ${site.name}, ${site.address.street}, ${site.address.city}. Zadzwoń ${site.phone.display}, napisz lub wpadnij – sprawdź godziny otwarcia.`;

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${site.geo.latitude},${site.geo.longitude}`;

export default async function ContactPage() {
  const vehicles = await getVehicles();
  const crumbs = [
    { name: "Strona główna", path: "/" },
    { name: "Kontakt", path: PATH },
  ];

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          webPageNode({
            type: "ContactPage",
            path: PATH,
            name: TITLE,
            description: DESCRIPTION,
            hasBreadcrumb: true,
          }),
          breadcrumbNode(PATH, crumbs),
        )}
      />

      <div className="container-page py-6 md:py-10">
        <Breadcrumbs items={crumbs} />
        <h1 className="type-heading mt-6">Kontakt i dojazd</h1>
        <p className="mt-3 max-w-2xl text-subheading text-slate">
          Najszybciej odpowiemy przez telefon. Wolisz napisać? Wypełnij formularz, a oddzwonimy.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
          <section aria-labelledby="formularz">
            <h2 id="formularz" className="text-heading-sm">
              Napisz do nas
            </h2>
            <div className="mt-6">
              <InquiryForm
                vehicles={vehicles.map((v) => ({ slug: v.slug, name: vehicleName(v) }))}
              />
            </div>
          </section>

          <aside className="space-y-4" aria-label="Dane kontaktowe">
            <div className="rounded-ui bg-mist p-6">
              <h2 className="flex items-center gap-2 text-subheading font-medium">
                <PhoneIcon width={18} height={18} />
                Telefon i e-mail
              </h2>
              <p className="mt-3 text-body">
                <a href={`tel:${site.phone.e164}`} className="font-medium hover:underline">
                  {site.phone.display}
                </a>
                <br />
                <a href={`mailto:${site.email}`} className="text-slate hover:underline">
                  {site.email}
                </a>
              </p>
            </div>

            <div className="rounded-ui bg-mist p-6">
              <h2 className="flex items-center gap-2 text-subheading font-medium">
                <PinIcon width={18} height={18} />
                Adres wypożyczalni
              </h2>
              <address className="mt-3 text-body not-italic">
                {site.name}
                <br />
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.city}
              </address>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-body-sm underline underline-offset-2"
              >
                Wyznacz trasę w Mapach Google
              </a>
            </div>

            <div className="rounded-ui bg-mist p-6">
              <h2 className="flex items-center gap-2 text-subheading font-medium">
                <ClockIcon width={18} height={18} />
                Godziny otwarcia
              </h2>
              <ul className="mt-3 space-y-1 text-body">
                {site.openingHours.map((hours) => (
                  <li key={hours.label}>{hours.label}</li>
                ))}
                <li className="text-slate">Niedziela: zamknięte</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
