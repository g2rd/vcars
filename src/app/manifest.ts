import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * Manifest strony publicznej. Panel admina dostanie własny manifest
 * (scope `/admin`) wraz z ikonami PNG 192/512 i service workerem.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} – ${site.tagline}`,
    short_name: site.name,
    description: site.description,
    lang: site.inLanguage,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
