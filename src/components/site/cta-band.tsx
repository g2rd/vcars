import { site } from "@/config/site";
import { Button } from "@/components/ui/button";
import { PhoneIcon } from "@/components/ui/icons";

/** Czarny pas z wezwaniem do działania – dwa cele konwersji: zapytanie i telefon. */
export function CtaBand({
  title = "Potrzebujesz busa na jutro?",
  text = "Podaj termin i rodzaj auta – potwierdzimy dostępność i cenę, zanim skończysz kawę.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="on-dark bg-ink text-paper">
      <div className="container-page flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between md:py-16">
        <div className="max-w-xl">
          <h2 className="type-heading">{title}</h2>
          <p className="mt-3 text-body text-ash">{text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/zapytanie" variant="inverse">
            Zapytaj o termin
          </Button>
          <a
            href={`tel:${site.phone.e164}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-ui border border-iron px-4 py-3 text-body text-paper hover:bg-graphite"
          >
            <PhoneIcon width={18} height={18} />
            {site.phone.display}
          </a>
        </div>
      </div>
    </section>
  );
}
