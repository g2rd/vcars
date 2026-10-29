import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/site/logo";
import { ExternalLinkIcon, LogoutIcon } from "@/components/ui/icons";
import { logoutAction } from "@/modules/auth/actions";
import type { AuthUser } from "@/modules/auth/service";
import { AdminBottomNav, AdminSideNav, type AdminNavItem } from "./admin-nav";

const ROLE_LABELS: Record<AuthUser["role"], string> = { owner: "Szef", staff: "Pracownik" };

/**
 * Powłoka panelu, mobile first: na telefonie górna belka + dolny pasek zakładek,
 * od `md` czarne menu boczne. Treść ma stały maksymalny rozmiar i duże odstępy.
 */
export function AdminShell({
  user,
  newInquiries,
  children,
}: {
  user: AuthUser;
  newInquiries: number;
  children: ReactNode;
}) {
  const items: AdminNavItem[] = [
    { href: "/admin", label: "Dziś", icon: "home" },
    { href: "/admin/flota", label: "Flota", icon: "van" },
    { href: "/admin/zapytania", label: "Zapytania", icon: "inbox", badge: newInquiries },
    { href: "/admin/konto", label: "Konto", icon: "user" },
  ];

  return (
    <div className="min-h-dvh md:pl-64">
      <aside className="on-dark fixed inset-y-0 left-0 hidden w-64 flex-col justify-between bg-ink p-4 text-paper md:flex">
        <div className="space-y-8">
          <div className="px-1 pt-1">
            <Logo href="/admin" label="Panel VCars – start" />
            <p className="mt-1 pl-[2.375rem] text-caption text-ash">Panel wypożyczalni</p>
          </div>
          <AdminSideNav items={items} />
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex min-h-11 items-center gap-3 rounded-ui px-3 text-body-sm text-ash hover:bg-graphite hover:text-paper"
          >
            <ExternalLinkIcon width={20} height={20} />
            Zobacz stronę
          </Link>
          <div className="rounded-ui bg-graphite p-3">
            <p className="truncate text-body-sm font-medium">{user.name}</p>
            <p className="text-caption text-ash">{ROLE_LABELS[user.role]}</p>
            <form action={logoutAction} className="mt-3">
              <button
                type="submit"
                className="flex min-h-10 w-full items-center justify-center gap-2 rounded-ui bg-paper px-3 text-body-sm text-ink hover:bg-mist"
              >
                <LogoutIcon width={18} height={18} />
                Wyloguj
              </button>
            </form>
          </div>
        </div>
      </aside>

      <header className="on-dark sticky top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 text-paper md:hidden">
        <Logo href="/admin" label="Panel VCars – start" />
        <Link href="/" target="_blank" className="flex min-h-11 items-center gap-2 text-body-sm text-ash">
          Zobacz stronę
          <ExternalLinkIcon width={16} height={16} />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-28 md:px-8 md:py-10 md:pb-12">
        {children}
      </main>

      <AdminBottomNav items={items} />
    </div>
  );
}

/** Nagłówek strony panelu: tytuł, opis i akcje (np. „Dodaj auto"). */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-heading-sm font-medium md:text-[2rem] md:leading-tight">{title}</h1>
        {description && <p className="mt-1 text-body text-slate">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
