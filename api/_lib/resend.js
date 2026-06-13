// ============================================================
// RUAH LABS — Resend email helper
// ============================================================
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = `${process.env.RESEND_FROM_NAME || 'RUAH LABS'} <${process.env.RESEND_FROM_EMAIL || 'noreply@ruahlabs.cl'}>`;

// ---- Confirmación de pedido ----
export async function sendOrderConfirmed({ to, orderNumber, firstName, items, total, shipping }) {
  const itemsHtml = items.map(it =>
    `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #333;">${it.product_name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #333;text-align:center;">${it.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #333;text-align:right;">$${(it.unit_price * it.quantity).toLocaleString('es-CL')}</td>
    </tr>`
  ).join('');

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Tu pedido ${orderNumber} fue confirmado ✓`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0a0a0a;color:#f5f1e8;font-family:'Courier New',monospace;padding:40px 24px;max-width:600px;margin:0 auto;">
  <div style="border-bottom:2px solid #eca10c;padding-bottom:20px;margin-bottom:32px;">
    <p style="font-size:11px;letter-spacing:0.3em;color:#6b6b62;margin:0 0 8px;">RUAH LABS · LABORATORIO CREATIVO</p>
    <h1 style="font-size:28px;font-weight:400;margin:0;letter-spacing:-0.01em;text-transform:uppercase;">Pedido confirmado.</h1>
  </div>

  <p style="color:#eca10c;font-size:13px;letter-spacing:0.2em;">PEDIDO ${orderNumber}</p>

  <p style="font-size:15px;line-height:1.6;">Hola ${firstName},<br><br>
  Tu pedido fue confirmado y está siendo preparado en el taller.</p>

  <table style="width:100%;border-collapse:collapse;margin:24px 0;">
    <thead>
      <tr>
        <th style="text-align:left;font-size:11px;letter-spacing:0.2em;color:#6b6b62;padding-bottom:8px;border-bottom:1px solid #333;">PRODUCTO</th>
        <th style="text-align:center;font-size:11px;letter-spacing:0.2em;color:#6b6b62;padding-bottom:8px;border-bottom:1px solid #333;">UND</th>
        <th style="text-align:right;font-size:11px;letter-spacing:0.2em;color:#6b6b62;padding-bottom:8px;border-bottom:1px solid #333;">TOTAL</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
    <tfoot>
      <tr>
        <td colspan="2" style="padding:12px 0 0;font-size:13px;letter-spacing:0.1em;">TOTAL PAGADO</td>
        <td style="padding:12px 0 0;text-align:right;font-size:20px;color:#eca10c;">$${total.toLocaleString('es-CL')}</td>
      </tr>
    </tfoot>
  </table>

  <div style="background:#111;border:1px solid #eca10c;padding:20px;margin:32px 0;">
    <p style="font-size:11px;letter-spacing:0.2em;color:#eca10c;margin:0 0 8px;">PROTOCOLO 1×1 ACTIVADO</p>
    <p style="font-size:14px;line-height:1.6;margin:0;">
      Tu compra activa el Protocolo 1×1. Una prenda filtrada y lavada
      será entregada a una persona en situación de calle.
      Recibirás el registro de la entrega en este correo.
    </p>
  </div>

  <p style="font-size:12px;color:#6b6b62;line-height:1.6;margin-top:40px;">
    Envío: ${shipping}<br>
    Cualquier consulta: hola@ruahlabs.cl<br><br>
    — Equipo RUAH LABS<br>
    TODO POR JESÚS.
  </p>
</body>
</html>`,
  });
}

