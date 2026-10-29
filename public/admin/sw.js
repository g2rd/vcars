/*
 * Service worker panelu VCars (zakres /admin/).
 *
 * Zasady (celowo ostrożne – panel pokazuje dane klientów i firmy):
 *  - nigdy nie cache'ujemy stron panelu, odpowiedzi RSC ani żądań POST (Server Actions),
 *  - nawigacja: najpierw sieć; bez internetu pokazujemy statyczną stronę /admin/offline,
 *  - cache-first tylko dla niezmiennych zasobów: hashowane pliki /_next/static i ikony.
 *
 * Podbij VERSION po zmianie logiki, żeby wyczyścić stare cache.
 */
const VERSION = "v1";
const STATIC_CACHE = `vcars-admin-static-${VERSION}`;
const OFFLINE_URL = "/admin/offline";
const PRECACHE = [OFFLINE_URL, "/admin/icon-192.png", "/admin/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

function isImmutableAsset(url) {
  return url.pathname.startsWith("/_next/static/") || /^\/admin\/icon-.*\.png$/.test(url.pathname);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" && url.pathname.startsWith("/admin")) {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) ?? Response.error()),
    );
    return;
  }

  if (isImmutableAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
