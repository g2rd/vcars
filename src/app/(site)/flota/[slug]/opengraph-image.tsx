import { site } from "@/config/site";
import { formatKg, formatPln, formatVolume } from "@/lib/format";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { lowestDailyRateNet } from "@/lib/pricing";
import { getVehicle, getVehicles } from "@/modules/vehicles/queries";
import { vehicleName } from "@/modules/vehicles/types";

export const alt = `Wynajem auta dostawczego – ${site.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  const vehicles = await getVehicles();
  return vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);

  if (!vehicle) {
    return renderOgImage({
      title: `${site.tagline} w ${site.address.cityLocative}`,
      subtitle: "Furgony, duże busy i kontenery z windą.",
      footer: site.phone.display,
      body: "panel",
      palette: "orange",
    });
  }

  return renderOgImage({
    title: vehicleName(vehicle),
    subtitle: `${formatVolume(vehicle.cargoVolumeM3)} · ${formatKg(vehicle.payloadKg)}\nod ${formatPln(lowestDailyRateNet(vehicle.priceTiers))} netto / doba`,
    footer: `${site.address.city} · ${site.phone.display}`,
    body: vehicle.bodyType,
    palette: vehicle.palette,
    photo: vehicle.images[0]?.url,
  });
}
