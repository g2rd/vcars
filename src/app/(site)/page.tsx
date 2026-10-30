import type { Metadata } from "next";
import { HeroScene } from "@/components/illustrations/hero-scene";
import { IllustrationPanel } from "@/components/illustrations/illustration-panel";
import { JsonLd } from "@/components/seo/json-ld";
import { CategoryCard } from "@/components/site/category-card";
import { CtaBand } from "@/components/site/cta-band";
import { FaqList } from "@/components/site/faq-list";
import { HeroSearch } from "@/components/site/hero-search";
import { PhotoFrame } from "@/components/site/photo-frame";
import { VehicleCard } from "@/components/site/vehicle-card";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { faq } from "@/content/faq";
import { itemListNode, jsonLdGraph, webPageNode } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCategories, getVehicles } from "@/modules/vehicles/queries";

const TITLE = `Wynajem samochodów dostawczych ${site.address.city}`;

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: site.description,
  path: "/",
});

const reasons = [
  {
    title: "Przejrzysty cennik netto",
    text: "Widzisz stawkę za dobę, limit kilometrów i kaucję, zanim cokolwiek podpiszesz. Żadnych dopłat w drobnym druku.",
  },
  {
    title: "Odbiór bez kolejek",
    text: "Umowę przygotowujemy z góry, więc przy odbiorze sprawdzasz tylko auto i dokumenty. Zwykle zajmuje to kilkanaście minut.",
  },
  {
    title: "Sprawne, serwisowane auta",
    text: "Każdy bus przechodzi przegląd przed wydaniem. Dostajesz auto z pełnym zestawem: pasy transportowe, koło zapasowe, apteczka.",
  },
  {
    title: "Pomoc, gdy jej potrzebujesz",
    text: "Masz pytanie w trakcie najmu? Dzwonisz pod ten sam numer, pod którym rezerwowałeś auto.",
  },
];

const steps = [
  {
    title: "Wybierz auto i termin",
    text: "Sprawdź flotę, porównaj pojemność i ładowność, a potem podaj termin w formularzu lub przez telefon.",
  },
  {
    title: "Potwierdzamy dostępność",
    text: "Odpowiadamy z ceną netto i szczegółami umowy. Rezerwację domykasz kaucją przy odbiorze.",
  },
  {
    title: "Odbierasz kluczyki",
    text: "Pokazujesz dowód i prawo jazdy, podpisujesz protokół wydania i ruszasz w drogę.",
  },
];

