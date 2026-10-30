import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/admin-shell";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { getDb } from "@/db/client";
import { requireUser } from "@/modules/auth/session";
import { listCategoryOptions } from "@/modules/vehicles/admin";
import { createVehicleAction } from "@/modules/vehicles/admin-actions";

export const metadata: Metadata = { title: "Nowe auto" };

export default async function NewVehiclePage() {
  await requireUser();
  const categories = await listCategoryOptions(getDb());

  return (
    <>
      <PageHeader
        title="Nowe auto"
        description="Po zapisaniu przejdziesz do edycji, gdzie dodasz zdjęcia."
      />
      <VehicleForm action={createVehicleAction} categories={categories} submitLabel="Dodaj auto" />
    </>
  );
}
