import { mainNav, site } from "@/config/site";
import { Logo } from "./logo";
import { SiteNav } from "./site-nav";

/** Czarna belka nawigacji, ~56 px wysokości, biały tekst 14 px. */
export function SiteHeader() {
  return (
    <header className="on-dark sticky top-0 z-40 bg-ink text-paper">
      <div className="container-page flex h-14 items-center gap-6">
        <Logo />
        <SiteNav items={mainNav} phone={site.phone} />
      </div>
    </header>
  );
}
