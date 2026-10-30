"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

/** Przycisk wysyłki formularza z blokadą na czas zapisu (zapobiega podwójnemu kliknięciu). */
export function SubmitButton({
  children,
  pendingText = "Zapisywanie…",
  variant = "primary",
  className,
}: {
  children: ReactNode;
  pendingText?: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending} className={className}>
      {pending ? pendingText : children}
    </Button>
  );
}
