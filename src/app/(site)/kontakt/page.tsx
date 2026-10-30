import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ClickToLoadMap } from "@/components/site/click-to-load-map";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Button } from "@/components/ui/button";
import { ClockIcon, NavigationIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { site } from "@/config/site";
import { directionsUrl, mapEmbedUrl } from "@/lib/maps";
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

          {/* Na telefonie dane kontaktowe i nawigacja są nad formularzem – to najczęstszy cel wizyty. */}
          <aside className="space-y-4 max-lg:order-first" aria-label="Dane kontaktowe">
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
              <Button
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full"
              >
                <NavigationIcon width={18} height={18} />
                Prowadź do nas
              </Button>
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

        <section className="mt-12" aria-labelledby="dojazd">
          <h2 id="dojazd" className="text-heading-sm">
            Dojazd
          </h2>
          <p className="mt-2 max-w-2xl text-body text-slate">
            {site.address.street}, {site.address.postalCode} {site.address.city}. Mapa pokazuje
            lokalizację. Żeby od razu pojechać, użyj przycisku poniżej: uruchomi nawigację w Mapach
            Google od miejsca, w którym jesteś.
          </p>
          <div className="mt-6">
            <ClickToLoadMap
              src={mapEmbedUrl}
              title={`Mapa dojazdu do ${site.name}`}
              address={`${site.address.street}, ${site.address.city}`}
            />
          </div>
          {/* Link „Otwórz w Mapach" w rogu mapy należy do Google i tylko pokazuje miejsce.
              To nasz przycisk uruchamia nawigację, dlatego stoi tuż pod mapą. */}
          <Button
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full sm:w-auto"
          >
            <NavigationIcon width={18} height={18} />
            Prowadź do nas
          </Button>
        </section>
      </div>
    </>
  );
}
