-- ============================================================
-- RUAH LABS — Supabase Storage: Buckets y políticas
-- Migración: 002_storage_buckets
-- Ejecutar desde Supabase Dashboard → SQL Editor
-- ============================================================

-- Buckets públicos (imágenes de productos, cuadros, eventos, iglesias, brand)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('ruah-products',  'ruah-products',  TRUE, 5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('ruah-cuadros',   'ruah-cuadros',   TRUE, 5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('ruah-eventos',   'ruah-eventos',   TRUE, 10485760, ARRAY['image/jpeg','image/png','image/webp','video/mp4']),
  ('ruah-iglesias',  'ruah-iglesias',  TRUE, 5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('ruah-brand',     'ruah-brand',     TRUE, 2097152,  ARRAY['image/jpeg','image/png','image/svg+xml','image/webp']),
  ('ruah-club',      'ruah-club',      FALSE, 20971520, ARRAY['image/jpeg','image/png','image/webp','video/mp4']),
  ('ruah-protocol',  'ruah-protocol',  FALSE, 20971520, ARRAY['image/jpeg','image/png','image/webp','video/mp4'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Políticas de Storage: Buckets PÚBLICOS
-- ============================================================

-- ruah-products: lectura pública, escritura solo admin
CREATE POLICY "products_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ruah-products');

CREATE POLICY "products_admin_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ruah-products'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "products_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'ruah-products'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ruah-cuadros: mismo patrón
CREATE POLICY "cuadros_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ruah-cuadros');

CREATE POLICY "cuadros_admin_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ruah-cuadros'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ruah-eventos
CREATE POLICY "eventos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ruah-eventos');

CREATE POLICY "eventos_admin_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ruah-eventos'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ruah-iglesias
CREATE POLICY "iglesias_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ruah-iglesias');

CREATE POLICY "iglesias_admin_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ruah-iglesias'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ruah-brand
CREATE POLICY "brand_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ruah-brand');

CREATE POLICY "brand_admin_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ruah-brand'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- Políticas de Storage: Buckets PRIVADOS
-- ============================================================

-- ruah-club: solo miembros autenticados del club
CREATE POLICY "club_members_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ruah-club'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'club_member'))
  );

CREATE POLICY "club_admin_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ruah-club'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ruah-protocol: solo admins
CREATE POLICY "protocol_admin_only"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'ruah-protocol'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
