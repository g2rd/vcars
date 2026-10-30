import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

type LogoProps = {
  href?: string;
  label?: string;
  /** `md` – napis z liniami prędkości (nagłówek i panel), `lg` – pełny znak z busem (stopka). */
  size?: "md" | "lg";
  className?: string;
};

/**
 * Logo firmy (SVG z `public/brand`) w wersji białej na czarne belki. Na pasku nagłówka
 * pełny znak byłby nieczytelny, więc `md` pokazuje sam napis, a `lg` całość: bus, napis
 * i podpis „Wypożyczalnia samochodów dostawczych". Wersja z numerem telefonu
 * (`logo-full.svg`) jest tylko do druku i dokumentów, bo numer na stronie podajemy tekstem.
 */
export function Logo({ href = "/", label, size = "md", className }: LogoProps) {
  const large = size === "lg";

  return (
    <Link
      href={href}
      className={cn("flex min-h-11 w-fit items-center text-paper", className)}
      aria-label={label ?? `${site.name} – strona główna`}
    >
      {/* SVG nie wymaga optymalizacji obrazów; alt pusty, bo nazwę podaje link (aria-label). */}
      <Image
        src={large ? "/brand/logo-lockup-negative.svg" : "/brand/logo-wordmark-negative.svg"}
        alt=""
        width={large ? 224 : 186}
        height={large ? 227 : 40}
        unoptimized
        loading={large ? "lazy" : "eager"}
        className={cn("h-auto", large ? "w-44 md:w-56" : "w-[11.625rem]")}
      />
    </Link>
  );
}
