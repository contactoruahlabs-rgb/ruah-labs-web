# RUAH LABS — FASE 0: AUDITORÍA Y ARQUITECTURA DE PRODUCCIÓN

---

## 1. AUDITORÍA DEL PROYECTO ACTUAL

### 1.1 Estructura de carpetas

```
design_handoff_ruahlabs/
├── src/
│   ├── index.html          ← Entry point. Carga React + Babel desde CDN.
│   ├── data.jsx            ← DEFAULT_CONTENT + store hook + localStorage
│   ├── app.jsx             ← Root component. Monta todo.
│   ├── sections.jsx        ← Nav, Hero, About, Protocol, Services, Products, ProductDetail, Manifesto, Testimonials, CTABlock, Footer
│   ├── extras.jsx          ← Cuadros, Iglesias
│   ├── eventos.jsx         ← Eventos
│   ├── club.jsx            ← Club privado (gate + dashboard)
│   ├── admin.jsx           ← Panel administrador
│   ├── checkout.jsx        ← Checkout 3 pasos + confirmación
│   ├── secret.jsx          ← Portal secreto (video + login)
│   ├── styles.css          ← Estilos principales + nav + productos + footer
│   ├── admin.css           ← Panel admin
│   ├── club.css            ← Club
│   ├── checkout.css        ← Checkout
│   ├── extras.css          ← Cuadros + Iglesias
│   ├── eventos.css         ← Eventos
│   ├── secret.css          ← Secret portal
│   └── assets/             ← Imágenes locales (logo, texturas, carrito)
├── COMPONENTS.md
├── DESIGN_TOKENS.md
├── ARCHITECTURE.md
├── MIGRATION_GUIDE.md
└── README.md
```

### 1.2 Arquitectura actual

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Frontend | React 18 (CDN) + Babel standalone | ✅ Funcional |
| Build | Sin build step. JSX compilado en browser | ⚠️ No apto para producción |
| Enrutamiento | Ninguno. Single page, scroll-based | ℹ️ Simple |
| Estado | React state + localStorage | ⚠️ Solo cliente |
| CSS vars | Aplicadas via JS en `document.documentElement` | ✅ Funcional |
| Imágenes | Base64 en localStorage o vacías | ⚠️ Limitado |
| Backend | NINGUNO | ❌ Falta |
| DB | NINGUNA | ❌ Falta |
| Auth | Contraseñas hardcodeadas, verificación cliente | ❌ Inseguro |
| Pagos | Simulado (setTimeout + número aleatorio) | ❌ No funcional |
| Emails | No existen | ❌ Falta |

### 1.3 Componentes existentes

#### Públicos (sections.jsx + extras.jsx + eventos.jsx)
- `<Nav>` — navegación fija, dropdown Productos, carrito, CTA
- `<Hero>` — sección principal con marquee
- `<About>` — quiénes somos + pilares + métricas
- `<Protocol>` — flujo Protocolo 1×1
- `<Services>` — lista de servicios
- `<Products>` — grid con filtro por categoría
- `<ProductDetail>` — modal de producto
- `<Cuadros>` — brief 4 pasos + catálogo
- `<Iglesias>` — servicios + portafolio + formulario
- `<Eventos>` — sección evento en vivo
- `<Manifesto>` — texto grande
- `<Testimonials>` — testimonios
- `<CTABlock>` — CTA final
- `<Footer>` — footer con columnas

#### Privados/Funcionales
- `<Admin>` — panel completo de edición de contenido
- `<Club>` — área privada con estadísticas, rutas, reuniones, feed, fotos
- `<Checkout>` — flujo 3 pasos (info / envío / pago) + confirmación
- `<SecretPortal>` — portal de video con login para el Club
- `<ProductDetail>` — modal con galería, detalles, CTAs

### 1.4 Sistema de contenido (localStorage)

**Clave:** `ruah-content-v5`

El objeto `DEFAULT_CONTENT` cubre:
- `brand` — nombre, tagline, instagram, passwords
- `theme` — colores ivory, amber, gray, black
- `typography` — 50+ tokens de tamaño por elemento
- `nav` — links, CTA
- `colors` — overrides por elemento (vacío = default CSS)
- `hero`, `about`, `protocol`, `services`, `products` — contenido de secciones
- `cuadros`, `iglesias`, `eventos` — secciones especiales
- `checkout` — textos + colores + tamaños
- `cta`, `footer`, `club` — resto de secciones

**Flujo de datos:**
```
localStorage.getItem('ruah-content-v5')
  → deepMerge(DEFAULT_CONTENT, saved)
  → migrateContent()        ← backfill de campos nuevos
  → applyTypography()       ← setea CSS vars en :root
  → applyColors()           ← setea --c-* vars en :root
  → applyCheckoutStyle()    ← setea --ck-* vars en :root
```

