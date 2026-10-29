/** Łączy klasy CSS pomijając wartości puste (bez zależności od clsx). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
