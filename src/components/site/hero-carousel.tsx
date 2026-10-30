"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PhotoCredit } from "@/components/site/photo-credit";
import { ArrowRightIcon, PauseIcon, PlayIcon } from "@/components/ui/icons";
import type { HeroSlide } from "@/content/hero-slides";
import { cn } from "@/lib/cn";

/** Co ile milisekund karuzela sama przechodzi do kolejnego slajdu. */
const INTERVAL_MS = 6000;
const SIZES = "(min-width: 1200px) 628px, (min-width: 768px) 54vw, 100vw";

/**
 * Karuzela na stronie głównej: auta z floty i promocje. Mobile first: slajdy to zwykła
 * lista z `scroll-snap`, więc przesuwa się ją palcem natywnie (bez biblioteki), a bez JS
 * nadal da się ją przewijać. JS dokłada tylko automatyczne przewijanie, kropki i pauzę.
 *
 * Automat zatrzymuje się, gdy: użytkownik go wstrzyma, trzyma palec lub kursor nad
 * karuzelą, nawiguje klawiaturą, karuzela jest poza ekranem albo karta jest w tle.
 * Przy ustawieniu „ogranicz ruch" slajdy zmieniają się bez animacji.
 */
export function HeroCarousel({ slides, className }: { slides: HeroSlide[]; className?: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [touching, setTouching] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const count = slides.length;

  const goTo = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({ left: index * scroller.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
    setActive(index);
  }, []);

  // Pozycję slajdu czytamy z przewinięcia, więc działa też przy przesunięciu palcem.
  const onScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;
    const index = Math.round(scroller.scrollLeft / scroller.clientWidth);
    setActive((previous) => (previous === index ? previous : index));
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const running =
    count > 1 && !userPaused && !hovering && !touching && !keyboardFocus && inView && tabVisible;

  // `active` w zależnościach: po każdej zmianie slajdu (także ręcznej) odliczanie zaczyna się od nowa.
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => goTo((active + 1) % count), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [running, active, count, goTo]);

  if (count === 0) return null;

  return (
    <section
      ref={rootRef}
      aria-roledescription="karuzela"
      aria-label="Nasza flota i promocje"
      className={className}
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onTouchStart={() => setTouching(true)}
      onTouchEnd={() => setTouching(false)}
      onTouchCancel={() => setTouching(false)}
      // Tylko fokus z klawiatury zatrzymuje automat; kliknięcie kropki myszą czy palcem nie.
      onFocus={(event) => setKeyboardFocus(event.target.matches(":focus-visible"))}
      onBlur={() => setKeyboardFocus(false)}
    >
      <div className="relative">
        <ul
          ref={scrollerRef}
          onScroll={onScroll}
          aria-live={running ? "off" : "polite"}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-ui bg-sand [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, index) => (
            <li
              key={slide.id}
              aria-roledescription="slajd"
              aria-label={`${index + 1} z ${count}`}
              className="relative aspect-[3/2] w-full shrink-0 snap-center md:aspect-[4/3]"
            >
              <Link href={slide.href} className="absolute inset-0 block text-paper">
                <Image
                  src={slide.image.url}
                  alt={slide.image.alt}
                  fill
                  sizes={SIZES}
                  preload={index === 0}
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/55 to-transparent px-4 pb-4 pt-14 md:px-5 md:pb-5 md:pt-20">
                  {slide.kind === "vehicle" ? (
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-subheading font-medium">{slide.title}</p>
                        <p className="mt-0.5 text-body-sm text-paper/85">{slide.detail}</p>
                        <p className="mt-1 text-body-sm font-medium">{slide.price}</p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-body-sm">
                        Zobacz
                        <ArrowRightIcon width={16} height={16} />
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="inline-block rounded-full bg-paper px-3 py-1 text-caption font-medium text-ink">
                        {slide.badge}
                      </span>
                      <p className="mt-2 text-subheading font-medium">{slide.title}</p>
                      <p className="mt-0.5 text-body-sm text-paper/90">{slide.text}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-body-sm font-medium underline underline-offset-2">
                        {slide.cta}
                        <ArrowRightIcon width={16} height={16} />
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo((active - 1 + count) % count)}
              aria-label="Poprzedni slajd"
              className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink hover:bg-paper md:flex"
            >
              <ArrowRightIcon className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => goTo((active + 1) % count)}
              aria-label="Następny slajd"
              className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink hover:bg-paper md:flex"
            >
              <ArrowRightIcon />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-2 flex items-center justify-between gap-3">
          <div role="group" aria-label="Wybór slajdu" className="flex items-center">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Pokaż slajd ${index + 1} z ${count}`}
                aria-current={index === active ? "true" : undefined}
                className="flex h-11 w-6 items-center justify-center"
              >
                <span
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === active ? "w-5 bg-ink" : "w-2 bg-iron",
                  )}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setUserPaused((paused) => !paused)}
            aria-label={
              userPaused ? "Wznów automatyczne przewijanie" : "Wstrzymaj automatyczne przewijanie"
            }
            className="flex size-11 items-center justify-center rounded-full border border-iron text-ink hover:bg-mist"
          >
            {userPaused ? <PlayIcon width={18} height={18} /> : <PauseIcon width={18} height={18} />}
          </button>
        </div>
      )}

      <PhotoCredit image={slides[active]?.image} />
    </section>
  );
}
