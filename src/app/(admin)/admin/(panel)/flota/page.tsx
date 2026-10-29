import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/admin/badge";
import { PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { getDb } from "@/db/client";
import { cn } from "@/lib/cn";
import { formatPln } from "@/lib/format";
import { requireUser } from "@/modules/auth/session";
import {
  getFleetStats,
  listAdminVehicles,
  type AdminVehicleSummary,
  type FleetFilter,
} from "@/modules/vehicles/admin";
import { setVehicleFlagAction } from "@/modules/vehicles/admin-actions";

export const metadata: Metadata = { title: "Flota" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const FILTERS: { value: FleetFilter; label: string }[] = [
  { value: "all", label: "Wszystkie" },
  { value: "visible", label: "Na stronie" },
  { value: "hidden", label: "Ukryte" },
  { value: "unavailable", label: "Niedostępne" },
];

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

function FlagButton({ id, flag, children }: { id: string; flag: string; children: string }) {
  return (
    <form action={setVehicleFlagAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="flag" value={flag} />
      <button
        type="submit"
        className="min-h-11 rounded-ui border border-iron bg-paper px-3 text-body-sm hover:bg-mist"
      >
        {children}
      </button>
    </form>
  );
}

function VehicleRow({ vehicle }: { vehicle: AdminVehicleSummary }) {
  return (
    <li className="rounded-ui bg-paper p-3">
      <Link href={`/admin/flota/${vehicle.id}`} className="flex items-center gap-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-ui bg-sand">
          {vehicle.photo && (
            <Image src={vehicle.photo.url} alt="" fill sizes="96px" className="object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-medium">{vehicle.name}</p>
          <p className="text-body-sm text-slate">
            {vehicle.categoryName} · od {formatPln(vehicle.fromNetGrosze)} netto
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {!vehicle.isPublished && <Badge tone="solid">Ukryte</Badge>}
            {vehicle.status === "unavailable" && <Badge>Niedostępne</Badge>}
            {!vehicle.photo && <Badge tone="muted">Brak zdjęcia</Badge>}
          </div>
        </div>
      </Link>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-mist pt-3">
        <FlagButton id={vehicle.id} flag={vehicle.isPublished ? "hide" : "publish"}>
          {vehicle.isPublished ? "Ukryj na stronie" : "Pokaż na stronie"}
        </FlagButton>
        <FlagButton id={vehicle.id} flag={vehicle.status === "available" ? "unavailable" : "available"}>
          {vehicle.status === "available" ? "Oznacz jako niedostępne" : "Oznacz jako dostępne"}
        </FlagButton>
      </div>
    </li>
  );
}

export default async function FleetPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser();
  const params = await searchParams;
  const query = first(params.q)?.slice(0, 80) ?? "";
  const filter = FILTERS.find((f) => f.value === first(params.filtr))?.value ?? "all";

  const db = getDb();
  const [stats, vehicles] = await Promise.all([
    getFleetStats(db),
    listAdminVehicles(db, { query, filter }),
  ]);
  const counts: Record<FleetFilter, number> = {
    all: stats.total,
    visible: stats.visible,
    hidden: stats.hidden,
    unavailable: stats.unavailable,
  };

  return (
    <>
      <PageHeader
        title="Flota"
        description="Dodawaj auta, zmieniaj ceny i decyduj, co widzą klienci."
        actions={
          <Button href="/admin/flota/nowe">
            <PlusIcon width={18} height={18} />
            Dodaj auto
          </Button>
        }
      />

      {first(params.usunieto) && (
        <p role="status" className="mb-4 rounded-ui bg-paper p-4 text-body font-medium">
          Auto zostało usunięte.
        </p>
      )}

      <form method="get" role="search" className="mb-4 flex gap-2">
        {filter !== "all" && <input type="hidden" name="filtr" value={filter} />}
        <label className="sr-only" htmlFor="q">
          Szukaj auta
        </label>
        <input
          id="q"
          name="q"
          defaultValue={query}
          placeholder="Szukaj: marka, model, wersja"
          className="min-h-12 min-w-0 flex-1 rounded-ui border border-iron bg-paper px-4 text-body"
        />
        <button type="submit" className="min-h-12 rounded-ui bg-ink px-5 text-body text-paper hover:bg-charcoal">
          Szukaj
        </button>
      </form>

      <nav aria-label="Filtr aut" className="-mx-4 mb-5 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="flex w-max gap-2">
          {FILTERS.map((f) => {
            const href = new URLSearchParams();
            if (f.value !== "all") href.set("filtr", f.value);
            if (query) href.set("q", query);
            const active = filter === f.value;
            return (
              <li key={f.value}>
                <Link
                  href={`/admin/flota${href.size ? `?${href}` : ""}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-2 whitespace-nowrap rounded-ui px-4 text-body",
                    active ? "bg-tab" : "bg-paper hover:bg-white/60",
                  )}
                >
                  {f.label}
                  <span className="text-body-sm text-slate">{counts[f.value]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {vehicles.length === 0 ? (
        <p className="rounded-ui bg-paper p-6 text-body text-slate">
          {query ? `Brak aut pasujących do „${query}”.` : "Brak aut w tym widoku."}
        </p>
      ) : (
        <ul className="space-y-3">
          {vehicles.map((vehicle) => (
            <VehicleRow key={vehicle.id} vehicle={vehicle} />
          ))}
        </ul>
      )}
    </>
  );
}
