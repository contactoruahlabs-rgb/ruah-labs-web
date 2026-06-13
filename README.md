# RUAH LABS — Design Handoff to Claude Code

> **Fidelidad:** HIGH-FIDELITY.  
> Los archivos HTML/JSX/CSS en este paquete son el **diseño de referencia final**, construido en React + Babel standalone. La tarea es **reimplementar este diseño en un stack de producción** (Next.js + Tailwind recomendado, o React + Vite) conservando pixel-perfect la apariencia visual, todas las interacciones y la lógica de negocio.  
> **No copiar los archivos tal cual al proyecto de producción.** Recrearlos en el entorno de destino con sus patrones propios.

---

## 1. Qué es este proyecto

**RUAH LABS** es el sitio web completo de un laboratorio creativo cristiano en Santiago, Chile. Incluye:

- Sitio público de marketing (landing page de múltiples secciones)
- Catálogo de productos con filtro por categoría
- Modal de detalle de producto
- Carrito de compras + checkout de 3 pasos
- Sección de cuadros decorativos con brief de encargo
- Sección de iglesias con portafolio y formulario
- Sección de eventos (RUAH Live)
- Panel de administración (oculto, acceso por Ctrl+Shift+A)
- Club privado con acceso por contraseña
- Portal secreto (activado por triple-click en el logo)
- Sistema de contenido editable en tiempo real (todo editable desde el admin sin backend)

---

## 2. Stack actual (Design Reference)

```
React 18.3.1 + ReactDOM (UMD, CDN)
Babel Standalone 7.29.0 (transpilación en browser)
CSS puro (6 archivos, sin preprocessor)
localStorage para persistencia de contenido
Sin backend, sin build step, sin router
```

**Archivos fuente:**
| Archivo | Rol |
|---------|-----|
| `index.html` | Entry point, carga CDN + scripts |
| `data.jsx` | DEFAULT_CONTENT + useContentStore hook + applyTypography |
| `app.jsx` | Root component: estado global, cart, eventos |
| `sections.jsx` | Nav, Hero, About, Protocol, Services, Products, ProductDetail, Manifesto, Testimonials, CTABlock, Footer |
| `extras.jsx` | Cuadros, Iglesias + modales de galería |
| `eventos.jsx` | Sección Eventos (RUAH Live) |
| `club.jsx` | Club privado (login + dashboard) |
| `admin.jsx` | Panel administrador completo (2330 líneas) |
| `checkout.jsx` | Checkout 3 pasos + confirmación |
| `secret.jsx` | SecretPortal (video oculto activado por triple-click) |
| `styles.css` | Tokens globales, nav, hero, about, services, products, footer |
| `extras.css` | Protocolo, Cuadros, Iglesias, galería modal |
| `eventos.css` | Sección Eventos completa |
| `club.css` | Club privado completo |
| `checkout.css` | Checkout completo |
| `admin.css` | Panel administrador |
| `secret.css` | Secret portal |

---

## 3. Stack recomendado para producción

```
Next.js 14+ (App Router)
TypeScript
Tailwind CSS v3 (con theme tokens que repliquen las CSS vars)
Zustand o Jotai para estado global
React Hook Form para formularios
Framer Motion para animaciones reveal
next/font para tipografías (DM Serif Display + DM Mono)
```

---

## 4. Estructura de rutas recomendada

```
app/
  layout.tsx          ← Nav + providers
  page.tsx            ← Landing page (todas las secciones)
  admin/
    page.tsx          ← Panel admin (protegida por contraseña)
  club/
    page.tsx          ← Club privado (protegida por contraseña)
  checkout/
    page.tsx          ← Checkout 3 pasos
  api/
    content/route.ts  ← GET/PUT content (reemplaza localStorage)
    checkout/route.ts ← Procesar pedido
    contact/route.ts  ← Formularios de contacto
```

---

## 5. Pantallas / Vistas

### 5.1 Landing Page (sections en orden)

| # | Sección | ID HTML | Componente |
|---|---------|---------|------------|
| 1 | Nav | `.nav` | `Nav` |
| 2 | Hero | `#top` | `Hero` |
| 3 | About / Quiénes Somos | `#nosotros` | `About` |
| 4 | Protocolo 1×1 | `#protocolo` | `Protocol` |
| 5 | Servicios | `#servicios` | `Services` |
| 6 | Catálogo de Productos | `#productos` | `Products` |
| 7 | Cuadros Decorativos | `#cuadros` | `Cuadros` |
| 8 | Iglesias | `#iglesias` | `Iglesias` |
| 9 | Eventos (RUAH Live) | `#evento` | `Eventos` |
| 10 | Manifesto | — | `Manifesto` |
| 11 | Testimonios | `#comunidad` | `Testimonials` |
| 12 | CTA / Contacto | `#contacto` | `CTABlock` |
| 13 | Footer | `footer` | `Footer` |

