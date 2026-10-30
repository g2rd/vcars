import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

type LogoProps = {
  href?: string;
  label?: string;
  /** `md` – pasek nagłówka i panelu, `lg` – stopka. */
  size?: "md" | "lg";
  className?: string;
};

/**
 * Logo firmy (SVG z `public/brand`) w wersji białej na czarne belki: nagłówek, panel
 * i stopka. Podpis „Wynajem samochodów" jest pominięty, bo przy wysokości paska byłby
 * nieczytelny; pełne wersje (z podpisem i sylwetką busa) leżą obok w `public/brand`.
 */
export function Logo({ href = "/", label, size = "md", className }: LogoProps) {
  const large = size === "lg";

  return (
    <Link
      href={href}
      className={cn("flex min-h-11 items-center text-paper", className)}
      aria-label={label ?? `${site.name} – strona główna`}
    >
      {/* SVG nie wymaga optymalizacji obrazów; alt pusty, bo nazwę podaje link (aria-label). */}
      <Image
        src="/brand/logo-wordmark-negative.svg"
        alt=""
        width={large ? 220 : 171}
        height={large ? 36 : 28}
        unoptimized
        loading="eager"
        className={cn("w-auto", large ? "h-9" : "h-7")}
      />
    </Link>
  );
}
