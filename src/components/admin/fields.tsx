import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { AdminFormState } from "@/modules/admin/form-state";

export const fieldControl =
  "w-full rounded-ui border bg-paper px-4 py-3 text-body text-ink placeholder:text-iron disabled:bg-mist";

export function controlClass(hasError: boolean, extra?: string): string {
  return cn(fieldControl, hasError ? "border-2 border-ink" : "border-iron", extra);
}

type ShellProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string[];
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

/** Etykieta + kontrolka + podpowiedź + komunikat błędu (powiązane przez aria-describedby). */
export function FieldShell({ id, label, hint, error, optional, className, children }: ShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-body-sm font-medium">
        {label}
        {optional && <span className="font-normal text-slate"> (opcjonalnie)</span>}
      </label>
      {children}
      {hint && !error?.length && (
        <p id={`${id}-hint`} className="mt-1.5 text-caption text-slate">
          {hint}
        </p>
      )}
      {error?.length ? (
        <p id={`${id}-error`} className="mt-1.5 text-body-sm font-medium text-ink">
          {error[0]}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string[]): string | undefined {
  if (error?.length) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

type CommonFieldProps = Pick<ShellProps, "label" | "hint" | "error" | "optional" | "className"> & {
  name: string;
};

export function TextField({
  name,
  label,
  hint,
  error,
  optional,
  className,
  ...input
}: CommonFieldProps & Omit<ComponentProps<"input">, "name" | "className">) {
  return (
    <FieldShell id={name} label={label} hint={hint} error={error} optional={optional} className={className}>
      <input
        id={name}
        name={name}
        aria-invalid={Boolean(error?.length)}
        aria-describedby={describedBy(name, hint, error)}
        className={controlClass(Boolean(error?.length))}
        {...input}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  name,
  label,
  hint,
  error,
  optional,
  className,
  ...textarea
}: CommonFieldProps & Omit<ComponentProps<"textarea">, "name" | "className">) {
  return (
    <FieldShell id={name} label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea
        id={name}
        name={name}
        aria-invalid={Boolean(error?.length)}
        aria-describedby={describedBy(name, hint, error)}
        className={controlClass(Boolean(error?.length))}
        {...textarea}
      />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  hint,
  error,
  optional,
  className,
  options,
  ...select
}: CommonFieldProps &
  Omit<ComponentProps<"select">, "name" | "className"> & {
    options: { value: string; label: string }[];
  }) {
  return (
    <FieldShell id={name} label={label} hint={hint} error={error} optional={optional} className={className}>
      <select
        id={name}
        name={name}
        aria-invalid={Boolean(error?.length)}
        aria-describedby={describedBy(name, hint, error)}
        className={controlClass(Boolean(error?.length))}
        {...select}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-ui border border-iron bg-paper p-4">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-5 shrink-0 accent-black"
      />
      <span>
        <span className="block text-body font-medium">{label}</span>
        {description && <span className="mt-0.5 block text-body-sm text-slate">{description}</span>}
      </span>
    </label>
  );
}

/** Komunikat o wyniku akcji: sukces (status) albo błąd (alert). */
export function FormAlert({ state }: { state: AdminFormState }) {
  if (state.status === "success") {
    return (
      <p role="status" className="rounded-ui bg-mist p-4 text-body font-medium">
        {state.message}
      </p>
    );
  }
  if (state.status === "error") {
    return (
      <p role="alert" className="rounded-ui border-2 border-ink p-4 text-body font-medium">
        {state.message}
      </p>
    );
  }
  return null;
}

/** Błędy pól z `state` (puste, gdy brak). */
export function errorsFor(state: AdminFormState, name: string): string[] | undefined {
  return state.status === "error" ? state.fieldErrors?.[name] : undefined;
}

/** Wartość pola do ponownego wypełnienia po błędzie (albo wartość domyślna). */
export function valueFor(state: AdminFormState, name: string, fallback: string): string {
  if (state.status !== "error" || !state.values) return fallback;
  const value = state.values[name];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? fallback);
}
