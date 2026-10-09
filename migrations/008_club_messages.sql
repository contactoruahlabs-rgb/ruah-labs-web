-- RUAH LABS — Migración 008: mensajes del canal NOS CUIDAMOS
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.club_messages (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  email      TEXT        NOT NULL,
  name       TEXT        NOT NULL,
  body       TEXT        NOT NULL CHECK (char_length(body) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.club_messages ENABLE ROW LEVEL SECURITY;

-- Lectura pública (solo miembros autenticados llegan a esta pantalla)
CREATE POLICY "club_messages_read"
  ON public.club_messages FOR SELECT USING (true);

-- Inserción solo vía service role (el servidor verifica credenciales antes)
-- No crear policy de INSERT anon — el API server usa SB_SVC para insertar.

-- Índice para paginación por fecha
CREATE INDEX IF NOT EXISTS club_messages_created_at_idx
  ON public.club_messages (created_at DESC);
