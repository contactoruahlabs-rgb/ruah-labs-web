# RUAH LABS — Component Inventory

## Componentes públicos (sections.jsx + extras.jsx + eventos.jsx)

---

### `<Nav>`

**Props:** `content`, `cartCount`, `onOpenCheckout`

**Estado interno:**
- `scrolled` — activa `.nav.scrolled` al scroll > 30px
- `mobileOpen` — toggle del menú hamburguesa
- `openDrop` — id del dropdown abierto (o null)
- `tripleClicksRef` — historial de clicks para triple-click en logo

**Layout:**
```
nav.nav
  ├── a.nav__brand (logo imagen + triple-click handler)
  ├── div.nav__links
  │   └── div.nav__link-wrap × N
  │       ├── [si dropdown] button.nav__link + div.nav__dropdown
  │       └── [si link] a.nav__link
  ├── button.nav__cart (icono carrito + badge count)
  ├── a.nav__cta ("Cotizar →")
  └── button.hamb (hamburguesa mobile)
div.mobile-menu (aparece en ≤ 900px)
  ├── a × N (links)
  └── a (CTA)
```

**Comportamiento especial:**
- Triple-click en logo → `window.dispatchEvent('ruah:triggerSecret')`
- Solo un click en logo → smooth scroll a top
- Dropdown: `pointer-events: none` + `opacity: 0` cuando cerrado; se abre con click y cierra al click fuera
- `body.overflow = 'hidden'` cuando mobileOpen = true

**CSS key:** `.nav`, `.nav.scrolled`, `.nav__brand`, `.nav__links`, `.nav__link`, `.nav__dropdown`, `.nav__cta`, `.hamb`, `.mobile-menu`

---

### `<Hero>`

**Props:** `content`

**Layout:**
```
section.hero#top
  └── div.shell
      ├── div.hero__eyebrow (línea + label)
      ├── h1.hero__title (3 líneas con RevealLine)
      └── div.hero__bottom
          ├── div.hero__lede (texto descriptivo)
          └── div.hero__ctas (btn--amber + btn--white)
  └── div.hero__marquee
      └── div.marquee__track (texto infinito animado)
```

**Fondo:** `texture-hero.jpg` en overlay oscuro via `.hero__texture`  
**Tipo:** Serif para el H1, Mono para el resto

---

### `<About>`

**Props:** `content`

**Layout:**
```
section.about#nosotros
  └── div.shell
      ├── div.sec-head (eyebrow + título + sub)
      ├── div.about__grid (historia + body text)
      ├── div.about__pillars (4 pilares en grid)
      └── div.about__metrics (3 métricas numéricas)
```

**Fondo:** `#0a0a0a` con `texture-about.jpg`  
**Colores texto:** ivory (todo sobre negro)

---

### `<Protocol>`

**Props:** `content`

**Layout:**
```
section.protocol#protocolo
  └── div.shell
      ├── SectionHeader (index / título / right)
      └── div.pr-grid (2 columnas)
          ├── div.pr-left
          │   ├── h3.pr-bigtitle (4 líneas grandes)
          │   ├── div.pr-sections (3 secciones de texto)
          │   └── div.pr-quote (cita bíblica)
          └── aside.pr-right
              ├── div.pr-flow (lista numerada de pasos)
              ├── div.pr-team (foto de equipo o placeholder)
              └── a.pr-activate (CTA "Activar Protocolo")
```

---

### `<Services>`

**Props:** `content`

**Layout:**
```
section.services#servicios
  └── div.shell
      ├── div.sec-head
      └── div.svc-list
          └── div.svc-row × N (4 columnas: num / nombre / desc / cta)
```

**Grid:** `grid-template-columns: 64px 1.4fr 1fr 180px`  
**Separadores:** `border-bottom: 1px solid var(--line)` entre filas

---

### `<Products>`

**Props:** `content`, `onOpenProduct(id)`

**Estado interno:** `activeSlug` (categoría activa, default 'todo')  
**Escucha:** `ruah:setCategory` CustomEvent

