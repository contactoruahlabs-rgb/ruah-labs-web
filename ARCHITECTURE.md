# RUAH LABS — Architecture Guide

## Diagrama de componentes

```
App (root state: content, cart, modals)
├── Nav
│   ├── Dropdown (Productos → categorías)
│   └── MobileMenu (hamburger)
├── main
│   ├── Hero
│   ├── About
│   ├── Protocol
│   ├── Services
│   ├── Products
│   │   └── [ProductDetail modal]
│   ├── Cuadros
│   │   ├── [CuadroProductModal]
│   │   └── [GalleryModal / GalleryLightbox]
│   ├── Iglesias
│   │   └── [GalleryModal / GalleryLightbox]
│   ├── Eventos
│   ├── Manifesto
│   ├── Testimonials
│   └── CTABlock
├── Footer
├── Admin (overlay, Ctrl+Shift+A)
├── Club (overlay, password-gated)
├── ProductDetail (modal)
├── Checkout (modal, 3 steps)
├── SecretPortal (video overlay)
└── Toast (notificación global)
```

---

## Flujo de datos

```
DEFAULT_CONTENT (data.jsx)
        ↓ deepMerge con localStorage
useContentStore() → { content, update, updateList, reset, exportJSON, importJSON }
        ↓ prop drilling
App → [todas las secciones] como `content={content}`
        ↓ efectos secundarios
applyTypography(content.typography) → CSS custom properties en :root
applyColors(content.colors)         → CSS custom properties --c-* en :root
applyCheckoutStyle(content.checkout.style) → CSS custom properties --ck-* en :root
```

---

## Patrón de actualización de contenido

```javascript
// Actualizar un campo simple
store.update('hero.titleLine1', 'NUEVA LÍNEA')

// Actualizar campo anidado
store.update('typography.heroMax', 200)

// Actualizar lista (add/remove/reorder)
store.updateList('products.items', list => [...list, newItem])

// Persistencia automática: cada update dispara saveContent(content)
// que escribe en localStorage['ruah-content-v5']
```

---

## Patrón de migración de contenido

Cuando se añaden nuevos campos a `DEFAULT_CONTENT`, la función `migrateContent()` en `data.jsx` los backfilla en el objeto guardado del usuario. Esto permite evolucionar el schema sin romper datos existentes.

**En producción:** implementar con migraciones de base de datos + versionado de schema. La lógica de `migrateContent` se convierte en un script de migración.

---

## Comunicación entre componentes (CustomEvents)

El proyecto usa `window.dispatchEvent` / `window.addEventListener` como bus de eventos para comunicación cross-component sin prop drilling:

```javascript
// Desde cualquier botón "Comprar ahora":
window.dispatchEvent(new CustomEvent('ruah:buyNow', { detail: { productId: 'p1' } }))

// App.jsx escucha:
window.addEventListener('ruah:buyNow', (e) => buyNow(e.detail.productId))

// Listado completo de eventos:
'ruah:openCheckout'      → Abre el modal de checkout
'ruah:addToCart'         → { productId, qty } → Añade al carrito
'ruah:buyNow'            → { productId } → Añade + abre checkout
'ruah:setCategory'       → { slug } → Filtra catálogo de productos
'ruah:openClub'          → Abre el Club overlay
'ruah:triggerSecret'     → Activa el SecretPortal (video)
```

**En producción:** reemplazar con:
- Zustand actions (para cart y modales)
- React callbacks/props (para comunicación parent-child)
- Router navigation (para filtros de categoría via URL params)

---

## CSS Architecture

### Jerarquía de archivos CSS (orden de carga en index.html)

```
1. styles.css    → Tokens globales, reset, tipografía, nav, hero, about,
                   services, products, product-detail, manifesto,
                   testimonials, cta, footer, toast, responsive
2. admin.css     → Panel administrador
3. club.css      → Club privado
4. extras.css    → Sec-bar, Protocolo, Cuadros, Iglesias, galería modal
5. eventos.css   → Sección Eventos completa
6. checkout.css  → Checkout completo
7. secret.css    → Secret portal
```

### Sistema de tokens CSS (en :root de styles.css)

