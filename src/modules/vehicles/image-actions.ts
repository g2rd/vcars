"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db/client";
import { formError, formSuccess, type AdminFormState } from "@/modules/admin/form-state";
import { requireUser } from "@/modules/auth/session";
import { ImageError, MAX_FILES_PER_UPLOAD, processImageUpload } from "@/modules/media/images";
import { deleteMediaByUrl, storeVehicleImage } from "@/modules/media/storage";
import {
  addVehicleImage,
  getAdminVehicle,
  moveVehicleImage,
  removeVehicleImage,
  updateVehicleImageAlt,
} from "./admin";
import { vehicleName } from "./types";

function invalidate(slug: string) {
  updateTag("vehicles");
  updateTag(`vehicle:${slug}`);
  revalidatePath("/admin/flota", "layout"); // odświeża też widok panelu po akcji bez stanu
}

/** Wgrywa do 5 zdjęć naraz (z aparatu lub galerii telefonu). */
export async function uploadVehicleImagesAction(
  vehicleId: string,
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireUser();

  const files = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length === 0) return formError("Wybierz co najmniej jedno zdjęcie.");
  if (files.length > MAX_FILES_PER_UPLOAD) {
    return formError(`Maksymalnie ${MAX_FILES_PER_UPLOAD} zdjęć naraz.`);
  }

  const db = getDb();
  const vehicle = await getAdminVehicle(db, vehicleId);
  if (!vehicle) return formError("Nie znaleziono tego auta.");

  const name = vehicleName(vehicle);
  let added = 0;
  const failures: string[] = [];

  for (const file of files) {
    try {
      const processed = await processImageUpload(Buffer.from(await file.arrayBuffer()));
      const url = await storeVehicleImage(processed.data);
      const saved = await addVehicleImage(db, vehicleId, {
        url,
        alt: `${name} – zdjęcie ${vehicle.images.length + added + 1}`,
        width: processed.width,
        height: processed.height,
      });
      if (!saved) {
        await deleteMediaByUrl(url);
        return formError("Nie znaleziono tego auta.");
      }
      added += 1;
    } catch (error) {
      if (error instanceof ImageError) failures.push(`${file.name}: ${error.message}`);
      else throw error;
    }
  }

  if (added > 0) invalidate(vehicle.slug);
  if (failures.length > 0) {
    const prefix = added > 0 ? `Dodano ${added}, ale ` : "";
    return formError(`${prefix}nie wszystkie pliki przeszły: ${failures.join(" ")}`);
  }
  return formSuccess(added === 1 ? "Dodano zdjęcie." : `Dodano ${added} zdjęć.`);
}

const idSchema = z.object({ imageId: z.uuid() });

export async function deleteVehicleImageAction(formData: FormData): Promise<void> {
  await requireUser();
  const parsed = idSchema.safeParse({ imageId: formData.get("imageId") });
  if (!parsed.success) return;

  const removed = await removeVehicleImage(getDb(), parsed.data.imageId);
  if (removed) {
    await deleteMediaByUrl(removed.url);
    invalidate(removed.slug);
  }
}

export async function moveVehicleImageAction(formData: FormData): Promise<void> {
  await requireUser();
  const parsed = idSchema
    .extend({ direction: z.enum(["up", "down"]) })
    .safeParse({ imageId: formData.get("imageId"), direction: formData.get("direction") });
  if (!parsed.success) return;

  const moved = await moveVehicleImage(getDb(), parsed.data.imageId, parsed.data.direction);
  if (moved) invalidate(moved.slug);
}

export async function updateVehicleImageAltAction(formData: FormData): Promise<void> {
  await requireUser();
  const parsed = idSchema
    .extend({ alt: z.string().trim().min(3).max(200) })
    .safeParse({ imageId: formData.get("imageId"), alt: formData.get("alt") });
  if (!parsed.success) return;

  const updated = await updateVehicleImageAlt(getDb(), parsed.data.imageId, parsed.data.alt);
  if (updated) invalidate(updated.slug);
}
