import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  /** Wyróżnione, wymaga uwagi (np. „Nowe"). */
  solid: "border-ink bg-ink text-paper",
  outline: "border-iron bg-paper text-ink",
  muted: "border-transparent bg-mist text-slate",
} as const;

export function Badge({
  tone = "outline",
  children,
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-caption font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
