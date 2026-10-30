import { demoCategories, demoVehicles } from "./demo-data";
import type { VehicleRepository } from "./repository";

/** Tryb demo: dane z pliku, bez bazy. Zwraca kopie, żeby nikt nie zmutował źródła. */
export function createStaticVehicleRepository(): VehicleRepository {
  return {
    async listCategories() {
      return structuredClone([...demoCategories].sort((a, b) => a.sortOrder - b.sortOrder));
    },
    async listVehicles() {
      return structuredClone([...demoVehicles].sort((a, b) => a.sortOrder - b.sortOrder));
    },
  };
}
