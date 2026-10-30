import type { Metadata } from "next";

// Statyczna strona pokazywana przez service worker, gdy telefon nie ma internetu.
export const metadata: Metadata = { title: "Brak połączenia" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        <h1 className="text-heading-sm font-medium">Brak połączenia z internetem</h1>
        <p className="mt-3 text-body text-slate">
          Panel pokazuje aktualne dane z serwera, dlatego do pracy potrzebuje internetu. Sprawdź
          zasięg lub Wi-Fi i spróbuj ponownie.
        </p>
        <a
          href="/admin"
          className="mt-6 inline-flex min-h-12 items-center rounded-ui bg-ink px-5 text-body text-paper"
        >
          Spróbuj ponownie
        </a>
      </div>
    </main>
  );
}
