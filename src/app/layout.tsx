import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { site } from "@/config/site";
import { env } from "@/lib/env";
import { assertIndexingSafe } from "@/lib/seo/indexing";
import "./globals.css";

// Build kończy się błędem, gdy ktoś włączy indeksowanie z danymi demonstracyjnymi.
assertIndexingSafe();

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  applicationName: site.name,
  title: {
    default: `${site.name} – ${site.tagline} ${site.address.city}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  // Domyślnie noindex; indeksowanie włącza dopiero ALLOW_INDEXING=true (zob. lib/seo/indexing.ts).
  robots: env.allowIndexing
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      }
    : { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { type: "website", locale: site.locale, siteName: site.name },
  twitter: { card: "summary_large_image" },
  category: "business",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: rozszerzenia przeglądarki (Grammarly, Dark Reader…) dopisują
    // atrybuty do <html>/<body> przed hydracją. Wycisza to różnice tylko w atrybutach tych
    // dwóch elementów – zawartość strony nadal jest sprawdzana.
    <html lang={site.language} className={inter.variable} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
