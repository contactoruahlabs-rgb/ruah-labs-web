// ============================================================
// GET /api/content/get
// Lee el contenido del sitio desde Supabase
// ============================================================
import { supabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const { data, error } = await supabaseAdmin
      .from('content')
      .select('data')
      .eq('key', 'main')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

    return res.status(200).json({ data: data?.data || null });
  } catch (err) {
    console.error('[content-get]', err);
    return res.status(500).json({ error: 'Error al leer contenido' });
  }
}
