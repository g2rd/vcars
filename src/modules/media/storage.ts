import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

/**
 * Magazyn wgranych zdjęć na dysku serwera (`MEDIA_DIR`). Adresy mają postać
 * `/media/vehicles/<uuid>.jpg` i są serwowane przez `app/media/[...path]/route.ts`.
 *
 * Interfejs jest celowo mały (zapisz / usuń / rozwiąż ścieżkę): na hostingu bez
 * trwałego dysku podmienisz go na S3/R2 bez zmian w panelu i na stronie.
 */
export const MEDIA_URL_PREFIX = "/media/";

export function mediaRoot(): string {
  return path.resolve(env.mediaDir);
}

/**
 * Zamienia segmenty adresu URL na plik w katalogu mediów. Zwraca `null` dla
 * wszystkiego, co wychodzi poza ten katalog (np. `..`) albo nie jest JPEG-iem.
 */
export function resolveMediaFile(segments: string[]): string | null {
  const root = mediaRoot();
  const target = path.resolve(root, ...segments);
  const relative = path.relative(root, target);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return null;
  if (!/\.jpe?g$/i.test(target)) return null;
  return target;
}

/** Zapisuje przetworzone zdjęcie i zwraca jego publiczny adres. */
export async function storeVehicleImage(data: Buffer): Promise<string> {
  const fileName = `${randomUUID()}.jpg`;
  const directory = path.join(mediaRoot(), "vehicles");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, fileName), data);
  return `${MEDIA_URL_PREFIX}vehicles/${fileName}`;
}

/** Usuwa plik wskazany adresem `/media/...`; zdjęcia spoza magazynu (np. `/vehicles/...`) ignoruje. */
export async function deleteMediaByUrl(url: string): Promise<void> {
  if (!url.startsWith(MEDIA_URL_PREFIX)) return;
  const file = resolveMediaFile(url.slice(MEDIA_URL_PREFIX.length).split("/"));
  if (file) await rm(file, { force: true });
}
