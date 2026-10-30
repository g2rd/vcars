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
      <div className="container-page flex flex-col gap-6 py-12 md:py-16 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2 className="type-heading">{title}</h2>
          <p className="mt-3 text-body text-ash">{text}</p>
        </div>
        {/* Przyciski nie zawijają tekstu: numer telefonu nie może się łamać w połowie. */}
        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <Button href="/zapytanie" variant="inverse" className="whitespace-nowrap">
            Zapytaj o termin
          </Button>
          <a
            href={`tel:${site.phone.e164}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-ui border border-iron px-4 py-3 text-body text-paper hover:bg-graphite"
          >
            <PhoneIcon width={18} height={18} />
            {site.phone.display}
          </a>
        </div>
      </div>
    </section>
  );
}
