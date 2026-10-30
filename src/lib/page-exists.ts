import postgres from "postgres";
import { demoCategories, demoVehicles } from "@/modules/vehicles/demo-data";

/**
 * Szybkie sprawdzenie, czy strona auta/kategorii istnieje – używane w `proxy.ts`
 * PRZED renderem, żeby nieznany adres dostał prawdziwe HTTP 404 już w pierwszej
 * odpowiedzi (strumieniowana strona zaczyna od 200, więc `notFound()` w samej
 * stronie przy pierwszym trafieniu zwraca 200 + noindex).
 *
 * Nie importuje `server-only` ani `db/client` – proxy działa poza środowiskiem RSC.
 * Pozytywne wyniki są cache'owane na 30 s; negatywne nigdy, więc świeżo dodane
 * auto jest dostępne od razu. Przy błędzie bazy ruch jest wpuszczany (fail open).
 */
export type PageKind = "vehicle" | "category";

const TTL_MS = 30_000;
const confirmed = new Map<string, number>();
let sql: ReturnType<typeof postgres> | undefined;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function pageExists(kind: PageKind, slug: string): Promise<boolean> {
  if (!SLUG.test(slug) || slug.length > 80) return false;

  const key = `${kind}:${slug}`;
  const until = confirmed.get(key);
  if (until && until > Date.now()) return true;

  let exists: boolean;
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      exists =
        kind === "vehicle"
          ? demoVehicles.some((v) => v.slug === slug)
          : demoCategories.some((c) => c.slug === slug);
    } else {
      sql ??= postgres(url, { max: 1, idle_timeout: 20, connect_timeout: 3 });
      const rows =
        kind === "vehicle"
          ? await sql`select 1 from vehicles where slug = ${slug} and is_published limit 1`
          : await sql`select 1 from vehicle_categories where slug = ${slug} limit 1`;
      exists = rows.length > 0;
    }
  } catch {
    return true;
  }

  if (exists) confirmed.set(key, Date.now() + TTL_MS);
  return exists;
}
