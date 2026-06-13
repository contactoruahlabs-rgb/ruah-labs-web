// ============================================================
// POST /api/forms/cuadros
// ============================================================
import { supabaseAdmin } from '../_lib/supabase.js';
import { sendCuadrosBriefConfirm } from '../_lib/resend.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, versiculo, estilo, formato, notas } = req.body;

  if (!name || !email) return res.status(400).json({ error: 'Nombre y email requeridos' });

  try {
    // Guardar en DB
    await supabaseAdmin.from('cuadros_briefs').insert({
      name, email, versiculo, estilo, formato, notas,
    });

    // Email al cliente
    await sendCuadrosBriefConfirm({ to: email, name, versiculo, estilo, formato });

    // Email interno
    await sendCuadrosBriefConfirm({
      to:       process.env.ADMIN_NOTIFICATION_EMAIL || 'hola@ruahlabs.cl',
      name:     `[BRIEF] ${name} <${email}>`,
      versiculo, estilo, formato,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[form-cuadros]', err);
    return res.status(500).json({ error: 'Error al enviar' });
  }
}
