import type { Metadata } from "next";
import Link from "next/link";
import { InquiryCard } from "@/components/admin/inquiry-card";
import { PageHeader } from "@/components/admin/admin-shell";
import { getDb } from "@/db/client";
import { cn } from "@/lib/cn";
import { requireUser } from "@/modules/auth/session";
import {
  countInquiriesByStatus,
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
  listInquiries,
  type InquiryStatus,
} from "@/modules/inquiries/admin";

export const metadata: Metadata = { title: "Zapytania" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function InquiriesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser();
  const params = await searchParams;
  const raw = Array.isArray(params.status) ? params.status[0] : params.status;
  const status = INQUIRY_STATUSES.find((s) => s === raw) as InquiryStatus | undefined;

  const db = getDb();
  const [counts, inquiries] = await Promise.all([
    countInquiriesByStatus(db),
    listInquiries(db, { status }),
  ]);
  const total = counts.new + counts.contacted + counts.closed;

  const tabs = [
    { href: "/admin/zapytania", label: "Wszystkie", count: total, active: !status },
    ...INQUIRY_STATUSES.map((s) => ({
      href: `/admin/zapytania?status=${s}`,
      label: INQUIRY_STATUS_LABELS[s],
      count: counts[s],
      active: status === s,
    })),
  ];

  return (
    <>
      <PageHeader title="Zapytania" description="Klienci, którzy pytają o termin przez stronę." />

      <nav aria-label="Filtr statusu" className="-mx-4 mb-5 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="flex w-max gap-2">
          {tabs.map((tab) => (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-2 whitespace-nowrap rounded-ui px-4 text-body",
                  tab.active ? "bg-tab" : "bg-paper hover:bg-white/60",
                )}
              >
                {tab.label}
                <span className="text-body-sm text-slate">{tab.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {inquiries.length === 0 ? (
        <p className="rounded-ui bg-paper p-6 text-body text-slate">Brak zapytań w tym widoku.</p>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <InquiryCard key={inquiry.id} inquiry={inquiry} />
          ))}
        </div>
      )}
    </>
  );
}
