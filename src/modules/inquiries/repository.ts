import { eq } from "drizzle-orm";
import { inquiries, vehicles } from "@/db/schema";
import type { Db } from "@/db/types";
import type { NewInquiry } from "./types";

export interface InquiryRepository {
  create(input: NewInquiry): Promise<{ id: string; persisted: boolean }>;
}

/** Tryb demo: bez bazy zapytanie trafia tylko do logu serwera. */
export function createLoggingInquiryRepository(): InquiryRepository {
  return {
    async create(input) {
      console.info("[inquiry:demo] zapytanie nie zostało zapisane (brak DATABASE_URL)", {
        ...input,
        email: "***",
        phone: "***",
      });
      return { id: "demo", persisted: false };
    },
  };
}

export function createDbInquiryRepository(db: Db): InquiryRepository {
  return {
    async create(input) {
      let vehicleId: string | null = null;
      if (input.vehicleSlug) {
        const [vehicle] = await db
          .select({ id: vehicles.id })
          .from(vehicles)
          .where(eq(vehicles.slug, input.vehicleSlug))
          .limit(1);
        vehicleId = vehicle?.id ?? null;
      }

      const [row] = await db
        .insert(inquiries)
        .values({
          vehicleId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          startDate: input.startDate ?? null,
          endDate: input.endDate ?? null,
          message: input.message ?? null,
          consentAt: input.consentAt,
        })
        .returning({ id: inquiries.id });

      return { id: row.id, persisted: true };
    },
  };
}
