import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IllustrationPanel } from "@/components/illustrations/illustration-panel";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { PhotoFrame } from "@/components/site/photo-frame";
import { PriceTable } from "@/components/site/price-table";
import { VehicleCard } from "@/components/site/vehicle-card";
import { Button } from "@/components/ui/button";
import { CheckIcon, PhoneIcon } from "@/components/ui/icons";
import { site } from "@/config/site";
import {
  formatKg,
  formatKm,
  formatMetersFromMm,
  formatPln,
  formatVolume,
} from "@/lib/format";
import { lowestDailyRateNet, withVat } from "@/lib/pricing";
import {
  breadcrumbNode,
  jsonLdGraph,
  vehicleProductNode,
  webPageNode,
} from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  getCategory,
  getRelatedVehicles,
  getVehicle,
  getVehicles,
} from "@/modules/vehicles/queries";
import { vehicleSeo } from "@/modules/vehicles/seo";
import { FUEL_LABELS, GEARBOX_LABELS, vehicleName } from "@/modules/vehicles/types";

type Props = { params: Promise<{ slug: string }> };

/**
 * Wyłączamy dev-ową walidację „instant navigation": strona czyta `params` i dane
 * przed odpowiedzią, a nie za <Suspense>. Znane auta i tak są prerenderowane
 * przez `generateStaticParams`, więc nawigacja do nich jest szybka.
 *
 * Nieznany lub ukryty adres dostaje prawdziwe HTTP 404 w `proxy.ts`, jeszcze
 * przed renderem; `notFound()` poniżej to druga linia obrony (strona dostaje wtedy
 * noindex, ale po rozpoczęciu streamingu status mógłby już być 200).
 */
export const instant = false;

export async function generateStaticParams() {
  const vehicles = await getVehicles();
  return vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);
  if (!vehicle) notFound();
  const { title, description } = vehicleSeo(vehicle);
  // Obrazek OG z pliku opengraph-image tego segmentu (karta konkretnego auta).
  return buildMetadata({
    title,
    description,
    path: `/flota/${vehicle.slug}`,
    image: "segment",
  });
}

export default async function VehiclePage({ params }: Props) {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);
  if (!vehicle) notFound();

  const [category, related] = await Promise.all([
    getCategory(vehicle.categorySlug),
    getRelatedVehicles(vehicle.slug, 3),
  ]);
  if (!category) notFound();

  const path = `/flota/${vehicle.slug}`;
  const name = vehicleName(vehicle);
  const { description } = vehicleSeo(vehicle);
  const fromNet = lowestDailyRateNet(vehicle.priceTiers);
  const crumbs = [
    { name: "Strona główna", path: "/" },
    { name: "Flota", path: "/flota" },
    { name: category.name, path: `/wynajem/${category.slug}` },
    { name, path },
  ];

  const { lengthMm, widthMm, heightMm } = vehicle.cargo;
  const specs: [string, string][] = [
    ["Przestrzeń ładunkowa", formatVolume(vehicle.cargoVolumeM3)],
    [
      "Wymiary (dł. × szer. × wys.)",
      `${formatMetersFromMm(lengthMm)} × ${formatMetersFromMm(widthMm)} × ${formatMetersFromMm(heightMm)}`,
    ],
    ["Ładowność", formatKg(vehicle.payloadKg)],
    ["Dopuszczalna masa całkowita", formatKg(vehicle.grossWeightKg)],
    ["Liczba miejsc", String(vehicle.seats)],
    ["Paliwo", FUEL_LABELS[vehicle.fuel]],
    ["Skrzynia biegów", GEARBOX_LABELS[vehicle.gearbox]],
    ["Prawo jazdy", `Kategoria ${vehicle.licenseCategory}`],
    ["Rok produkcji", String(vehicle.year)],
  ];

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          webPageNode({
            path,
            name: `${name} – wynajem`,
            description,
            hasBreadcrumb: true,
          }),
          breadcrumbNode(path, crumbs),
          vehicleProductNode(vehicle, category),
        )}
      />

      <div className="container-page py-6 md:py-10">
        <Breadcrumbs items={crumbs} />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-x-12">
          <div className="min-w-0">
            <h1 className="type-heading">
              {`Wynajem ${name} w ${site.address.cityLocative}`}
            </h1>
            <p className="mt-3 text-subheading text-slate">{vehicle.summary}</p>
            {/* Zdjęcie z panelu admina; auto bez zdjęcia dostaje ilustrację. */}
            {vehicle.images[0] ? (
              <PhotoFrame
                image={vehicle.images[0]}
                sizes="(min-width: 1024px) 640px, 100vw"
                preload
                aspectClassName="aspect-[3/2] md:aspect-[16/10]"
                className="mt-6"
              />
            ) : (
              <IllustrationPanel
                body={vehicle.bodyType}
                palette={vehicle.palette}
                className="mt-6"
              />
            )}
          </div>

          <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start lg:sticky lg:top-20">
            <div className="rounded-ui border border-iron p-6">
              <p className="text-body-sm text-slate">Cena od</p>
              <p className="mt-1">
                <strong className="text-heading-sm font-medium">{formatPln(fromNet)}</strong>{" "}
                <span className="text-body-sm text-slate">netto / doba</span>
              </p>
              <p className="text-body-sm text-slate">
                {formatPln(withVat(fromNet, site.rental.vatRate))} brutto
              </p>

              <div className="mt-5">
                <PriceTable tiers={vehicle.priceTiers} />
              </div>

              <dl className="mt-5 space-y-2 text-body-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate">Kaucja (zwrotna)</dt>
                  <dd className="font-medium">{formatPln(vehicle.depositGrosze)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate">Limit kilometrów</dt>
                  <dd className="font-medium">{formatKm(vehicle.kmLimitPerDay)} / doba</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate">Każdy km ponad limit</dt>
                  <dd className="font-medium">{formatPln(vehicle.extraKmPriceGrosze)} netto</dd>
                </div>
              </dl>

              <Button href={`/zapytanie?auto=${vehicle.slug}`} className="mt-6 w-full">
                Zapytaj o termin
              </Button>
              <a
                href={`tel:${site.phone.e164}`}
                className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-ui border border-iron px-4 py-3 text-body hover:bg-mist"
              >
                <PhoneIcon width={18} height={18} />
                {site.phone.display}
              </a>
            </div>
          </aside>

          <div className="min-w-0 space-y-12">
            <section aria-labelledby="opis">
              <h2 id="opis" className="text-heading-sm">
                Opis
              </h2>
              <div className="mt-4 space-y-4 text-body text-slate">
                {vehicle.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section aria-labelledby="dane">
              <h2 id="dane" className="text-heading-sm">
                Dane techniczne
              </h2>
              <dl className="mt-4 grid gap-x-10 sm:grid-cols-2">
                {specs.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 border-b border-mist py-3 text-body-sm"
                  >
                    <dt className="text-slate">{label}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section aria-labelledby="wyposazenie">
              <h2 id="wyposazenie" className="text-heading-sm">
                Wyposażenie
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {vehicle.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-body">
                    <CheckIcon width={18} height={18} className="shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="zastosowania">
              <h2 id="zastosowania" className="text-heading-sm">
                {`Do czego sprawdzi się ${vehicle.model}`}
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-body text-slate">
                {vehicle.idealFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16" aria-labelledby="zobacz-tez">
            <h2 id="zobacz-tez" className="type-heading">
              Zobacz też
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <VehicleCard key={item.slug} vehicle={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      <CtaBand />
    </>
  );
}
