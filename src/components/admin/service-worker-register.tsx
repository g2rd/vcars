"use client";

import { useEffect } from "react";

/**
 * Rejestruje service worker panelu (tryb PWA). Tylko na produkcji: w dev pliki
 * `_next/static` nie mają hashy i cache-first serwowałby nieaktualny kod.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" }).catch(() => {
      // Brak SW nie psuje panelu – po prostu nie ma trybu offline.
    });
  }, []);

  return null;
}
