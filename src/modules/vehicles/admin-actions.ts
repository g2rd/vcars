"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db/client";
import {
  collectValues,
  formError,
  formSuccess,
  type AdminFormState,
} from "@/modules/admin/form-state";
import { requireOwner, requireUser } from "@/modules/auth/session";
import { deleteMediaByUrl } from "@/modules/media/storage";
import {
  categoryExists,
  createVehicle,
  deleteVehicle,
  isSlugTaken,
  setVehicleFlags,
  updateVehicle,
  type VehicleInput,
} from "./admin";
import { parseVehicleForm } from "./admin-schema";

/** Odświeża strony publiczne (lista, kategorie, karta auta, sitemap, llms.txt, obrazy OG). */
function invalidatePublicSite(...slugs: Array<string | undefined>) {
  updateTag("vehicles");
  for (const slug of new Set(slugs)) if (slug) updateTag(`vehicle:${slug}`);
  revalidatePath("/admin/flota", "layout"); // odświeża też widok panelu po akcji bez stanu
}

function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: string; cause?: { code?: string } } | null);
  return code?.code === "23505" || code?.cause?.code === "23505";
}

const SLUG_TAKEN = ["Auto z takim adresem URL już istnieje. Zmień adres lub nazwę."];

/** Sprawdza reguły zależne od bazy: istnienie kategorii i unikalność adresu. */
async function checkDatabaseRules(
  input: VehicleInput,
  exceptId?: string,
): Promise<Record<string, string[]> | null> {
  const db = getDb();
  const errors: Record<string, string[]> = {};
  if (!(await categoryExists(db, input.categoryId))) errors.categoryId = ["Wybierz istniejącą kategorię."];
  if (await isSlugTaken(db, input.slug, exceptId)) errors.slug = SLUG_TAKEN;
  return Object.keys(errors).length > 0 ? errors : null;
}

export async function createVehicleAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireUser();
  const values = collectValues(formData);

  const parsed = parseVehicleForm(formData);
  if (!parsed.ok) return formError("Sprawdź zaznaczone pola.", parsed.fieldErrors, values);

  const conflicts = await checkDatabaseRules(parsed.data);
  if (conflicts) return formError("Sprawdź zaznaczone pola.", conflicts, values);

  let created: { id: string; slug: string };
  try {
    created = await createVehicle(getDb(), parsed.data);
  } catch (error) {
    if (isUniqueViolation(error)) return formError("Sprawdź zaznaczone pola.", { slug: SLUG_TAKEN }, values);
    throw error;
  }

  invalidatePublicSite(created.slug);
  // Po utworzeniu przechodzimy do edycji – tam można od razu dodać zdjęcia.
  redirect(`/admin/flota/${created.id}?utworzono=1`);
}

export async function updateVehicleAction(
  id: string,
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireUser();
  const values = collectValues(formData);

  const parsed = parseVehicleForm(formData);
  if (!parsed.ok) return formError("Sprawdź zaznaczone pola.", parsed.fieldErrors, values);

  const conflicts = await checkDatabaseRules(parsed.data, id);
  if (conflicts) return formError("Sprawdź zaznaczone pola.", conflicts, values);

  let result: { previousSlug: string; slug: string } | null;
  try {
    result = await updateVehicle(getDb(), id, parsed.data);
  } catch (error) {
    if (isUniqueViolation(error)) return formError("Sprawdź zaznaczone pola.", { slug: SLUG_TAKEN }, values);
    throw error;
  }
  if (!result) return formError("Nie znaleziono tego auta – mogło zostać usunięte.");

  invalidatePublicSite(result.previousSlug, result.slug);
  return formSuccess("Zapisano zmiany. Strona publiczna jest już zaktualizowana.");
}

const flagSchema = z.object({
  id: z.uuid(),
  flag: z.enum(["publish", "hide", "available", "unavailable"]),
});

/** Szybka zmiana z listy aut: pokaż/ukryj na stronie, dostępne/niedostępne. */
export async function setVehicleFlagAction(formData: FormData): Promise<void> {
  await requireUser();
  const parsed = flagSchema.safeParse({ id: formData.get("id"), flag: formData.get("flag") });
  if (!parsed.success) return;

  const flags = {
    publish: { isPublished: true },
    hide: { isPublished: false },
    available: { status: "available" as const },
    unavailable: { status: "unavailable" as const },
  }[parsed.data.flag];

  const updated = await setVehicleFlags(getDb(), parsed.data.id, flags);
  if (updated) invalidatePublicSite(updated.slug);
}

/** Usuwanie jest zarezerwowane dla szefa; zapytania klientów o to auto zostają w bazie. */
export async function deleteVehicleAction(id: string): Promise<void> {
  await requireOwner();
  if (!z.uuid().safeParse(id).success) return;

  const removed = await deleteVehicle(getDb(), id);
  if (removed) {
    await Promise.all(removed.imageUrls.map((url) => deleteMediaByUrl(url)));
    invalidatePublicSite(removed.slug);
  }
  redirect("/admin/flota?usunieto=1");
}
