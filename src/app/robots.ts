import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { env } from "@/lib/env";
import { assertIndexingSafe } from "@/lib/seo/indexing";

/** Crawlery trenujące modele AI (nie wpływają na widoczność w wyszukiwarkach). */
const AI_TRAINING_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  assertIndexingSafe();

  // Środowisko demo/staging: zamykamy cały serwis (plus noindex w <meta>).
  if (!env.allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      // Strona /zapytanie ma noindex w <meta> – musi być crawlowalna, żeby robot go zobaczył.
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
      // Boty wyszukiwarek AI (OAI-SearchBot, Claude-SearchBot, PerplexityBot) zostają dozwolone.
      ...(site.seo.blockAiTrainingCrawlers
        ? [{ userAgent: AI_TRAINING_CRAWLERS, disallow: "/" }]
        : []),
    ],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
