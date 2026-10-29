import { DotIcon, SquareIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { Category } from "@/modules/vehicles/types";

const fieldClass =
  "flex items-center gap-3 rounded-ui border border-iron bg-paper px-4 py-2.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink";
const inputClass = "w-full bg-transparent text-body text-ink outline-none";

/**
 * Formularz w hero: zwykły `GET` do /zapytanie (działa bez JS, nie wymaga
 * kodu po stronie klienta). Znaczniki osi czasu: kółko = odbiór, kwadrat = zwrot.
 */
export function HeroSearch({
  categories,
  className,
}: {
  categories: Pick<Category, "slug" | "name">[];
  className?: string;
}) {
  return (
    <form action="/zapytanie" method="get" className={cn("space-y-3", className)}>
      <label className={fieldClass}>
        <DotIcon className="size-4 shrink-0" />
        <span className="block flex-1">
          <span className="block text-caption text-slate">Odbiór</span>
          <input type="date" name="od" className={inputClass} />
        </span>
      </label>

      <label className={fieldClass}>
        <SquareIcon className="size-4 shrink-0" />
        <span className="block flex-1">
          <span className="block text-caption text-slate">Zwrot</span>
          <input type="date" name="do" className={inputClass} />
        </span>
      </label>

      <label className={cn(fieldClass, "bg-mist")}>
        <span className="block flex-1">
          <span className="block text-caption text-slate">Rodzaj auta</span>
          <select name="kategoria" defaultValue="" className={inputClass}>
            <option value="">Dowolny</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </span>
      </label>

      <button
        type="submit"
        className="min-h-12 w-full rounded-ui bg-ink px-4 py-3 text-body text-paper hover:bg-charcoal"
      >
        Sprawdź dostępność
      </button>
    </form>
  );
}