**Layout:**
```
section.products#productos
  └── div.shell
      ├── div.sec-head
      ├── div.cat-bar (chips de filtro)
      └── div.prod-grid (3 columnas) | div.empty-state
          └── div.prod × N
              ├── div.prod__media (imagen + tag + "Ver detalle" hover)
              └── div.prod__body (verso + nombre + precio + botón)
```

**Interacción:** click en card o en "Comprar" → `onOpenProduct(id)`

---

### `<ProductDetail>`

**Props:** `productId`, `content`, `onClose`, `onBuyNow`, `onAddToCart`

**Estado interno:** `idx` (imagen activa en galería)

**Layout:**
```
div.pd-overlay[.open]
  └── div.pd (2 columnas)
      ├── div.pd__media
      │   ├── div.pd__main (imagen principal)
      │   └── div.pd__thumbs (thumbnails si hay galería)
      └── div.pd__body
          ├── div.pd__verse + tag
          ├── h2.pd__title
          ├── div.pd__price
          ├── p.pd__desc
          ├── div.pd__details (tabla label/valor)
          ├── div.pd__protocol (badge Protocolo 1×1)
          └── div.pd__cta (Ir a pagar + Añadir + Consultar)
```

---

### `<Cuadros>` (extras.jsx)

**Props:** `content`, `onAddToCart`, `onBuyNow`

**Estado interno:**
- `activeStep` (1-4: Explorar / Estilo / Formato / Enviar)
- `selectedEstilo`, `selectedFormato`
- `cuadroProductId` (modal)
- `form` fields (nombre, email, versiculo, notas)

**Layout:**
```
section.cuadros#cuadros
  └── div.shell
      ├── SectionHeader
      ├── div.cu-hero (título + estilos grid)
      └── div.cu-brief (4 pasos con tabs)
          ├── div.cu-tabs (botones de paso)
          └── div.cu-panel (contenido del paso activo)
              ├── Paso 1: Referencias (cu-refs grid)
              ├── Paso 2: Estilos (cu-estilos grid)
              ├── Paso 3: Formatos (cu-formatos grid)
              └── Paso 4: Formulario (cu-form)
      └── div.cu-catalog (catálogo de cuadros disponibles)
```

---

### `<Iglesias>` (extras.jsx)

**Props:** `content`

**Estado interno:**
- `galleryProjectId` (modal galería portafolio)
- `form` fields

**Layout:**
```
section.iglesias#iglesias
  └── div.shell
      ├── SectionHeader
      ├── div.ig-hero (título + feature card)
      ├── div.ig-svcs (4 servicios en grid)
      ├── div.ig-port (portafolio)
      │   ├── SectionHeader
      │   └── div.ig-projs (3×2 grid de proyectos)
      └── div.ig-formWrap (título + formulario)
```

---

### `<Eventos>` (eventos.jsx)

**Props:** `content`

**Estado:** `galleryIdx` (lightbox)

**Layout:** Sección larga con bloques alternos claro/oscuro:
```
section.eventos#evento
  └── div.shell
      ├── div.ev-head (título + sub)
      ├── div.ev-twocol (El Problema / Lo Que Hacemos)
      ├── div.ev-pillars (4 pilares)
      ├── div.ev-detail (detalle con ícono)
      ├── div.ev-receive (lista de lo que recibes)
      ├── div.ev-packs (3 paquetes)
      ├── div.ev-coverage (cobertura)
      ├── div.ev-cta (CTA agendar)
      └── div.ev-gallery (galería de eventos)
```

---

### `<Manifesto>`

**Props:** `content`

**Layout:** Una sola línea de texto grande con fragmentos `em` (amber) e inline. Fondo negro.

---

### `<Testimonials>`

**Props:** `content`

**Layout:**
```
section.testi-section#comunidad
  └── div.shell
      ├── div.sec-head
      └── div.testi-grid (3 columnas)
          └── div.testi × N
              ├── p.testi__quote
              └── div.testi__foot (avatar + nombre/rol)
```

