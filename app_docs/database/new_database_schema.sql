-- Enable UUID generation and vector extension if not already enabled (for PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- As per your existing table

-- -----------------------------------------------------
-- Table eo_internal_use_statuses
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_internal_use_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table eo_dilution_recommendations
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_dilution_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table eo_phototoxicity_statuses
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_phototoxicity_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Modify existing public.essential_oils table
-- -----------------------------------------------------
ALTER TABLE public.essential_oils
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS internal_use_status_id UUID,
ADD COLUMN IF NOT EXISTS dilution_recommendation_id UUID,
ADD COLUMN IF NOT EXISTS phototoxicity_status_id UUID;

-- Add foreign key constraints if they don't already exist
-- (It's harder to check for constraint existence directly in a portable way,
-- so these might error if run twice without dropping constraints first.
-- Consider adding manual checks or error handling if re-running.)

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_essential_oils_internal_use_status' AND conrelid = 'public.essential_oils'::regclass
    ) THEN
        ALTER TABLE public.essential_oils
        ADD CONSTRAINT fk_essential_oils_internal_use_status FOREIGN KEY (internal_use_status_id) 
            REFERENCES eo_internal_use_statuses (id) ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_essential_oils_dilution_recommendation' AND conrelid = 'public.essential_oils'::regclass
    ) THEN
        ALTER TABLE public.essential_oils
        ADD CONSTRAINT fk_essential_oils_dilution_recommendation FOREIGN KEY (dilution_recommendation_id) 
            REFERENCES eo_dilution_recommendations (id) ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_essential_oils_phototoxicity_status' AND conrelid = 'public.essential_oils'::regclass
    ) THEN
        ALTER TABLE public.essential_oils
        ADD CONSTRAINT fk_essential_oils_phototoxicity_status FOREIGN KEY (phototoxicity_status_id) 
            REFERENCES eo_phototoxicity_statuses (id) ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


-- Create indexes for new foreign keys on public.essential_oils
CREATE INDEX IF NOT EXISTS idx_essential_oils_internal_use_status_id ON public.essential_oils (internal_use_status_id);
CREATE INDEX IF NOT EXISTS idx_essential_oils_dilution_recommendation_id ON public.essential_oils (dilution_recommendation_id);
CREATE INDEX IF NOT EXISTS idx_essential_oils_phototoxicity_status_id ON public.essential_oils (phototoxicity_status_id);

