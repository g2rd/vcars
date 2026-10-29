import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Regulamin wynajmu",
  description: "Regulamin wynajmu pojazdów – szablon do uzupełnienia.",
  path: "/regulamin",
  noindex: true,
});

export default function TermsPage() {
  return (
    <div className="container-page py-6 md:py-10">
      <Breadcrumbs
        items={[
          { name: "Strona główna", path: "/" },
          { name: "Regulamin wynajmu", path: "/regulamin" },
        ]}
      />
      <h1 className="type-heading mt-6">Regulamin wynajmu</h1>
      <div className="mt-6 max-w-3xl space-y-4 text-body text-slate">
        <p className="rounded-ui border-2 border-ink p-4 font-medium text-ink">
          Szablon do uzupełnienia. Ostateczny regulamin i wzór umowy najmu przygotuje prawnik na
          podstawie zasad {site.name} – ta strona jest tylko miejscem na jego publikację.
        </p>
        <p>Regulamin powinien obejmować m.in.:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>warunki zawarcia umowy najmu i wymagane dokumenty,</li>
          <li>zasady rozliczenia doby, limitu kilometrów i opłat dodatkowych,</li>
          <li>kaucję oraz zasady jej zwrotu,</li>
          <li>zakres ubezpieczenia (OC/AC) i udział własny w szkodzie,</li>
          <li>obowiązki najemcy: paliwo, czystość, zakaz podnajmu i wyjazdu za granicę,</li>
          <li>procedurę w razie awarii, wypadku lub kradzieży,</li>
          <li>reklamacje i odstąpienie od umowy.</li>
        </ul>
      </div>
    </div>
  );
}
