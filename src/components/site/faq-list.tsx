import type { FaqItem } from "@/content/faq";

/**
 * Lista pytań i odpowiedzi na natywnych elementach <details> – działa bez JS,
 * a pełna treść odpowiedzi jest w HTML od pierwszego renderu.
 */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="border-t border-iron">
      {items.map((item) => (
        <details key={item.question} className="group border-b border-iron">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-body font-medium [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="text-heading-sm font-normal leading-none after:content-['+'] group-open:after:content-['−']"
            />
          </summary>
          <p className="pb-5 pr-8 text-body text-slate">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
