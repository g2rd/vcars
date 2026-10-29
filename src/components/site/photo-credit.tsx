import type { VehicleImage } from "@/modules/vehicles/types";

/** Podpis pod zdjęciem: poglądowe + atrybucja wymagana przez licencję CC. */
export function PhotoCredit({ image }: { image: VehicleImage | undefined }) {
  if (!image) return null;

  return (
    <p className="mt-2 text-caption text-slate">
      Zdjęcie poglądowe
      {image.credit && (
        <>
          {" · "}
          {image.sourceUrl ? (
            <a
              href={image.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-ink"
            >
              {image.credit}
            </a>
          ) : (
            image.credit
          )}
          {" · Wikimedia Commons"}
        </>
      )}
    </p>
  );
}
