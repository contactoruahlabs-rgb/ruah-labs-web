// ============================================================
// POST /api/webhooks/mercadopago
// Recibe notificaciones de pago de MercadoPago
// ============================================================
import { supabaseAdmin } from '../_lib/supabase.js';
import { mpPayment, verifyWebhookSignature } from '../_lib/mercadopago.js';
import { sendOrderConfirmed, sendProtocolDelivery } from '../_lib/resend.js';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1. Verificar firma del webhook
  if (!verifyWebhookSignature(req)) {
    console.warn('[webhook-mp] Firma inválida');
    return res.status(401).json({ error: 'Firma inválida' });
  }

  const { type, data } = req.body;

  // Solo procesar eventos de pago
  if (type !== 'payment') return res.status(200).json({ received: true });

  try {
    // 2. Consultar estado real del pago a MP (no confiar solo en el webhook)
    const payment = await mpPayment.get({ id: data.id });

    const mpStatus      = payment.status;           // 'approved' | 'rejected' | 'pending'
    const externalRef   = payment.external_reference; // order.id en Supabase
    const mpPaymentId   = String(payment.id);

    if (!externalRef) {
      console.warn('[webhook-mp] Sin external_reference');
      return res.status(200).json({ received: true });
    }

    // 3. Buscar pedido en Supabase
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', externalRef)
      .single();

    if (orderErr || !order) {
      console.error('[webhook-mp] Pedido no encontrado:', externalRef);
      return res.status(200).json({ received: true });
    }

    // 4. Actualizar según estado
    if (mpStatus === 'approved') {
      // Ya fue procesado antes (idempotencia)
      if (order.payment_status === 'paid') {
        return res.status(200).json({ received: true, skipped: 'already_paid' });
      }

      // Marcar como pagado
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_id:     mpPaymentId,
          paid_at:        new Date().toISOString(),
        })
        .eq('id', order.id);

      // Activar Protocolo 1×1
      if (!order.protocol_activated) {
        await supabaseAdmin.from('donations').insert({
          order_id: order.id,
        });
        await supabaseAdmin
          .from('orders')
          .update({ protocol_activated: true })
          .eq('id', order.id);
      }

      // Enviar email de confirmación
      const firstName = order.customer_name.split(' ')[0];
      await sendOrderConfirmed({
        to:          order.customer_email,
        orderNumber: order.order_number,
        firstName,
        items:       order.order_items || [],
        total:       order.total,
        shipping:    order.shipping_method === 'pickup'
                       ? 'Retiro en taller (Lun–Vie 11–19h)'
                       : order.shipping_method === 'express'
                         ? 'Envío express 24–48hrs'
                         : 'Envío estándar 5–7 días hábiles',
      });

      console.log('[webhook-mp] Pedido pagado:', order.order_number);

    } else if (['rejected', 'cancelled'].includes(mpStatus)) {
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'failed',
          payment_id:     mpPaymentId,
        })
        .eq('id', order.id);

      console.log('[webhook-mp] Pedido rechazado:', order.order_number);
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error('[webhook-mp] Error:', err);
    // Siempre responder 200 para que MP no reintente indefinidamente
    return res.status(200).json({ received: true, error: err.message });
  }
}
