# RUAH LABS — Migration Guide: Design → Production

## Objetivo

Migrar el proyecto desde React + Babel standalone (sin build) a un stack de producción
**Next.js 14 + TypeScript + Tailwind CSS**, conservando diseño pixel-perfect,
toda la lógica de negocio y la UX premium.

---

## 1. Setup inicial del proyecto

```bash
npx create-next-app@latest ruah-labs \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd ruah-labs

# Dependencias core
npm install zustand @tanstack/react-query framer-motion
npm install react-hook-form zod @hookform/resolvers
npm install resend  # para emails de formularios
```

---

## 2. Configurar fuentes (reemplaza Google Fonts CDN)

```typescript
// src/app/layout.tsx
import { DM_Serif_Display, DM_Mono } from 'next/font/google'

const serif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const mono = DM_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

```css
/* src/app/globals.css */
:root {
  --serif: var(--font-serif), Georgia, serif;
  --mono:  var(--font-mono), 'Courier New', monospace;
  /* ... resto de los tokens de DESIGN_TOKENS.md */
}
```

---

## 3. Tokens de diseño en Tailwind

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ivory:  '#f5f1e8',
        amber:  '#eca10c',
        'ruah-gray':  '#6b6b62',
        'ruah-black': '#0a0a0a',
        ink:    '#1a1a16',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono:  ['var(--font-mono)', 'Courier New', 'monospace'],
      },
      screens: {
        'laptop': '1180px',
        // Tailwind defaults: sm=640, md=768, lg=1024, xl=1280, 2xl=1536
      },
      maxWidth: {
        shell: '1440px',
      },
      borderRadius: {
        pill: '9999px',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 4. Estado global: Content Store → Zustand + DB

### Paso 1: Definir el tipo
```typescript
// src/types/content.ts
// Copiar la forma de DEFAULT_CONTENT de data.jsx y tipar cada sección.
// Ver data.jsx lines 1–120 para la estructura completa.

export interface Content {
  brand: Brand
  theme: Theme
  typography: Typography
  nav: NavContent
  colors: Record<string, string>
  hero: HeroContent
  about: AboutContent
  protocol: ProtocolContent
  services: ServicesContent
  products: ProductsContent
  cuadros: CuadrosContent
  iglesias: IglesiasContent
  manifesto: ManifestoContent
  testimonials: TestimonialsContent
  eventos: EventosContent
  checkout: CheckoutContent
  cta: CTAContent
  footer: FooterContent
  club: ClubContent
}
```

### Paso 2: Store Zustand
```typescript
// src/store/content.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_CONTENT } from '@/data/defaultContent'
import type { Content } from '@/types/content'

interface ContentStore {
  content: Content
  update: (path: string, value: unknown) => void
  reset: () => void
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      content: DEFAULT_CONTENT,
      update: (path, value) => {
        set(state => {
          const next = structuredClone(state.content)
          const keys = path.split('.')
          let cur: Record<string, unknown> = next as Record<string, unknown>
          for (let i = 0; i < keys.length - 1; i++) {
            cur = cur[keys[i]] as Record<string, unknown>
          }
          cur[keys[keys.length - 1]] = value
          return { content: next }
        })
      },
      reset: () => set({ content: DEFAULT_CONTENT }),
    }),
    {
      name: 'ruah-content-v5', // mantiene compatibilidad con datos existentes
    }
  )
)
```

### Paso 3: Conectar a base de datos (opcional para fase 2)
```typescript
// src/app/api/content/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db' // Supabase / Prisma / etc.

export async function GET() {
  const content = await db.content.findFirst()
  return NextResponse.json(content)
}

export async function PUT(request: Request) {
  const body = await request.json()
  const content = await db.content.upsert({ data: body })
  return NextResponse.json(content)
}
```

---

## 5. Cart → Zustand store

```typescript
// src/store/cart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  name: string
  verse: string
  price: string
  img: string
  qty: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Omit<CartItem, 'qty'>, qty?: number) => void
  updateQty: (id: string, qty: number) => void
  removeItem: (id: string) => void
  clear: () => void
  count: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      addItem: (product, qty = 1) => {
        set(state => {
          const existing = state.items.find(i => i.id === product.id)
          const items = existing
            ? state.items.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
            : [...state.items, { ...product, qty }]
          return { items, count: items.reduce((s, i) => s + i.qty, 0) }
        })
      },
      updateQty: (id, qty) => {
        set(state => {
          const items = qty <= 0
            ? state.items.filter(i => i.id !== id)
            : state.items.map(i => i.id === id ? { ...i, qty } : i)
          return { items, count: items.reduce((s, i) => s + i.qty, 0) }
        })
      },
      removeItem: (id) => {
        set(state => {
          const items = state.items.filter(i => i.id !== id)
          return { items, count: items.reduce((s, i) => s + i.qty, 0) }
        })
      },
      clear: () => set({ items: [], count: 0 }),
    }),
    { name: 'ruah-cart' }
  )
)
```

---

## 6. Animaciones Reveal → Framer Motion

### Equivalente del `<Reveal>` actual:
```typescript
// src/components/ui/Reveal.tsx
'use client'
import { motion } from 'framer-motion'

interface RevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.7, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

### Equivalente de `<RevealLine>` (clip de línea):
```typescript
// src/components/ui/RevealLine.tsx
'use client'
import { motion } from 'framer-motion'

export function RevealLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
      <motion.span
        style={{ display: 'inline-block' }}
        initial={{ y: '110%' }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  )
}
```

---

## 7. Migrar CSS a Tailwind (estrategia recomendada)

