// ============================================================
// RUAH LABS — MercadoPago helper
// ============================================================
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import crypto from 'crypto';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

export const mpPreference = new Preference(client);
export const mpPayment    = new Payment(client);

// Genera número de pedido único
export function generateOrderNumber() {
  return 'RUAH-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

// Parsea precio "18.990" → 18990
export function parsePrice(p) {
  return parseInt(String(p || '0').replace(/[^\d]/g, ''), 10) || 0;
}

// Verifica firma HMAC del webhook de MercadoPago
export function verifyWebhookSignature(req) {
  const secret    = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const xSig      = req.headers['x-signature'] || '';
  const xReqId    = req.headers['x-request-id'] || '';
  const dataId    = req.query?.['data.id'] || req.body?.data?.id || '';

  if (!secret || !xSig) return false;

  // Extraer ts y v1 del header
  const parts = {};
  xSig.split(',').forEach(part => {
    const [k, v] = part.trim().split('=');
    if (k && v) parts[k] = v;
  });

  if (!parts.ts || !parts.v1) return false;

  const manifest = `id:${dataId};request-id:${xReqId};ts:${parts.ts};`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(parts.v1, 'hex')
  );
}
