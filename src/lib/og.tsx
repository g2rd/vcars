import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import { VanShapes } from "@/components/illustrations/van";
import { site } from "@/config/site";
import { MEDIA_URL_PREFIX, resolveMediaFile } from "@/modules/media/storage";
import type { BodyType, Palette } from "@/modules/vehicles/types";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/**
 * Inter w dwóch podzbiorach (łaciński + rozszerzony), bo domyślny font
 * generatora nie ma polskich znaków (ą, ę, ł, ó, ś, ż…).
 */
async function loadFonts() {
  // Cache sprawia, że odczyt plików fontów nie robi z obrazów OG tras dynamicznych.
  "use cache";
  cacheLife("max");
  const read = async (file: string) => {
    const buffer = await readFile(path.join(process.cwd(), "src", "assets", "fonts", file));
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  };
  const [latin, latinExt] = await Promise.all([
    read("inter-latin-500.woff"),
    read("inter-latin-ext-500.woff"),
  ]);
  return [
    { name: "Inter", data: latin, weight: 500 as const, style: "normal" as const },
    { name: "InterExt", data: latinExt, weight: 500 as const, style: "normal" as const },
  ];
}

/**
 * Zdjęcie z `public/` jako data URI (generator OG nie ma dostępu do `next/image`).
 * Dozwolone są tylko ścieżki z naszych danych (`/vehicles/…jpg`).
 */
async function loadPhoto(photoUrl: string): Promise<string | null> {
  "use cache";
  cacheLife("max");
  if (!/^\/[\w./-]+\.jpe?g$/i.test(photoUrl) || photoUrl.includes("..")) return null;

  // Zdjęcia z panelu (`/media/...`) leżą w katalogu mediów, a statyczne (`/vehicles/...`) w `public/`.
  const file = photoUrl.startsWith(MEDIA_URL_PREFIX)
    ? resolveMediaFile(photoUrl.slice(MEDIA_URL_PREFIX.length).split("/"))
    : path.join(process.cwd(), "public", photoUrl);
  if (!file) return null;

  try {
    return `data:image/jpeg;base64,${(await readFile(file)).toString("base64")}`;
  } catch {
    return null;
  }
}

/** Logo (czarne, wersja na jasne tło) jako data URI do wstawienia w kartę OG. */
async function loadLogo(): Promise<string> {
  "use cache";
  cacheLife("max");
  const svg = await readFile(path.join(process.cwd(), "public", "brand", "logo-wordmark.svg"));
  return `data:image/svg+xml;base64,${svg.toString("base64")}`;
}

type OgInput = {
  title: string;
  subtitle: string;
  footer: string;
  /** Ilustracja awaryjna, gdy auto nie ma zdjęcia. */
  body: BodyType;
  palette: Palette;
  /** Adres zdjęcia: `/vehicles/…jpg` (z `public/`) albo `/media/…jpg` (wgrane z panelu). */
  photo?: string;
};

/** Karta 1200×630 do udostępniania w mediach społecznościowych. */
export async function renderOgImage({ title, subtitle, footer, body, palette, photo }: OgInput) {
  const [fonts, photoUri, logoUri] = await Promise.all([
    loadFonts(),
    photo ? loadPhoto(photo) : Promise.resolve(null),
    loadLogo(),
  ]);
  if (photo && !photoUri) console.warn("[og] nie udało się wczytać zdjęcia", photo);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#fff",
          color: "#000",
          fontFamily: "Inter, InterExt",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: 64,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- generator OG nie używa next/image */}
            <img src={logoUri} alt={site.name} width={260} height={56} />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: title.length > 22 ? 54 : 66,
                lineHeight: 1.1,
              }}
            >
              {title}
            </div>
            {/* „\n" w podtytule łamie wiersz (white-space: pre-wrap). */}
            <div
              style={{
                display: "flex",
                fontSize: 30,
                lineHeight: 1.35,
                color: "#5e5e5e",
                marginTop: 24,
                whiteSpace: "pre-wrap",
              }}
            >
              {subtitle}
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 26, color: "#5e5e5e" }}>{footer}</div>
        </div>

        <div
          style={{
            display: "flex",
            width: 480,
            alignItems: "center",
            justifyContent: "center",
            background: "#EFD9B4",
          }}
        >
          {photoUri ? (
            // eslint-disable-next-line @next/next/no-img-element -- generator OG nie używa next/image
            <img
              src={photoUri}
              alt=""
              width={480}
              height={630}
              style={{ width: 480, height: 630, objectFit: "cover", objectPosition: "78% 50%" }}
            />
          ) : (
            <svg width="440" height="220" viewBox="0 0 320 160">
              {/* Wywołanie funkcją: w <svg> generatora OG nie działają komponenty. */}
              {VanShapes({ body, palette })}
            </svg>
          )}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
