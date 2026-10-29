import { Button } from "@/components/ui/button";

export default function AdminHomePage() {
  return (
    <div className="container-page py-16">
      <h1 className="type-heading">Panel administracyjny</h1>
      <p className="mt-4 max-w-xl text-subheading text-slate">
        Ten obszar jest przygotowany pod panel zarządzania flotą (PWA, mobile first). Katalog
        pojazdów, ceny i zapytania klientów mają już gotowe tabele i warstwę danych.
      </p>
      <Button href="/" variant="secondary" className="mt-8">
        Wróć do strony
      </Button>
    </div>
  );
}
