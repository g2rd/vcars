import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { PageHeader } from "@/components/admin/admin-shell";
import { LogoutIcon } from "@/components/ui/icons";
import { logoutAction } from "@/modules/auth/actions";
import { requireUser } from "@/modules/auth/session";

export const metadata: Metadata = { title: "Konto" };

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader title="Konto" />

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-ui bg-paper p-5" aria-labelledby="profil">
          <h2 id="profil" className="text-subheading font-medium">
            Twoje dane
          </h2>
          <dl className="mt-4 space-y-3 text-body">
            <div>
              <dt className="text-caption text-slate">Imię i nazwisko</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt className="text-caption text-slate">E-mail (login)</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt className="text-caption text-slate">Rola</dt>
              <dd>{user.role === "owner" ? "Szef" : "Pracownik"}</dd>
            </div>
          </dl>

          <form action={logoutAction} className="mt-6">
            <button
              type="submit"
              className="inline-flex min-h-12 items-center gap-2 rounded-ui border border-iron px-4 text-body hover:bg-mist"
            >
              <LogoutIcon width={18} height={18} />
              Wyloguj się
            </button>
          </form>
        </section>

        <section className="rounded-ui bg-paper p-5" aria-labelledby="haslo">
          <h2 id="haslo" className="text-subheading font-medium">
            Zmiana hasła
          </h2>
          <div className="mt-4">
            <ChangePasswordForm />
          </div>
        </section>
      </div>
    </>
  );
}
