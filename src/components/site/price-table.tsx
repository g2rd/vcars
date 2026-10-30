import { site } from "@/config/site";
import { formatPln, pluralPl } from "@/lib/format";
import { withVat } from "@/lib/pricing";
import type { PriceTier } from "@/modules/vehicles/types";

/** Tabela stawek dobowych wg długości najmu (netto i brutto). */
export function PriceTable({ tiers }: { tiers: PriceTier[] }) {
  const sorted = [...tiers].sort((a, b) => a.minDays - b.minDays);

  return (
    <table className="w-full text-left text-body-sm">
      <caption className="sr-only">Stawki za dobę wg długości najmu</caption>
      <thead>
        <tr className="border-b border-iron text-caption text-slate">
          <th scope="col" className="py-2 pr-2 font-normal">
            Długość najmu
          </th>
          <th scope="col" className="px-2 py-2 text-right font-normal">
            Netto / doba
          </th>
          <th scope="col" className="py-2 pl-2 text-right font-normal">
            Brutto / doba
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((tier) => (
          <tr key={tier.minDays} className="border-b border-mist">
            <th scope="row" className="py-2.5 pr-2 font-normal">
              od {tier.minDays} {pluralPl(tier.minDays, "doby", "dób", "dób")}
            </th>
            <td className="px-2 py-2.5 text-right font-medium">{formatPln(tier.pricePerDayNet)}</td>
            <td className="py-2.5 pl-2 text-right text-slate">
              {formatPln(withVat(tier.pricePerDayNet, site.rental.vatRate))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
