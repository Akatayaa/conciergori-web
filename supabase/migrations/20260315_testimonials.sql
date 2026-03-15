CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_location text,
  text text NOT NULL,
  rating int DEFAULT 5,
  visible boolean DEFAULT true,
  source text DEFAULT 'direct',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS testimonials_tenant_idx ON testimonials(tenant_id, visible);
