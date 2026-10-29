"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/submit-button";
import { idleState, type AdminFormState } from "@/modules/admin/form-state";

type Action = (previous: AdminFormState, formData: FormData) => Promise<AdminFormState>;

/** Wgrywanie zdjęć z galerii lub aparatu telefonu (`accept` + `multiple`). */
export function UploadPhotosForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, idleState);

  return (
    <form action={formAction} className="space-y-3">
      <FormAlert state={state} />
      <div>
        <label htmlFor="photos" className="mb-1.5 block text-body-sm font-medium">
          Dodaj zdjęcia
        </label>
        <input
          id="photos"
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          required
          className="block w-full rounded-ui border border-iron bg-paper text-body-sm file:mr-3 file:min-h-11 file:cursor-pointer file:border-0 file:bg-ink file:px-4 file:text-body-sm file:text-paper"
        />
        <p className="mt-1.5 text-caption text-slate">
          Do 5 zdjęć naraz, każde do 10 MB (JPG, PNG, WebP, HEIC). Zmniejszymy je i usuniemy z nich
          lokalizację GPS. Pierwsze zdjęcie jest zdjęciem głównym.
        </p>
      </div>
      <SubmitButton pendingText="Wgrywanie…" variant="secondary">
        Wgraj zdjęcia
      </SubmitButton>
    </form>
  );
}