**Exportar/Importar:** El admin tiene botones de export JSON / import JSON.

### 1.5 Panel administrador (admin.jsx)

- **Acceso:** contraseña `adminPassword` en contenido (default: `ruah1x1`)
- Verificación 100% cliente — **inseguro en producción**
- Atajos: `Ctrl+Shift+A` (toggle admin), `Ctrl+Shift+C` (toggle club)
- Triple-click en año del footer → abre admin
- Cubre edición de: Marca, Tema, Tipografía, Colores, Nav, Hero, About, Protocol, Services, Products, Cuadros, Iglesias, Manifesto, Testimonials, CTA, Footer, Club, Checkout

### 1.6 Checkout (checkout.jsx)

**Estado actual: 100% SIMULADO**

```javascript
// Línea 166-172 de checkout.jsx:
setTimeout(() => {
  const num = 'RUAH-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  setOrderNum(num);
  setPayState('success');
  setStep(3);
}, 1800);
```

- Carrito: estado React en memoria (se pierde al recargar)
- Métodos de pago: Tarjeta, Webpay, Transferencia (ninguno real)
- Código de descuento: hardcodeado `BIENVENIDO10` = 10%
- Validación de tarjeta: solo frontend (regex básico)
- No se guarda ningún pedido
- No se envía ningún email

### 1.7 Club privado (club.jsx)

**Estado actual: PARCIALMENTE SIMULADO**

- Acceso: contraseña `clubPassword` (default: `shalom`), verificada localmente
- Datos del dashboard (rutas, reuniones, feed, fotos): hardcodeados en `DEFAULT_CONTENT`
- "Anotarme" en ruta: toggle de estado local, no persiste
- Foto registro: imágenes en localStorage o vacías
- No hay comunicación real entre miembros

### 1.8 Secret Portal (secret.jsx)

**Estado actual: DEMO (acepta cualquier credencial)**

```javascript
// Línea 199-201 de secret.jsx:
// Demo: accept any email + password.
// The real validation would happen against your backend.
loggedInRef.current = true;
```

- El login del portal acepta email y contraseña sin validar contra ningún servidor
- Muestra credenciales demo en pantalla: `club@ruahlabs.cl` / `shalom`

### 1.9 Formularios

| Formulario | Destino | Estado |
|-----------|---------|--------|
| Cuadros brief | Ninguno | ❌ Simulado |
| Iglesias cotización | Ninguno | ❌ Simulado |
| Checkout info | Ninguno | ❌ Simulado |
| Club "Anotarme" | Estado local | ⚠️ No persiste |

---

## 2. FUNCIONALIDADES REALES vs SIMULADAS

### ✅ REALES (funcionan ahora, sin backend)
- Todo el UI/UX visual del sitio
- Edición de contenido via admin panel
- Persistencia de contenido via localStorage
- Catálogo de productos con filtro
- Sistema de temas (colores + tipografía)
- Exportar/importar contenido en JSON
- Subida de imágenes como base64 (limitado a ~5MB por localStorage)
- Carrito (mientras no se recarga la página)
- Portal secreto (video + experiencia)
- Responsive design

### ❌ SIMULADAS (requieren backend)
- Procesamiento de pagos
- Generación de pedidos reales
- Autenticación de admin (segura)
- Autenticación de club (segura)
- Envío de emails (confirmación, protocolo, formularios)
- Validación de códigos de descuento (servidor)
- Formulario de cuadros → recibir en bandeja
- Formulario de iglesias → recibir en bandeja
- Persistencia del carrito entre sesiones
- Dashboard del club con datos reales
- Registro fotográfico compartido del club

---

## 3. DEPENDENCIAS CRÍTICAS

| Dependencia | Versión | Tipo | Riesgo |
|-----------|---------|------|--------|
| React | 18.3.1 (CDN) | Runtime | ⚠️ Sin bundler |
| ReactDOM | 18.3.1 (CDN) | Runtime | ⚠️ Sin bundler |
| Babel Standalone | 7.29.0 (CDN) | Runtime | ⚠️ Lento en prod |
| localStorage | Browser API | Persistencia | ⚠️ ~5-10MB límite |

**Riesgo principal:** Babel standalone compila JSX en el navegador en cada carga. En producción, esto agrega ~500ms de compilación. Para un sitio de ventas, esto es inaceptable.

---

## 4. RIESGOS DE MIGRACIÓN

