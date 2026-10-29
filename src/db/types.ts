import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type * as schema from "./schema";

/**
 * Wspólny typ bazy: pasuje do `postgres-js` (aplikacja) i `pglite` (testy),
 * dzięki czemu repozytoria da się testować bez Dockera.
 */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;
