import { count, desc, eq } from "drizzle-orm";
import { inquiries } from "@/db/schema";
import type { Db } from "@/db/types";
import { vehicleName } from "@/modules/vehicles/types";

export const INQUIRY_STATUSES = ["new", "contacted", "closed"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "Nowe",
  contacted: "W kontakcie",
  closed: "Zamknięte",
};

export type AdminInquiry = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  startDate: string | null;
  endDate: string | null;
  message: string | null;
  status: InquiryStatus;
  vehicle: { id: string; slug: string; name: string } | null;
};

/** Zapytania od najnowszych; opcjonalnie tylko o danym statusie. */
export async function listInquiries(
  db: Db,
  options: { status?: InquiryStatus; limit?: number } = {},
): Promise<AdminInquiry[]> {
  const rows = await db.query.inquiries.findMany({
    where: options.status ? eq(inquiries.status, options.status) : undefined,
    with: { vehicle: true },
    orderBy: [desc(inquiries.createdAt)],
    limit: options.limit ?? 100,
  });

  return rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    name: row.name,
    email: row.email,
    phone: row.phone,
    startDate: row.startDate,
    endDate: row.endDate,
    message: row.message,
    status: row.status,
    vehicle: row.vehicle
      ? { id: row.vehicle.id, slug: row.vehicle.slug, name: vehicleName(row.vehicle) }
      : null,
  }));
}

export async function countInquiriesByStatus(db: Db): Promise<Record<InquiryStatus, number>> {
  const rows = await db
    .select({ status: inquiries.status, total: count() })
    .from(inquiries)
    .groupBy(inquiries.status);

  const result: Record<InquiryStatus, number> = { new: 0, contacted: 0, closed: 0 };
  for (const row of rows) result[row.status] = row.total;
  return result;
}

/** Zwraca `false`, gdy zapytanie o danym id nie istnieje. */
export async function setInquiryStatus(
  db: Db,
  id: string,
  status: InquiryStatus,
): Promise<boolean> {
  const updated = await db
    .update(inquiries)
    .set({ status })
    .where(eq(inquiries.id, id))
    .returning({ id: inquiries.id });
  return updated.length > 0;
}