### 5.2 Modales / Overlays

- **ProductDetail** — Modal de detalle de producto (galería, descripción, detalles técnicos, CTA)
- **CuadroProductModal** — Modal similar para cuadros
- **GalleryModal** / **GalleryLightbox** — Portafolio de iglesias y galería de eventos
- **Checkout** — Modal full-screen de 3 pasos (Info → Envío → Pago → Confirmación)
- **Admin** — Panel lateral derecho full-height con todas las secciones editables
- **Club** — Overlay full-screen (gate de contraseña → dashboard)
- **SecretPortal** — Video overlay oculto (triple-click en logo)

---

## 6. Navegación y Flujos

### Flujo principal
```
Landing → click "Ver productos" → scroll a #productos
Landing → click producto → ProductDetail modal
ProductDetail → "Ir a pagar" → Checkout (directamente al paso 3 con el item)
ProductDetail → "Añadir al carrito" → toast + badge en nav
Nav → icono carrito → Checkout modal
Checkout paso 1 → "Continuar a envío" → paso 2
Checkout paso 2 → "Continuar a pago" → paso 3
Checkout paso 3 → "Pagar" → Confirmación
```

### Flujos especiales
```
Triple-click en logo del nav → SecretPortal (video)
SecretPortal → "ENTRAR" → Club (gate)
Club gate → password correcto ("shalom") → Club dashboard
Footer año (triple-click) → Admin panel
Teclado Ctrl+Shift+A → Admin toggle
Teclado Ctrl+Shift+C → Club toggle
Escape → Cierra cualquier modal
```

### Navegación por secciones
- El nav usa `scrollIntoView` (o `window.scrollTo`) para smooth scroll a `#id`
- El dropdown de "Productos" filtra por categoría vía evento CustomEvent `ruah:setCategory`
- El botón "Cotizar" del nav navega a `#contacto`

---

## 7. Estado Global

### Content Store (`useContentStore` en data.jsx)

Todo el contenido del sitio vive en un objeto `DEFAULT_CONTENT` persistido en `localStorage` bajo la clave `ruah-content-v5`.

**Estructura de alto nivel:**
```typescript
interface Content {
  brand: Brand
  theme: Theme          // colores base: ivory, amber, gray, black
  typography: Typography // tamaños en px para cada elemento
  nav: Nav
  colors: Colors        // overrides de color por elemento (empty = default)
  hero: Hero
  about: About
  protocol: Protocol
  services: Services
  products: Products
  cuadros: Cuadros
  iglesias: Iglesias
  manifesto: Manifesto
  testimonials: Testimonials
  eventos: Eventos
  checkout: Checkout
  cta: CTA
  footer: Footer
  club: Club
}
```

**En producción:** reemplazar localStorage por una base de datos (Supabase, PlanetScale, etc.) con una tabla `content` y endpoint REST/API Route. El hook `useContentStore` se convierte en un `useSWR` o `useQuery`.

### Cart State (en App)
```typescript
interface CartItem {
  id: string
  name: string
  verse: string
  price: string  // ej: "18.990"
  img: string
  qty: number
}
```

Cart se pasa como prop a `Checkout`. En producción: mover a Zustand store + persistir en localStorage (o cookies para SSR).

### Eventos CustomEvent (bus de comunicación)
```javascript
window.dispatchEvent(new CustomEvent('ruah:openCheckout'))
window.dispatchEvent(new CustomEvent('ruah:addToCart', { detail: { productId, qty } }))
window.dispatchEvent(new CustomEvent('ruah:buyNow', { detail: { productId } }))
window.dispatchEvent(new CustomEvent('ruah:setCategory', { detail: { slug } }))
window.dispatchEvent(new CustomEvent('ruah:openClub'))
window.dispatchEvent(new CustomEvent('ruah:triggerSecret'))
```
En producción: reemplazar con callbacks/props o un event bus (mitt, zustand actions).

---

## 8. Autenticación

### Admin Panel
- **Trigger:** Ctrl+Shift+A, o triple-click en el año del footer
- **Password:** campo en `content.brand.adminPassword` (default: `"ruah1x1"`)
- Verificación: comparación directa de string en el componente Admin
- **En producción:** implementar con NextAuth.js + sesión de admin real, o middleware de Next.js con cookie firmada

### Club Privado
- **Trigger:** SecretPortal → botón "ENTRAR AL MOVIMIENTO", o Ctrl+Shift+C
- **Password:** `content.brand.clubPassword` (default: `"shalom"`)
- **En producción:** mismo sistema que admin, o membresías con Stripe

---

## 9. Formularios

