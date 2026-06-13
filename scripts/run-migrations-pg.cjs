// Script de migracion via node-postgres
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(
  path.join(__dirname, '..', 'migrations', 'FULL_MIGRATION.sql'),
  'utf8'
);

const client = new Client({
  host: 'aws-0-us-east-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.txrpxzsqqomdlnxmyvxn',
  password: 'Ru4hl4bs!!.',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('Conectando a Supabase...');
  await client.connect();
  console.log('Conectado. Ejecutando migraciones...');
  try {
    await client.query(sql);
    console.log('✅ Migraciones ejecutadas correctamente.');
  } catch (err) {
    // Algunos errores son esperados si las tablas ya existen
    if (err.message.includes('already exists')) {
      console.log('⚠️  Algunos objetos ya existen (OK si es re-ejecucion):', err.message);
    } else {
      throw err;
    }
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
