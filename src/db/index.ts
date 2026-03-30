// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

declare global {
  var __dbPool__: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool =
  global.__dbPool__ ??
  new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });

if (process.env.NODE_ENV !== 'production') {
  global.__dbPool__ = pool;
}

export const db = drizzle(pool, { schema });
export { pool };