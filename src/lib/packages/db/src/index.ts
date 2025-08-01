export * from "drizzle-orm/sql";
export { alias } from "drizzle-orm/pg-core";
export * from "./schema";

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;
