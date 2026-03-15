-- Livret d'accueil par logement
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS wifi_name text,
  ADD COLUMN IF NOT EXISTS wifi_password text,
  ADD COLUMN IF NOT EXISTS welcome_message text,
  ADD COLUMN IF NOT EXISTS checkin_instructions text,
  ADD COLUMN IF NOT EXISTS checkout_instructions text,
  ADD COLUMN IF NOT EXISTS house_rules text,
  ADD COLUMN IF NOT EXISTS local_tips text,
  ADD COLUMN IF NOT EXISTS emergency_contact text;
