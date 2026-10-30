import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { getVehicles } from "@/modules/vehicles/queries";
import { vehicleName } from "@/modules/vehicles/types";

// Strona informacyjna (atrybucja licencji) – nie ma wartości w wynikach wyszukiwania.
export const metadata: Metadata = buildMetadata({
  title: "Źródła zdjęć",
  description: "Autorzy i licencje zdjęć poglądowych użytych w wersji demonstracyjnej serwisu.",
  path: "/zrodla-zdjec",
  noindex: true,
});

export default async function PhotoCreditsPage() {
  const vehicles = await getVehicles();
  const rows = vehicles.flatMap((vehicle) =>
    vehicle.images.map((image) => ({ name: vehicleName(vehicle), image })),
  );

  return (
    <div className="container-page py-6 md:py-10">
      <Breadcrumbs
        items={[
          { name: "Strona główna", path: "/" },
          { name: "Źródła zdjęć", path: "/zrodla-zdjec" },
        ]}
      />
      <h1 className="type-heading mt-6">Źródła zdjęć</h1>
      <p className="mt-3 max-w-2xl text-subheading text-slate">
        W wersji demonstracyjnej używamy zdjęć poglądowych z Wikimedia Commons na wolnych
        licencjach. Prezentowany model lub wersja nadwozia może różnić się od konkretnego egzemplarza
        w ofercie.
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-body-sm">
          <caption className="sr-only">Autorzy i licencje zdjęć</caption>
          <thead>
            <tr className="border-b border-iron text-caption text-slate">
              <th scope="col" className="py-2 pr-4 font-normal">
                Auto
              </th>
              <th scope="col" className="px-4 py-2 font-normal">
                Autor i licencja
              </th>
              <th scope="col" className="py-2 pl-4 font-normal">
                Źródło
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ name, image }) => (
              <tr key={image.url} className="border-b border-mist">
                <th scope="row" className="py-3 pr-4 font-medium">
                  {name}
                </th>
                <td className="px-4 py-3">{image.credit ?? "—"}</td>
                <td className="py-3 pl-4">
                  {image.sourceUrl ? (
                    <a
                      href={image.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      Wikimedia Commons
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
