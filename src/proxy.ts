import { NextResponse, type NextRequest } from "next/server";
import { isProtectedAdminPath } from "@/lib/admin-paths";
import { pageExists } from "@/lib/page-exists";
import { LOGIN_PATH, SESSION_COOKIE } from "@/modules/auth/constants";

/**
 * Dwie rzeczy robimy PRZED renderem (zob. docs Next.js → loading.js → „Status codes"):
 *
 * 1. `/flota/:slug`, `/wynajem/:kategoria` – nieznany adres dostaje prawdziwe HTTP 404.
 *    Bez tego pierwsza odpowiedź to 200 + noindex, które roboty raportują jako „soft 404".
 * 2. `/admin/*` – brak ciasteczka sesji = natychmiastowe 307 na logowanie. To tylko
 *    optymistyczny filtr (sprawdza obecność ciasteczka, nie jego ważność); właściwą
 *    weryfikację sesji w bazie robi `requireUser()` w każdej stronie i Server Action.
 */
export const config = {
  matcher: ["/flota/:slug", "/wynajem/:kategoria", "/admin/:path*"],
};

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (isProtectedAdminPath(pathname) && !request.cookies.has(SESSION_COOKIE)) {
      const login = new URL(LOGIN_PATH, request.url);
      if (pathname !== "/admin") login.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  const [, section, rawSlug] = pathname.split("/");
  let slug: string;
  try {
    slug = decodeURIComponent(rawSlug ?? "");
  } catch {
    slug = "";
  }

  if (await pageExists(section === "flota" ? "vehicle" : "category", slug)) {
    return NextResponse.next();
  }

  // Przepisanie na trasę, której nie ma, daje stronę 404 serwisu ze statusem 404.
  return NextResponse.rewrite(new URL("/nie-znaleziono", request.url));
}
