-- Ajout des champs Airbnb aux propriétés
ALTER TABLE properties ADD COLUMN IF NOT EXISTS airbnb_id text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS airbnb_url text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS max_guests int DEFAULT 4;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedrooms int DEFAULT 1;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS cover_image text;
