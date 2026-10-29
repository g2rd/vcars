import { site } from "@/config/site";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { getVehicles } from "@/modules/vehicles/queries";

export const alt = `${site.name} – ${site.tagline} ${site.address.city}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const vehicles = await getVehicles();
  const featured =
    vehicles.find((v) => v.slug === "ford-transit-custom-l2h1") ??
    vehicles.find((v) => v.images.length > 0);

  return renderOgImage({
    title: `${site.tagline} w ${site.address.cityLocative}`,
    subtitle: "Furgony, duże busy i kontenery\nz windą. Ceny netto.",
    footer: `${site.address.city} · ${site.phone.display}`,
    body: "panel",
    palette: "orange",
    photo: featured?.images[0]?.url,
  });
}
