import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/admin/admin-shell";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { VehicleImagesPanel } from "@/components/admin/vehicle-images-panel";
import { ExternalLinkIcon } from "@/components/ui/icons";
import { getDb } from "@/db/client";
import { requireUser } from "@/modules/auth/session";
import { getAdminVehicle, listCategoryOptions } from "@/modules/vehicles/admin";
import { deleteVehicleAction, updateVehicleAction } from "@/modules/vehicles/admin-actions";
import { uploadVehicleImagesAction } from "@/modules/vehicles/image-actions";
import { vehicleName } from "@/modules/vehicles/types";

export const metadata: Metadata = { title: "Edycja auta" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditVehiclePage({ params, searchParams }: Props) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const db = getDb();
  const [vehicle, categories, query] = await Promise.all([
    getAdminVehicle(db, id),
    listCategoryOptions(db),
    searchParams,
  ]);
  if (!vehicle) notFound();

  return (
    <>
      <PageHeader
        title={vehicleName(vehicle)}
        description={vehicle.isPublished ? "Auto jest widoczne na stronie." : "Auto jest ukryte na stronie."}
        actions={
          vehicle.isPublished ? (
            <Link
              href={`/flota/${vehicle.slug}`}
              target="_blank"
              className="inline-flex min-h-12 items-center gap-2 rounded-ui border border-iron bg-paper px-4 text-body hover:bg-mist"
            >
              Zobacz na stronie
              <ExternalLinkIcon width={16} height={16} />
            </Link>
          ) : undefined
        }
      />

      {query.utworzono && (
        <p role="status" className="mb-5 rounded-ui bg-paper p-4 text-body font-medium">
          Auto zostało dodane. Teraz dodaj zdjęcia poniżej.
        </p>
      )}

      <div className="space-y-5">
        <VehicleForm
          action={updateVehicleAction.bind(null, vehicle.id)}
          categories={categories}
          initial={vehicle}
          submitLabel="Zapisz zmiany"
        />

        <VehicleImagesPanel
          images={vehicle.images}
          uploadAction={uploadVehicleImagesAction.bind(null, vehicle.id)}
        />

        {user.role === "owner" && (
          <details className="rounded-ui bg-paper p-5">
            <summary className="cursor-pointer text-subheading font-medium">Usuwanie auta</summary>
            <p className="mt-3 text-body-sm text-slate">
              Usunięcie jest nieodwracalne: znikną auto, jego cennik i zdjęcia. Zapytania klientów o to
              auto zostaną w skrzynce. Jeśli auto ma tylko chwilowo zniknąć ze strony, użyj opcji
              „Pokaż auto na stronie” w formularzu powyżej.
            </p>
            <form action={deleteVehicleAction.bind(null, vehicle.id)} className="mt-4">
              <button
                type="submit"
                className="min-h-12 rounded-ui border-2 border-ink px-5 text-body font-medium hover:bg-mist"
              >
                Usuń auto na stałe
              </button>
            </form>
          </details>
        )}
      </div>
    </>
  );
}
