-- ============================================================
-- RUAH LABS — Fix: recursión infinita en policies de profiles
-- Migración: 004
-- ============================================================

-- Función SECURITY DEFINER: verifica admin sin disparar RLS en profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- Reemplazar policies que usaban subquery directa a profiles
-- ============================================================

-- content
DROP POLICY IF EXISTS "content_admin_write" ON public.content;
CREATE POLICY "content_admin_write"
  ON public.content FOR ALL
  USING (public.is_admin());

-- profiles (self-referential → era la causa de la recursión)
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- categories
DROP POLICY IF EXISTS "categories_admin_write" ON public.categories;
CREATE POLICY "categories_admin_write"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- products
DROP POLICY IF EXISTS "products_admin_all" ON public.products;
CREATE POLICY "products_admin_all"
  ON public.products FOR ALL
  USING (public.is_admin());

-- discount_codes
DROP POLICY IF EXISTS "discount_admin_all" ON public.discount_codes;
CREATE POLICY "discount_admin_all"
  ON public.discount_codes FOR ALL
  USING (public.is_admin());

-- orders
DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;
CREATE POLICY "orders_admin_all"
  ON public.orders FOR ALL
  USING (public.is_admin());

-- order_items
DROP POLICY IF EXISTS "order_items_via_order" ON public.order_items;
CREATE POLICY "order_items_via_order"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (o.customer_user_id = auth.uid() OR public.is_admin())
    )
  );

-- donations
DROP POLICY IF EXISTS "donations_admin_all" ON public.donations;
CREATE POLICY "donations_admin_all"
  ON public.donations FOR ALL
  USING (public.is_admin());

-- cuadros_briefs
DROP POLICY IF EXISTS "briefs_admin_all" ON public.cuadros_briefs;
CREATE POLICY "briefs_admin_all"
  ON public.cuadros_briefs FOR ALL
  USING (public.is_admin());

-- iglesias_requests
DROP POLICY IF EXISTS "iglesias_admin_all" ON public.iglesias_requests;
CREATE POLICY "iglesias_admin_all"
  ON public.iglesias_requests FOR ALL
  USING (public.is_admin());

-- club_members
DROP POLICY IF EXISTS "club_admin_all" ON public.club_members;
CREATE POLICY "club_admin_all"
  ON public.club_members FOR ALL
  USING (public.is_admin());

-- club_routes
DROP POLICY IF EXISTS "routes_club_read" ON public.club_routes;
CREATE POLICY "routes_club_read"
  ON public.club_routes FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'club_member'))
  );

DROP POLICY IF EXISTS "routes_admin_all" ON public.club_routes;
CREATE POLICY "routes_admin_all"
  ON public.club_routes FOR ALL
  USING (public.is_admin());

-- club_route_signups
DROP POLICY IF EXISTS "signups_admin" ON public.club_route_signups;
CREATE POLICY "signups_admin"
  ON public.club_route_signups FOR ALL
  USING (public.is_admin());

-- club_meetings
DROP POLICY IF EXISTS "meetings_club_read" ON public.club_meetings;
CREATE POLICY "meetings_club_read"
  ON public.club_meetings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'club_member'))
  );

DROP POLICY IF EXISTS "meetings_admin_all" ON public.club_meetings;
CREATE POLICY "meetings_admin_all"
  ON public.club_meetings FOR ALL
  USING (public.is_admin());
