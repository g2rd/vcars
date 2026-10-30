/** Wspólny kształt wyniku Server Action w panelu (formularze z `useActionState`). */
export type AdminFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
      /** Surowe wartości pól, żeby formularz wrócił wypełniony po błędzie. */
      values?: Record<string, string | string[]>;
    };

export const idleState: AdminFormState = { status: "idle" };

export function formError(
  message: string,
  fieldErrors?: Record<string, string[]>,
  values?: Record<string, string | string[]>,
): AdminFormState {
  return { status: "error", message, fieldErrors, values };
}

export function formSuccess(message: string): AdminFormState {
  return { status: "success", message };
}

/** Zbiera wartości z FormData (pola powtarzalne jako tablice) do ponownego wypełnienia formularza. */
export function collectValues(formData: FormData): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {};
  for (const key of new Set(formData.keys())) {
    const all = formData.getAll(key).filter((v): v is string => typeof v === "string");
    values[key] = all.length > 1 ? all : (all[0] ?? "");
  }
  return values;
}
