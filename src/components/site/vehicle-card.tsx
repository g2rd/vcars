import Link from "next/link";
import { formatKg, formatPln, formatVolume } from "@/lib/format";
import { lowestDailyRateNet } from "@/lib/pricing";
import { vehicleName, type Vehicle } from "@/modules/vehicles/types";
import { VehicleMedia } from "./vehicle-media";

/**
 * Karta auta: zdjęcie na górze, pod nim szary panel z tytułem 16/500, opisem
 * 14 px w #5e5e5e i podkreślonym „Szczegóły". Cała karta jest klikalna
 * (pseudo-element na linku), a w DOM zostaje jeden czytelny link.
 */
export function VehicleCard({
  vehicle,
  headingLevel = "h3",
  eager = false,
}: {
  vehicle: Vehicle;
  headingLevel?: "h2" | "h3";
  /** Pierwszy rząd kart leży nad zagięciem (LCP): zdjęcie ładowane od razu, bez lazy. */
  eager?: boolean;
}) {
  const Heading = headingLevel;
  const name = vehicleName(vehicle);

  return (
    <article className="relative flex flex-col overflow-hidden rounded-ui bg-mist">
      <VehicleMedia
        vehicle={vehicle}
        sizes="(min-width: 1200px) 384px, (min-width: 768px) 50vw, 100vw"
        eager={eager}
      />

      <div className="flex flex-1 flex-col justify-between gap-5 p-6">
        <div>
          <Heading className="text-body font-medium">
            <Link href={`/flota/${vehicle.slug}`} className="after:absolute after:inset-0">
              {name}
            </Link>
          </Heading>
          <p className="mt-1 text-body-sm text-slate">{vehicle.summary}</p>
        </div>

        <dl className="grid grid-cols-3 gap-3 text-body-sm">
          <div>
            <dt className="text-caption text-slate">Przestrzeń</dt>
            <dd className="font-medium">{formatVolume(vehicle.cargoVolumeM3)}</dd>
          </div>
          <div>
            <dt className="text-caption text-slate">Ładowność</dt>
            <dd className="font-medium">{formatKg(vehicle.payloadKg)}</dd>
          </div>
          <div>
            <dt className="text-caption text-slate">Miejsca</dt>
            <dd className="font-medium">{vehicle.seats}</dd>
          </div>
        </dl>

        <div className="flex items-end justify-between gap-4">
          <p className="text-body-sm text-slate">
            od{" "}
            <strong className="text-subheading font-medium text-ink">
              {formatPln(lowestDailyRateNet(vehicle.priceTiers))}
            </strong>{" "}
            netto / doba
          </p>
          <span className="text-body-sm underline underline-offset-2">Szczegóły</span>
        </div>
      </div>
    </article>
  );
}
