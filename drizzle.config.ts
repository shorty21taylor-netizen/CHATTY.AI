// Drizzle Kit config — migrations + studio
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  // Treat all custom types as defined in schema — pgvector is wired via
  // the `vector` customType helper in schema.ts.
  strict: true,
  verbose: true,
} satisfies Config;
