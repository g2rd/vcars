import type { Metadata, Viewport } from "next";
import { Suspense, type ReactNode } from "react";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { ServiceWorkerRegister } from "@/components/admin/service-worker-register";
import { env } from "@/lib/env";

/**
 * Panel administracyjny (mobile first). Tryb PWA jest przygotowany, ale wyłączony do
 * późniejszego etapu (`ENABLE_PWA=true` włącza manifest, service worker i instalację
 * na ekranie głównym). Osobna grupa tras `(admin)` ma
 * własny layout bez nagłówka i stopki strony publicznej. Sekcja nigdy nie jest
 * indeksowana i jest wykluczona w robots.txt.
 *
 * Strony panelu czytają ciasteczko sesji (dane dynamiczne), dlatego całość leży
 * w <Suspense>, a walidację „instant navigation" wyłączamy – panel nie ma być
 * prerenderowany, tylko zawsze sprawdzać sesję na serwerze.
 */
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s | Panel VCars" },
  robots: { index: false, follow: false },
  // Manifest i tryb aplikacji tylko po włączeniu PWA: bez nich przeglądarka nie proponuje instalacji.
  ...(env.pwaEnabled
    ? {
        manifest: "/admin/manifest.webmanifest",
        appleWebApp: { capable: true, title: "Panel VCars", statusBarStyle: "black" as const },
      }
    : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Tylko w trybie PWA: bez `cover` env(safe-area-inset-*) jest zawsze 0 i dolna nawigacja
  // nachodzi na pasek gestów iPhone'a. W zwykłej przeglądarce `cover` nie jest potrzebne.
  ...(env.pwaEnabled ? { viewportFit: "cover" as const } : {}),
  themeColor: "#000000",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-mist">
      <Suspense fallback={<AdminSkeleton />}>{children}</Suspense>
      <ServiceWorkerRegister enabled={env.pwaEnabled} />
    </div>
  );
}
