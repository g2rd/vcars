"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/config/site";
import { PhoneIcon } from "@/components/ui/icons";

/**
 * Stała czarna belka u dołu ekranu na telefonach: dwa największe cele
 * konwersji (zadzwoń / zapytaj o termin). Ukrywana na stronie formularza.
 */
export function MobileActionBar() {
  const pathname = usePathname();
  if (pathname === "/zapytanie") return null;

  return (
    <div
      className="on-dark fixed inset-x-0 bottom-0 z-30 flex bg-ink text-paper md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <a
        href={`tel:${site.phone.e164}`}
        className="flex h-14 flex-1 items-center justify-center gap-2 text-body"
      >
        <PhoneIcon width={18} height={18} />
        Zadzwoń
      </a>
      <Link
        href="/zapytanie"
        className="flex h-14 flex-1 items-center justify-center border-l border-graphite text-body"
      >
        Zapytaj o termin
      </Link>
    </div>
  );
}
