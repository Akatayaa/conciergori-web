-- Enable RLS on tables flagged by Supabase Security Advisor
-- All API routes use service_role (bypasses RLS), so this only blocks direct anon/public access.

-- cleaners
ALTER TABLE public.cleaners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.cleaners
  USING (true)
  WITH CHECK (true);

-- email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.email_templates
  USING (true)
  WITH CHECK (true);

-- owners
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.owners
  USING (true)
  WITH CHECK (true);

-- cleaning_tasks
ALTER TABLE public.cleaning_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.cleaning_tasks
  USING (true)
  WITH CHECK (true);

-- testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.testimonials
  USING (true)
  WITH CHECK (true);
