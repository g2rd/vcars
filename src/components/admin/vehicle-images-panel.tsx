import Image from "next/image";
import { ArrowDownIcon, ArrowUpIcon, TrashIcon } from "@/components/ui/icons";
import type { AdminVehicle } from "@/modules/vehicles/admin";
import {
  deleteVehicleImageAction,
  moveVehicleImageAction,
  updateVehicleImageAltAction,
} from "@/modules/vehicles/image-actions";
import { Badge } from "./badge";
import { UploadPhotosForm } from "./upload-photos-form";

const iconButton =
  "flex size-11 items-center justify-center rounded-ui border border-iron bg-paper hover:bg-mist disabled:opacity-40";

export function VehicleImagesPanel({
  images,
  uploadAction,
}: {
  images: AdminVehicle["images"];
  uploadAction: React.ComponentProps<typeof UploadPhotosForm>["action"];
}) {
  return (
    <section className="rounded-ui bg-paper p-5" aria-labelledby="zdjecia">
      <h2 id="zdjecia" className="text-subheading font-medium">
        Zdjęcia
      </h2>

      {images.length === 0 ? (
        <p className="mt-3 text-body-sm text-slate">
          Auto nie ma jeszcze zdjęć – na stronie pokazuje się ilustracja zastępcza.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {images.map((image, index) => (
            <li key={image.id} className="rounded-ui border border-mist p-3">
              <div className="flex gap-3">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-ui bg-sand">
                  <Image src={image.url} alt={image.alt} fill sizes="112px" className="object-cover" />
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  {index === 0 && <Badge tone="solid">Zdjęcie główne</Badge>}
                  <form action={updateVehicleImageAltAction} className="flex gap-2">
                    <input type="hidden" name="imageId" value={image.id} />
                    <label className="sr-only" htmlFor={`alt-${image.id}`}>
                      Opis zdjęcia (alt)
                    </label>
                    <input
                      id={`alt-${image.id}`}
                      name="alt"
                      defaultValue={image.alt}
                      minLength={3}
                      maxLength={200}
                      className="min-h-11 min-w-0 flex-1 rounded-ui border border-iron px-3 text-body-sm"
                    />
                    <button
                      type="submit"
                      className="min-h-11 rounded-ui border border-iron px-3 text-body-sm hover:bg-mist"
                    >
                      Zapisz opis
                    </button>
                  </form>
                  {image.credit && <p className="text-caption text-slate">Źródło: {image.credit}</p>}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                {(["up", "down"] as const).map((direction) => {
                  const disabled = direction === "up" ? index === 0 : index === images.length - 1;
                  const Icon = direction === "up" ? ArrowUpIcon : ArrowDownIcon;
                  return (
                    <form key={direction} action={moveVehicleImageAction}>
                      <input type="hidden" name="imageId" value={image.id} />
                      <input type="hidden" name="direction" value={direction} />
                      <button
                        type="submit"
                        disabled={disabled}
                        className={iconButton}
                        aria-label={direction === "up" ? "Przesuń wyżej" : "Przesuń niżej"}
                      >
                        <Icon width={18} height={18} />
                      </button>
                    </form>
                  );
                })}
                <form action={deleteVehicleImageAction} className="ml-auto">
                  <input type="hidden" name="imageId" value={image.id} />
                  <button type="submit" className={iconButton} aria-label="Usuń zdjęcie">
                    <TrashIcon width={18} height={18} />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 border-t border-mist pt-5">
        <UploadPhotosForm action={uploadAction} />
      </div>
    </section>
  );
}
