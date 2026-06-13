-- ============================================================
-- RUAH LABS — Migración completa (orden corregido)
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. TABLA: profiles  (va PRIMERO — otras tablas la referencian en policies)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'club_member', 'customer')),
  display_name TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_own_read"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

CREATE POLICY "profiles_own_read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'admin'));

-- Trigger: crear profile automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. TABLA: content
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content (
  id         SERIAL PRIMARY KEY,
  key        TEXT UNIQUE NOT NULL DEFAULT 'main',
  data       JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content_public_read"  ON public.content;
DROP POLICY IF EXISTS "content_admin_write"  ON public.content;

CREATE POLICY "content_public_read"
  ON public.content FOR SELECT USING (true);

CREATE POLICY "content_admin_write"
  ON public.content FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 3. TABLA: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_read"  ON public.categories;
DROP POLICY IF EXISTS "categories_admin_write"  ON public.categories;

CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "categories_admin_write"
  ON public.categories FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

INSERT INTO public.categories (id, name, slug, order_index) VALUES
  ('c-all', 'Todo',       'todo',       0),
  ('c1',    'Poleras',    'poleras',    1),
  ('c2',    'Polerones',  'polerones',  2),
  ('c3',    'Chaquetas',  'chaquetas',  3),
  ('c4',    'Gorros',     'gorros',     4),
  ('c5',    'Cuadros',    'cuadros',    5),
  ('c6',    'Accesorios', 'accesorios', 6)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. TABLA: products
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id          TEXT PRIMARY KEY,
  category_id TEXT REFERENCES public.categories(id),
  name        TEXT NOT NULL,
  verse       TEXT,
  price       INTEGER NOT NULL,
  tag         TEXT,
  tag_style   TEXT DEFAULT 'soft',
  description TEXT,
  details     JSONB DEFAULT '[]',
  images      TEXT[] DEFAULT '{}',
  gallery     TEXT[] DEFAULT '{}',
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "products_admin_all"   ON public.products;

CREATE POLICY "products_public_read"
  ON public.products FOR SELECT USING (active = TRUE);

CREATE POLICY "products_admin_all"
  ON public.products FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 5. TABLA: discount_codes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.discount_codes (
  code       TEXT PRIMARY KEY,
  percent    INTEGER NOT NULL CHECK (percent BETWEEN 1 AND 100),
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  max_uses   INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "discount_admin_all" ON public.discount_codes;

CREATE POLICY "discount_admin_all"
  ON public.discount_codes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE OR REPLACE FUNCTION public.verify_discount_code(p_code TEXT)
RETURNS TABLE(valid BOOLEAN, percent INTEGER, message TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_discount public.discount_codes%ROWTYPE;
BEGIN
  SELECT * INTO v_discount FROM public.discount_codes
  WHERE code = UPPER(p_code) AND active = TRUE;
  IF NOT FOUND THEN RETURN QUERY SELECT FALSE, 0, 'Código no válido'::TEXT; RETURN; END IF;
  IF v_discount.expires_at IS NOT NULL AND v_discount.expires_at < NOW() THEN
    RETURN QUERY SELECT FALSE, 0, 'Código expirado'::TEXT; RETURN;
  END IF;
  IF v_discount.max_uses IS NOT NULL AND v_discount.used_count >= v_discount.max_uses THEN
    RETURN QUERY SELECT FALSE, 0, 'Código agotado'::TEXT; RETURN;
  END IF;
  RETURN QUERY SELECT TRUE, v_discount.percent, 'Código válido'::TEXT;
END; $$;

INSERT INTO public.discount_codes (code, percent, active, max_uses) VALUES
  ('BIENVENIDO10', 10, TRUE, NULL)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 6. TABLA: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number       TEXT UNIQUE NOT NULL,
  customer_email     TEXT NOT NULL,
  customer_name      TEXT NOT NULL,
  customer_phone     TEXT,
  customer_user_id   UUID REFERENCES auth.users(id),
  shipping_street    TEXT,
  shipping_number    TEXT,
  shipping_apt       TEXT,
  shipping_city      TEXT,
  shipping_region    TEXT,
  shipping_postal    TEXT,
  shipping_country   TEXT DEFAULT 'Chile',
  shipping_method    TEXT NOT NULL,
  shipping_fee       INTEGER NOT NULL DEFAULT 0,
  subtotal           INTEGER NOT NULL,
  discount_code      TEXT,
  discount_amount    INTEGER NOT NULL DEFAULT 0,
  total              INTEGER NOT NULL,
  payment_method     TEXT NOT NULL,
  payment_status     TEXT NOT NULL DEFAULT 'pending'
                     CHECK (payment_status IN ('pending','paid','failed','refunded','cancelled')),
  payment_id         TEXT,
  mp_preference_id   TEXT,
  paid_at            TIMESTAMPTZ,
  protocol_activated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_insert_anyone" ON public.orders;
DROP POLICY IF EXISTS "orders_own_read"      ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all"     ON public.orders;

CREATE POLICY "orders_insert_anyone" ON public.orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "orders_own_read"      ON public.orders FOR SELECT USING (customer_user_id = auth.uid());
CREATE POLICY "orders_admin_all"     ON public.orders FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 7. TABLA: order_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id   TEXT,
  product_name TEXT NOT NULL,
  verse        TEXT,
  unit_price   INTEGER NOT NULL,
  quantity     INTEGER NOT NULL DEFAULT 1,
  subtotal     INTEGER NOT NULL,
  img_url      TEXT
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_via_order" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert"    ON public.order_items;

CREATE POLICY "order_items_via_order" ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = order_id
    AND (o.customer_user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  ));
CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- 8. TABLA: donations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.donations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID REFERENCES public.orders(id),
  garment_desc      TEXT,
  delivery_date     DATE,
  delivery_location TEXT,
  photo_url         TEXT,
  video_url         TEXT,
  email_sent_at     TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "donations_admin_all" ON public.donations;
CREATE POLICY "donations_admin_all" ON public.donations FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 9. TABLA: cuadros_briefs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cuadros_briefs (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL,
  email     TEXT NOT NULL,
  versiculo TEXT,
  estilo    TEXT,
  formato   TEXT,
  notas     TEXT,
  status    TEXT NOT NULL DEFAULT 'new'
            CHECK (status IN ('new','quoted','in_progress','delivered','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cuadros_briefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "briefs_public_insert" ON public.cuadros_briefs;
DROP POLICY IF EXISTS "briefs_admin_all"     ON public.cuadros_briefs;

CREATE POLICY "briefs_public_insert" ON public.cuadros_briefs FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "briefs_admin_all"     ON public.cuadros_briefs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 10. TABLA: iglesias_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS public.iglesias_requests (
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
              CHECK (status IN ('new','quoted','in_progress','delivered','cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.iglesias_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "iglesias_public_insert" ON public.iglesias_requests;
DROP POLICY IF EXISTS "iglesias_admin_all"     ON public.iglesias_requests;

CREATE POLICY "iglesias_public_insert" ON public.iglesias_requests FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "iglesias_admin_all"     ON public.iglesias_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 11. TABLA: club_members
-- ============================================================
CREATE TABLE IF NOT EXISTS public.club_members (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  routes_joined TEXT[] DEFAULT '{}',
  bio           TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "club_own_read"  ON public.club_members;
DROP POLICY IF EXISTS "club_admin_all" ON public.club_members;

CREATE POLICY "club_own_read"  ON public.club_members FOR SELECT USING (auth.uid() = id);
CREATE POLICY "club_admin_all" ON public.club_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 12. TABLA: club_routes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.club_routes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  date_time   TIMESTAMPTZ NOT NULL,
  location    TEXT NOT NULL,
  description TEXT,
  max_members INTEGER,
  garments    INTEGER DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open','full','completed','cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.club_routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "routes_club_read" ON public.club_routes;
DROP POLICY IF EXISTS "routes_admin_all" ON public.club_routes;

CREATE POLICY "routes_club_read" ON public.club_routes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','club_member')));
CREATE POLICY "routes_admin_all" ON public.club_routes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 13. TABLA: club_route_signups
-- ============================================================
CREATE TABLE IF NOT EXISTS public.club_route_signups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id     UUID NOT NULL REFERENCES public.club_routes(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signed_up_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(route_id, user_id)
);

ALTER TABLE public.club_route_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "signups_own"   ON public.club_route_signups;
DROP POLICY IF EXISTS "signups_admin" ON public.club_route_signups;

CREATE POLICY "signups_own"   ON public.club_route_signups FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "signups_admin" ON public.club_route_signups FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 14. TABLA: club_meetings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.club_meetings (
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

DROP POLICY IF EXISTS "meetings_club_read" ON public.club_meetings;
DROP POLICY IF EXISTS "meetings_admin_all" ON public.club_meetings;

CREATE POLICY "meetings_club_read" ON public.club_meetings FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','club_member')));
CREATE POLICY "meetings_admin_all" ON public.club_meetings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_email      ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_mp_id      ON public.orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_created    ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_briefs_status     ON public.cuadros_briefs(status);
CREATE INDEX IF NOT EXISTS idx_iglesias_status   ON public.iglesias_requests(status);
CREATE INDEX IF NOT EXISTS idx_club_routes_date  ON public.club_routes(date_time);
CREATE INDEX IF NOT EXISTS idx_signups_route     ON public.club_route_signups(route_id);
CREATE INDEX IF NOT EXISTS idx_donations_order   ON public.donations(order_id);

-- ============================================================
-- FUNCIONES UTILITARIAS
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE v_num TEXT; v_exists BOOLEAN;
BEGIN
  LOOP
    v_num := 'RUAH-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 6));
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_number = v_num) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_num;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.increment_discount_usage(p_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.discount_codes SET used_count = used_count + 1 WHERE code = UPPER(p_code);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================
DROP TRIGGER IF EXISTS orders_updated_at   ON public.orders;
DROP TRIGGER IF EXISTS content_updated_at  ON public.content;
DROP TRIGGER IF EXISTS products_updated_at ON public.products;

CREATE TRIGGER orders_updated_at   BEFORE UPDATE ON public.orders   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER content_updated_at  BEFORE UPDATE ON public.content  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('ruah-products', 'ruah-products', TRUE,  5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('ruah-cuadros',  'ruah-cuadros',  TRUE,  5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('ruah-eventos',  'ruah-eventos',  TRUE,  10485760, ARRAY['image/jpeg','image/png','image/webp','video/mp4']),
  ('ruah-iglesias', 'ruah-iglesias', TRUE,  5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('ruah-brand',    'ruah-brand',    TRUE,  2097152,  ARRAY['image/jpeg','image/png','image/svg+xml','image/webp']),
  ('ruah-club',     'ruah-club',     FALSE, 20971520, ARRAY['image/jpeg','image/png','image/webp','video/mp4']),
  ('ruah-protocol', 'ruah-protocol', FALSE, 20971520, ARRAY['image/jpeg','image/png','image/webp','video/mp4'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "products_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "products_admin_write"  ON storage.objects;
DROP POLICY IF EXISTS "products_admin_delete" ON storage.objects;
DROP POLICY IF EXISTS "cuadros_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "cuadros_admin_write"   ON storage.objects;
DROP POLICY IF EXISTS "eventos_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "eventos_admin_write"   ON storage.objects;
DROP POLICY IF EXISTS "iglesias_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "iglesias_admin_write"  ON storage.objects;
DROP POLICY IF EXISTS "brand_public_read"     ON storage.objects;
DROP POLICY IF EXISTS "brand_admin_write"     ON storage.objects;
DROP POLICY IF EXISTS "club_members_read"     ON storage.objects;
DROP POLICY IF EXISTS "club_admin_write"      ON storage.objects;
DROP POLICY IF EXISTS "protocol_admin_only"   ON storage.objects;

CREATE POLICY "products_public_read"  ON storage.objects FOR SELECT USING (bucket_id = 'ruah-products');
CREATE POLICY "products_admin_write"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ruah-products' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "products_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'ruah-products' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "cuadros_public_read"   ON storage.objects FOR SELECT USING (bucket_id = 'ruah-cuadros');
CREATE POLICY "cuadros_admin_write"   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ruah-cuadros' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "eventos_public_read"   ON storage.objects FOR SELECT USING (bucket_id = 'ruah-eventos');
CREATE POLICY "eventos_admin_write"   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ruah-eventos' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "iglesias_public_read"  ON storage.objects FOR SELECT USING (bucket_id = 'ruah-iglesias');
CREATE POLICY "iglesias_admin_write"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ruah-iglesias' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "brand_public_read"     ON storage.objects FOR SELECT USING (bucket_id = 'ruah-brand');
CREATE POLICY "brand_admin_write"     ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ruah-brand' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "club_members_read"     ON storage.objects FOR SELECT USING (bucket_id = 'ruah-club' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','club_member')));
CREATE POLICY "club_admin_write"      ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ruah-club' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "protocol_admin_only"   ON storage.objects FOR ALL USING (bucket_id = 'ruah-protocol' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
