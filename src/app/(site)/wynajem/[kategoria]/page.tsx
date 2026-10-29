import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CategoryTabs } from "@/components/site/category-tabs";
import { CtaBand } from "@/components/site/cta-band";
import { VehicleCard } from "@/components/site/vehicle-card";
import { CheckIcon } from "@/components/ui/icons";
import { breadcrumbNode, itemListNode, jsonLdGraph, webPageNode } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  getCategories,
  getCategory,
  getVehiclesByCategory,
} from "@/modules/vehicles/queries";
import { vehicleName } from "@/modules/vehicles/types";

type Props = { params: Promise<{ kategoria: string }> };

/** Zob. uzasadnienie w `flota/[slug]/page.tsx`: prawdziwe 404 > instant UI dla nieznanych adresów. */
export const instant = false;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ kategoria: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategoria } = await params;
  const category = await getCategory(kategoria);
  if (!category) notFound();
  return buildMetadata({
    title: category.seoTitle,
    description: category.seoDescription,
    path: `/wynajem/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { kategoria } = await params;
  const category = await getCategory(kategoria);
  if (!category) notFound();

  const [categories, vehicles] = await Promise.all([
    getCategories(),
    getVehiclesByCategory(category.slug),
  ]);

  const path = `/wynajem/${category.slug}`;
  const crumbs = [
    { name: "Strona główna", path: "/" },
    { name: "Flota", path: "/flota" },
    { name: category.name, path },
  ];

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          webPageNode({
            type: "CollectionPage",
            path,
            name: category.h1,
            description: category.seoDescription,
            hasBreadcrumb: true,
          }),
          breadcrumbNode(path, crumbs),
          itemListNode(
            path,
            category.name,
            vehicles.map((v) => ({ name: vehicleName(v), path: `/flota/${v.slug}` })),
          ),
        )}
      />

      <div className="container-page py-6 md:py-10">
        <Breadcrumbs items={crumbs} />
        <h1 className="type-heading mt-6">{category.h1}</h1>
        <div className="mt-4 max-w-3xl space-y-4 text-body text-slate">
          {category.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-8">
          <CategoryTabs categories={categories} activeSlug={category.slug} />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.slug} vehicle={vehicle} headingLevel="h2" />
          ))}
        </div>

        <section className="mt-14 rounded-ui bg-mist p-6 md:p-8" aria-labelledby="zastosowania">
          <h2 id="zastosowania" className="text-heading-sm">
            Do czego sprawdzi się ta kategoria
          </h2>
          <ul className="mt-5 grid gap-3 md:grid-cols-3">
            {category.useCases.map((useCase) => (
              <li key={useCase} className="flex items-start gap-3 text-body">
                <CheckIcon width={18} height={18} className="mt-1 shrink-0" />
                {useCase}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <CtaBand />
    </>
  );
}
