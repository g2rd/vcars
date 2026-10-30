import { serializeJsonLd, type JsonLdNode } from "@/lib/seo/jsonld";

/** Dane strukturalne renderowane po stronie serwera (od razu w HTML, nie przez JS). */
export function JsonLd({ data }: { data: JsonLdNode }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
