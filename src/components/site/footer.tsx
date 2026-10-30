import Link from "next/link";
import { mainNav, site } from "@/config/site";
import { tieLastWord } from "@/lib/format";
import { getCategories } from "@/modules/vehicles/queries";
import { Logo } from "./logo";

const linkClass = "text-body-sm text-ash hover:text-paper hover:underline";
const headingClass = "mb-3 text-body-sm font-medium text-paper";

/** Czarna stopka z czterema kolumnami linków i danymi kontaktowymi (NAP). */
export async function SiteFooter() {
  const categories = await getCategories();

  return (
    <footer className="on-dark bg-ink pb-24 pt-12 text-paper md:pb-12 md:pt-16">
      <div className="container-page">
        {/* Od md logo stoi w lewej kolumnie, a linki obok niego (2×2, od xl w czterech kolumnach). */}
        <div className="grid gap-8 md:grid-cols-[14rem_1fr] md:gap-12">
          <Logo size="lg" className="self-start" />
          <div className="grid grid-cols-2 gap-8 xl:grid-cols-4">
            <nav aria-label="Flota">
              <h2 className={headingClass}>Flota</h2>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link href={`/wynajem/${category.slug}`} className={linkClass}>
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/flota" className={linkClass}>
                    Cała flota
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="Firma">
              <h2 className={headingClass}>Firma</h2>
              <ul className="space-y-2">
                {mainNav
                  .filter((item) => item.href !== "/flota")
                  .map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={linkClass}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                <li>
                  <Link href="/zapytanie" className={linkClass}>
                    Zapytaj o termin
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="Informacje prawne">
              <h2 className={headingClass}>Informacje</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/regulamin" className={linkClass}>
                    Regulamin wynajmu
                  </Link>
                </li>
                <li>
                  <Link href="/polityka-prywatnosci" className={linkClass}>
                    Polityka prywatności
                  </Link>
                </li>
                <li>
                  <Link href="/zrodla-zdjec" className={linkClass}>
                    Źródła zdjęć
                  </Link>
                </li>
              </ul>
            </nav>

            <div>
              <h2 className={headingClass}>Kontakt</h2>
              <address className="space-y-2 text-body-sm not-italic text-ash">
                <p>
                  <span className="text-paper">{site.name}</span>
                  <br />
                  {tieLastWord(site.address.street)}
                  <br />
                  {site.address.postalCode} {site.address.city}
                </p>
                <p>
                  <a href={`tel:${site.phone.e164}`} className="text-paper hover:underline">
                    {site.phone.display}
                  </a>
                  <br />
                  <a href={`mailto:${site.email}`} className="hover:text-paper hover:underline">
                    {site.email}
                  </a>
                </p>
                <ul>
                  {site.openingHours.map((hours) => (
                    <li key={hours.label}>{hours.label}</li>
                  ))}
                </ul>
              </address>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-graphite pt-6 text-caption text-ash md:flex-row md:justify-between">
          <p>© {site.name}. Wszystkie ceny podajemy netto, chyba że zaznaczono inaczej.</p>
          {site.isDemo && (
            <p>Wersja demonstracyjna – dane firmy i floty są przykładowe.</p>
          )}
        </div>
      </div>
    </footer>
  );
}
