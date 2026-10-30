import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";

/** Widoczne okruszki; dane strukturalne (BreadcrumbList) dodaje strona osobno. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Okruszki" className="text-body-sm text-slate">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="text-ink">
                  {item.name}
                </span>
              ) : (
                <>
                  {/* after: powiększa pole dotyku do ok. 44 px bez zmiany układu okruszków */}
                  <Link
                    href={item.path}
                    className="relative hover:text-ink hover:underline after:absolute after:inset-x-0 after:-inset-y-3"
                  >
                    {item.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
