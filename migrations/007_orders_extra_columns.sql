-- Agrega columnas que faltaban en orders para registrar todo el pedido
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS items           JSONB,
  ADD COLUMN IF NOT EXISTS shipping_name   TEXT,
  ADD COLUMN IF NOT EXISTS total_grams     INTEGER,
  ADD COLUMN IF NOT EXISTS weight_cat      TEXT,
  ADD COLUMN IF NOT EXISTS mp_external_ref TEXT;
