// ============================================================
// POST /api/forms/iglesias
// ============================================================
import { supabaseAdmin } from '../_lib/supabase.js';
import { sendIglesiasConfirm } from '../_lib/resend.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { nombre, email, telefono, iglesia, eventoTipo, fecha, cantidad, descripcion } = req.body;

  if (!nombre || !email) return res.status(400).json({ error: 'Nombre y email requeridos' });

  try {
    await supabaseAdmin.from('iglesias_requests').insert({
      nombre, email, telefono, iglesia,
      evento_tipo: eventoTipo, fecha,
      cantidad:    parseInt(cantidad) || null,
      descripcion,
    });

    await sendIglesiasConfirm({ to: email, nombre, eventoTipo, fecha });

    await sendIglesiasConfirm({
      to:        process.env.ADMIN_NOTIFICATION_EMAIL || 'hola@ruahlabs.cl',
      nombre:    `[IGLESIA] ${nombre} <${email}> — ${iglesia}`,
      eventoTipo, fecha,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[form-iglesias]', err);
    return res.status(500).json({ error: 'Error al enviar' });
  }
}
