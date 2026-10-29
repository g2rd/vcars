import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteChrome } from "@/components/site/site-chrome";
import { businessNode, jsonLdGraph, websiteNode } from "@/lib/seo/jsonld";
import { getCategories, getVehicles } from "@/modules/vehicles/queries";

/** Publiczna strona: nagłówek, stopka i dane strukturalne całego serwisu (firma + WebSite). */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [categories, vehicles] = await Promise.all([getCategories(), getVehicles()]);

  return (
    <>
      <JsonLd data={jsonLdGraph(businessNode({ categories, vehicles }), websiteNode())} />
      <SiteChrome>{children}</SiteChrome>
    </>
  );
}
