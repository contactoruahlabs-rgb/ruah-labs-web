// ============================================================
// POST /api/checkout/verify-discount
// ============================================================
import { supabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code } = req.body;
  if (!code) return res.status(400).json({ valid: false, message: 'Código requerido' });

  const { data, error } = await supabaseAdmin.rpc('verify_discount_code', { p_code: code });

  if (error) return res.status(500).json({ valid: false, message: 'Error al verificar' });

  const result = data?.[0] || { valid: false, percent: 0, message: 'Código no válido' };
  return res.status(200).json(result);
}
