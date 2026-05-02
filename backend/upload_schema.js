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
    connectionTimeoutMillis: 30000,
    ssl: false,
});

async function uploadSchema() {
    const schemaPath = path.join(__dirname, 'empay_hrms_schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log(`Connecting to PostgreSQL at ${process.env.PGHOST}:${process.env.PGPORT}...`);
    await client.connect();
    console.log('Connected successfully!\n');

    console.log('Executing schema...');
    await client.query(sql);
    console.log('Schema uploaded successfully!');

    await client.end();
}

uploadSchema().catch(async (err) => {
    console.error('Error:', err.message);
    await client.end().catch(() => {});
    process.exit(1);
});
