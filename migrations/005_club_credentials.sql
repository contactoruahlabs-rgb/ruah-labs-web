-- ============================================================
-- RUAH LABS — Club: credenciales individuales + log de accesos
-- Migración: 005
-- ============================================================

-- Tabla de credenciales del club (independiente de auth.users)
CREATE TABLE IF NOT EXISTS public.club_credentials (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  email               TEXT NOT NULL UNIQUE,
  password_hash       TEXT NOT NULL,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at       TIMESTAMPTZ,
  notes               TEXT
);

ALTER TABLE public.club_credentials ENABLE ROW LEVEL SECURITY;

-- Solo el admin puede ver y gestionar credenciales
CREATE POLICY "club_creds_admin_all"
  ON public.club_credentials FOR ALL
  USING (public.is_admin());

-- Tabla de log de accesos al club
CREATE TABLE IF NOT EXISTS public.club_access_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('login_ok', 'login_fail', 'password_changed', 'logout')),
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.club_access_log ENABLE ROW LEVEL SECURITY;

-- Insert abierto desde el servidor (via service role), lectura solo admin
CREATE POLICY "access_log_admin_read"
  ON public.club_access_log FOR SELECT
  USING (public.is_admin());
