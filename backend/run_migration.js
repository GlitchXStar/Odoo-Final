require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: false,
});

async function runMigrations() {
  await client.connect();
  console.log('Connected to PostgreSQL.\n');

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Running migration: ${file}...`);
    await client.query(sql);
    console.log(`  ✓ ${file} applied.\n`);
  }

  console.log('All migrations applied successfully.');
  await client.end();
}

runMigrations().catch(async (err) => {
  console.error('Migration failed:', err.message);
  await client.end().catch(() => {});
  process.exit(1);
});
