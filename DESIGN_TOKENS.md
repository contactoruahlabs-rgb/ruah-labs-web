# RUAH LABS — Design Tokens

## Colores

### Paleta base
| Token CSS | Valor default | Descripción |
|-----------|--------------|-------------|
| `--ivory` | `#f5f1e8` | Crema cálido — fondo principal, texto sobre negro |
| `--amber` | `#eca10c` | Dorado RUAH — acentos, CTA primario, hover |
| `--gray`  | `#6b6b62` | Gris oliva — subtítulos, iconos secundarios |
| `--black` | `#0a0a0a` | Negro profundo — fondo hero, nav, footer, botones |
| `--ink`   | `#1a1a16` | Casi negro — texto body principal (hardcoded) |
| `--line`  | `rgba(26,26,22,0.14)` | Líneas divisorias sutiles (hardcoded) |
| `--gray-soft` | `rgba(107,107,98,0.6)` | Texto secundario atenuado (hardcoded) |

### Colores de sección (fondos)
| Sección | Background |
|---------|-----------|
| Nav (top) | `rgba(245,241,232,0.92)` con backdrop-filter |
| Hero | `#0a0a0a` con texture overlay |
| About | `#0a0a0a` con texture |
| Protocol | `#0a0a0a` |
| Services | `var(--ivory)` |
| Products | `#0a0a0a` |
| Cuadros | `var(--ivory)` |
| Iglesias | `#0a0a0a` |
| Eventos | `var(--ivory)` |
| Manifesto | `#0a0a0a` |
| Testimonials | `var(--ivory)` |
| CTA | `var(--ivory)` |
| Footer | `#0a0a0a` |

### Overrides de color por elemento (CSS vars `--c-*`)
Cuando están vacíos, el diseño usa el color default del CSS. El admin los expone para edición visual.

```css
--c-heroTitle          /* título hero */
--c-navLink            /* links del nav */
--c-aboutTitle         /* título about */
--c-aboutBody          /* texto body about */
--c-pillarNum          /* número del pilar */
--c-pillarTitle        /* título del pilar */
--c-pillarDesc         /* descripción del pilar */
--c-metricLbl          /* label de métrica */
--c-servicesTitle      /* título servicios */
--c-productsTitle      /* título productos */
--c-cuadrosTitle       /* título cuadros */
--c-cuadrosBriefTitle  /* título brief */
--c-iglesiasTitle      /* título iglesias */
--c-protocolSectionHd  /* heading sección protocolo */
--c-protocolBody       /* body texto protocolo */
--c-protocolQuoteRef   /* referencia bíblica */
--c-testiTitle         /* título testimonios */
--c-testiQuote         /* texto quote */
--c-eventosTitleEm     /* acento título eventos */
--c-eventosBody        /* body eventos */
--c-ctaBody            /* body CTA */
--c-footerColTitle     /* título columna footer */
--c-footerAbout        /* texto about footer */
--c-footerColItem      /* items footer */
```

---

## Tipografía

### Familias
```css
--serif: 'DM Serif Display', Georgia, serif   /* weight 400 siempre */
--mono:  'DM Mono', 'Courier New', monospace  /* weights 300, 400, 500 */
```

### Escala de tamaños (tokens CSS, sobreescritos desde JS)

#### Títulos de sección (máximos — se reducen vía clamp en CSS)
| Token | Default | Elemento |
|-------|---------|---------|
| `--fs-hero` | 160px | H1 Hero |
| `--fs-section` | 120px | H2 secciones genéricas |
| `--fs-about-title` | 120px | H2 About |
| `--fs-protocol` | 140px | H3 Protocolo big title |
| `--fs-services-title` | 120px | H2 Servicios |
| `--fs-products-title` | 120px | H2 Productos |
| `--fs-cuadros-title` | 140px | H2/H3 Cuadros |
| `--fs-iglesias-title` | 120px | H2 Iglesias |
| `--fs-manifesto` | 92px | H2 Manifesto |
| `--fs-testimonials-title` | 120px | H2 Testimonios |
| `--fs-cta` | 160px | H2 CTA |
| `--fs-wordmark` | 280px | Wordmark en footer |
| `--fs-club-title` | 140px | H2 Club |

#### Tipografía de componentes
| Token | Default | Elemento |
|-------|---------|---------|
| `--fs-product` | 28px | Nombre de producto en card |
| `--fs-testi` | 28px | Quote testimonio |
| `--fs-pillar-title` | 32px | Título pilar about |
| `--fs-stat-num` | 92px | Número métricas about |
| `--fs-ig-svc-name` | 22px | Nombre servicio iglesias |
| `--fs-ig-proj-name` | 38px | Nombre proyecto iglesias |
| `--fs-ig-portfolio-title` | 92px | Título portafolio |
| `--fs-ig-form-title` | 72px | Título form iglesias |
| `--fs-ig-feature-name` | 88px | Feature name iglesias |
| `--fs-cu-style-tag` | 18px | Tag estilo cuadros |
| `--fs-cu-brief-title` | 64px | Título brief cuadros |
| `--fs-cu-step-num` | 38px | Número de paso |
| `--fs-cu-ref-name` | 56px | Nombre referencia |
| `--fs-cu-format-num` | 36px | Número formato cuadro |
| `--fs-pr-flow-name` | 15px | Nombre paso flujo protocolo |
| `--fs-pr-section-hd` | 13px | Heading sección protocolo |
| `--fs-pr-quote` | 20px | Quote protocolo |
| `--fs-club-panel-big` | 64px | Número grande panel club |
| `--fs-club-route-name` | 22px | Nombre ruta club |
| `--fs-club-meeting-day` | 36px | Día reunión club |