### Opción A: CSS Modules + Tailwind (recomendada para este proyecto)
Dado que el diseño tiene clases muy específicas y nombres bien definidos, mantener los archivos CSS como **CSS Modules** y usar Tailwind solo para utilidades comunes es más seguro que reescribir todo en clases de Tailwind.

```typescript
// src/components/sections/Hero.module.css
/* Copiar exactamente el CSS de .hero, .hero__texture, .hero__title, etc. */
/* desde styles.css, reemplazando var(--serif) por var(--font-serif), etc. */
```

### Opción B: Tailwind puro
Usar `@apply` en un archivo global para los componentes más complejos, y clases de Tailwind en JSX para los más simples.

```css
/* src/styles/components.css */
@layer components {
  .btn {
    @apply inline-flex items-center gap-3 h-[62px] px-9 font-mono text-[15px]
           font-medium tracking-[0.16em] uppercase rounded-full bg-ruah-black 
           text-ivory transition-transform hover:-translate-y-px;
  }
  .btn--amber {
    @apply bg-amber text-ruah-black;
  }
}
```

---

## 8. Formularios con React Hook Form + Zod

```typescript
// src/components/checkout/CheckoutStep1.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().regex(/^\+?56\s?9\s?\d{4}\s?\d{4}$/, 'Formato: +56 9 XXXX XXXX'),
  rut: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function CheckoutStep1({ onNext }: { onNext: (data: FormData) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })
  return (
    <form onSubmit={handleSubmit(onNext)}>
      {/* Campos con estilos de checkout.css */}
    </form>
  )
}
```

---

## 9. API Routes

### Formulario de contacto / cotización
```typescript
// src/app/api/contact/route.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const body = await request.json()
  
  await resend.emails.send({
    from: 'web@ruahlabs.cl',
    to: 'hola@ruahlabs.cl',
    subject: `Nueva solicitud: ${body.tipo}`,
    html: `<p>${JSON.stringify(body, null, 2)}</p>`,
  })
  
  return Response.json({ ok: true })
}
```

### Checkout (Mercado Pago)
```typescript
// src/app/api/checkout/route.ts
import MercadoPago from 'mercadopago'

export async function POST(request: Request) {
  const { cart, info, shipping } = await request.json()
  
  const mp = new MercadoPago({ accessToken: process.env.MP_ACCESS_TOKEN! })
  
  const preference = await mp.preferences.create({
    items: cart.map((item: CartItem) => ({
      title: item.name,
      unit_price: parseInt(item.price.replace('.', '')),
      quantity: item.qty,
    })),
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_URL}/checkout/confirmado`,
      failure:  `${process.env.NEXT_PUBLIC_URL}/checkout/error`,
    },
    payer: { email: info.email, name: info.nombre },
  })
  
  return Response.json({ checkoutUrl: preference.init_point })
}
```

---

## 10. Autenticación del Admin

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('ruah-admin-token')
    if (!token || token.value !== process.env.ADMIN_TOKEN) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
```

---

## 11. Variables de entorno

```bash
# .env.local
NEXT_PUBLIC_URL=https://ruahlabs.cl
RESEND_API_KEY=re_xxxx
MP_ACCESS_TOKEN=TEST-xxxx
ADMIN_TOKEN=ruah1x1_hash_aqui
CLUB_TOKEN=shalom_hash_aqui
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=ruahlabs
```

---

## 12. Imágenes en producción

```typescript
// Reemplazar todos los <img> con next/image:

// ANTES (en el diseño):
<img src={product.img} alt={product.name} loading="lazy" />

// DESPUÉS:
import Image from 'next/image'
<Image
  src={product.img || '/placeholder.png'}
  alt={product.name}
  fill
  className="object-cover"
  sizes="(max-width: 900px) 50vw, 33vw"
/>
```

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.ruahlabs.cl' },
    ],
  },
}
```

---

## 13. Checklist de migración

### Fase 1 — Base (semana 1)
- [ ] Setup Next.js + TypeScript + Tailwind
- [ ] Configurar fuentes con `next/font`
- [ ] Migrar `DEFAULT_CONTENT` y tipos TypeScript
- [ ] Implementar `useContentStore` con Zustand + persist
- [ ] Copiar CSS a `globals.css` o CSS Modules
- [ ] Migrar `<Nav>`, `<Hero>`, `<Footer>` como componentes server/client

### Fase 2 — Secciones (semana 2)
- [ ] Migrar todas las secciones públicas (`About`, `Protocol`, `Services`, etc.)
- [ ] Migrar `<Products>` con filtro por categoría (URL params)
- [ ] Migrar `<ProductDetail>` modal
- [ ] Implementar `useCartStore` con Zustand
- [ ] Migrar `<Checkout>` con React Hook Form + Zod

### Fase 3 — Features especiales (semana 3)
- [ ] Migrar `<Cuadros>` (multi-step form)
- [ ] Migrar `<Iglesias>` con formulario de cotización
- [ ] Migrar `<Eventos>`
- [ ] Implementar `<SecretPortal>` con video
- [ ] Implementar `<Club>` con auth

### Fase 4 — Admin + Backend (semana 4)
- [ ] Migrar panel Admin con protección de ruta
- [ ] Conectar formularios a API Routes + Resend
- [ ] Integrar Mercado Pago para checkout real
- [ ] Setup base de datos para contenido editable
- [ ] Configurar Cloudinary para imágenes de productos

### Fase 5 — Producción
- [ ] Deploy en Vercel
- [ ] Configurar dominio ruahlabs.cl
- [ ] SSL y headers de seguridad (CSP)
- [ ] Analytics (Vercel Analytics o Plausible)
- [ ] Sitemap + robots.txt
- [ ] OG images con `next/og`
- [ ] Lighthouse audit (target: 95+ performance)
