// ============================================================
// POST /api/content/save
// Guarda contenido del sitio (requiere auth admin)
// ============================================================
import { supabaseAdmin, verifyUserToken } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Verificar autenticación
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autenticado' });

  const { user, role } = await verifyUserToken(token);
  if (!user || role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });

  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'Datos requeridos' });

  try {
    const { error } = await supabaseAdmin
      .from('content')
      .upsert({ key: 'main', data, updated_by: user.id }, { onConflict: 'key' });

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[content-save]', err);
    return res.status(500).json({ error: 'Error al guardar' });
  }
}
