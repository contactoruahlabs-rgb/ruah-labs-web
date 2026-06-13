# RUAH LABS — Arquitectura de Backend y APIs

## Endpoints a crear (Vercel Serverless Functions o Supabase Edge Functions)

---

### POST /api/checkout/create-preference

Crea una preferencia de pago en Mercado Pago y un pedido en Supabase.

**Body:**
```json
{
  "cart": [
    { "id": "p1", "name": "Polera Salmo 23", "price": "18.990", "qty": 1 }
  ],
  "customer": {
    "email": "cliente@mail.cl",
    "firstName": "Juan",
    "lastName": "García",
    "phone": "+56912345678"
  },
  "shipping": {
    "method": "std",
    "street": "Av. Providencia",
    "number": "1234",
    "city": "Santiago",
    "region": "Metropolitana",
    "postal": "7500000"
  },
  "discountCode": "BIENVENIDO10"
}
```

**Response 200:**
```json
{
  "orderId": "uuid-del-pedido",
  "orderNumber": "RUAH-ABC123",
  "preferenceId": "mp-preference-id",
  "initPoint": "https://www.mercadopago.cl/checkout/v1/redirect?pref_id=...",
  "total": 22990
}
```

**Lógica:**
1. Verificar discount_code en DB (si existe)
2. Calcular total con descuento + envío
3. Crear registro en `orders` (status: 'pending')
4. Crear items en `order_items`
5. Llamar a MP API con items + payer + URLs de retorno
6. Retornar preference_id + init_point

---

### POST /api/checkout/verify-discount

**Body:** `{ "code": "BIENVENIDO10" }`

**Response 200:**
```json
{ "valid": true, "percent": 10, "message": "Código válido" }
```

---

### POST /api/webhooks/mercadopago

Recibe notificaciones de pago de Mercado Pago.

**Headers:** `x-signature: ts=...,v1=...`

**Lógica:**
1. Verificar firma HMAC-SHA256 con `MERCADOPAGO_WEBHOOK_SECRET`
2. Si tipo es `payment`:
   a. Consultar estado real del pago a MP API
   b. Buscar orden por `mp_preference_id` o `payment_id`
   c. Si `status === 'approved'`:
      - Actualizar order → `payment_status: 'paid'`, `paid_at: now()`
      - Si `protocol_activated = false`:
        - Crear registro en `donations`
        - Marcar `protocol_activated = true`
        - Enviar email via Resend: `order_confirmed`
   d. Si `status === 'rejected'` o `'cancelled'`:
      - Actualizar order → `payment_status: 'failed'`

**Response:** `200 OK` siempre (MP no reintenta si responde 200)

---

### POST /api/forms/cuadros

**Body:** `{ "name", "email", "versiculo", "estilo", "formato", "notas" }`

**Lógica:**
1. Insertar en `cuadros_briefs`
2. Enviar email via Resend a `hola@ruahlabs.cl` con datos del brief
3. Enviar email de confirmación al cliente

---

### POST /api/forms/iglesias

**Body:** `{ "nombre", "email", "telefono", "iglesia", "eventoTipo", "fecha", "cantidad", "descripcion" }`

**Lógica:**
1. Insertar en `iglesias_requests`
2. Enviar email via Resend a `hola@ruahlabs.cl`
3. Enviar email de confirmación al cliente

---

### GET /api/content

Lee el contenido del sitio desde Supabase.

**Response 200:**
```json
{ "data": { /* objeto completo de contenido */ } }
```

Si no existe registro en DB, retorna DEFAULT_CONTENT.

---

### POST /api/content/save

Guarda el contenido del sitio (requiere auth de admin).

**Headers:** `Authorization: Bearer <supabase-jwt>`

**Body:** `{ "data": { /* objeto completo de contenido */ } }`

**Lógica:**
1. Verificar JWT con Supabase
2. Verificar que `profiles.role = 'admin'`
3. UPSERT en tabla `content` donde `key = 'main'`

---

### POST /api/images/upload

Sube imagen a Supabase Storage.

**Headers:** `Authorization: Bearer <supabase-jwt>`

**Body:** FormData con archivo + bucket + path

**Lógica:**
1. Verificar auth admin
2. Validar tipo MIME y tamaño
3. Upload a Supabase Storage
4. Retornar URL pública

---

## Plantillas de email (Resend + React Email)

### order_confirmed
```
Asunto: Tu pedido {orderNumber} fue confirmado ✓

Hola {firstName},

Tu pedido {orderNumber} ha sido confirmado.

RESUMEN:
{items}

Total: ${total}
Envío: {shippingMethod} — {eta}

PROTOCOLO 1×1:
Al confirmar tu compra, una prenda filtrada y lavada
será entregada a una persona en situación de calle.
Te llegará el registro de la entrega a este correo.

Gracias por ser parte del movimiento.
— Equipo RUAH LABS
```

### protocol_delivery
```
Asunto: Gracias a ti llegó esta prenda

Hola {firstName},

Gracias a tu pedido {orderNumber} del {orderDate},
hoy entregamos una prenda a alguien que la necesitaba.

[FOTO/VIDEO]

Esto no es contenido. Es transparencia.
— Equipo RUAH LABS
```

### cuadros_brief
```
Asunto: Recibimos tu brief · RUAH Cuadros

Hola {name},

Recibimos tu solicitud de cuadro. Nos contactaremos
en menos de 48 horas con la cotización.

Tu brief:
Versículo/frase: {versiculo}
Estilo: {estilo}
Formato: {formato}
Notas: {notas}

— Equipo RUAH LABS
```

---

## Cambios mínimos en el frontend existente

### Nuevo archivo: src/api.js

```javascript
// Wrapper de fetch para el backend
const API_BASE = window.location.origin;

export const api = {
  async createCheckoutPreference(data) {
    const res = await fetch(`${API_BASE}/api/checkout/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async verifyDiscount(code) {
    const res = await fetch(`${API_BASE}/api/checkout/verify-discount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    return res.json();
  },

  async submitCuadrosBrief(data) {
    const res = await fetch(`${API_BASE}/api/forms/cuadros`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async submitIglesiasRequest(data) {
    const res = await fetch(`${API_BASE}/api/forms/iglesias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
```

### Modificación en checkout.jsx (función pay)

```javascript
// ANTES (simulado):
function pay(e) {
  e.preventDefault();
  setPayState('processing');
  setTimeout(() => {
    const num = 'RUAH-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    setOrderNum(num);
    setPayState('success');
    setStep(3);
  }, 1800);
}

// DESPUÉS (real):
async function pay(e) {
  e.preventDefault();
  if (payMethod === 'card' && !cardValid()) return;
  if (payMethod !== 'card' && !terms) return;
  setPayState('processing');
  try {
    const result = await api.createCheckoutPreference({
      cart,
      customer: info,
      shipping: { method: shipping, ...info },
      discountCode: discountApplied?.code,
    });
    if (result.initPoint) {
      window.location.href = result.initPoint; // Redirigir a MP
    }
  } catch (err) {
    setPayState('error');
  }
}
```

### Modificación en data.jsx (función saveContent)

```javascript
// Agregar sync con Supabase además de localStorage:
async function saveContent(c) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch (e) {}

  // Si hay sesión admin activa, sincronizar con Supabase
  try {
    const session = supabase.auth.getSession();
    if (session?.data?.session) {
      await fetch('/api/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({ data: c }),
      });
    }
  } catch (e) {}
}
```
