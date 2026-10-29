import { site } from "@/config/site";

/**
 * Manifest PWA panelu: aplikacja „VCars Panel" otwiera się od `/admin`, w osobnym
 * zakresie, niezależnie od strony publicznej (ta ma własny manifest).
 */
export function GET() {
  const manifest = {
    name: `Panel wypożyczalni ${site.name}`,
    short_name: "Panel VCars",
    description: "Zarządzanie flotą, cenami i zapytaniami klientów.",
    lang: site.inLanguage,
    id: "/admin",
    start_url: "/admin",
    scope: "/admin/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      { src: "/admin/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/admin/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/admin/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Dodaj auto", url: "/admin/flota/nowe" },
      { name: "Zapytania", url: "/admin/zapytania" },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  });
}
