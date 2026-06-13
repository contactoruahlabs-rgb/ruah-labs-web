const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(
  path.join(__dirname, '..', 'migrations', '004_fix_rls_recursion.sql'),
  'utf8'
);

// Use connection string — pooler transaction mode port 6543
const client = new Client({
  connectionString: 'postgresql://postgres.txrpxzsqqomdlnxmyvxn:Ru4hl4bs%21%21.@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
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
