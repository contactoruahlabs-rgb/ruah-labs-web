// ============================================================
// RUAH LABS — Script de migración automática
// Ejecutar: node scripts/run-migrations.js
// ============================================================
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cargar variables de entorno desde .env.local
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && !key.startsWith('#') && vals.length) {
    process.env[key.trim()] = vals.join('=').trim();
  }
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Faltan SUPABASE_URL o SERVICE_KEY en .env.local');
  process.exit(1);
}

async function runSQL(sql, label) {
  // Supabase permite ejecutar SQL via RPC si existe la función,
  // pero para DDL necesitamos el endpoint de administración
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey':        SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${label}: ${err}`);
  }
  return response.json();
}

async function testConnection() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey':        SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
  });
  return response.ok;
}

async function main() {
  console.log('🔄 RUAH LABS — Ejecutando migraciones en Supabase...');
  console.log(`📡 Proyecto: ${SUPABASE_URL}`);

  // Test conexión
  const connected = await testConnection();
  if (connected) {
    console.log('✅ Conexión a Supabase establecida');
  } else {
    console.log('⚠️  No se pudo verificar la conexión');
  }

  // Las migraciones SQL deben ejecutarse desde el SQL Editor de Supabase
  // (requieren permisos de superusuario que no están disponibles via REST API)
  console.log('\n📋 INSTRUCCIONES PARA EJECUTAR LAS MIGRACIONES:');
  console.log('═'.repeat(55));
  console.log('1. Ve a: https://supabase.com/dashboard/project/txrpxzsqqomdlnxmyvxn/sql/new');
  console.log('2. Pega el contenido de: migrations/001_initial_schema.sql');
  console.log('3. Haz clic en "Run"');
  console.log('4. Repite con: migrations/002_storage_buckets.sql');
  console.log('5. Repite con: migrations/003_increment_discount_function.sql');
  console.log('═'.repeat(55));
  console.log('\n✅ Una vez ejecutadas, el backend estará listo.');
}

main().catch(console.error);
