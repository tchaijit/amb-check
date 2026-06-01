import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __ambPgPool: Pool | undefined;
}

function createPool(): Pool {
  // Prefer the pooled connection (Supabase pgBouncer, port 6543). Serverless
  // platforms like Vercel often cannot reach the direct connection (port 5432)
  // because Supabase only exposes it over IPv6; the pooler is IPv4-reachable.
  const rawUrl = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
  if (!rawUrl) {
    throw new Error('POSTGRES_URL or POSTGRES_URL_NON_POOLING is required');
  }

  // Strip sslmode (handled by ssl option) and Supabase-specific flags pg doesn't recognize
  const connectionString = rawUrl
    .replace(/[?&]sslmode=[^&]+/g, '')
    .replace(/[?&]supa=[^&]+/g, '')
    .replace(/[?&]pgbouncer=[^&]+/g, '');

  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
  });
}

export const pgPool: Pool = globalThis.__ambPgPool ?? (globalThis.__ambPgPool = createPool());

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const result = await pgPool.query(text, params);
  return { rows: result.rows as T[] };
}
