-- ============================================================
-- Migration: invoice_profiles
-- Profils de facturation pré-configurés par logement
-- À exécuter dans : Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.invoice_profiles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID        NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id   UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL DEFAULT 'Profil par défaut',
  lines       JSONB       NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_profiles_property ON public.invoice_profiles(property_id);
CREATE INDEX IF NOT EXISTS idx_invoice_profiles_tenant   ON public.invoice_profiles(tenant_id);

ALTER TABLE public.invoice_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON public.invoice_profiles
  FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Trigger updated_at (crée la fonction si elle n'existe pas)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_invoice_profiles_updated_at ON public.invoice_profiles;
CREATE TRIGGER trg_invoice_profiles_updated_at
  BEFORE UPDATE ON public.invoice_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE  public.invoice_profiles       IS 'Profils de lignes de facturation pré-configurés par logement';
COMMENT ON COLUMN public.invoice_profiles.lines IS 'Tableau de lignes: [{description, quantity, unit_price}]';

-- ============================================================
-- Données de test : profil Studio Cosy
-- property_id : 8ade99a3-831f-472f-989e-191dbabb60f8
-- tenant_id   : 67b8314e-ce88-467a-9246-cb0558402e34
-- ============================================================
INSERT INTO public.invoice_profiles (property_id, tenant_id, name, lines)
VALUES (
  '8ade99a3-831f-472f-989e-191dbabb60f8',
  '67b8314e-ce88-467a-9246-cb0558402e34',
  'Profil Standard — Studio Cosy',
  '[
    {"description": "Ménage de fin de séjour", "quantity": 1, "unit_price": 45},
    {"description": "Linge de maison (draps + serviettes)", "quantity": 1, "unit_price": 15},
    {"description": "Commission conciergerie (20%)", "quantity": 1, "unit_price": 0}
  ]'::jsonb
);