// ---- Entrega Protocolo 1×1 ----
export async function sendProtocolDelivery({ to, firstName, orderNumber, orderDate, photoUrl, videoUrl }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Gracias a ti llegó esta prenda · ${orderNumber}`,
    html: `
<!DOCTYPE html>
<html>
<body style="background:#0a0a0a;color:#f5f1e8;font-family:'Courier New',monospace;padding:40px 24px;max-width:600px;margin:0 auto;">
  <p style="font-size:11px;letter-spacing:0.3em;color:#6b6b62;">RUAH LABS · PROTOCOLO 1×1</p>
  <h1 style="font-size:24px;font-weight:400;text-transform:uppercase;">Gracias a ti llegó esta prenda.</h1>

  <p style="font-size:15px;line-height:1.6;">Hola ${firstName},<br><br>
  Tu pedido ${orderNumber} del ${orderDate} activó el Protocolo 1×1.<br>
  Hoy hicimos la entrega.</p>

  ${photoUrl ? `<img src="${photoUrl}" alt="Entrega" style="width:100%;max-width:480px;display:block;margin:24px 0;border:1px solid #333;">` : ''}
  ${videoUrl ? `<p><a href="${videoUrl}" style="color:#eca10c;">Ver video de la entrega →</a></p>` : ''}

  <p style="font-size:13px;color:#6b6b62;margin-top:32px;">
    Esto no es contenido. Es transparencia.<br>
    — Equipo RUAH LABS
  </p>
</body>
</html>`,
  });
}

// ---- Brief de cuadros ----
export async function sendCuadrosBriefConfirm({ to, name, versiculo, estilo, formato }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Recibimos tu brief · RUAH Cuadros`,
    html: `
<!DOCTYPE html>
<html>
<body style="background:#0a0a0a;color:#f5f1e8;font-family:'Courier New',monospace;padding:40px 24px;max-width:600px;margin:0 auto;">
  <p style="font-size:11px;letter-spacing:0.3em;color:#6b6b62;">RUAH LABS · CUADROS</p>
  <h1 style="font-size:24px;font-weight:400;text-transform:uppercase;">Recibimos tu brief.</h1>
  <p style="font-size:15px;line-height:1.6;">Hola ${name},<br><br>
  Nos contactaremos en menos de 48 horas con la cotización.</p>
  <div style="background:#111;padding:20px;margin:24px 0;border-left:3px solid #eca10c;">
    <p style="font-size:12px;color:#6b6b62;margin:0 0 12px;letter-spacing:0.2em;">TU BRIEF</p>
    <p style="margin:4px 0;font-size:14px;">Versículo: <span style="color:#eca10c;">${versiculo || '—'}</span></p>
    <p style="margin:4px 0;font-size:14px;">Estilo: ${estilo || '—'}</p>
    <p style="margin:4px 0;font-size:14px;">Formato: ${formato || '—'}</p>
  </div>
  <p style="font-size:12px;color:#6b6b62;">— Equipo RUAH LABS</p>
</body>
</html>`,
  });
}

// ---- Solicitud Iglesias ----
export async function sendIglesiasConfirm({ to, nombre, eventoTipo, fecha }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Cotización recibida · RUAH Labs`,
    html: `
<!DOCTYPE html>
<html>
<body style="background:#0a0a0a;color:#f5f1e8;font-family:'Courier New',monospace;padding:40px 24px;max-width:600px;margin:0 auto;">
  <p style="font-size:11px;letter-spacing:0.3em;color:#6b6b62;">RUAH LABS · IGLESIAS Y EVENTOS</p>
  <h1 style="font-size:24px;font-weight:400;text-transform:uppercase;">Cotización recibida.</h1>
  <p style="font-size:15px;line-height:1.6;">Hola ${nombre},<br><br>
  Recibimos tu solicitud. Te respondemos en 24–48 horas.</p>
  <div style="background:#111;padding:20px;margin:24px 0;border-left:3px solid #eca10c;">
    <p style="margin:4px 0;font-size:14px;">Evento: <span style="color:#eca10c;">${eventoTipo || '—'}</span></p>
    <p style="margin:4px 0;font-size:14px;">Fecha estimada: ${fecha || '—'}</p>
  </div>
  <p style="font-size:12px;color:#6b6b62;">— Equipo RUAH LABS</p>
</body>
</html>`,
  });
}
