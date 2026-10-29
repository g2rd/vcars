import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Polityka prywatności",
  description: "Zasady przetwarzania danych osobowych – szablon do uzupełnienia.",
  path: "/polityka-prywatnosci",
  noindex: true,
});

export default function PrivacyPage() {
  return (
    <div className="container-page py-6 md:py-10">
      <Breadcrumbs
        items={[
          { name: "Strona główna", path: "/" },
          { name: "Polityka prywatności", path: "/polityka-prywatnosci" },
        ]}
      />
      <h1 className="type-heading mt-6">Polityka prywatności</h1>
      <div className="mt-6 max-w-3xl space-y-4 text-body text-slate">
        <p className="rounded-ui border-2 border-ink p-4 font-medium text-ink">
          Szablon do uzupełnienia. Pełną treść (zgodną z RODO) przygotuje prawnik. Poniżej
          struktura i dane, które powinny się w niej znaleźć.
        </p>
        <h2 className="text-subheading font-medium text-ink">Administrator danych</h2>
        <p>
          {site.legalName}, {site.address.street}, {site.address.postalCode} {site.address.city},
          e-mail: {site.email}.
        </p>
        <h2 className="text-subheading font-medium text-ink">Jakie dane zbieramy</h2>
        <p>
          Dane z formularza zapytania (imię i nazwisko, e-mail, telefon, termin i wybrane auto,
          treść wiadomości) oraz moment wyrażenia zgody na kontakt. Przy wynajmie – dane z umowy i
          dokumentów kierowcy.
        </p>
        <h2 className="text-subheading font-medium text-ink">Cele, podstawy i okres</h2>
        <p>
          Odpowiedź na zapytanie i zawarcie umowy, obowiązki księgowe i podatkowe, ewentualne
          dochodzenie roszczeń. Okres przechowywania należy określić dla każdego celu osobno.
        </p>
        <h2 className="text-subheading font-medium text-ink">Prawa osób, których dane dotyczą</h2>
        <p>
          Dostęp, sprostowanie, usunięcie, ograniczenie przetwarzania, przenoszenie danych,
          sprzeciw oraz skarga do Prezesa UODO.
        </p>
      </div>
    </div>
  );
}
