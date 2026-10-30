import "server-only";
import { z } from "zod";

/**
 * Jedyne miejsce odczytu zmiennych środowiskowych po stronie serwera.
 * Pusta wartość (np. `FOO=`) traktowana jest jak brak wartości.
 */
const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  /** Indeksowanie włączasz świadomie, dopiero po uzupełnieniu danych firmy. */
  ALLOW_INDEXING: z.enum(["true", "false"]).default("false"),
  /** Brak = tryb demo (dane z `modules/vehicles/demo-data.ts`, zapytania tylko w logu). */
  DATABASE_URL: z.string().min(1).optional(),
  /** Katalog na zdjęcia wgrywane z panelu (dysk serwera). Na hostingu bezdyskowym użyj S3/R2. */
  MEDIA_DIR: z.string().min(1).default(".data/media"),
  /** PWA (manifest, service worker, instalacja na telefonie) to późniejszy etap – domyślnie wyłączone. */
  ENABLE_PWA: z.enum(["true", "false"]).default("false"),
});

const parsed = schema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  ALLOW_INDEXING: process.env.ALLOW_INDEXING || undefined,
  DATABASE_URL: process.env.DATABASE_URL || undefined,
  MEDIA_DIR: process.env.MEDIA_DIR || undefined,
  ENABLE_PWA: process.env.ENABLE_PWA || undefined,
});

export const env = {
  /** Origin bez końcowego ukośnika, np. `https://vcars.pl`. */
  siteUrl: parsed.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, ""),
  allowIndexing: parsed.ALLOW_INDEXING === "true",
  databaseUrl: parsed.DATABASE_URL,
  mediaDir: parsed.MEDIA_DIR,
  pwaEnabled: parsed.ENABLE_PWA === "true",
} as const;
