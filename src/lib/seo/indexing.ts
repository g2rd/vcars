import { site } from "@/config/site";
import { env } from "@/lib/env";

/**
 * Bezpiecznik: nie pozwala włączyć indeksowania, dopóki w `config/site.ts`
 * są dane demonstracyjne (fałszywy adres/telefon trafiłyby do Google i do JSON-LD).
 */
export function assertIndexingSafe(): void {
  if (env.allowIndexing && site.isDemo) {
    throw new Error(
      "ALLOW_INDEXING=true, ale src/config/site.ts nadal ma isDemo: true. " +
        "Uzupełnij prawdziwe dane firmy i ustaw isDemo: false albo wyłącz indeksowanie.",
    );
  }
}
