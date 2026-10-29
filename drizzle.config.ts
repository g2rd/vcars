import { defineConfig } from "drizzle-kit";

// drizzle-kit nie ładuje .env.local sam – robimy to jawnie (Node 20+).
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // brak pliku – pomijamy
  }
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://vcars:vcars@localhost:5432/vcars",
  },
});
