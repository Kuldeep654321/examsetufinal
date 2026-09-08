import { Pool, QueryResult, QueryResultRow } from 'pg';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://examadmin:examsecret@localhost:5432/examsetu';

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[Database Pool Error]:', err.message);
});

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 200) {
      console.warn(`[Slow Query ${duration}ms]:`, text.substring(0, 100));
    }
    return res;
  } catch (error: any) {
    console.error('[DB Query Error]:', { text, error: error.message });
    throw error;
  }
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}

export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export default pool;
