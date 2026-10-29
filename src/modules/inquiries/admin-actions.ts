"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db/client";
import { requireUser } from "@/modules/auth/session";
import { INQUIRY_STATUSES, setInquiryStatus } from "./admin";

const schema = z.object({
  id: z.uuid(),
  status: z.enum(INQUIRY_STATUSES),
});

/** Zmiana statusu zapytania z listy (formularz bez JS też działa). */
export async function updateInquiryStatusAction(formData: FormData): Promise<void> {
  await requireUser();

  const parsed = schema.safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;

  await setInquiryStatus(getDb(), parsed.data.id, parsed.data.status);
  // Odświeża listy, plakietkę z liczbą nowych zapytań i ekran „Dziś".
  revalidatePath("/admin", "layout");
}
