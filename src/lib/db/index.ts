import { Pool, QueryResult, QueryResultRow } from 'pg';
import { createInMemoryDatabase } from './in-memory-db';
import { populateDatabase } from './seed-all';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://examadmin:examsecret@localhost:5432/examsetu';

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 1500,
});

let useInMemory = false;
let memoryPool: any = null;
let seedPromise: Promise<void> | null = null;

async function getMemoryPool() {
  if (!memoryPool) {
    const { pool: mPool } = createInMemoryDatabase();
    memoryPool = mPool;
    seedPromise = populateDatabase(memoryPool);
  }
  if (seedPromise) {
    await seedPromise;
  }
  return memoryPool;
}

pool.on('error', () => {
  useInMemory = true;
});

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();

  if (useInMemory) {
    const mPool = await getMemoryPool();
    return mPool.query(text, params);
  }

  try {
    const res = await pool.query<T>(text, params);
    return res;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED') || error.message?.includes('Connection refused')) {
      useInMemory = true;
      const mPool = await getMemoryPool();
      return mPool.query(text, params);
    }
    console.error('[DB Query Error]:', { text, error: error.message });
    throw error;
  }
}

export async function getClient() {
  if (useInMemory) {
    const mPool = await getMemoryPool();
    return mPool.connect();
  }
  try {
    const client = await pool.connect();
    return client;
  } catch (err: any) {
    useInMemory = true;
    const mPool = await getMemoryPool();
    return mPool.connect();
  }
}

export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {}
    throw err;
  } finally {
    try {
      client.release();
    } catch {}
  }
}

export default pool;
