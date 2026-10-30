"use client";

import { useActionState } from "react";
import { FormAlert, TextField, errorsFor } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/submit-button";
import { idleState } from "@/modules/admin/form-state";
import { changePasswordAction } from "@/modules/auth/actions";

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, idleState);

  return (
    <form action={formAction} className="space-y-4">
      <FormAlert state={state} />
      <TextField
        name="current"
        label="Obecne hasło"
        type="password"
        autoComplete="current-password"
        required
        error={errorsFor(state, "current")}
      />
      <TextField
        name="next"
        label="Nowe hasło"
        type="password"
        autoComplete="new-password"
        required
        hint="Co najmniej 10 znaków."
        error={errorsFor(state, "next")}
      />
      <TextField
        name="confirm"
        label="Powtórz nowe hasło"
        type="password"
        autoComplete="new-password"
        required
        error={errorsFor(state, "confirm")}
      />
      <SubmitButton>Zmień hasło</SubmitButton>
    </form>
  );
}
