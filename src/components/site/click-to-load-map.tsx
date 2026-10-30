"use client";

import { useState } from "react";
import { PinIcon } from "@/components/ui/icons";

type ClickToLoadMapProps = {
  /** Adres ramki z mapą – wczytywany dopiero po kliknięciu. */
  src: string;
  title: string;
  address: string;
};

/**
 * Mapa „na żądanie": do kliknięcia widać tylko zaślepkę, więc strona nie pobiera
 * skryptów ani kafelków Google i nie wysyła do Google danych użytkownika, dopóki
 * ten sam o to nie poprosi (szybsze ładowanie i mniej problemów z prywatnością).
 */
export function ClickToLoadMap({ src, title, address }: ClickToLoadMapProps) {
  const [requested, setRequested] = useState(false);
  const [ready, setReady] = useState(false);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-ui bg-mist md:aspect-[16/7]">
      {requested ? (
        <>
          <iframe
            src={src}
            title={title}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setReady(true)}
            className="absolute inset-0 size-full border-0"
          />
          {/* Mapa Google potrafi wczytywać się kilka sekund – bez komunikatu wygląda to na błąd. */}
          {!ready && (
            <p
              role="status"
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-mist text-body text-slate"
            >
              Ładuję mapę…
            </p>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => setRequested(true)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-mist p-6 text-center hover:bg-sand"
        >
          <PinIcon width={32} height={32} />
          <span className="text-subheading font-medium">Pokaż mapę</span>
          <span className="max-w-xs text-body-sm text-slate">
            {address}. Mapa Google załaduje się po kliknięciu.
          </span>
        </button>
      )}
    </div>
  );
}