| Formulario | Sección | Destino actual | Destino producción |
|-----------|---------|----------------|-------------------|
| Cotización Iglesias | #iglesias | `alert()` simulado | POST /api/contact con email (Resend/SendGrid) |
| Brief Cuadros | #cuadros | `alert()` simulado | POST /api/contact |
| Contacto / CTA | #contacto (nav cta → WhatsApp) | href externo | WhatsApp link + email |
| Checkout Step 1 | Checkout | estado local | POST /api/checkout |
| Checkout Step 3 (pago) | Checkout | simulado | Integración Mercado Pago / Transbank WebPay |

### Reglas de validación (Checkout)
- Email: formato válido, required
- Nombre: required
- Teléfono: formato chileno (+56 9 XXXX XXXX)
- Dirección: required si envío ≠ retiro en taller
- RUT: opcional, validación de dígito verificador

---

## 10. Interacciones y Animaciones

### Reveal (scroll-triggered)
- **Clase base:** `.reveal` — `opacity: 0; transform: translateY(24px); transition: 0.7s`
- **Activación:** `.reveal.in` — `opacity: 1; transform: none`
- **Trigger:** IntersectionObserver con `threshold: 0.15`
- **En producción:** reemplazar con `framer-motion` `whileInView` o CSS + `useInView`

### RevealLine (enmascarado por línea)
- **Clase:** `.reveal-mask` / `.reveal-mask.in`
- Efecto: el texto sube desde abajo del bounding box (clip-path o overflow hidden)
- Delay escalonado por línea (50ms, 180ms, 310ms...)

### Marquee hero
- CSS `animation: marquee 38s linear infinite`
- Track duplicado para loop continuo
- Pausa con `animation-play-state: paused` en hover

### Nav scroll
- `.nav.scrolled` se activa al `scrollY > 30`
- Aplica `backdrop-filter: blur` y reduce el padding

### Transitions
- Todos los modales: `opacity 0→1` + `transform translateY(20px)→0`, `0.3s ease`
- Hover estados de botones: `transform: translateY(-1px)`, `0.25s ease`
- Dropdown nav: `opacity` + `translateY(-6px)`, con `pointer-events: none` cuando cerrado

---

## 11. Sistema de Imágenes y Assets

### Assets existentes (en `/assets/`)
```
ruah-logo-white.png       ← Logo blanco para fondos oscuros
ruah-logo-wordmark.png    ← Logo horizontal usado en el nav
cart-carrito.png          ← Icono carrito del nav
cart-icon-new.png         ← Variante carrito
texture-hero.jpg          ← Textura de fondo del hero (overlay oscuro)
texture-about.jpg         ← Textura sección About
texture-black.jpg         ← Textura genérica negra
texture-cuadros.jpg       ← Fondo sección Cuadros
texture-tags.jpg          ← Textura Tags
texture-testimonios.jpg   ← Fondo testimonios
secret-portal.mp4         ← Video del portal secreto
static-intro.mp4          ← Video de introducción
```

### Imágenes de productos (en `/uploads/`)
Todas las imágenes están en `/uploads/`. Los productos en `DEFAULT_CONTENT` tienen `img: ''` (vacío). El admin permite asignar URLs o subir imágenes. En producción: usar un CDN (Cloudflare Images, AWS S3 + CloudFront).

### Fallback sin imagen
Cuando `product.img` está vacío, se muestra un placeholder con las primeras 2 letras del nombre del producto, en tipografía serif grande.

---

## 12. Responsive Breakpoints

| Breakpoint | Valor | Cambios clave |
|-----------|-------|---------------|
| Desktop | > 1180px | Layout completo |
| Laptop | ≤ 1180px | Nav compacto, grids reducidos |
| Tablet | ≤ 900px | Menú hamburguesa, 1 columna en hero bottom, 2 cols en products |
| Mobile L | ≤ 700px | 1 col en products, servicios simplificados |
| Mobile | ≤ 480px | Typography fluid mínima, padding reducido |

### Viewport meta
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```
**CRÍTICO: nunca usar `zoom` CSS ni `transform: scale` para adaptación.**

---

## 13. Sistema de Fuentes

```css
--serif: 'DM Serif Display', 'Georgia', serif;   /* Títulos grandes */
--mono:  'DM Mono', 'Courier New', monospace;    /* Labels, body, UI text */
```

**Carga:** Google Fonts (en el CSS actual está referenciada implícitamente). En producción usar `next/font`:

```typescript
import { DM_Serif_Display, DM_Mono } from 'next/font/google'

const serif = DM_Serif_Display({ weight: '400', subsets: ['latin'] })
const mono  = DM_Mono({ weight: ['300', '400', '500'], subsets: ['latin'] })
```

---

## Archivos en este paquete

Ver carpeta `src/` — contiene todos los archivos fuente del diseño de referencia tal como están en el proyecto de Claude Design.

Para entender el diseño visualmente, abrir `src/index.html` en un navegador con conexión a internet (necesita CDN de React).
