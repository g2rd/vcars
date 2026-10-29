import type { Metadata } from "next";
import { SiteChrome } from "@/components/site/site-chrome";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Nie znaleziono strony",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="container-page py-16 md:py-24">
        <p className="text-body-sm text-slate">Błąd 404</p>
        <h1 className="type-display mt-2">Nie znaleziono strony</h1>
        <p className="mt-4 max-w-xl text-subheading text-slate">
          Adres mógł się zmienić albo auto zostało wycofane z oferty. Sprawdź aktualną flotę lub
          wróć na stronę główną.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="/flota">Zobacz flotę</Button>
          <Button href="/" variant="secondary">
            Strona główna
          </Button>
        </div>
      </section>
    </SiteChrome>
  );
}
