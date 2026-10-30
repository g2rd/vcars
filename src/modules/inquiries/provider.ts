import "server-only";
import { env } from "@/lib/env";
import type { InquiryRepository } from "./repository";

export async function getInquiryRepository(): Promise<InquiryRepository> {
  const { createDbInquiryRepository, createLoggingInquiryRepository } = await import(
    "./repository"
  );
  if (!env.databaseUrl) return createLoggingInquiryRepository();
  const { getDb } = await import("@/db/client");
  return createDbInquiryRepository(getDb());
}
