import { connection } from "next/server";
import { env } from "@/lib/env";

/** Sonda zdrowia dla hostingu/monitoringu (zawsze dynamiczna, nigdy z cache). */
export async function GET() {
  await connection();
  return Response.json(
    { status: "ok", mode: env.databaseUrl ? "database" : "demo" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
