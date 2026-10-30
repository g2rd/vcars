import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { site } from "@/config/site";
import { getCurrentUser, isAdminAvailable } from "@/modules/auth/session";

export const metadata: Metadata = { title: "Logowanie" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  if (await getCurrentUser()) redirect("/admin");

  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          {/* Czarna wersja logo na jasne tło; SVG nie wymaga optymalizacji obrazów. */}
          <Image
            src="/brand/logo-wordmark.svg"
            alt={site.name}
            width={200}
            height={43}
            unoptimized
            loading="eager"
            className="mx-auto h-auto w-52"
          />
          <h1 className="mt-4 text-heading-sm font-medium">Panel wypożyczalni</h1>
        </div>

        <div className="rounded-ui bg-paper p-6">
          {isAdminAvailable() ? (
            <LoginForm next={next} />
          ) : (
            <div className="space-y-3 text-body-sm text-slate" role="alert">
              <p className="font-medium text-ink">Panel wymaga bazy danych.</p>
              <p>
                Ustaw <code className="rounded bg-mist px-1">DATABASE_URL</code> w{" "}
                <code className="rounded bg-mist px-1">.env.local</code>. Bez Dockera uruchom lokalną
                bazę komendą <code className="rounded bg-mist px-1">npm run db:local</code> (zob.
                README).
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-body-sm">
          <Link href="/" className="text-slate underline underline-offset-2">
            Wróć na stronę
          </Link>
        </p>
      </div>
    </main>
  );
}
