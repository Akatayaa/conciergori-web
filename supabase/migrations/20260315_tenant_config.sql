-- Config étendue des tenants pour SaaS multi-tenant
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS custom_domain text UNIQUE,
  ADD COLUMN IF NOT EXISTS site_name text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS brand_primary text DEFAULT '#0097b2',
  ADD COLUMN IF NOT EXISTS brand_secondary text DEFAULT '#00243f',
  ADD COLUMN IF NOT EXISTS brand_accent text DEFAULT '#fff2e0',
  ADD COLUMN IF NOT EXISTS brand_font_heading text DEFAULT 'Suez One',
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'FR',
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Europe/Paris',
  ADD COLUMN IF NOT EXISTS locale text DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS owner_commission_default int DEFAULT 80;

-- Index pour résolution par domaine (critique pour le middleware)
CREATE INDEX IF NOT EXISTS tenants_custom_domain_idx ON tenants(custom_domain);
CREATE INDEX IF NOT EXISTS tenants_slug_idx ON tenants(slug);
