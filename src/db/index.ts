import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __dbPool__: Pool | undefined;
}

const pool =
  global.__dbPool__ ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });

if (process.env.NODE_ENV !== 'production') {
  global.__dbPool__ = pool;
}

export const db = drizzle(pool);
export { pool };