```css
/* Colores base (sobrescribibles desde JS) */
--ivory: #f5f1e8
--amber: #eca10c
--gray:  #6b6b62
--black: #0a0a0a

/* Colores derivados (hardcoded en CSS) */
--ink:       #1a1a16   /* texto principal */
--line:      rgba(26,26,22,0.14)
--gray-soft: rgba(107,107,98,0.6)

/* Fuentes */
--serif: 'DM Serif Display', Georgia, serif
--mono:  'DM Mono', 'Courier New', monospace

/* Layout */
--max: 1440px
--gutter: clamp(28px, 4.2vw, 88px)

/* Spacing */
--section-pad-y: clamp(96px, 10vw, 188px)
--section-pad-y-tight: clamp(80px, 7vw, 120px)
--space-2xs: 4px  → --space-4xl: 96px

/* Tipografía (sobrescribibles desde JS via applyTypography) */
--fs-hero: 160px
--fs-section: 120px
... (ver DESIGN_TOKENS.md para listado completo)

/* Overrides de color por elemento (empty por default) */
--c-heroTitle, --c-aboutTitle, --c-navLink, etc.

/* Checkout tokens */
--ck-bg, --ck-accent, --ck-fs-title, etc.
```

### Patrón `.shell`

Todos los contenedores de sección usan `.shell`:
```css
.shell {
  max-width: var(--max);      /* 1440px */
  margin: 0 auto;
  padding: 0 var(--gutter);   /* clamp(28px, 4.2vw, 88px) */
}
```

---

## Responsive Strategy

**Breakpoints** (definidos en media queries al final de styles.css):

```css
@media (max-width: 1180px) { /* laptop compacto */ }
@media (max-width: 900px)  { /* tablet / mobile landscape */ }
@media (max-width: 700px)  { /* mobile portrait */ }
@media (max-width: 480px)  { /* mobile pequeño */ }
```

**Reglas clave:**
- `.hamb` visible solo en ≤ 900px
- `.nav__links` oculto en ≤ 900px (reemplazado por `.mobile-menu`)
- Grids de productos: 3col → 2col → 1col
- Grid de servicios: 4 columnas → simplificado a 3 áreas (num + nombre + cta)
- Tipografía hero: `clamp(68px, 14vw, 160px)` (fluid entre viewports)
- **NUNCA** `transform: scale` ni `zoom` CSS

---

## Persistencia

```javascript
const STORAGE_KEY = 'ruah-content-v5'

// Guardar (se llama en cada update)
localStorage.setItem(STORAGE_KEY, JSON.stringify(content))

// Cargar (al init)
const raw = localStorage.getItem(STORAGE_KEY)
const parsed = JSON.parse(raw)
const merged = deepMerge(DEFAULT_CONTENT, parsed) // mantiene nuevos campos
return migrateContent(merged) // backfill de campos añadidos en versiones nuevas
```

**Versioning:** el sufijo `-v5` en la clave permite romper con contenido cacheado de versiones anteriores sin conflictos.

---

## Seguridad (actual vs. producción)

| Feature | Ahora | Producción |
|---------|-------|------------|
| Admin password | string en localStorage | bcrypt hash en DB + JWT session |
| Club password | string en localStorage | OAuth o password hash en DB |
| Datos de pago | No procesados (simulado) | Mercado Pago / WebPay + webhooks |
| Formularios | alert() simulado | API Routes + email (Resend) |
| Imágenes | paths locales / URLs directas | Cloudflare Images / S3 + presigned URLs |
| Contenido | localStorage | Supabase / PlanetScale + RLS |

---

## Consideraciones de performance

- Las imágenes de productos están en `uploads/` sin optimización. En producción: usar `next/image` con sizes apropiados.
- El JS de Babel standalone (~1MB) no debe ir a producción. El build de Next.js lo elimina completamente.
- Todas las animaciones usan `transform` y `opacity` (GPU-composited). No hay animaciones en `top/left/width/height`.
- IntersectionObserver con `disconnect()` después del primer disparo (no re-observa).
- Fuentes de Google: en producción preload con `next/font` para evitar FOUT.
