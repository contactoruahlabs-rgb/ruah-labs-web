-- ============================================================
-- RUAH LABS — Esquema inicial de base de datos
-- Supabase / PostgreSQL
-- Migración: 001_initial_schema
-- ============================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLA: content
-- Almacena el contenido del sitio (reemplaza localStorage)
-- ============================================================
CREATE TABLE public.content (
  id          SERIAL PRIMARY KEY,
  key         TEXT UNIQUE NOT NULL DEFAULT 'main',
  data        JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer el contenido principal
CREATE POLICY "content_public_read"
  ON public.content FOR SELECT
  USING (true);

-- Solo admins pueden escribir
CREATE POLICY "content_admin_write"
  ON public.content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- TABLA: profiles
-- Extiende auth.users con roles
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'club_member', 'customer')),
  display_name TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own_read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p2
      WHERE p2.id = auth.uid() AND p2.role = 'admin'
    )
  );

-- Trigger: crear profile automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLA: categories
-- Categorías de productos
-- ============================================================
CREATE TABLE public.categories (
  id          TEXT PRIMARY KEY,         -- 'c1', 'c2', etc. (compatibilidad con data.jsx)
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "categories_admin_write"
  ON public.categories FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed: categorías iniciales
INSERT INTO public.categories (id, name, slug, order_index) VALUES
  ('c-all', 'Todo',       'todo',       0),
  ('c1',    'Poleras',    'poleras',    1),
  ('c2',    'Polerones',  'polerones',  2),
  ('c3',    'Chaquetas',  'chaquetas',  3),
  ('c4',    'Gorros',     'gorros',     4),
  ('c5',    'Cuadros',    'cuadros',    5),
  ('c6',    'Accesorios', 'accesorios', 6);

-- ============================================================
-- TABLA: products
-- Catálogo de productos
-- ============================================================
CREATE TABLE public.products (
  id          TEXT PRIMARY KEY,          -- 'p1', 'p2', etc.
  category_id TEXT REFERENCES public.categories(id),
  name        TEXT NOT NULL,
  verse       TEXT,
  price       INTEGER NOT NULL,          -- en CLP, sin decimales
  tag         TEXT,
  tag_style   TEXT DEFAULT 'soft',       -- 'amber' | 'soft'
  description TEXT,
  details     JSONB DEFAULT '[]',        -- [{label, value}]
  images      TEXT[] DEFAULT '{}',       -- URLs de Supabase Storage
  gallery     TEXT[] DEFAULT '{}',
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read"
  ON public.products FOR SELECT USING (active = TRUE);

CREATE POLICY "products_admin_all"
  ON public.products FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- TABLA: discount_codes
-- Códigos de descuento
-- ============================================================
CREATE TABLE public.discount_codes (
  code        TEXT PRIMARY KEY,
  percent     INTEGER NOT NULL CHECK (percent BETWEEN 1 AND 100),
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  max_uses    INTEGER,                   -- NULL = sin límite
  used_count  INTEGER NOT NULL DEFAULT 0,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Los clientes solo pueden verificar (via función segura), no leer la tabla directa
CREATE POLICY "discount_admin_all"
  ON public.discount_codes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Función segura para verificar código de descuento (llamada desde API)
CREATE OR REPLACE FUNCTION public.verify_discount_code(p_code TEXT)
RETURNS TABLE(valid BOOLEAN, percent INTEGER, message TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_discount public.discount_codes%ROWTYPE;
BEGIN
  SELECT * INTO v_discount
  FROM public.discount_codes
  WHERE code = UPPER(p_code) AND active = TRUE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'Código no válido'::TEXT;
    RETURN;
  END IF;

  IF v_discount.expires_at IS NOT NULL AND v_discount.expires_at < NOW() THEN
    RETURN QUERY SELECT FALSE, 0, 'Código expirado'::TEXT;
    RETURN;
  END IF;

  IF v_discount.max_uses IS NOT NULL AND v_discount.used_count >= v_discount.max_uses THEN
    RETURN QUERY SELECT FALSE, 0, 'Código agotado'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, v_discount.percent, 'Código válido'::TEXT;
END;
$$;

-- Seed: código de bienvenida (equivale al hardcodeado actual)
INSERT INTO public.discount_codes (code, percent, active, max_uses) VALUES
  ('BIENVENIDO10', 10, TRUE, NULL);

-- ============================================================
-- TABLA: orders
-- Pedidos realizados
-- ============================================================
CREATE TABLE public.orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     TEXT UNIQUE NOT NULL,        -- 'RUAH-XXXXXX'
  customer_email   TEXT NOT NULL,
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT,
  customer_user_id UUID REFERENCES auth.users(id),  -- NULL si guest

  -- Dirección
  shipping_street  TEXT,
  shipping_number  TEXT,
  shipping_apt     TEXT,
  shipping_city    TEXT,
  shipping_region  TEXT,
  shipping_postal  TEXT,
  shipping_country TEXT DEFAULT 'Chile',

  -- Método de envío
  shipping_method  TEXT NOT NULL,              -- 'std' | 'express' | 'pickup'
  shipping_fee     INTEGER NOT NULL DEFAULT 0,

  -- Financiero
  subtotal         INTEGER NOT NULL,
  discount_code    TEXT,
  discount_amount  INTEGER NOT NULL DEFAULT 0,
  total            INTEGER NOT NULL,

  -- Pago
  payment_method   TEXT NOT NULL,              -- 'card' | 'webpay' | 'transfer'
  payment_status   TEXT NOT NULL DEFAULT 'pending'
                   CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  payment_id       TEXT,                       -- ID de MercadoPago
  mp_preference_id TEXT,                       -- Preference ID de MP
  paid_at          TIMESTAMPTZ,

  -- Protocolo 1×1
  protocol_activated BOOLEAN NOT NULL DEFAULT FALSE,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar un pedido (guest checkout)
CREATE POLICY "orders_insert_anyone"
  ON public.orders FOR INSERT
  WITH CHECK (TRUE);

-- El cliente autenticado puede ver sus propios pedidos
CREATE POLICY "orders_own_read"
  ON public.orders FOR SELECT
  USING (customer_user_id = auth.uid());

-- Admins ven y modifican todo
CREATE POLICY "orders_admin_all"
  ON public.orders FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- TABLA: order_items
-- Items de cada pedido
-- ============================================================
CREATE TABLE public.order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  TEXT,
  product_name TEXT NOT NULL,
  verse       TEXT,
  unit_price  INTEGER NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  subtotal    INTEGER NOT NULL,
  img_url     TEXT
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_via_order"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (o.customer_user_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "order_items_insert"
  ON public.order_items FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- TABLA: donations
-- Registro Protocolo 1×1 — entrega de prenda a persona en calle
-- ============================================================
CREATE TABLE public.donations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID REFERENCES public.orders(id),
  garment_desc      TEXT,                        -- descripción de la prenda entregada
  delivery_date     DATE,
  delivery_location TEXT,
  photo_url         TEXT,                         -- Supabase Storage: ruah-protocol
  video_url         TEXT,
  email_sent_at     TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Solo admins gestionan donaciones
CREATE POLICY "donations_admin_all"
  ON public.donations FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- TABLA: cuadros_briefs
-- Formularios de encargo de cuadros
-- ============================================================
CREATE TABLE public.cuadros_briefs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  versiculo   TEXT,
  estilo      TEXT,
  formato     TEXT,
  notas       TEXT,
  status      TEXT NOT NULL DEFAULT 'new'
              CHECK (status IN ('new', 'quoted', 'in_progress', 'delivered', 'cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cuadros_briefs ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede enviar un brief (sin autenticación)
CREATE POLICY "briefs_public_insert"
  ON public.cuadros_briefs FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "briefs_admin_all"
  ON public.cuadros_briefs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- TABLA: iglesias_requests
-- Formularios de solicitud para iglesias
-- ============================================================
CREATE TABLE public.iglesias_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  email       TEXT NOT NULL,
  telefono    TEXT,
  iglesia     TEXT,
  evento_tipo TEXT,
  fecha       TEXT,
  cantidad    INTEGER,
  descripcion TEXT,
  status      TEXT NOT NULL DEFAULT 'new'
              CHECK (status IN ('new', 'quoted', 'in_progress', 'delivered', 'cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.iglesias_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "iglesias_public_insert"
  ON public.iglesias_requests FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "iglesias_admin_all"
  ON public.iglesias_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- TABLA: club_members
-- Datos adicionales de miembros del club
-- ============================================================
CREATE TABLE public.club_members (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  routes_joined   TEXT[] DEFAULT '{}',       -- IDs de rutas a las que se anotaron
  bio             TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "club_own_read"
  ON public.club_members FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "club_admin_all"
  ON public.club_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- TABLA: club_routes
-- Rutas de entrega del club
-- ============================================================
CREATE TABLE public.club_routes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  date_time   TIMESTAMPTZ NOT NULL,
  location    TEXT NOT NULL,
  description TEXT,
  max_members INTEGER,
  garments    INTEGER DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'full', 'completed', 'cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.club_routes ENABLE ROW LEVEL SECURITY;

-- Miembros del club pueden ver rutas
CREATE POLICY "routes_club_read"
  ON public.club_routes FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'club_member'))
  );

CREATE POLICY "routes_admin_all"
  ON public.club_routes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- TABLA: club_route_signups
-- Inscripciones a rutas
-- ============================================================
CREATE TABLE public.club_route_signups (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id  UUID NOT NULL REFERENCES public.club_routes(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signed_up_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(route_id, user_id)
);

ALTER TABLE public.club_route_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signups_own"
  ON public.club_route_signups FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "signups_admin"
  ON public.club_route_signups FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- TABLA: club_meetings
-- Reuniones del club
-- ============================================================
CREATE TABLE public.club_meetings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  date_time   TIMESTAMPTZ NOT NULL,
  location    TEXT,
  description TEXT,
  is_online   BOOLEAN DEFAULT FALSE,
  link        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.club_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meetings_club_read"
  ON public.club_meetings FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'club_member')));

CREATE POLICY "meetings_admin_all"
  ON public.club_meetings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_orders_email        ON public.orders(customer_email);
CREATE INDEX idx_orders_status       ON public.orders(payment_status);
CREATE INDEX idx_orders_mp_id        ON public.orders(payment_id);
CREATE INDEX idx_orders_created      ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order   ON public.order_items(order_id);
CREATE INDEX idx_briefs_status       ON public.cuadros_briefs(status);
CREATE INDEX idx_iglesias_status     ON public.iglesias_requests(status);
CREATE INDEX idx_club_routes_date    ON public.club_routes(date_time);
CREATE INDEX idx_signups_route       ON public.club_route_signups(route_id);
CREATE INDEX idx_donations_order     ON public.donations(order_id);

-- ============================================================
-- FUNCIÓN: generar número de pedido
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  v_num TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_num := 'RUAH-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 6));
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_number = v_num) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