export default async function HomePage() {
  const [categories, vehicles] = await Promise.all([getCategories(), getVehicles()]);
  const countByCategory = new Map<string, number>();
  for (const vehicle of vehicles) {
    countByCategory.set(vehicle.categorySlug, (countByCategory.get(vehicle.categorySlug) ?? 0) + 1);
  }
  const popular = vehicles.slice(0, 6);
  // Zdjęcia sekcji hero i „Dlaczego" – konkretne auta z floty (fallback: ilustracje).
  const heroPhoto = (
    vehicles.find((v) => v.slug === "ford-transit-custom-l2h1") ??
    vehicles.find((v) => v.images.length > 0)
  )?.images[0];
  const whyPhoto = (
    vehicles.find((v) => v.slug === "renault-master-l3h2") ??
    vehicles.find((v) => v.images.length > 0)
  )?.images[0];

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          webPageNode({ path: "/", name: TITLE, description: site.description }),
          itemListNode(
            "/",
            "Kategorie floty",
            categories.map((c) => ({ name: c.name, path: `/wynajem/${c.slug}` })),
          ),
        )}
      />

      <section className="container-page grid gap-8 py-8 md:grid-cols-[5fr_6fr] md:items-center md:gap-12 md:py-14">
        <div>
          <h1 className="type-display">
            {`${site.tagline} w ${site.address.cityLocative}`}
          </h1>
          <p className="mt-4 text-subheading text-slate">
            Furgony, duże busy i kontenery z windą. Ceny netto, szybki odbiór i umowa bez kolejek.
          </p>
          <HeroSearch categories={categories} className="mt-8 max-w-md" />
        </div>
        {heroPhoto ? (
          <PhotoFrame
            image={heroPhoto}
            sizes="(min-width: 1200px) 628px, (min-width: 768px) 54vw, 100vw"
            preload
            aspectClassName="aspect-[4/3]"
            imageClassName="object-right"
          />
        ) : (
          <HeroScene className="aspect-square w-full rounded-ui" />
        )}
      </section>

      <section className="container-page py-12 md:py-16" aria-labelledby="kategorie">
        <h2 id="kategorie" className="type-heading">
          Wybierz rodzaj auta
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard
              key={category.slug}
              category={category}
              count={countByCategory.get(category.slug) ?? 0}
              representative={vehicles.find((v) => v.categorySlug === category.slug)}
            />
          ))}
        </div>
      </section>

      <section className="container-page pb-12 md:pb-16" aria-labelledby="popularne">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="popularne" className="type-heading">
            Popularne modele
          </h2>
          <Button href="/flota" variant="secondary">
            Cała flota
          </Button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {popular.map((vehicle) => (
            <VehicleCard key={vehicle.slug} vehicle={vehicle} />
          ))}
        </div>
      </section>

      <section className="bg-mist" aria-labelledby="dlaczego">
        <div className="container-page grid gap-8 py-12 md:grid-cols-2 md:items-center md:gap-12 md:py-16">
          <div>
            <h2 id="dlaczego" className="type-heading">
              {`Dlaczego ${site.name}`}
            </h2>
            <ul className="mt-8 space-y-6">
              {reasons.map((reason) => (
                <li key={reason.title}>
                  <h3 className="text-subheading font-medium">{reason.title}</h3>
                  <p className="mt-1 text-body text-slate">{reason.text}</p>
                </li>
              ))}
            </ul>
          </div>
          {whyPhoto ? (
            <PhotoFrame
              image={whyPhoto}
              sizes="(min-width: 1200px) 564px, (min-width: 768px) 46vw, 100vw"
              aspectClassName="aspect-[4/3] md:aspect-square"
            />
          ) : (
            <IllustrationPanel body="panel" palette="teal" className="aspect-square" />
          )}
        </div>
      </section>

      <section className="container-page py-12 md:py-16" aria-labelledby="kroki">
        <h2 id="kroki" className="type-heading">
          Jak wynająć busa w 3 krokach
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-ui bg-mist p-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-ink text-body-sm text-paper">
                {index + 1}
              </span>
              <h3 className="mt-4 text-subheading font-medium">{step.title}</h3>
              <p className="mt-2 text-body-sm text-slate">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-page pb-12 md:pb-16" aria-labelledby="obszar">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 id="obszar" className="type-heading">
              {`Wynajem busów w ${site.address.cityLocative} i okolicach`}
            </h2>
            <p className="mt-4 text-body text-slate">
              Odbierasz auto w naszej wypożyczalni przy {site.address.street},{" "}
              {site.address.city}. Wynajmujemy w Zabrzu i miastach ościennych, a z czasem na
              całym Górnym Śląsku. Obsługujemy m.in.: {site.serviceAreas.join(", ")}. Planujesz
              dłuższą trasę? Zapytaj o pakiet kilometrów.
            </p>
          </div>
          <div className="rounded-ui bg-mist p-6">
            <h3 className="text-subheading font-medium">Godziny otwarcia</h3>
            <ul className="mt-3 space-y-1 text-body text-slate">
              {site.openingHours.map((hours) => (
                <li key={hours.label}>{hours.label}</li>
              ))}
              <li>Niedziela: zamknięte</li>
            </ul>
            <p className="mt-4 text-body-sm text-slate">
              Odbiór poza godzinami otwarcia ustalamy indywidualnie.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page pb-12 md:pb-16" aria-labelledby="faq">
        <h2 id="faq" className="type-heading">
          Najczęstsze pytania
        </h2>
        <div className="mt-8 max-w-3xl">
          <FaqList items={faq.slice(0, 5)} />
          <Button href="/jak-wynajac" variant="secondary" className="mt-6">
            Wszystkie warunki wynajmu
          </Button>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
