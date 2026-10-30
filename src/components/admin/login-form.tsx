"use client";

import { useActionState } from "react";
import { FormAlert, TextField, errorsFor, valueFor } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/submit-button";
import { idleState } from "@/modules/admin/form-state";
import { loginAction } from "@/modules/auth/actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, idleState);

  return (
    <form action={formAction} className="space-y-5">
      <FormAlert state={state} />
      {next && <input type="hidden" name="next" value={next} />}
      <TextField
        name="email"
        label="Adres e-mail"
        type="email"
        inputMode="email"
        autoComplete="username"
        required
        autoFocus
        defaultValue={valueFor(state, "email", "")}
        error={errorsFor(state, "email")}
      />
      <TextField
        name="password"
        label="Hasło"
        type="password"
        autoComplete="current-password"
        required
        error={errorsFor(state, "password")}
      />
      <SubmitButton pendingText="Logowanie…" className="w-full">
        Zaloguj się
      </SubmitButton>
    </form>
  );
}
