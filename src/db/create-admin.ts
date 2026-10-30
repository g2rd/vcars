/**
 * `npm run admin:create -- --email szef@firma.pl --name "Jan Kowalski" [--role owner|staff] [--password ...]`
 *
 * Zakłada konto w panelu. Bez `--password` generuje losowe hasło i wypisuje je
 * jednorazowo. `--demo` zakłada konto z `demo-credentials.ts` (tylko lokalnie).
 */
import { parseArgs } from "node:util";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { generatePassword } from "../modules/auth/password";
import { createAuthService, type UserRole } from "../modules/auth/service";
import { DEMO_ADMIN } from "./demo-credentials";
import * as schema from "./schema";

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      name: { type: "string" },
      role: { type: "string", default: "owner" },
      password: { type: "string" },
      demo: { type: "boolean", default: false },
    },
  });

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Brak DATABASE_URL (ustaw w .env.local).");
    process.exit(1);
  }
  if (values.demo && process.env.NODE_ENV === "production") {
    console.error("Konto demo jest niedozwolone na produkcji.");
    process.exit(1);
  }

  const email = values.demo ? DEMO_ADMIN.email : values.email;
  const name = values.demo ? DEMO_ADMIN.name : values.name;
  if (!email || !name) {
    console.error('Podaj --email i --name (albo --demo). Przykład: --email szef@firma.pl --name "Jan Kowalski"');
    process.exit(1);
  }
  if (values.role !== "owner" && values.role !== "staff") {
    console.error("--role musi być „owner” albo „staff”.");
    process.exit(1);
  }

  const generated = !values.demo && !values.password;
  const password = values.demo ? DEMO_ADMIN.password : (values.password ?? generatePassword());

  const client = postgres(url, { max: 1 });
  try {
    const user = await createAuthService(drizzle(client, { schema })).createUser({
      email,
      name,
      role: values.role as UserRole,
      password,
    });
    console.info(`Utworzono konto: ${user.email} (${user.role}).`);
    if (generated) {
      console.info(`Hasło (zapisz je teraz, nie zostanie pokazane ponownie): ${password}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
