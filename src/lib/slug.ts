const POLISH_LETTERS: Record<string, string> = {
  ł: "l",
  Ł: "L",
  ø: "o",
  đ: "d",
};

/** „Fiat Doblò Cargo L2" → `fiat-doblo-cargo-l2`. Obsługuje polskie znaki. */
export function slugify(text: string): string {
  return text
    .replace(/[łŁøđ]/g, (char) => POLISH_LETTERS[char] ?? char)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 80;
}
