import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
// Import dinâmico tipado de forma resiliente: caso não haja declaração, usa any.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Pool }: { Pool: any } = require("pg");

import * as schema from "./schema";

// Reutiliza Pool em ambiente de desenvolvimento para evitar criação
// de múltiplos pools após cada hot-reload (que causam uso extra de memória
// e conexões sobrando no Postgres).
const globalForPg = globalThis as unknown as { _pgPool?: InstanceType<typeof Pool> };

export const pool =
  globalForPg._pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Ajuste opcional de pool para reduzir memória em dev
    max: Number(process.env.PG_POOL_MAX || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg._pgPool = pool;
}

export const db = drizzle(pool, { schema });
