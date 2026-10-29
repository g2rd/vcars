import Link from "next/link";
import { PhoneIcon } from "@/components/ui/icons";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
  type AdminInquiry,
  type InquiryStatus,
} from "@/modules/inquiries/admin";
import { updateInquiryStatusAction } from "@/modules/inquiries/admin-actions";
import { Badge } from "./badge";

const STATUS_TONE: Record<InquiryStatus, "solid" | "outline" | "muted"> = {
  new: "solid",
  contacted: "outline",
  closed: "muted",
};

/** Karta zapytania klienta: kontakt jednym dotknięciem i zmiana statusu bez opuszczania listy. */
export function InquiryCard({ inquiry, compact = false }: { inquiry: AdminInquiry; compact?: boolean }) {
  const period =
    inquiry.startDate || inquiry.endDate
      ? [inquiry.startDate && formatDate(inquiry.startDate), inquiry.endDate && formatDate(inquiry.endDate)]
          .filter(Boolean)
          .join(" → ")
      : null;

  return (
    <article className="rounded-ui bg-paper p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-body font-medium">{inquiry.name}</h3>
          <p className="text-caption text-slate">{formatDateTime(inquiry.createdAt)}</p>
        </div>
        <Badge tone={STATUS_TONE[inquiry.status]}>{INQUIRY_STATUS_LABELS[inquiry.status]}</Badge>
      </div>

      <dl className="mt-3 space-y-1 text-body-sm">
        {inquiry.vehicle && (
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 text-slate">Auto</dt>
            <dd className="font-medium">
              <Link href={`/flota/${inquiry.vehicle.slug}`} target="_blank" className="underline underline-offset-2">
                {inquiry.vehicle.name}
              </Link>
            </dd>
          </div>
        )}
        {period && (
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 text-slate">Termin</dt>
            <dd>{period}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-slate">E-mail</dt>
          <dd className="min-w-0 truncate">
            <a href={`mailto:${inquiry.email}`} className="underline underline-offset-2">
              {inquiry.email}
            </a>
          </dd>
        </div>
      </dl>

      {!compact && inquiry.message && (
        <p className="mt-3 whitespace-pre-line rounded-ui bg-mist p-3 text-body-sm">{inquiry.message}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a
          href={`tel:${inquiry.phone.replace(/\s|-/g, "")}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-ui bg-ink px-4 text-body-sm text-paper hover:bg-charcoal"
        >
          <PhoneIcon width={16} height={16} />
          {inquiry.phone}
        </a>

        {!compact &&
          INQUIRY_STATUSES.filter((status) => status !== inquiry.status).map((status) => (
            <form key={status} action={updateInquiryStatusAction}>
              <input type="hidden" name="id" value={inquiry.id} />
              <input type="hidden" name="status" value={status} />
              <button
                type="submit"
                className="min-h-11 rounded-ui border border-iron bg-paper px-4 text-body-sm hover:bg-mist"
              >
                {status === "contacted" ? "Oznacz: w kontakcie" : status === "closed" ? "Zamknij" : "Oznacz jako nowe"}
              </button>
            </form>
          ))}
      </div>
    </article>
  );
}
