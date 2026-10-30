"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { HomeIcon, InboxIcon, UserIcon, VanIcon } from "@/components/ui/icons";

const ICONS = { home: HomeIcon, van: VanIcon, inbox: InboxIcon, user: UserIcon } as const;

export type AdminNavItem = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  /** Liczba do pokazania w plakietce (np. nowe zapytania). */
  badge?: number;
};

function useActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Dolny pasek zakładek na telefonie (największe cele dotykowe, kciuk obsługuje całość). */
export function AdminBottomNav({ items }: { items: AdminNavItem[] }) {
  const isActive = useActive();
  return (
    <nav
      aria-label="Nawigacja panelu"
      className="on-dark fixed inset-x-0 bottom-0 z-30 bg-ink text-paper md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-16 flex-col items-center justify-center gap-1 text-caption",
                  active ? "bg-graphite text-paper" : "text-ash",
                )}
              >
                <Icon width={22} height={22} />
                {item.label}
                {item.badge ? (
                  <span className="absolute right-[calc(50%-1.75rem)] top-2 min-w-5 rounded-full bg-paper px-1.5 text-center text-caption font-medium leading-5 text-ink">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Menu boczne na większych ekranach. */
export function AdminSideNav({ items }: { items: AdminNavItem[] }) {
  const isActive = useActive();
  return (
    <nav aria-label="Nawigacja panelu">
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-ui px-3 text-body-sm hover:bg-graphite",
                  active ? "bg-graphite text-paper" : "text-ash hover:text-paper",
                )}
              >
                <Icon width={20} height={20} />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="min-w-5 rounded-full bg-paper px-1.5 text-center text-caption font-medium leading-5 text-ink">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
