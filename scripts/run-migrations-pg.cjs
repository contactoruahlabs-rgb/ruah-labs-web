// Script de migracion via node-postgres
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(
  path.join(__dirname, '..', 'migrations', 'FULL_MIGRATION.sql'),
  'utf8'
);

// La contraseña NUNCA va hardcodeada. Exporta SUPABASE_DB_PASSWORD antes de correr.
if (!process.env.SUPABASE_DB_PASSWORD) {
  console.error('Falta SUPABASE_DB_PASSWORD en el entorno.');
  process.exit(1);
}
const client = new Client({
  host: 'aws-1-us-east-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.txrpxzsqqomdlnxmyvxn',
  password: process.env.SUPABASE_DB_PASSWORD,
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
