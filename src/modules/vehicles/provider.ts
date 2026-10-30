import "server-only";
import { env } from "@/lib/env";
import type { VehicleRepository } from "./repository";

let repository: Promise<VehicleRepository> | undefined;

/**
 * Wybiera źródło danych: Postgres, gdy ustawiono DATABASE_URL, w przeciwnym
 * razie dane demonstracyjne. Importy dynamiczne – sterownik bazy nie jest
 * ładowany w trybie demo.
 */
export function getVehicleRepository(): Promise<VehicleRepository> {
  repository ??= (async () => {
    if (!env.databaseUrl) {
      const { createStaticVehicleRepository } = await import("./repository.static");
      return createStaticVehicleRepository();
    }
    const [{ getDb }, { createDbVehicleRepository }] = await Promise.all([
      import("@/db/client"),
      import("./repository.db"),
    ]);
    return createDbVehicleRepository(getDb());
  })();
  return repository;
}
