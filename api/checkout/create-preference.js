// ============================================================
// POST /api/checkout/create-preference
// Crea preferencia MP + pedido en Supabase
// ============================================================
import { supabaseAdmin } from '../_lib/supabase.js';
import { mpPreference, generateOrderNumber, parsePrice } from '../_lib/mercadopago.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { cart, customer, shipping, discountCode } = req.body;

    if (!cart?.length || !customer?.email || !customer?.firstName) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // 1. Calcular totales
    const subtotal = cart.reduce((s, it) => s + parsePrice(it.price) * (it.qty || 1), 0);

    const SHIPPING_FEES = { std: 4990, express: 9990, pickup: 0 };
    const shippingFee   = SHIPPING_FEES[shipping?.method] ?? 4990;

    // 2. Validar descuento
    let discountAmount = 0;
    let validCode      = null;
    if (discountCode) {
      const { data } = await supabaseAdmin.rpc('verify_discount_code', { p_code: discountCode });
      if (data?.[0]?.valid) {
        discountAmount = Math.round(subtotal * data[0].percent / 100);
        validCode      = discountCode.toUpperCase();
        // Incrementar uso
        await supabaseAdmin.rpc('increment_discount_usage', { p_code: validCode });
      }
    }

    const total = Math.max(0, subtotal - discountAmount) + shippingFee;

    // 3. Crear pedido en Supabase (estado: pending)
    const orderNumber = generateOrderNumber();
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number:    orderNumber,
        customer_email:  customer.email,
        customer_name:   `${customer.firstName} ${customer.lastName || ''}`.trim(),
        customer_phone:  customer.phone,
        shipping_street: shipping?.street,
        shipping_number: shipping?.number,
        shipping_apt:    shipping?.apt,
        shipping_city:   shipping?.city,
        shipping_region: shipping?.region,
        shipping_postal: shipping?.postal,
        shipping_method: shipping?.method || 'std',
        shipping_fee:    shippingFee,
        subtotal,
        discount_code:   validCode,
        discount_amount: discountAmount,
        total,
        payment_method:  'webpay',  // MP Checkout Pro maneja el método
        payment_status:  'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 4. Insertar items del pedido
    await supabaseAdmin.from('order_items').insert(
      cart.map(it => ({
        order_id:     order.id,
        product_id:   it.id,
        product_name: it.name,
        verse:        it.verse,
        unit_price:   parsePrice(it.price),
        quantity:     it.qty || 1,
        subtotal:     parsePrice(it.price) * (it.qty || 1),
        img_url:      it.img || null,
      }))
    );

    // 5. Crear preferencia en MercadoPago
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ruahlabs.cl';

    const preference = await mpPreference.create({
      body: {
        external_reference: order.id,
        items: cart.map(it => ({
          id:         it.id,
          title:      it.name,
          quantity:   it.qty || 1,
          unit_price: parsePrice(it.price),
          currency_id: 'CLP',
        })),
        payer: {
          email: customer.email,
          name:  customer.firstName,
          surname: customer.lastName || '',
          phone: { number: customer.phone || '' },
        },
        shipments: {
          cost:            shippingFee,
          mode:            'not_specified',
        },
        back_urls: {
          success: `${appUrl}/checkout/success?order_id=${order.id}`,
          failure: `${appUrl}/checkout/failure?order_id=${order.id}`,
          pending: `${appUrl}/checkout/pending?order_id=${order.id}`,
        },
        auto_return:        'approved',
        notification_url:   `${appUrl}/api/webhooks/mercadopago`,
        statement_descriptor: 'RUAH LABS',
      },
    });

    // 6. Guardar preference_id en el pedido
    await supabaseAdmin
      .from('orders')
      .update({ mp_preference_id: preference.id })
      .eq('id', order.id);

    return res.status(200).json({
      orderId:      order.id,
      orderNumber,
      preferenceId: preference.id,
      initPoint:    preference.init_point,
      sandboxUrl:   preference.sandbox_init_point,
      total,
    });

  } catch (err) {
    console.error('[create-preference]', err);
    return res.status(500).json({ error: 'Error interno', detail: err.message });
  }
}
