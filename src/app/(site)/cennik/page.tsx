import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { site } from "@/config/site";
import { formatKm, formatPln, pluralPl } from "@/lib/format";
import { breadcrumbNode, jsonLdGraph, webPageNode } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { getVehicles } from "@/modules/vehicles/queries";
import { vehicleName } from "@/modules/vehicles/types";

const PATH = "/cennik";
const TITLE = `Cennik wynajmu aut dostawczych`;
const DESCRIPTION = `Cennik wynajmu busów w ${site.address.cityLocative}: stawki za dobę netto, rabaty za dłuższy najem, kaucja i limit kilometrów. Bez ukrytych opłat.`;

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default async function PricingPage() {
  const vehicles = await getVehicles();
  const crumbs = [
    { name: "Strona główna", path: "/" },
    { name: "Cennik", path: PATH },
  ];
  const thresholds = [
    ...new Set(vehicles.flatMap((v) => v.priceTiers.map((t) => t.minDays))),
  ].sort((a, b) => a - b);

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
        <h1 className="type-heading mt-6">Cennik wynajmu aut dostawczych</h1>
        <p className="mt-3 max-w-2xl text-subheading text-slate">
          Stawka za dobę maleje wraz z długością najmu. Poniżej ceny netto – do każdej kwoty
          doliczamy {Math.round(site.rental.vatRate * 100)}% VAT.
        </p>

        {/* Telefon: karty zamiast szerokiej tabeli, żeby ceny nie wymagały przewijania w bok. */}
        <ul className="mt-8 grid gap-3 md:hidden">
          {vehicles.map((vehicle) => (
            <li key={vehicle.slug} className="rounded-ui bg-mist p-4">
              <Link
                href={`/flota/${vehicle.slug}`}
                className="inline-flex min-h-11 items-center text-body font-medium hover:underline"
              >
                {vehicleName(vehicle)}
              </Link>
              <dl className="mt-1 grid grid-cols-2 gap-x-6 gap-y-3 text-body-sm">
                {thresholds.map((days) => {
                  const tier = vehicle.priceTiers.find((t) => t.minDays === days);
                  return (
                    <div key={days} className="border-t border-iron pt-2">
                      <dt className="text-caption text-slate">
                        od {days} {pluralPl(days, "doby", "dób", "dób")}
                      </dt>
                      <dd className="text-body font-medium">
                        {tier ? formatPln(tier.pricePerDayNet) : "—"}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              <p className="mt-3 text-body-sm text-slate">
                Kaucja zwrotna: {formatPln(vehicle.depositGrosze)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-8 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[44rem] text-left text-body-sm">
            <caption className="sr-only">Stawki za dobę netto wg długości najmu</caption>
            <thead>
              <tr className="border-b border-iron text-caption text-slate">
                <th scope="col" className="py-2 pr-4 font-normal">
                  Auto
                </th>
                {thresholds.map((days) => (
                  <th key={days} scope="col" className="px-4 py-2 text-right font-normal">
                    od {days} {pluralPl(days, "doby", "dób", "dób")}
                  </th>
                ))}
                <th scope="col" className="py-2 pl-4 text-right font-normal">
                  Kaucja
                </th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.slug} className="border-b border-mist">
                  <th scope="row" className="py-3 pr-4 font-medium">
                    <Link href={`/flota/${vehicle.slug}`} className="hover:underline">
                      {vehicleName(vehicle)}
                    </Link>
                  </th>
                  {thresholds.map((days) => {
                    const tier = vehicle.priceTiers.find((t) => t.minDays === days);
                    return (
                      <td key={days} className="px-4 py-3 text-right">
                        {tier ? formatPln(tier.pricePerDayNet) : "—"}
                      </td>
                    );
                  })}
                  <td className="py-3 pl-4 text-right text-slate">
                    {formatPln(vehicle.depositGrosze)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="mt-14 grid gap-4 md:grid-cols-3" aria-labelledby="zasady">
          <h2 id="zasady" className="sr-only">
            Zasady rozliczenia
          </h2>
          <div className="rounded-ui bg-mist p-6">
            <h3 className="text-subheading font-medium">Doba wynajmu</h3>
            <p className="mt-2 text-body-sm text-slate">
              Doba to 24 godziny od chwili odbioru. Zwrot po terminie rozliczamy za kolejną
              rozpoczętą dobę, dlatego o opóźnieniu daj nam znać z wyprzedzeniem.
            </p>
          </div>
          <div className="rounded-ui bg-mist p-6">
            <h3 className="text-subheading font-medium">Limit kilometrów</h3>
            <p className="mt-2 text-body-sm text-slate">
              W cenie masz {formatKm(site.rental.kmLimitPerDay)} na dobę. Każdy kilometr ponad
              limit to {formatPln(site.rental.extraKmPriceGrosze)} netto. Dla dłuższych tras
              ustalimy pakiet.
            </p>
          </div>
          <div className="rounded-ui bg-mist p-6">
            <h3 className="text-subheading font-medium">Kaucja i płatność</h3>
            <p className="mt-2 text-body-sm text-slate">
              Kaucja jest zwrotna i zależy od modelu auta. Płacisz: {site.rental.paymentMethods.join(", ")}.
              Po najmie wystawiamy fakturę VAT.
            </p>
          </div>
        </section>
      </div>

      <CtaBand />
    </>
  );
}
