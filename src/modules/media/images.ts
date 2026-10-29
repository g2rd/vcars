import sharp from "sharp";

/** Błąd, którego komunikat można pokazać użytkownikowi panelu. */
export class ImageError extends Error {}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_FILES_PER_UPLOAD = 5;
export const MAX_IMAGE_WIDTH = 1600;
const MIN_IMAGE_WIDTH = 600;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "heif"]);

export type ProcessedImage = { data: Buffer; width: number; height: number };

/**
 * Przygotowuje zdjęcie z telefonu do strony: sprawdza, że to naprawdę obraz
 * (po zawartości, nie po rozszerzeniu), obraca wg EXIF, zmniejsza do 1600 px
 * szerokości i zapisuje jako JPEG. Metadane (w tym lokalizacja GPS) są usuwane.
 */
export async function processImageUpload(input: Buffer): Promise<ProcessedImage> {
  if (input.length === 0) throw new ImageError("Plik jest pusty.");
  if (input.length > MAX_UPLOAD_BYTES) {
    throw new ImageError(`Plik jest za duży (maks. ${MAX_UPLOAD_BYTES / 1024 / 1024} MB).`);
  }

  let format: string | undefined;
  let width: number | undefined;
  try {
    const meta = await sharp(input, { failOn: "error" }).metadata();
    format = meta.format;
    width = meta.autoOrient?.width ?? meta.width;
  } catch {
    throw new ImageError("To nie jest poprawny plik ze zdjęciem.");
  }

  if (!format || !ALLOWED_FORMATS.has(format)) {
    throw new ImageError("Dozwolone formaty zdjęć: JPG, PNG, WebP, HEIC.");
  }
  if (width !== undefined && width < MIN_IMAGE_WIDTH) {
    throw new ImageError(`Zdjęcie jest zbyt małe (min. ${MIN_IMAGE_WIDTH} px szerokości).`);
  }

  const { data, info } = await sharp(input)
    .rotate()
    .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  return { data, width: info.width, height: info.height };
}
