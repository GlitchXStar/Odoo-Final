const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  ssl: false,
  // Automatically remove broken connections from the pool
  allowExitOnIdle: false,
});

// Don't crash the process on idle client errors — just log and let the pool recover
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Slow query (${duration}ms):`, text);
    }
    return res;
  } catch (err) {
    const duration = Date.now() - start;
    // Retry once on connection errors (broken pipe, terminated, etc.)
    if (err.message && (err.message.includes('Connection terminated') ||
        err.message.includes('connection refused') ||
        err.message.includes('ECONNRESET'))) {
      console.warn(`DB connection error (${duration}ms), retrying once:`, err.message);
      const res = await pool.query(text, params);
      return res;
    }
    throw err;
  }
};

const getClient = async () => {
  return pool.connect();
};

module.exports = { pool, query, getClient };
