/**
 * Ścieżki panelu dostępne bez logowania. Reszta `/admin/*` wymaga sesji.
 * (Logika w osobnym pliku, żeby dało się ją przetestować bez uruchamiania proxy.)
 */
const PUBLIC_EXACT = new Set(["/admin/login", "/admin/offline", "/admin/manifest.webmanifest", "/admin/sw.js"]);
const PUBLIC_ICON = /^\/admin\/icon-[\w-]+\.png$/;

export function isProtectedAdminPath(pathname: string): boolean {
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) return false;
  return !PUBLIC_EXACT.has(pathname) && !PUBLIC_ICON.test(pathname);
}