-- -----------------------------------------------------
-- Table eo_application_methods
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_application_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table essential_oil_application_methods (Join Table)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS essential_oil_application_methods (
  essential_oil_id UUID NOT NULL,
  application_method_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (essential_oil_id, application_method_id),
  FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (application_method_id) REFERENCES eo_application_methods (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eoam_essential_oil_id ON essential_oil_application_methods (essential_oil_id);
CREATE INDEX IF NOT EXISTS idx_eoam_application_method_id ON essential_oil_application_methods (application_method_id);

-- -----------------------------------------------------
-- Table eo_pets
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table essential_oil_pet_safety (Join Table)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS essential_oil_pet_safety (
  essential_oil_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  safety_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (essential_oil_id, pet_id),
  FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (pet_id) REFERENCES eo_pets (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eops_essential_oil_id ON essential_oil_pet_safety (essential_oil_id);
CREATE INDEX IF NOT EXISTS idx_eops_pet_id ON essential_oil_pet_safety (pet_id);

-- -----------------------------------------------------
-- Table eo_child_safety_age_ranges
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_child_safety_age_ranges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  range_description TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table essential_oil_child_safety (Join Table)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS essential_oil_child_safety (
  essential_oil_id UUID NOT NULL,
  age_range_id UUID NOT NULL,
  safety_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (essential_oil_id, age_range_id),
  FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (age_range_id) REFERENCES eo_child_safety_age_ranges (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eocs_essential_oil_id ON essential_oil_child_safety (essential_oil_id);
CREATE INDEX IF NOT EXISTS idx_eocs_age_range_id ON essential_oil_child_safety (age_range_id);

-- -----------------------------------------------------
-- Table eo_pregnancy_nursing_statuses
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_pregnancy_nursing_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status_description TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table essential_oil_pregnancy_nursing_safety (Join Table)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS essential_oil_pregnancy_nursing_safety (
  essential_oil_id UUID NOT NULL,
  pregnancy_nursing_status_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (essential_oil_id, pregnancy_nursing_status_id),
  FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (pregnancy_nursing_status_id) REFERENCES eo_pregnancy_nursing_statuses (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eopns_essential_oil_id ON essential_oil_pregnancy_nursing_safety (essential_oil_id);
CREATE INDEX IF NOT EXISTS idx_eopns_pregnancy_nursing_status_id ON essential_oil_pregnancy_nursing_safety (pregnancy_nursing_status_id);

-- -----------------------------------------------------
-- Table eo_therapeutic_properties
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_therapeutic_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table essential_oil_therapeutic_properties (Join Table)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS essential_oil_therapeutic_properties (
  essential_oil_id UUID NOT NULL,
  property_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (essential_oil_id, property_id),
  FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (property_id) REFERENCES eo_therapeutic_properties (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eotp_essential_oil_id ON essential_oil_therapeutic_properties (essential_oil_id);
CREATE INDEX IF NOT EXISTS idx_eotp_property_id ON essential_oil_therapeutic_properties (property_id);

-- -----------------------------------------------------
-- Table eo_health_benefits
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_health_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  benefit_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table essential_oil_health_benefits (Join Table)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS essential_oil_health_benefits (
  essential_oil_id UUID NOT NULL,
  health_benefit_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (essential_oil_id, health_benefit_id),
  FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (health_benefit_id) REFERENCES eo_health_benefits (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eohb_essential_oil_id ON essential_oil_health_benefits (essential_oil_id);
CREATE INDEX IF NOT EXISTS idx_eohb_health_benefit_id ON essential_oil_health_benefits (health_benefit_id);

-- -----------------------------------------------------
-- Table eo_energetic_emotional_properties
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_energetic_emotional_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table essential_oil_energetic_emotional_properties (Join Table)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS essential_oil_energetic_emotional_properties (
  essential_oil_id UUID NOT NULL,
  energetic_property_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (essential_oil_id, energetic_property_id),
  FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (energetic_property_id) REFERENCES eo_energetic_emotional_properties (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eoeep_essential_oil_id ON essential_oil_energetic_emotional_properties (essential_oil_id);
CREATE INDEX IF NOT EXISTS idx_eoeep_energetic_property_id ON essential_oil_energetic_emotional_properties (energetic_property_id);

-- -----------------------------------------------------
-- Table eo_chakras
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_chakras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chakra_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table essential_oil_chakra_association (Join Table)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS essential_oil_chakra_association (
  essential_oil_id UUID NOT NULL,
  chakra_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (essential_oil_id, chakra_id),
  FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (chakra_id) REFERENCES eo_chakras (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eoca_essential_oil_id ON essential_oil_chakra_association (essential_oil_id);
CREATE INDEX IF NOT EXISTS idx_eoca_chakra_id ON essential_oil_chakra_association (chakra_id);

-- -----------------------------------------------------
-- Table eo_extraction_methods
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_extraction_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  method_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table essential_oil_extraction_methods (Join Table)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS essential_oil_extraction_methods (
  essential_oil_id UUID NOT NULL,
  extraction_method_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (essential_oil_id, extraction_method_id),
  FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (extraction_method_id) REFERENCES eo_extraction_methods (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eoem_essential_oil_id ON essential_oil_extraction_methods (essential_oil_id);
CREATE INDEX IF NOT EXISTS idx_eoem_extraction_method_id ON essential_oil_extraction_methods (extraction_method_id);

-- -----------------------------------------------------
-- Table eo_countries
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_name TEXT NOT NULL UNIQUE,
  country_code TEXT UNIQUE, 
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table essential_oil_extraction_countries (Join Table)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS essential_oil_extraction_countries (
  essential_oil_id UUID NOT NULL,
  country_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (essential_oil_id, country_id),
  FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (country_id) REFERENCES eo_countries (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eoec_essential_oil_id ON essential_oil_extraction_countries (essential_oil_id);
CREATE INDEX IF NOT EXISTS idx_eoec_country_id ON essential_oil_extraction_countries (country_id);

-- -----------------------------------------------------
-- Table eo_plant_parts
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_plant_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table essential_oil_plant_parts (Join Table)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS essential_oil_plant_parts (
  essential_oil_id UUID NOT NULL,
  plant_part_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (essential_oil_id, plant_part_id),
  FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (plant_part_id) REFERENCES eo_plant_parts (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eopp_essential_oil_id ON essential_oil_plant_parts (essential_oil_id);
CREATE INDEX IF NOT EXISTS idx_eopp_plant_part_id ON essential_oil_plant_parts (plant_part_id);

-- -----------------------------------------------------
-- Table eo_aroma_notes
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_aroma_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_name TEXT NOT NULL UNIQUE, 
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table essential_oil_aroma_notes (Join Table)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS essential_oil_aroma_notes (
  essential_oil_id UUID NOT NULL,
  aroma_note_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (essential_oil_id, aroma_note_id),
  FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (aroma_note_id) REFERENCES eo_aroma_notes (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eoan_essential_oil_id ON essential_oil_aroma_notes (essential_oil_id);
CREATE INDEX IF NOT EXISTS idx_eoan_aroma_note_id ON essential_oil_aroma_notes (aroma_note_id);

-- -----------------------------------------------------
-- Table eo_aroma_scents
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eo_aroma_scents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scent_name TEXT NOT NULL UNIQUE, 
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table essential_oil_aroma_scents (Join Table)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS essential_oil_aroma_scents (
  essential_oil_id UUID NOT NULL,
  scent_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (essential_oil_id, scent_id),
  FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (scent_id) REFERENCES eo_aroma_scents (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eoas_essential_oil_id ON essential_oil_aroma_scents (essential_oil_id);
CREATE INDEX IF NOT EXISTS idx_eoas_scent_id ON essential_oil_aroma_scents (scent_id);

-- -----------------------------------------------------
-- Table usage_instructions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS usage_instructions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  essential_oil_id UUID NOT NULL,
  health_benefit_id UUID NOT NULL,
  application_method_id UUID, 
  instruction_text TEXT NOT NULL,
  dilution_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (essential_oil_id, health_benefit_id, application_method_id),
  FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (health_benefit_id) REFERENCES eo_health_benefits (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (application_method_id) REFERENCES eo_application_methods (id) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ui_essential_oil_id ON usage_instructions (essential_oil_id);
CREATE INDEX IF NOT EXISTS idx_ui_health_benefit_id ON usage_instructions (health_benefit_id);
CREATE INDEX IF NOT EXISTS idx_ui_application_method_id ON usage_instructions (application_method_id);


-- Function to update 'updated_at' column automatically (PostgreSQL specific)
-- This function should be compatible with your existing trigger_set_timestamp()
-- or you can ensure your existing one is used for essential_oils.
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all *newly created* tables that have an 'updated_at' column
DO $$
DECLARE
    t_name TEXT;
    s_name TEXT;
BEGIN
    FOR s_name, t_name IN
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_schema = current_schema() -- or your specific schema
          AND table_type = 'BASE TABLE'
          AND table_name <> 'essential_oils' -- Exclude the already configured table
          AND EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = s_name AND table_name = t_name AND column_name = 'updated_at')
    LOOP
        -- Check if trigger already exists for the table
        IF NOT EXISTS (
            SELECT 1
            FROM pg_trigger
            WHERE tgname = 'set_timestamp_' || t_name  -- A common naming convention for triggers
              AND tgrelid = (s_name || '.' || t_name)::regclass
        ) THEN
            EXECUTE format('CREATE TRIGGER set_timestamp_%I
                            BEFORE UPDATE ON %I.%I
                            FOR EACH ROW
                            EXECUTE FUNCTION public.trigger_set_timestamp();', t_name, s_name, t_name);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMIT;