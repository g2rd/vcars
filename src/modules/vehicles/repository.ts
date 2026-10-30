import type { Category, Vehicle } from "./types";

/**
 * Port dostępu do katalogu floty. UI zna tylko ten interfejs, więc źródło
 * danych (demo / Postgres) można podmienić bez dotykania stron.
 */
export interface VehicleRepository {
  /** Kategorie posortowane wg `sortOrder`. */
  listCategories(): Promise<Category[]>;
  /** Opublikowane pojazdy posortowane wg `sortOrder`. */
  listVehicles(): Promise<Vehicle[]>;
}
