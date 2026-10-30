import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getDb } from "@/db/client";
import { countInquiriesByStatus } from "@/modules/inquiries/admin";
import { requireUser } from "@/modules/auth/session";

/**
 * Strefa dla zalogowanych. Layout jest tylko wygodą (powłoka + plakietka z liczbą
 * nowych zapytań) – prawdziwa ochrona to `requireUser()` w każdej stronie i akcji.
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const counts = await countInquiriesByStatus(getDb());

  return (
    <AdminShell user={user} newInquiries={counts.new}>
      {children}
    </AdminShell>
  );
}
