import { mkdirSync } from 'node:fs';
import { Pool } from 'pg';
import { SCHEMA_SQL, SEED_PRODUCTS } from '@/lib/schema';

export type Row = Record<string, unknown>;
export type QueryResult<T extends Row> = { rows: T[]; rowCount: number };

export interface Queryable {
  query<T extends Row = Row>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
}

interface Driver extends Queryable {
  exec(sql: string): Promise<void>;
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
}

type PgLike = {
  query(text: string, params?: unknown[]): Promise<{ rows: Row[]; rowCount: number | null }>;
};

function createPostgresDriver(url: string): Driver {
  const pool = new Pool({
    connectionString: url,
    max: 5,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  const wrap = (target: PgLike): Queryable => ({
    async query<T extends Row>(text: string, params?: unknown[]) {
      const res = await target.query(text, params);
      return { rows: res.rows as T[], rowCount: res.rowCount ?? 0 };
    },
  });

  const base = wrap(pool);

  return {
    ...base,
    async exec(sql) {
      await pool.query(sql);
    },
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await fn(wrap(client));
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK').catch(() => undefined);
        throw error;
      } finally {
        client.release();
      }
    },
  };
}

/** Base embebida (Postgres real compilado a WASM) para desarrollar sin instalar nada. Solo fuera de producción. */
async function createPgliteDriver(): Promise<Driver> {
  const { PGlite } = await import('@electric-sql/pglite');
  // PGlite crea la carpeta de datos pero no la carpeta que la contiene
  mkdirSync('./.data', { recursive: true });
  const db = new PGlite('./.data/pglite');
  await db.waitReady;

  const wrap = (target: {
    query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[]; affectedRows?: number }>;
  }): Queryable => ({
    async query<T extends Row>(text: string, params?: unknown[]) {
      const res = await target.query(text, params);
      return { rows: res.rows as T[], rowCount: res.affectedRows ?? res.rows.length };
    },
  });

  return {
    ...wrap(db),
    async exec(sql) {
      await db.exec(sql);
    },
    transaction: (fn) => db.transaction((tx) => fn(wrap(tx))),
  };
}

async function init(): Promise<Driver> {
  const url = process.env.DATABASE_URL;

  let driver: Driver;
  if (url) {
    driver = createPostgresDriver(url);
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('Falta la variable DATABASE_URL (la da Railway al crear el Postgres).');
  } else {
    driver = await createPgliteDriver();
  }

  await driver.exec(SCHEMA_SQL);

  const { rows } = await driver.query<{ n: number }>('SELECT COUNT(*)::int AS n FROM products');
  if (rows[0].n === 0) {
    // Proyecto de portfolio: los productos de ejemplo salen visibles también en producción
    const active = true;
    for (const p of SEED_PRODUCTS) {
      await driver.query(
        'INSERT INTO products (name, description, unit_kg, price_cents, sort_order, active) VALUES ($1, $2, $3, $4, $5, $6)',
        [p.name, p.description, p.unitKg, p.priceCents, p.sortOrder, active],
      );
    }
  }

  return driver;
}

// Una sola conexión por proceso, también entre recargas de desarrollo
const globalForDb = globalThis as unknown as { __l108Db?: Promise<Driver> };

export function getDb(): Promise<Driver> {
  if (!globalForDb.__l108Db) {
    globalForDb.__l108Db = init().catch((error) => {
      globalForDb.__l108Db = undefined;
      throw error;
    });
  }
  return globalForDb.__l108Db;
}

export async function query<T extends Row = Row>(text: string, params?: unknown[]) {
  return (await getDb()).query<T>(text, params);
}

export async function transaction<T>(fn: (tx: Queryable) => Promise<T>) {
  return (await getDb()).transaction(fn);
}
