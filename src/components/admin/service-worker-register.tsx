"use client";

import { useEffect } from "react";

/**
 * Włącza albo sprząta tryb PWA panelu.
 *
 * - `enabled`: rejestruje service worker (tylko na produkcji: w dev pliki `_next/static`
 *   nie mają hashy i cache-first serwowałby nieaktualny kod).
 * - wyłączone (stan domyślny, PWA to późniejszy etap): wyrejestrowuje service worker
 *   i kasuje jego cache u każdego, kto zdążył go zainstalować z wcześniejszej wersji.
 */
export function ServiceWorkerRegister({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (!enabled) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(
            registrations
              .filter((registration) => registration.scope.endsWith("/admin/"))
              .map((registration) => registration.unregister()),
          ),
        )
        .catch(() => {});
      if ("caches" in window) {
        caches
          .keys()
          .then((keys) =>
            Promise.all(keys.filter((key) => key.startsWith("vcars-admin-")).map((key) => caches.delete(key))),
          )
          .catch(() => {});
      }
      return;
    }

    if (process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" }).catch(() => {
      // Brak SW nie psuje panelu – po prostu nie ma trybu offline.
    });
  }, [enabled]);

  return null;
}
