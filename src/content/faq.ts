import { site } from "@/config/site";
import { formatPln } from "@/lib/format";

export type FaqItem = { question: string; answer: string };

/** Najczęstsze pytania klientów wypożyczalni – treść powiązana z `config/site.ts`. */
export const faq: FaqItem[] = [
  {
    question: "Jakie dokumenty potrzebuję do wynajęcia busa?",
    answer: `Dowód osobisty lub paszport oraz prawo jazdy kategorii B (minimum ${site.rental.minLicenseYears} lata). Firmy dodatkowo podają NIP i dane osoby upoważnionej do odbioru auta. Umowę przygotowujemy z góry, więc odbiór trwa kilkanaście minut.`,
  },
  {
    question: "Czy wystarczy prawo jazdy kategorii B?",
    answer:
      "Tak. Wszystkie auta w ofercie mają dopuszczalną masę całkowitą do 3,5 t, więc prowadzisz je na standardowym prawie jazdy kategorii B – także duże furgony i kontenery z windą.",
  },
  {
    question: "Czy ceny są netto czy brutto?",
    answer: `Wszystkie ceny na stronie podajemy netto. Do kwoty doliczamy ${Math.round(site.rental.vatRate * 100)}% VAT, a po najmie wystawiamy fakturę VAT na firmę lub osobę prywatną.`,
  },
  {
    question: "Ile wynosi kaucja i kiedy ją zwracacie?",
    answer:
      "Wysokość kaucji zależy od modelu auta i jest podana na jego karcie. Zwracamy ją po odbiorze pojazdu w stanie zgodnym z protokołem wydania – zazwyczaj tego samego dnia.",
  },
  {
    question: "Ile kilometrów mogę przejechać?",
    answer: `W cenie masz limit ${site.rental.kmLimitPerDay} km na dobę. Każdy dodatkowy kilometr kosztuje ${formatPln(site.rental.extraKmPriceGrosze)} netto. Planujesz dłuższą trasę? Zapytaj o pakiet kilometrów.`,
  },
  {
    question: "Czy auta są ubezpieczone?",
    answer:
      "Tak, każde auto ma polisę OC i AC. Zakres ubezpieczenia oraz ewentualny udział własny w szkodzie opisujemy w umowie najmu, a przed podpisaniem tłumaczymy je prostym językiem.",
  },
  {
    question: "Od ilu lat mogę wynająć auto dostawcze?",
    answer: `Kierowca musi mieć ukończone ${site.rental.minDriverAge} lat i posiadać prawo jazdy od co najmniej ${site.rental.minLicenseYears} lat.`,
  },
  {
    question: "Jak zarezerwować busa?",
    answer: `Wybierz auto i termin w formularzu albo zadzwoń: ${site.phone.display}. Potwierdzamy dostępność i cenę, a rezerwację domykasz kaucją przy odbiorze. Płatność: ${site.rental.paymentMethods.join(", ")}.`,
  },
];
