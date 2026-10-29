import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { ImageError, MAX_IMAGE_WIDTH, MAX_UPLOAD_BYTES, processImageUpload } from "./images";

const solid = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: "#c44" } });

describe("processImageUpload", () => {
  it("zmniejsza duże zdjęcie do 1600 px i zapisuje je jako JPEG", async () => {
    const input = await solid(3200, 2000).png().toBuffer();
    const result = await processImageUpload(input);

    expect(result.width).toBe(MAX_IMAGE_WIDTH);
    expect(result.height).toBe(1000);
    const meta = await sharp(result.data).metadata();
    expect(meta.format).toBe("jpeg");
    expect(meta.width).toBe(MAX_IMAGE_WIDTH);
  });

  it("nie powiększa mniejszych zdjęć", async () => {
    const result = await processImageUpload(await solid(900, 600).jpeg().toBuffer());
    expect(result.width).toBe(900);
  });

  it("uwzględnia obrót z EXIF (zdjęcia z telefonu zrobione w pionie)", async () => {
    // 1200×800 z orientacją 6 = zdjęcie pionowe 800×1200.
    const input = await solid(1200, 800).jpeg().withMetadata({ orientation: 6 }).toBuffer();
    const result = await processImageUpload(input);
    expect(result).toMatchObject({ width: 800, height: 1200 });
    expect((await sharp(result.data).metadata()).orientation).toBeUndefined();
  });

  it("usuwa metadane z pliku (w tym EXIF z lokalizacją)", async () => {
    const input = await solid(1200, 800).jpeg().withMetadata({ orientation: 3 }).toBuffer();
    const meta = await sharp((await processImageUpload(input)).data).metadata();
    expect(meta.exif).toBeUndefined();
  });

  it("odrzuca pusty plik, plik nie będący obrazem i obce formaty", async () => {
    await expect(processImageUpload(Buffer.alloc(0))).rejects.toThrow(ImageError);
    await expect(processImageUpload(Buffer.from("to nie jest zdjęcie"))).rejects.toThrow(
      /nie jest poprawny plik/,
    );
    const gif = await solid(800, 600).gif().toBuffer();
    await expect(processImageUpload(gif)).rejects.toThrow(/Dozwolone formaty/);
  });

  it("odrzuca zbyt małe i zbyt duże pliki", async () => {
    await expect(processImageUpload(await solid(300, 200).jpeg().toBuffer())).rejects.toThrow(
      /zbyt małe/,
    );
    await expect(processImageUpload(Buffer.alloc(MAX_UPLOAD_BYTES + 1))).rejects.toThrow(/za duży/);
  });
});
