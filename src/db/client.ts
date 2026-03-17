import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/env";
import * as schema from "@/db/schema";

const globalForDb = globalThis as unknown as {
  client?: Pool;
};

const client =
  globalForDb.client ??
  new Pool({
    connectionString: env.databaseUrl,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
