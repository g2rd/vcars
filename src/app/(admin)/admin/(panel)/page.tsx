import type { Metadata } from "next";
import Link from "next/link";
import { InquiryCard } from "@/components/admin/inquiry-card";
import { PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { getDb } from "@/db/client";
import { pluralPl } from "@/lib/format";
import { requireUser } from "@/modules/auth/session";
import { countInquiriesByStatus, listInquiries } from "@/modules/inquiries/admin";
import { getFleetStats } from "@/modules/vehicles/admin";

export const metadata: Metadata = { title: "Dziś" };

function Tile({
  href,
  value,
  label,
  strong = false,
}: {
  href: string;
  value: number;
  label: string;
  strong?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-28 flex-col justify-between rounded-ui p-4 ${
        strong ? "bg-ink text-paper hover:bg-charcoal" : "bg-paper hover:bg-white/60"
      }`}
    >
      <span className="text-[2rem] font-medium leading-none">{value}</span>
      <span className={`text-body-sm ${strong ? "text-ash" : "text-slate"}`}>{label}</span>
    </Link>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const db = getDb();
  const [stats, counts, latest] = await Promise.all([
    getFleetStats(db),
    countInquiriesByStatus(db),
    listInquiries(db, { limit: 5 }),
  ]);
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Dzień dobry, ${firstName}`}
        description="Oto co dzieje się w wypożyczalni."
        actions={
          <Button href="/admin/flota/nowe">
            <PlusIcon width={18} height={18} />
            Dodaj auto
          </Button>
        }
      />

      <section aria-label="Podsumowanie" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile href="/admin/zapytania?status=new" value={counts.new} label="Nowe zapytania" strong={counts.new > 0} />
        <Tile href="/admin/flota?filtr=visible" value={stats.visible} label="Auta w ofercie" />
        <Tile href="/admin/flota?filtr=unavailable" value={stats.unavailable} label="Niedostępne" />
        <Tile href="/admin/flota?filtr=hidden" value={stats.hidden} label="Ukryte na stronie" />
      </section>

      <section className="mt-8" aria-labelledby="ostatnie">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="ostatnie" className="text-subheading font-medium">
            Ostatnie zapytania
          </h2>
          <Link href="/admin/zapytania" className="text-body-sm underline underline-offset-2">
            Wszystkie
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="rounded-ui bg-paper p-6 text-body text-slate">
            Brak zapytań. Gdy klient wypełni formularz na stronie, zobaczysz je tutaj.
          </p>
        ) : (
          <div className="space-y-3">
            {latest.map((inquiry) => (
              <InquiryCard key={inquiry.id} inquiry={inquiry} compact />
            ))}
          </div>
        )}

        {counts.new > 0 && (
          <p className="mt-3 text-body-sm text-slate">
            {counts.new} {pluralPl(counts.new, "nowe zapytanie czeka", "nowe zapytania czekają", "nowych zapytań czeka")} na odpowiedź.
          </p>
        )}
      </section>
    </>
  );
}
