import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "pill" | "inverse";

const base =
  "inline-flex items-center justify-center gap-2 text-body transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  /** Czarny wypełniony przycisk – główne akcje. */
  primary: "min-h-12 rounded-ui bg-ink px-4 py-3 text-paper hover:bg-charcoal",
  /** Biały z hairline – akcje drugorzędne na jasnym tle. */
  secondary:
    "min-h-12 rounded-ui border border-iron bg-paper px-4 py-3 text-ink hover:bg-mist",
  /** Biała pigułka na czarnej belce nawigacji. */
  pill: "min-h-9 rounded-full bg-paper px-4 py-1.5 text-body-sm text-ink hover:bg-mist",
  /** Biały przycisk na czarnym tle (sekcje CTA). */
  inverse: "min-h-12 rounded-ui bg-paper px-4 py-3 text-ink hover:bg-mist",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

type ButtonAsLink = CommonProps & { href: string } & Omit<ComponentProps<typeof Link>, "href">;
type ButtonAsButton = CommonProps & { href?: undefined } & ComponentProps<"button">;

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", className, children, ...rest } = props;
  const classes = cn(base, variants[variant], className);

  if (typeof rest.href === "string") {
    const linkProps = rest as Omit<ButtonAsLink, keyof CommonProps>;
    return (
      <Link {...linkProps} className={classes}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as Omit<ButtonAsButton, keyof CommonProps>;
  return (
    <button type="button" {...buttonProps} className={classes}>
      {children}
    </button>
  );
}
