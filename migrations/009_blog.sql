-- ═══════════════════════════════════════════════════════════════════════════
-- RUAH LABS — Migración 009: Blog / Medio Editorial
-- Ejecutar en: https://supabase.com/dashboard/project/txrpxzsqqomdlnxmyvxn/sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Categorías ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name       TEXT        NOT NULL,
  slug       TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_cat_read"  ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "blog_cat_write" ON public.blog_categories FOR ALL  USING (auth.role() = 'service_role');

-- ── Posts ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id             UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  title          TEXT        NOT NULL,
  subtitle       TEXT,
  slug           TEXT        NOT NULL UNIQUE,
  featured_image TEXT,
  content        TEXT        NOT NULL DEFAULT '',
  category_id    UUID        REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author         TEXT        NOT NULL DEFAULT 'RUAH LABS',
  status         TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  published_at   TIMESTAMPTZ,
  seo_title      TEXT,
  seo_desc       TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_posts_public"  ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "blog_posts_service" ON public.blog_posts FOR ALL   USING (auth.role() = 'service_role');
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx       ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx     ON public.blog_posts (status);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx  ON public.blog_posts (published_at DESC);

-- ── Imágenes de post ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_post_images (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id    UUID        NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  url        TEXT        NOT NULL,
  alt        TEXT        NOT NULL DEFAULT '',
  sort_order INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.blog_post_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_images_read"    ON public.blog_post_images FOR SELECT USING (true);
CREATE POLICY "blog_images_service" ON public.blog_post_images FOR ALL   USING (auth.role() = 'service_role');
CREATE INDEX IF NOT EXISTS blog_images_post_id_idx ON public.blog_post_images (post_id, sort_order);

-- ── Categorías iniciales ─────────────────────────────────────────────────────
INSERT INTO public.blog_categories (name, slug) VALUES
  ('Entrevistas', 'entrevistas'),
  ('Música',      'musica'),
  ('Artistas',    'artistas'),
  ('Eventos',     'eventos'),
  ('Educación',   'educacion'),
  ('Cultura',     'cultura'),
  ('Noticias',    'noticias'),
  ('Lanzamientos','lanzamientos'),
  ('Testimonios', 'testimonios')
ON CONFLICT (slug) DO NOTHING;
