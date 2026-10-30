import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Category } from "@/modules/vehicles/types";

/**
 * Pasek zakładek kategorii. Aktywna zakładka dostaje jasnoturkusowe tło –
 * to jedyny chromatyczny element interfejsu. To zwykłe linki (każda kategoria
 * ma własny, indeksowalny adres), a nie przełącznik po stronie klienta.
 */
export function CategoryTabs({
  categories,
  activeSlug,
}: {
  categories: Pick<Category, "slug" | "name">[];
  /** `null` = zakładka „Wszystkie" (strona /flota). */
  activeSlug: string | null;
}) {
  const tabs = [
    { href: "/flota", label: "Wszystkie", active: activeSlug === null },
    ...categories.map((c) => ({
      href: `/wynajem/${c.slug}`,
      label: c.name,
      active: c.slug === activeSlug,
    })),
  ];

  return (
    <nav aria-label="Kategorie floty" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="flex w-max gap-2 md:w-auto md:flex-wrap">
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              aria-current={tab.active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center whitespace-nowrap rounded-ui px-4 text-body",
                tab.active ? "bg-tab" : "hover:bg-mist",
              )}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