| Riesgo | Severidad | Mitigación |
|--------|-----------|-----------|
| Pérdida de contenido admin al migrar de localStorage a Supabase | ALTO | Exportar JSON antes de migrar; importar en Supabase |
| Autenticación admin/club expuesta (client-side) | ALTO | Migrar a Supabase Auth + JWT |
| Imágenes base64 en localStorage (límite ~10MB) | MEDIO | Migrar a Supabase Storage |
| Sin build step — Babel en runtime | MEDIO | Opcional: migrar a Vite/Next.js como fase posterior |
| Carrito no persistente | BAJO | Agregar localStorage para carrito + sync con servidor |
| Sin SEO (100% JS client-side) | MEDIO | Considerar SSR/SSG en fase posterior |

---

## 5. ARQUITECTURA DE PRODUCCIÓN

### 5.1 Decisión de stack

**Frontend:** Mantener React existente. Agregar `api.js` como capa de integración.
- Sin reconstruir ni rediseñar
- Agregar llamadas `fetch()` donde hoy hay localStorage
- Babel standalone puede mantenerse en fase 1; migrar a Vite en fase 2 (opcional)

**Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- Hosting: Vercel (funciones serverless para webhooks y lógica de negocio)
- O bien: Supabase Edge Functions directamente

**Pagos:** Mercado Pago (SDK de JavaScript + webhook)

**Emails:** Resend (API REST + plantillas React Email)

### 5.2 Arquitectura de capas

```
[Browser]
  └── index.html (React + Babel o Vite build)
      ├── src/api.js           ← NUEVO: wrapper de fetch hacia backend
      ├── src/data.jsx         ← Modificar: sync con Supabase además de localStorage
      └── [todos los .jsx existentes sin cambiar estructura]

[Vercel Serverless / Supabase Edge Functions]
  ├── /api/checkout/create-preference   ← Crea preferencia en MercadoPago
  ├── /api/checkout/verify-discount     ← Valida código de descuento
  ├── /api/forms/cuadros                ← Recibe brief de cuadros
  ├── /api/forms/iglesias               ← Recibe solicitud iglesias
  ├── /api/webhooks/mercadopago         ← Recibe notificaciones de pago
  ├── /api/content/get                  ← Lee contenido de Supabase
  └── /api/content/save                 ← Guarda contenido (admin autenticado)

[Supabase]
  ├── PostgreSQL                        ← Tablas de negocio
  ├── Auth                              ← Admin + Club members
  └── Storage                           ← Imágenes (productos, club, eventos)

[Mercado Pago]
  └── Checkout Pro / API de pagos

[Resend]
  └── Envío de emails transaccionales
```

### 5.3 Estrategia de migración (por fases)

**Fase 1 — Backend base (sin cambiar frontend visible)**
- [ ] Crear proyecto Supabase
- [ ] Crear tablas y políticas RLS
- [ ] Migrar contenido de localStorage → Supabase (endpoint `content/save`)
- [ ] Crear `api.js` en frontend
- [ ] Imágenes → Supabase Storage (migrar base64)

**Fase 2 — Pagos reales**
- [ ] Crear endpoints `/api/checkout/*`
- [ ] Integrar Mercado Pago SDK
- [ ] Reemplazar `pay()` simulado en checkout.jsx con llamada real
- [ ] Webhook `/api/webhooks/mercadopago`
- [ ] Actualizar estado de pedido en Supabase

**Fase 3 — Emails**
- [ ] Configurar Resend
- [ ] Plantillas: confirmación pedido, entrega protocolo, formularios
- [ ] Disparar desde webhook de pago y endpoints de formularios

**Fase 4 — Autenticación real**
- [ ] Admin → Supabase Auth (email/password)
- [ ] Club → Supabase Auth (magic link o password)
- [ ] Eliminar contraseñas hardcodeadas del contenido

**Fase 5 — Build (opcional)**
- [ ] Migrar de Babel CDN a Vite
- [ ] Bundling + minificación
- [ ] Deploy en Vercel con CI/CD

---

## 6. DISEÑO DE BASE DE DATOS (Supabase / PostgreSQL)

Ver archivo: `migrations/001_initial_schema.sql`

### Tablas principales

| Tabla | Propósito |
|-------|-----------|
| `content` | Contenido del sitio (reemplaza localStorage) |
| `products` | Catálogo de productos |
| `categories` | Categorías de productos |
| `orders` | Pedidos confirmados |
| `order_items` | Items de cada pedido |
| `donations` | Registro Protocolo 1×1 |
| `cuadros_briefs` | Formularios de cuadros |
| `iglesias_requests` | Formularios de iglesias |
| `discount_codes` | Códigos de descuento |
| `club_members` | Miembros del club |
| `club_routes` | Rutas (datos reales) |
| `club_route_signups` | Inscripciones a rutas |
| `club_meetings` | Reuniones |

