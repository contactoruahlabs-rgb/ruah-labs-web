CREATE TABLE IF NOT EXISTS public.club_signups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  route_id    TEXT NOT NULL,
  route_name  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email, route_id)
);
ALTER TABLE public.club_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signups_insert_open" ON public.club_signups FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "signups_own_delete"  ON public.club_signups FOR DELETE USING (TRUE);
CREATE POLICY "signups_admin_read"  ON public.club_signups FOR SELECT USING (public.is_admin());
