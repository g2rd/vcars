import Image from "next/image";
import Link from "next/link";
import { VanIllustration } from "@/components/illustrations/van";
import type { Category, Palette, Vehicle } from "@/modules/vehicles/types";

const CATEGORY_PALETTE: Record<string, Palette> = {
  compact: "teal",
  panel: "cobalt",
  "panel-long": "orange",
  luton: "brown",
};

/**
 * Kafelek kategorii (sekcja „Wybierz rodzaj auta"). Po prawej miniatura
 * zdjęcia reprezentanta kategorii (albo ilustracja, gdy brak zdjęcia).
 */
export function CategoryCard({
  category,
  count,
  representative,
}: {
  category: Category;
  count: number;
  representative?: Vehicle;
}) {
  const photo = representative?.images[0];

  return (
    <article className="relative flex items-center justify-between gap-4 rounded-ui bg-mist p-6">
      <div className="min-w-0">
        <h3 className="text-body font-medium">
          <Link
            href={`/wynajem/${category.slug}`}
            className="after:absolute after:inset-0 after:rounded-ui"
          >
            {category.name}
          </Link>
        </h3>
        <p className="mt-1 text-body-sm text-slate">{category.summary}</p>
        <p className="mt-4 text-body-sm">
          <span className="underline underline-offset-2">
            Zobacz {count} {count === 1 ? "auto" : "auta"}
          </span>
        </p>
      </div>

      {photo ? (
        <div className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-ui bg-sand sm:w-40">
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            sizes="160px"
            className="object-cover"
          />
        </div>
      ) : (
        <VanIllustration
          body={category.bodyType}
          palette={CATEGORY_PALETTE[category.bodyType] ?? "orange"}
          className="aspect-[2/1] w-32 shrink-0"
        />
      )}
    </article>
  );
}
