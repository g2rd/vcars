import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

let root: string;

// `env` czyta MEDIA_DIR przy imporcie – ustawiamy katalog tymczasowy przed załadowaniem modułu.
const load = async () => {
  vi.resetModules();
  process.env.MEDIA_DIR = root;
  return import("./storage");
};

beforeAll(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), "vcars-media-"));
});

afterAll(async () => {
  delete process.env.MEDIA_DIR;
  await rm(root, { recursive: true, force: true });
});

describe("resolveMediaFile", () => {
  it("rozwiązuje poprawne ścieżki wewnątrz katalogu mediów", async () => {
    const { resolveMediaFile } = await load();
    expect(resolveMediaFile(["vehicles", "a.jpg"])).toBe(path.join(root, "vehicles", "a.jpg"));
    expect(resolveMediaFile(["vehicles", "B.JPEG"])).toBe(path.join(root, "vehicles", "B.JPEG"));
  });

  it("blokuje wyjście poza katalog, ścieżki bezwzględne i inne rozszerzenia", async () => {
    const { resolveMediaFile } = await load();
    expect(resolveMediaFile(["..", "sekrety.jpg"])).toBeNull();
    expect(resolveMediaFile(["vehicles", "..", "..", "etc", "passwd.jpg"])).toBeNull();
    expect(resolveMediaFile(["/etc/passwd.jpg"])).toBeNull();
    expect(resolveMediaFile(["vehicles", "plik.png"])).toBeNull();
    expect(resolveMediaFile(["vehicles", "plik.jpg.exe"])).toBeNull();
    expect(resolveMediaFile([])).toBeNull();
  });
});

describe("zapis i usuwanie", () => {
  it("zapisuje zdjęcie pod losową nazwą i usuwa je po adresie URL", async () => {
    const { storeVehicleImage, deleteMediaByUrl, resolveMediaFile, MEDIA_URL_PREFIX } = await load();

    const url = await storeVehicleImage(Buffer.from("jpeg-bytes"));
    expect(url).toMatch(/^\/media\/vehicles\/[0-9a-f-]{36}\.jpg$/);
    const file = resolveMediaFile(url.slice(MEDIA_URL_PREFIX.length).split("/"));
    expect(file && existsSync(file)).toBe(true);

    await deleteMediaByUrl(url);
    expect(file && existsSync(file)).toBe(false);
  });

  it("nie usuwa plików spoza magazynu ani nie wychodzi poza katalog", async () => {
    const { deleteMediaByUrl } = await load();
    const outside = path.join(path.dirname(root), "poza-magazynem.jpg");
    await writeFile(outside, "x");

    await deleteMediaByUrl("/vehicles/ford.jpg"); // zdjęcie statyczne z public/
    await deleteMediaByUrl("/media/../poza-magazynem.jpg");
    expect(existsSync(outside)).toBe(true);
    await rm(outside);
  });
});
