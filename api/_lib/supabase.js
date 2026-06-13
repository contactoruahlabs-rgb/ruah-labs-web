// ============================================================
// RUAH LABS — Supabase client (servidor)
// ============================================================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRole) {
  throw new Error('Faltan variables de entorno de Supabase');
}

// Client con service_role — solo para servidor, nunca exponer al cliente
export const supabaseAdmin = createClient(supabaseUrl, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Verifica JWT de usuario y retorna { user, role }
export async function verifyUserToken(token) {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return { user: null, role: null };

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  return { user: data.user, role: profile?.role || 'customer' };
}
