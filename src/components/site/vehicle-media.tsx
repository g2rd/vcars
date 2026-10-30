import Image from "next/image";
import { VanIllustration } from "@/components/illustrations/van";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/modules/vehicles/types";

type VehicleMediaProps = {
  vehicle: Vehicle;
  /** Atrybut `sizes` – ile miejsca zajmuje zdjęcie w układzie (ważne dla wydajności). */
  sizes: string;
  /** Zdjęcie nad zagięciem (LCP): ładowane z wysokim priorytetem. */
  preload?: boolean;
  /** Zdjęcie nad zagięciem, ale nie jedyne (np. pierwszy rząd kart): bez opóźnionego ładowania. */
  eager?: boolean;
  className?: string;
};

/**
 * Zdjęcie auta w ramce o stałych proporcjach (brak przesunięć układu – CLS).
 * Auto bez zdjęcia dostaje ilustrację, więc nowe pozycje dodane w panelu
 * admina wyglądają poprawnie jeszcze przed wgraniem fotografii.
 */
export function VehicleMedia({
  vehicle,
  sizes,
  preload = false,
  eager = false,
  className,
}: VehicleMediaProps) {
  const photo = vehicle.images[0];

  return (
    <div className={cn("relative aspect-[3/2] overflow-hidden bg-sand", className)}>
      {photo ? (
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes={sizes}
          preload={preload}
          loading={eager ? "eager" : undefined}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-6">
          <VanIllustration
            body={vehicle.bodyType}
            palette={vehicle.palette}
            className="h-auto w-full max-w-xs"
          />
        </div>
      )}
    </div>
  );
}