#### Tipografía de UI y body
| Token | Default | Elemento |
|-------|---------|---------|
| `--fs-body` | 19px | Texto body general |
| `--fs-lede` | 21px | Lead text (párrafos destacados) |
| `--fs-label` | 14px | Labels UI |
| `--fs-navbrand` | 16px | Texto marca en nav (no usado, logo es imagen) |
| `--fs-nav-link` | 12px | Links del nav |

#### Tipografía per-elemento (tokens extra)
| Token | Default | Elemento |
|-------|---------|---------|
| `--fs-svc-num` | 13px | Número servicio en fila |
| `--fs-svc-name` | 56px | Nombre servicio |
| `--fs-svc-desc` | 15px | Descripción servicio |
| `--fs-prod-verse` | 12px | Versículo en card producto |
| `--fs-prod-price` | 28px | Precio producto |
| `--fs-pr-flow-det` | 14px | Detalle paso flujo |
| `--fs-cu-lede` | 14px | Lede cuadros |
| `--fs-ig-lede` | 15px | Lede iglesias |
| `--fs-ev-eyebrow` | 13px | Eyebrow eventos |
| `--fs-ev-block-title` | 34px | Título bloque eventos |
| `--fs-testi-name` | 13px | Nombre testimonial |
| `--fs-testi-role` | 13px | Rol testimonial |
| `--fs-cta-body` | 18px | Body CTA |
| `--fs-footer-about` | 14px | About footer |
| `--fs-footer-coltitle` | 13px | Título columna footer |
| `--fs-footer-colitem` | 14px | Item columna footer |
| `--fs-cat-chip` | 12px | Chip de categoría |
| `--logo-h` | 40px | Altura del logo en nav |

---

## Spacing

### Escala base (4pt)
```css
--space-2xs: 4px
--space-xs:  8px
--space-sm:  12px
--space-md:  16px
--space-lg:  24px
--space-xl:  32px
--space-2xl: 48px
--space-3xl: 64px
--space-4xl: 96px
```

### Ritmo vertical
```css
--rhythm-head:  clamp(64px, 6.5vw, 112px)   /* sec-head → contenido */
--rhythm-block: clamp(52px, 5.5vw, 88px)    /* entre bloques */
```

### Padding de sección
```css
--section-pad-y:       clamp(96px, 10vw, 188px)
--section-pad-y-tight: clamp(80px, 7vw, 120px)
```

### Gutter del contenedor
```css
--gutter: clamp(28px, 4.2vw, 88px)   /* padding lateral del .shell */
--max:    1440px                       /* max-width del .shell */
```

---

## Botones

### Variantes
| Clase | Background | Color | Border |
|-------|-----------|-------|--------|
| `.btn` (default) | `var(--black)` | `var(--ivory)` | — |
| `.btn.btn--amber` | `var(--amber)` | `var(--black)` | — |
| `.btn.btn--white` | `var(--ivory)` | `var(--black)` | — |
| `.btn.btn--ghost` | `transparent` | `var(--ink)` | `1px solid var(--line)` |
| `.btn.btn--dark-ghost` | `transparent` | `var(--ivory)` | `1px solid rgba(245,241,232,0.25)` |

### Dimensiones base
```css
height: 62px
padding: 0 36px
font-size: 15px
font-family: var(--mono)
font-weight: 500
letter-spacing: 0.16em
text-transform: uppercase
border-radius: 999px
gap: 12px
min-height: 48px
```

### Estados
- Hover: `transform: translateY(-1px)`
- Active: `transform: translateY(0)`
- Ripple: pseudo-elemento `::after` con `background: rgba(255,255,255,0.08)`

---

## Bordes y Radios

| Elemento | Border-radius |
|---------|---------------|
| Botones | 999px (pill) |
| Cards de producto | 0 (sin radius) |
| Dropdown nav | 10px |
| Panel cuadros | 16px |
| Refs cuadros | 10px |
| Chips de categoría | 999px |
| Tarjetas de testimonio | 0 |
| Checkout card | 0 |

---

## Sombras

```css
/* Dropdown nav */
box-shadow: 0 24px 60px rgba(10,10,10,0.12)

/* Product detail modal overlay */
background: rgba(10,10,10,0.85)

/* Modales principales */
background: rgba(10,10,10,0.85) + backdrop-filter: blur(4px)
```

---

## Checkout Tokens (`--ck-*`)

```css
--ck-bg:        #0a0a0a   /* fondo exterior */
--ck-card:      #0a0a0a   /* superficie del form */
--ck-on-dark:   #f5f1e8   /* texto sobre oscuro */
--ck-on-card:   #ffffff   /* texto sobre card */
--ck-accent:    #eca10c   /* step activo, focus, CTA */
--ck-step-done: #eca10c   /* step completado */
--ck-sum-bg:    #0a0a0a   /* fondo del resumen */
--ck-sum-text:  #f5f1e8   /* texto del resumen */

/* Sizes */
--ck-fs-title:   36px
--ck-fs-sub:     14px
--ck-fs-step:    12px
--ck-fs-flbl:    11px
--ck-fs-input:   19px
--ck-fs-cta:     14px
--ck-fs-sum-hd:  13px
--ck-fs-sum-it:  14px
--ck-fs-sum-tot: 22px
```

---

## Tailwind Config (para producción)

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        ivory:  '#f5f1e8',
        amber:  '#eca10c',
        'ruah-gray': '#6b6b62',
        'ruah-black': '#0a0a0a',
        ink:    '#1a1a16',
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        mono:  ['DM Mono', 'Courier New', 'monospace'],
      },
      maxWidth: {
        shell: '1440px',
      },
      spacing: {
        'section': 'clamp(96px, 10vw, 188px)',
      },
      borderRadius: {
        pill: '999px',
      },
    },
  },
}
```
