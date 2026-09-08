const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://examadmin:examsecret@localhost:5432/parikshasetu'
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection error', err);
    process.exit(1);
  }
  console.log('Connected to PostgreSQL successfully at:', res.rows[0].now);
  pool.end();
});
