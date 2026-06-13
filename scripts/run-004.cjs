const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(
  path.join(__dirname, '..', 'migrations', '004_fix_rls_recursion.sql'),
  'utf8'
);

// La contraseña va por entorno, nunca hardcodeada.
if (!process.env.SUPABASE_DB_PASSWORD) {
  console.error('Falta SUPABASE_DB_PASSWORD en el entorno.');
  process.exit(1);
}
const client = new Client({
  host: 'aws-1-us-east-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.txrpxzsqqomdlnxmyvxn',
  password: process.env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('Conectando...');
  await client.connect();
  console.log('Conectado. Ejecutando 004...');
  await client.query(sql);
  console.log('✅ Migracion 004 ejecutada.');
  await client.end();
}

main().catch(async err => {
  console.error('❌', err.message);
  try { await client.end(); } catch(_) {}
  process.exit(1);
});
