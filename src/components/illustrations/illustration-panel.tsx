import type { BodyType, Palette } from "@/modules/vehicles/types";
import { cn } from "@/lib/cn";
import { VanIllustration } from "./van";

/**
 * Prostokątny panel z ilustracją auta na piaskowym tle. Stałe proporcje
 * rezerwują miejsce (brak przesunięć układu – dobre CLS) i docelowo
 * zostaną zastąpione zdjęciem z `next/image`.
 */
export function IllustrationPanel({
  body,
  palette,
  className,
}: {
  body: BodyType;
  palette: Palette;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex aspect-[4/3] items-center justify-center rounded-ui bg-sand p-6 md:aspect-[2/1] md:p-8 lg:aspect-[16/10]",
        className,
      )}
    >
      <VanIllustration body={body} palette={palette} className="h-auto w-full max-w-md" />
    </div>
  );
}
