import fs from 'fs';
import path from 'path';
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { createInMemoryDatabase } from './in-memory-db';
import { populateDatabase } from './seed-all';

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

    const [rawKey, ...rest] = trimmed.split('=');
    const key = rawKey.trim();
    let value = rest.join('=').trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile();

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
    const msg = error?.message ?? '';
    const isConnectionError =
      error?.code === 'ECONNREFUSED' ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('Connection refused') ||
      msg.includes('password authentication failed') ||
      msg.includes('authentication failed') ||
      msg.includes('database system is starting up') ||
      msg.includes('does not exist') ||
      msg.includes('relation "') && msg.includes(' does not exist');

    if (isConnectionError) {
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
