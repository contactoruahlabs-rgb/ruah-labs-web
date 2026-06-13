-- ============================================================
-- RUAH LABS — Función para incrementar uso de descuento
-- Migración: 003
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_discount_usage(p_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.discount_codes
  SET used_count = used_count + 1
  WHERE code = UPPER(p_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
