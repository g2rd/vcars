import Image from "next/image";
import { cn } from "@/lib/cn";
import type { VehicleImage } from "@/modules/vehicles/types";
import { PhotoCredit } from "./photo-credit";

type PhotoFrameProps = {
  image: VehicleImage;
  sizes: string;
  /** Zdjęcie nad zagięciem (LCP). */
  preload?: boolean;
  /** Klasy proporcji ramki, np. `aspect-[4/3] md:aspect-square`. */
  aspectClassName?: string;
  /** Klasy zdjęcia, np. `object-[25%_50%]` do kadrowania. */
  imageClassName?: string;
  className?: string;
};

/** Zdjęcie z zaokrągloną ramką o stałych proporcjach i podpisem z atrybucją. */
export function PhotoFrame({
  image,
  sizes,
  preload = false,
  aspectClassName = "aspect-[3/2]",
  imageClassName,
  className,
}: PhotoFrameProps) {
  return (
    <figure className={className}>
      <div className={cn("relative overflow-hidden rounded-ui bg-sand", aspectClassName)}>
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes={sizes}
          preload={preload}
          className={cn("object-cover", imageClassName)}
        />
      </div>
      <figcaption>
        <PhotoCredit image={image} />
      </figcaption>
    </figure>
  );
}
