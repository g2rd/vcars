import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CategoryTabs } from "@/components/site/category-tabs";
import { CtaBand } from "@/components/site/cta-band";
import { VehicleCard } from "@/components/site/vehicle-card";
import { site } from "@/config/site";
import { formatKg, formatPln, formatVolume } from "@/lib/format";
import { lowestDailyRateNet } from "@/lib/pricing";
import { breadcrumbNode, itemListNode, jsonLdGraph, webPageNode } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCategories, getVehicles } from "@/modules/vehicles/queries";
import { vehicleName } from "@/modules/vehicles/types";

const PATH = "/flota";
const TITLE = `Flota – samochody dostawcze do wynajęcia`;
const DESCRIPTION = `Pełna oferta busów i aut dostawczych do wynajęcia w ${site.address.cityLocative}: od małych dostawczych po kontenery z windą. Porównaj pojemność, ładowność i ceny netto.`;

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default async function FleetPage() {
  const [categories, vehicles] = await Promise.all([getCategories(), getVehicles()]);
  const crumbs = [
    { name: "Strona główna", path: "/" },
    { name: "Flota", path: PATH },
  ];

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          webPageNode({
            type: "CollectionPage",
            path: PATH,
            name: TITLE,
            description: DESCRIPTION,
            hasBreadcrumb: true,
          }),
          breadcrumbNode(PATH, crumbs),
          itemListNode(
            PATH,
            "Flota do wynajmu",
            vehicles.map((v) => ({ name: vehicleName(v), path: `/flota/${v.slug}` })),
          ),
        )}
      />

      <div className="container-page py-6 md:py-10">
        <Breadcrumbs items={crumbs} />
        <h1 className="type-heading mt-6">Flota – samochody dostawcze do wynajęcia</h1>
        <p className="mt-3 max-w-2xl text-subheading text-slate">
          {vehicles.length} aut w {categories.length} kategoriach. Wszystkie prowadzisz na prawie
          jazdy kategorii B, a ceny podajemy netto.
        </p>

        <div className="mt-8">
          <CategoryTabs categories={categories} activeSlug={null} />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle, index) => (
            <VehicleCard key={vehicle.slug} vehicle={vehicle} headingLevel="h2" eager={index < 3} />
          ))}
        </div>

        <section className="mt-14" aria-labelledby="porownanie">
          <h2 id="porownanie" className="type-heading">
            Porównanie parametrów
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-body-sm">
              <caption className="sr-only">Porównanie pojemności, ładowności i cen aut</caption>
              <thead>
                <tr className="border-b border-iron text-caption text-slate">
                  <th scope="col" className="sticky left-0 bg-paper py-2 pr-4 font-normal">Auto</th>
                  <th scope="col" className="px-4 py-2 font-normal">Przestrzeń</th>
                  <th scope="col" className="px-4 py-2 font-normal">Ładowność</th>
                  <th scope="col" className="px-4 py-2 font-normal">Miejsca</th>
                  <th scope="col" className="py-2 pl-4 text-right font-normal">Od (netto / doba)</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.slug} className="border-b border-mist">
                    <th scope="row" className="sticky left-0 bg-paper py-3 pr-4 font-medium">
                      <Link href={`/flota/${vehicle.slug}`} className="hover:underline">
                        {vehicleName(vehicle)}
                      </Link>
                    </th>
                    <td className="px-4 py-3">{formatVolume(vehicle.cargoVolumeM3)}</td>
                    <td className="px-4 py-3">{formatKg(vehicle.payloadKg)}</td>
                    <td className="px-4 py-3">{vehicle.seats}</td>
                    <td className="py-3 pl-4 text-right font-medium">
                      {formatPln(lowestDailyRateNet(vehicle.priceTiers))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <CtaBand />
    </>
  );
}
