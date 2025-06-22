import type { Config } from "drizzle-kit";
import { config } from "dotenv";

config();

export default {
  schema: "./shared/schema.ts",
  out: "./db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
