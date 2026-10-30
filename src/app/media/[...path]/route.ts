import { readFile } from "node:fs/promises";
import { connection } from "next/server";
import { resolveMediaFile } from "@/modules/media/storage";

/**
 * Serwuje zdjęcia wgrane z panelu. Nazwy plików to losowe UUID i nigdy się nie
 * zmieniają, więc odpowiedź można cache'ować bezterminowo.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  await connection();
  const { path: segments } = await params;

  const file = resolveMediaFile(segments);
  if (!file) return new Response("Not found", { status: 404 });

  try {
    const bytes = await readFile(file);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
