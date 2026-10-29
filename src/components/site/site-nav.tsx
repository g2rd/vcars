"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { CloseIcon, MenuIcon, PhoneIcon } from "@/components/ui/icons";

type NavItem = { href: string; label: string };

type SiteNavProps = {
  items: readonly NavItem[];
  phone: { display: string; e164: string };
};

/**
 * Nawigacja główna. Linki są zawsze w HTML (także mobilne – panel jest tylko
 * ukrywany atrybutem `hidden`), więc roboty widzą pełną strukturę serwisu.
 */
export function SiteNav({ items, phone }: SiteNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <nav aria-label="Główna nawigacja" className="hidden flex-1 md:block">
        <ul className="flex items-center gap-1">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-ui px-3 py-2 text-body-sm text-paper hover:bg-graphite",
                  isActive(item.href) && "bg-graphite",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="ml-auto hidden items-center gap-4 md:flex">
        <a
          href={`tel:${phone.e164}`}
          className="flex items-center gap-2 text-body-sm text-paper hover:underline"
        >
          <PhoneIcon width={16} height={16} />
          <span className="hidden lg:inline">{phone.display}</span>
          <span className="lg:hidden">Zadzwoń</span>
        </a>
        <Link
          href="/zapytanie"
          className="min-h-9 rounded-full bg-paper px-4 py-1.5 text-body-sm text-ink hover:bg-mist"
        >
          Zapytaj o termin
        </Link>
      </div>

      <button
        type="button"
        className="ml-auto flex size-11 items-center justify-center rounded-ui text-paper hover:bg-graphite md:hidden"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <nav
        id="mobile-menu"
        aria-label="Menu mobilne"
        hidden={!open}
        className="absolute inset-x-0 top-14 border-t border-graphite bg-ink md:hidden"
      >
        <ul className="container-page flex flex-col py-2">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center rounded-ui px-2 text-subheading text-paper hover:bg-graphite",
                  isActive(item.href) && "bg-graphite",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="mt-2 border-t border-graphite pt-3">
            <a
              href={`tel:${phone.e164}`}
              className="flex min-h-12 items-center gap-3 px-2 text-subheading text-paper"
            >
              <PhoneIcon />
              {phone.display}
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}