---

## 7. MERCADO PAGO — FLUJO DE INTEGRACIÓN

### 7.1 Flujo completo

```
1. Usuario llena datos + elige envío
2. Frontend POST /api/checkout/create-preference
   Body: { cart, customer, shipping, discount_code }
3. Backend:
   a. Valida descuento contra DB
   b. Crea orden en Supabase (estado: 'pending')
   c. Llama MP API → crea preference con items, precio, URLs de retorno
   d. Retorna { preference_id, init_point, order_id }
4. Frontend redirige a init_point (o abre Checkout Pro modal)
5. Usuario completa pago en MP
6. MP notifica webhook → POST /api/webhooks/mercadopago
7. Backend:
   a. Verifica firma HMAC del webhook
   b. Consulta estado del pago a MP API (no confiar solo en webhook)
   c. Si aprobado:
      - Actualiza orden → status: 'paid'
      - Activa Protocolo 1×1 (donation record)
      - Envía email de confirmación via Resend
   d. Si rechazado:
      - Actualiza orden → status: 'failed'
      - No enviar email o enviar de reintento
8. Frontend polling o redirect a página de confirmación
```

### 7.2 URLs de retorno

```
success_url: https://ruahlabs.cl/checkout/success?order_id={order_id}
failure_url: https://ruahlabs.cl/checkout/failure?order_id={order_id}
pending_url: https://ruahlabs.cl/checkout/pending?order_id={order_id}
```

### 7.3 Items de preferencia MP

```json
{
  "items": [
    {
      "id": "p1",
      "title": "Polera Salmo 23",
      "quantity": 1,
      "unit_price": 18990,
      "currency_id": "CLP"
    }
  ],
  "payer": {
    "email": "cliente@email.cl"
  },
  "payment_methods": {
    "excluded_payment_types": [],
    "installments": 1
  }
}
```

---

## 8. RESEND — PLANTILLAS DE EMAIL

| Evento | Asunto | Disparador |
|--------|--------|-----------|
| `order_confirmed` | Tu pedido RUAH-XXXXXX fue confirmado | Webhook MP: pago aprobado |
| `protocol_delivery` | Gracias a ti llegó esta prenda | Manual desde admin, al hacer entrega |
| `cuadros_brief` | Recibimos tu brief · RUAH Cuadros | POST /api/forms/cuadros |
| `iglesias_request` | Cotización recibida · RUAH Labs | POST /api/forms/iglesias |
| `club_welcome` | Bienvenido al movimiento | Al crear cuenta de club |

---

## 9. ESTRATEGIA DE ALMACENAMIENTO DE IMÁGENES

### Supabase Storage — Buckets

| Bucket | Acceso | Contenido |
|--------|--------|-----------|
| `ruah-products` | Público | Imágenes de productos |
| `ruah-cuadros` | Público | Imágenes de cuadros |
| `ruah-eventos` | Público | Fotos de eventos |
| `ruah-iglesias` | Público | Portafolio iglesias |
| `ruah-club` | Privado (solo auth) | Fotos del club |
| `ruah-brand` | Público | Logo, wordmark, assets |
| `ruah-protocol` | Privado (admin) | Fotos de entregas 1×1 |

### Migración de imágenes base64

El admin panel actual guarda imágenes como data URIs en localStorage.

Proceso de migración:
1. Admin hace export JSON (tiene todas las imágenes en base64)
2. Script de migración lee el JSON, extrae base64, sube a Supabase Storage
3. Reemplaza las URLs base64 por URLs públicas de Supabase
4. Importa el JSON modificado

---

## 10. AUTENTICACIÓN (estrategia gradual)

### Fase 1 — Sin cambios (actual)
- Admin: password hardcodeado → verificación cliente
- Club: password hardcodeado → verificación cliente

### Fase 2 — Admin seguro (Supabase Auth)
- Crear usuario admin en Supabase Auth
- El admin panel llama `supabase.auth.signInWithPassword()`
- El JWT se usa para autorizar `content/save` y endpoints admin
- Eliminar `adminPassword` del contenido editable

### Fase 3 — Club seguro (Supabase Auth)
- Club members tienen cuentas en Supabase Auth
- Pueden hacer login con email/password o magic link
- Secret portal autentica contra Supabase
- El JWT del club se usa para acceder a datos privados del club

### Fase 4 — Cuentas de cliente (opcional)
- Después del primer pedido, se crea cuenta automáticamente
- El cliente puede ver historial de pedidos
- Acceso al Club si es miembro

---

## 11. VARIABLES DE ENTORNO

Ver archivo: `.env.example`
