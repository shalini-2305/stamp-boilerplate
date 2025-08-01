import type { Config } from "drizzle-kit";
import { env } from "./env";


if (!env.POSTGRES_URL) {
  throw new Error(
    "Missing POSTGRES_URL - make sure you have a .env file in the root directory",
  );
}

const nonPoolingUrl = env.POSTGRES_URL.replace(":6543", ":5432");

export default {
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: nonPoolingUrl },
  casing: "snake_case",
} satisfies Config;