---

### `<CTABlock>`

**Props:** `content`

**Layout:**
```
section.cta-block#contacto
  └── div.shell
      └── div.cta-block__grid (2 columnas)
          ├── h2.cta-block__title (3 líneas)
          └── div (body + botones)
```

---

### `<Footer>`

**Props:** `content`, `onOpenAdmin`

**Estado:** `clicksRef` — triple-click en el año abre el Admin

**Layout:**
```
footer.footer
  └── div.shell
      ├── h2.footer__wordmark (RUAH LABS gigante)
      ├── p.footer__about
      ├── div.footer__grid (4 columnas)
      └── div.footer__bottom (copyright + tagline)
```

---

## Componentes de admin / club / checkout

### `<Admin>` (admin.jsx — 2330 líneas)

Panel lateral derecho full-height. Organizado en tabs:
- **Marca:** nombre, tagline, passwords, instagram
- **Tema:** colores base (ivory, amber, gray, black)
- **Tipografía:** sliders A+/A- para cada token
- **Colores por sección:** overrides de color por elemento
- **Nav:** editar links, CTA
- **Hero / About / Protocol / Services / Products / Cuadros / Iglesias / Manifesto / Testimonials / CTA / Footer / Club / Checkout:** edición completa

Expone `exportJSON`, `importJSON`, `reset` para backup.

### `<Club>` (club.jsx)

- **Gate:** input de contraseña + submit
- **Dashboard** (si autenticado):
  - Hero con estadísticas (paneles)
  - Rutas (grid de 2 col, botón "Anotarme")
  - Reuniones (grid de 2 col)
  - Feed de actividad
  - Registro fotográfico

### `<Checkout>` (checkout.jsx)

**3 pasos + confirmación:**

**Paso 1 — Información:**
- Nombre completo
- Email
- Teléfono
- RUT (opcional)

**Paso 2 — Envío:**
- Opciones de shipping (radio cards)
- Dirección: calle + número + depto + ciudad + región + código postal
- Descuento (campo + aplicar)

**Paso 3 — Pago:**
- Tabs: Tarjeta / Transferencia / Efectivo
- Tarjeta: número (4×4) + vencimiento + CVV + nombre
- Transferencia: instrucciones + referencia
- Efectivo: instrucciones retiro
- Trust bar (SSL + protocolo)

**Confirmación:**
- Número de pedido generado
- Resumen de ítems
- Instrucciones siguientes

**Resumen lateral (siempre visible en desktop):**
- Lista de items con qty controls
- Subtotal / Envío / Descuento / Total
- Badge Protocolo 1×1

### `<SecretPortal>` (secret.jsx)

- Escucha `ruah:triggerSecret`
- Muestra overlay con video `assets/secret-portal.mp4`
- Input de contraseña → si correcta: `window.dispatchEvent('ruah:openClub')`
- Botón de cerrar

---

## Componentes de utilidad

### `<Reveal>`
```typescript
interface RevealProps {
  children: ReactNode
  delay?: number      // ms
  as?: string         // tag HTML (default: 'div')
  className?: string
  style?: CSSProperties
}
```
Usa IntersectionObserver. Añade `.reveal` y `.reveal.in` al intersectar.

### `<RevealLine>`
```typescript
interface RevealLineProps {
  children: ReactNode
  delay?: number
  className?: string
}
```
Efecto de máscara: el texto aparece de abajo hacia arriba.

### `<SectionHeader>`
```typescript
interface SectionHeaderProps {
  index: string      // ej: "§02  /  06"
  title: string      // ej: "PROTOCOLO 1×1"
  right: string      // ej: "DOC · INTERNO · v1.0"
  amberTitle?: boolean
}
```
Barra horizontal con 3 columnas, usada en Protocolo, Cuadros, Iglesias.

### `<Field>`, `<Text>`, `<EditText>`, `<ColorPicker>` (admin.jsx)
Átomos de formulario del admin. En producción: reemplazar con componentes del UI kit de destino.
