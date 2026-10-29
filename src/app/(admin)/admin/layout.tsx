import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Miejsce na panel administracyjny (PWA). Osobna grupa tras `(admin)` ma
 * własny layout bez nagłówka/stopki strony publicznej. Sekcja nigdy nie jest
 * indeksowana i jest wykluczona w robots.txt.
 *
 * Następne kroki opisuje docs/ARCHITECTURE.md (auth, role, CRUD floty,
 * manifest + service worker, `updateTag("vehicles")` po zapisie).
 */
export const metadata: Metadata = {
  title: "Panel administracyjny",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-mist">{children}</div>;
}
