-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Or use extensions.uuid_generate_v4()

-- ==========================================================================
-- User Management and Authentication Tables
-- ==========================================================================

-- Modify existing profiles table to support roles and subscriptions
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'::text CHECK (role IN ('user', 'premium', 'admin')),
ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_status text,
ADD COLUMN IF NOT EXISTS subscription_tier text,
ADD COLUMN IF NOT EXISTS subscription_period text CHECK (subscription_period IN ('monthly', 'annual', NULL)),
ADD COLUMN IF NOT EXISTS subscription_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone;

COMMENT ON COLUMN public.profiles.role IS 'User role: user (free), premium (paid), or admin';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID reference';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Current status of subscription (active, canceled, past_due, etc.)';
COMMENT ON COLUMN public.profiles.subscription_tier IS 'Level of subscription (basic, pro, etc.)';
COMMENT ON COLUMN public.profiles.subscription_period IS 'Billing period (monthly or annual)';

-- Create Stripe Products table
CREATE TABLE IF NOT EXISTS public.products (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    active boolean NOT NULL DEFAULT true,
    metadata jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.products IS 'Products from Stripe (subscription tiers)';

-- Create Stripe Prices table
CREATE TABLE IF NOT EXISTS public.prices (
    id text PRIMARY KEY,
    product_id text NOT NULL REFERENCES public.products(id),
    currency text NOT NULL,
    unit_amount integer NOT NULL,
    interval text CHECK (interval IN ('month', 'year')),
    interval_count integer,
    active boolean NOT NULL DEFAULT true,
    metadata jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.prices IS 'Prices from Stripe for products/subscriptions';

-- Create Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id text PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status text NOT NULL,
    price_id text NOT NULL REFERENCES public.prices(id),
    quantity integer NOT NULL DEFAULT 1,
    cancel_at_period_end boolean NOT NULL DEFAULT false,
    created timestamp with time zone NOT NULL DEFAULT now(),
    current_period_start timestamp with time zone NOT NULL,
    current_period_end timestamp with time zone NOT NULL,
    ended_at timestamp with time zone,
    cancel_at timestamp with time zone,
    canceled_at timestamp with time zone,
    trial_start timestamp with time zone,
    trial_end timestamp with time zone,
    metadata jsonb
);

COMMENT ON TABLE public.subscriptions IS 'Customer subscriptions from Stripe';

-- Create table for tracking Stripe Events
CREATE TABLE IF NOT EXISTS public.stripe_events (
    id text PRIMARY KEY,
    api_version text,
    data jsonb NOT NULL,
    type text NOT NULL,
    created timestamp with time zone NOT NULL DEFAULT now(),
    processed boolean NOT NULL DEFAULT false,
    processing_error text,
    processing_attempts integer NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.stripe_events IS 'Processed Stripe webhook events to prevent duplicates';

-- Setup RLS policies for secure access
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Only authenticated users can access products & prices
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for authenticated users" ON public.products
    FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for authenticated users" ON public.prices
    FOR SELECT USING (auth.role() = 'authenticated');

-- Users can only access their own subscription data
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Only service role can manage stripe events
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only service role can manage" ON public.stripe_events
    USING (auth.role() = 'service_role');

-- Functions to update profile role based on subscription
CREATE OR REPLACE FUNCTION handle_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile with subscription details
  IF (TG_OP = 'INSERT' OR NEW.status != OLD.status) THEN
    UPDATE public.profiles
    SET 
      subscription_status = NEW.status,
      role = CASE 
        WHEN NEW.status = 'active' THEN 'premium'
        WHEN NEW.status = 'trialing' THEN 'premium'
        ELSE 'user' 
      END,
      subscription_start_date = NEW.current_period_start,
      subscription_end_date = NEW.current_period_end
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for subscription status changes
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE OF status ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_subscription_change();

-- ==========================================================================
-- Main Essential Oils Table
-- ==========================================================================
CREATE TABLE public.essential_oils (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    names_concatenated text NOT NULL, -- For quick search/display, consider if needed or generate dynamically
    name_english text NOT NULL,
    name_scientific text NOT NULL,
    name_portuguese text NOT NULL,
    general_description text NULL, -- Added for a brief overview of the oil
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    embedding extensions.vector NULL, -- For vector similarity searches
    CONSTRAINT essential_oils_pkey PRIMARY KEY (id),
    CONSTRAINT essential_oils_name_english_unique UNIQUE (name_english), -- Ensure English names are unique
    CONSTRAINT essential_oils_name_scientific_unique UNIQUE (name_scientific) -- Ensure scientific names are unique
) TABLESPACE pg_default;

COMMENT ON TABLE public.essential_oils IS 'Core table storing fundamental data for each essential oil.';
COMMENT ON COLUMN public.essential_oils.names_concatenated IS 'Concatenated names for quick search or display; review if redundant.';
COMMENT ON COLUMN public.essential_oils.name_english IS 'Common English name of the essential oil.';
COMMENT ON COLUMN public.essential_oils.name_scientific IS 'Scientific (botanical) name of the plant source.';
COMMENT ON COLUMN public.essential_oils.name_portuguese IS 'Common Portuguese name of the essential oil.';
COMMENT ON COLUMN public.essential_oils.general_description IS 'A brief general description or summary of the essential oil.';
COMMENT ON COLUMN public.essential_oils.created_at IS 'Timestamp of when the record was created.';
COMMENT ON COLUMN public.essential_oils.updated_at IS 'Timestamp of when the record was last updated.';
COMMENT ON COLUMN public.essential_oils.embedding IS 'Vector embedding for similarity searches.';

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_essential_oils
BEFORE UPDATE ON public.essential_oils
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();


-- ==========================================================================
-- Lookup Tables (Alphabetical Order)
-- ==========================================================================

-- Lookup table for Aromatic Descriptors
CREATE TABLE public.aromatic_descriptors (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    descriptor text NOT NULL UNIQUE, -- e.g., Sweet, Woody, Citrusy, Floral, Herbaceous
    CONSTRAINT aromatic_descriptors_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

COMMENT ON TABLE public.aromatic_descriptors IS 'Lookup table for aromatic descriptor tags.';
COMMENT ON COLUMN public.aromatic_descriptors.descriptor IS 'The specific aromatic characteristic (e.g., Citrusy).';

-- Lookup table for Categories/Filters
CREATE TABLE public.categories (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL UNIQUE, -- e.g., Calming, Energizing, Skin Health, Respiratory Support
    description text NULL, -- Optional description of the category
    CONSTRAINT categories_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

COMMENT ON TABLE public.categories IS 'Lookup table for descriptive categories or functional filters for oils.';
COMMENT ON COLUMN public.categories.name IS 'The name of the category or filter (e.g., Calming).';

-- Lookup table for Chemical Compounds
CREATE TABLE public.chemical_compounds (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL UNIQUE, -- e.g., Linalool, Limonene, Menthol, Eugenol
    description text NULL, -- Optional: further details about the compound
    CONSTRAINT chemical_compounds_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

COMMENT ON TABLE public.chemical_compounds IS 'Lookup table for chemical compounds found in essential oils.';
COMMENT ON COLUMN public.chemical_compounds.name IS 'Name of the chemical compound (e.g., Linalool).';

-- Lookup table for Countries
CREATE TABLE public.countries (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL UNIQUE,
    iso_code_2 char(2) NULL UNIQUE, -- Optional: ISO 3166-1 alpha-2 country code
    iso_code_3 char(3) NULL UNIQUE, -- Optional: ISO 3166-1 alpha-3 country code
    CONSTRAINT countries_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

COMMENT ON TABLE public.countries IS 'Lookup table for countries, potentially including ISO codes.';
COMMENT ON COLUMN public.countries.name IS 'Common name of the country (e.g., Brazil).';

-- Lookup table for Extraction Methods
CREATE TABLE public.extraction_methods (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL UNIQUE, -- e.g., 'Steam Distillation', 'Cold Press', 'CO2 Extraction', 'Solvent Extraction'
    description text NULL, -- Optional explanation of the method
    CONSTRAINT extraction_methods_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

COMMENT ON TABLE public.extraction_methods IS 'Lookup table defining different methods of essential oil extraction.';
COMMENT ON COLUMN public.extraction_methods.name IS 'The name of the extraction method.';

-- Lookup table for Health Issues
CREATE TABLE public.health_issues (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL UNIQUE, -- e.g., Anxiety, Insomnia, Headache, Skin Irritation, Muscle Pain
    description text NULL, -- Optional description of the health issue
    CONSTRAINT health_issues_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

COMMENT ON TABLE public.health_issues IS 'Lookup table for health issues or conditions that essential oils can address.';
COMMENT ON COLUMN public.health_issues.name IS 'The name of the health issue (e.g., Anxiety).';

-- Lookup table for Plant Parts
CREATE TABLE public.plant_parts (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL UNIQUE, -- e.g., Leaf, Flower, Root, Seed, Resin, Bark, Peel
    description text NULL, -- Optional description of the plant part
    CONSTRAINT plant_parts_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

COMMENT ON TABLE public.plant_parts IS 'Lookup table for plant parts used for extraction.';
COMMENT ON COLUMN public.plant_parts.name IS 'The name of the plant part (e.g., Leaf).';

-- Lookup table for Safety Characteristics
CREATE TABLE public.safety_characteristics (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL UNIQUE, -- e.g., 'Dilution Mandatory', 'Photosensitive', 'Ingestion Safe', 'Avoid During Pregnancy'
    description text NULL, -- Optional explanation of the characteristic
    severity_level smallint NULL, -- Optional: e.g., 1=Info, 2=Caution, 3=Warning
    CONSTRAINT safety_characteristics_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

COMMENT ON TABLE public.safety_characteristics IS 'Lookup table defining different safety characteristics or warnings for essential oils.';
COMMENT ON COLUMN public.safety_characteristics.name IS 'The specific safety characteristic (e.g., Photosensitive).';
COMMENT ON COLUMN public.safety_characteristics.severity_level IS 'Optional numerical indicator of the warning severity.';

-- Lookup table for Usage Modes
CREATE TABLE public.usage_modes (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL UNIQUE, -- e.g., Aromatic, Topical, Internal
    description text NULL, -- Optional description of the usage mode
    icon_svg text NULL, -- Optional: SVG representation for an icon
    CONSTRAINT usage_modes_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

COMMENT ON TABLE public.usage_modes IS 'Lookup table for the different ways an essential oil can be used (e.g., Aromatic, Topical).';
COMMENT ON COLUMN public.usage_modes.name IS 'The name of the usage mode (e.g., Aromatic).';
COMMENT ON COLUMN public.usage_modes.icon_svg IS 'Optional SVG string for displaying an icon for the mode.';


-- ==========================================================================
-- Junction Tables & Related Data Tables (Alphabetical Order)
-- ==========================================================================

-- Junction table for Essential Oils and Aromatic Descriptors (Many-to-Many)
CREATE TABLE public.essential_oil_aromatic_descriptors (
    essential_oil_id uuid NOT NULL,
    descriptor_id uuid NOT NULL,
    CONSTRAINT essential_oil_aromatic_descriptors_pkey PRIMARY KEY (essential_oil_id, descriptor_id),
    CONSTRAINT fk_essential_oil FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils(id) ON DELETE CASCADE,
    CONSTRAINT fk_descriptor FOREIGN KEY (descriptor_id) REFERENCES public.aromatic_descriptors(id) ON DELETE RESTRICT
) TABLESPACE pg_default;

CREATE INDEX idx_essential_oil_aromatic_descriptors_oil ON public.essential_oil_aromatic_descriptors(essential_oil_id);
CREATE INDEX idx_essential_oil_aromatic_descriptors_desc ON public.essential_oil_aromatic_descriptors(descriptor_id);
COMMENT ON TABLE public.essential_oil_aromatic_descriptors IS 'Associates essential oils with their aromatic descriptors (tags).';

-- Junction table for Essential Oils and Categories (Many-to-Many)
CREATE TABLE public.essential_oil_categories (
    essential_oil_id uuid NOT NULL,
    category_id uuid NOT NULL,
    CONSTRAINT essential_oil_categories_pkey PRIMARY KEY (essential_oil_id, category_id),
    CONSTRAINT fk_essential_oil FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils(id) ON DELETE CASCADE,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT
) TABLESPACE pg_default;

CREATE INDEX idx_essential_oil_categories_oil ON public.essential_oil_categories(essential_oil_id);
CREATE INDEX idx_essential_oil_categories_cat ON public.essential_oil_categories(category_id);
COMMENT ON TABLE public.essential_oil_categories IS 'Associates essential oils with their relevant categories/filters.';

-- Junction table for Essential Oils and Chemical Compounds (Many-to-Many with Variance)
CREATE TABLE public.essential_oil_chemical_compounds (
    essential_oil_id uuid NOT NULL,
    compound_id uuid NOT NULL,
    min_percentage NUMERIC(5,2) NULL,
    max_percentage NUMERIC(5,2) NULL,
    typical_percentage NUMERIC(5,2) NULL,
    notes text NULL,
    CONSTRAINT essential_oil_chemical_compounds_pkey PRIMARY KEY (essential_oil_id, compound_id),
    CONSTRAINT fk_essential_oil FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils(id) ON DELETE CASCADE,
    CONSTRAINT fk_compound FOREIGN KEY (compound_id) REFERENCES public.chemical_compounds(id) ON DELETE RESTRICT,
    CONSTRAINT chk_min_max_percentage CHECK (min_percentage IS NULL OR max_percentage IS NULL OR min_percentage <= max_percentage),
    CONSTRAINT chk_min_percentage_range CHECK (min_percentage IS NULL OR (min_percentage >= 0 AND min_percentage <= 100)),
    CONSTRAINT chk_max_percentage_range CHECK (max_percentage IS NULL OR (max_percentage >= 0 AND max_percentage <= 100)),
    CONSTRAINT chk_typical_percentage_range CHECK (typical_percentage IS NULL OR (typical_percentage >= 0 AND typical_percentage <= 100))
) TABLESPACE pg_default;

CREATE INDEX idx_essential_oil_chem_comp_oil ON public.essential_oil_chemical_compounds(essential_oil_id);
CREATE INDEX idx_essential_oil_chem_comp_comp ON public.essential_oil_chemical_compounds(compound_id);
COMMENT ON TABLE public.essential_oil_chemical_compounds IS 'Associates essential oils with their chemical compounds and their typical concentration variance.';
COMMENT ON COLUMN public.essential_oil_chemical_compounds.min_percentage IS 'Minimum typical percentage of the compound in this specific essential oil.';
COMMENT ON COLUMN public.essential_oil_chemical_compounds.max_percentage IS 'Maximum typical percentage of the compound in this specific essential oil.';
COMMENT ON COLUMN public.essential_oil_chemical_compounds.typical_percentage IS 'A general or average percentage, if min/max range is too broad or not always applicable.';
COMMENT ON COLUMN public.essential_oil_chemical_compounds.notes IS 'Specific notes about the compound''s presence or variance in this oil.';

-- Junction table for Essential Oils and Extraction Countries (Many-to-Many)
CREATE TABLE public.essential_oil_extraction_countries (
    essential_oil_id uuid NOT NULL,
    country_id uuid NOT NULL,
    CONSTRAINT essential_oil_extraction_countries_pkey PRIMARY KEY (essential_oil_id, country_id),
    CONSTRAINT fk_essential_oil FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils(id) ON DELETE CASCADE,
    CONSTRAINT fk_country FOREIGN KEY (country_id) REFERENCES public.countries(id) ON DELETE RESTRICT
) TABLESPACE pg_default;

CREATE INDEX idx_essential_oil_ext_countries_oil ON public.essential_oil_extraction_countries(essential_oil_id);
CREATE INDEX idx_essential_oil_ext_countries_ctry ON public.essential_oil_extraction_countries(country_id);
COMMENT ON TABLE public.essential_oil_extraction_countries IS 'Associates essential oils with their multiple extraction countries.';

-- Junction table for Essential Oils and Extraction Methods (Many-to-Many)
CREATE TABLE public.essential_oil_extraction_methods (
    essential_oil_id uuid NOT NULL,
    extraction_method_id uuid NOT NULL,
    CONSTRAINT essential_oil_extraction_methods_pkey PRIMARY KEY (essential_oil_id, extraction_method_id),
    CONSTRAINT fk_essential_oil FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils(id) ON DELETE CASCADE,
    CONSTRAINT fk_extraction_method FOREIGN KEY (extraction_method_id) REFERENCES public.extraction_methods(id) ON DELETE RESTRICT
) TABLESPACE pg_default;

CREATE INDEX idx_essential_oil_ext_methods_oil ON public.essential_oil_extraction_methods(essential_oil_id);
CREATE INDEX idx_essential_oil_ext_methods_meth ON public.essential_oil_extraction_methods(extraction_method_id);
COMMENT ON TABLE public.essential_oil_extraction_methods IS 'Associates essential oils with their extraction methods.';

-- Junction table for Essential Oils and Plant Parts (Many-to-Many)
CREATE TABLE public.essential_oil_plant_parts (
    essential_oil_id uuid NOT NULL,
    plant_part_id uuid NOT NULL,
    CONSTRAINT essential_oil_plant_parts_pkey PRIMARY KEY (essential_oil_id, plant_part_id),
    CONSTRAINT fk_essential_oil FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils(id) ON DELETE CASCADE,
    CONSTRAINT fk_plant_part FOREIGN KEY (plant_part_id) REFERENCES public.plant_parts(id) ON DELETE RESTRICT
) TABLESPACE pg_default;

CREATE INDEX idx_essential_oil_plant_parts_oil ON public.essential_oil_plant_parts(essential_oil_id);
CREATE INDEX idx_essential_oil_plant_parts_part ON public.essential_oil_plant_parts(plant_part_id);
COMMENT ON TABLE public.essential_oil_plant_parts IS 'Associates essential oils with the plant parts they are extracted from.';

-- Junction table for Essential Oils and Safety Characteristics (Many-to-Many)
CREATE TABLE public.essential_oil_safety (
    essential_oil_id uuid NOT NULL,
    safety_characteristic_id uuid NOT NULL,
    notes text NULL,
    CONSTRAINT essential_oil_safety_pkey PRIMARY KEY (essential_oil_id, safety_characteristic_id),
    CONSTRAINT fk_essential_oil FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils(id) ON DELETE CASCADE,
    CONSTRAINT fk_safety_characteristic FOREIGN KEY (safety_characteristic_id) REFERENCES public.safety_characteristics(id) ON DELETE RESTRICT
) TABLESPACE pg_default;

CREATE INDEX idx_essential_oil_safety_oil ON public.essential_oil_safety(essential_oil_id);
CREATE INDEX idx_essential_oil_safety_char ON public.essential_oil_safety(safety_characteristic_id);
COMMENT ON TABLE public.essential_oil_safety IS 'Associates essential oils with applicable safety characteristics.';
COMMENT ON COLUMN public.essential_oil_safety.notes IS 'Optional specific context or notes related to this safety characteristic for this specific oil.';

-- Table for Storing Usage Suggestions for Essential Oils
CREATE TABLE public.essential_oil_usage_suggestions (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    essential_oil_id uuid NOT NULL,
    usage_mode_id uuid NOT NULL,
    suggestion_title text NOT NULL, -- e.g., "Diffuser Blend for Relaxation", "Topical Application for Sore Muscles"
    suggestion_details text NOT NULL, -- Detailed instructions on how to use
    display_order smallint DEFAULT 0, -- For ordering suggestions within a mode for an oil
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT essential_oil_usage_suggestions_pkey PRIMARY KEY (id),
    CONSTRAINT fk_essential_oil FOREIGN KEY (essential_oil_id) REFERENCES public.essential_oils(id) ON DELETE CASCADE,
    CONSTRAINT fk_usage_mode FOREIGN KEY (usage_mode_id) REFERENCES public.usage_modes(id) ON DELETE RESTRICT
) TABLESPACE pg_default;

CREATE INDEX idx_eo_usage_suggestions_oil_mode ON public.essential_oil_usage_suggestions(essential_oil_id, usage_mode_id);
COMMENT ON TABLE public.essential_oil_usage_suggestions IS 'Stores specific usage suggestions for essential oils, categorized by usage mode.';
COMMENT ON COLUMN public.essential_oil_usage_suggestions.suggestion_title IS 'A concise title for the usage suggestion.';
COMMENT ON COLUMN public.essential_oil_usage_suggestions.suggestion_details IS 'Detailed instructions for the usage suggestion.';
COMMENT ON COLUMN public.essential_oil_usage_suggestions.display_order IS 'Controls the order in which suggestions are displayed for an oil within a usage mode.';

CREATE TRIGGER set_timestamp_eo_usage_suggestions
BEFORE UPDATE ON public.essential_oil_usage_suggestions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Junction table for Usage Suggestions and Health Issues (Many-to-Many)
CREATE TABLE public.suggestion_health_issue_links (
    usage_suggestion_id uuid NOT NULL,
    health_issue_id uuid NOT NULL,
    CONSTRAINT suggestion_health_issue_links_pkey PRIMARY KEY (usage_suggestion_id, health_issue_id),
    CONSTRAINT fk_usage_suggestion FOREIGN KEY (usage_suggestion_id) REFERENCES public.essential_oil_usage_suggestions(id) ON DELETE CASCADE,
    CONSTRAINT fk_health_issue FOREIGN KEY (health_issue_id) REFERENCES public.health_issues(id) ON DELETE RESTRICT
) TABLESPACE pg_default;

CREATE INDEX idx_suggestion_health_links_sugg ON public.suggestion_health_issue_links(usage_suggestion_id);
CREATE INDEX idx_suggestion_health_links_issue ON public.suggestion_health_issue_links(health_issue_id);
COMMENT ON TABLE public.suggestion_health_issue_links IS 'Links usage suggestions to the specific health issues they can address.';


-- ==========================================================================
-- End of Schema Definition
-- ==========================================================================

-- Example Data Population (Illustrative - adapt as needed)

-- 1. Populate Lookup Tables first
-- INSERT INTO public.usage_modes (name, description) VALUES
--    ('Aromatic', 'Inhaling essential oils or diffusing them into the air.'),
--    ('Topical', 'Applying essential oils directly to the skin, often diluted.'),
--    ('Internal', 'Ingesting essential oils, typically under expert guidance.');

-- INSERT INTO public.health_issues (name) VALUES
--    ('Agitação'), ('Ansiedade'), ('Autismo / Asperger'), ('Bulimia'), ('Compulsão Alimentar'),
--    ('Depressão'), ('Estresse'), ('Luto'), ('Nervosismo'), ('Palpitações'), ('Insônia');

-- 2. Assume Lavender oil (essential_oil_id = 'lavender-uuid') exists.
--    Assume Aromatic usage mode (usage_mode_id = 'aromatic-mode-uuid') exists.
--    Assume relevant health issue IDs exist (e.g., 'ansiedade-uuid', 'insonia-uuid').

-- 3. Populate essential_oil_usage_suggestions
-- INSERT INTO public.essential_oil_usage_suggestions (essential_oil_id, usage_mode_id, suggestion_title, suggestion_details, display_order)
-- VALUES
--    ('lavender-uuid', 'aromatic-mode-uuid', 'Difusão aromática em colar', 'Pingar 1-2 gotas em um colar difusor, pulseira ou acessório de pedra vulcânica ou feltro.', 1)
--    RETURNING id; -- Let's say this returns 'suggestion1-uuid'

-- INSERT INTO public.essential_oil_usage_suggestions (essential_oil_id, usage_mode_id, suggestion_title, suggestion_details, display_order)
-- VALUES
--    ('lavender-uuid', 'aromatic-mode-uuid', 'Difusor Ultrassônico', 'Para cada 100ml de água, coloque 5 gotas.', 2)
--    RETURNING id; -- Let's say this returns 'suggestion2-uuid'

-- 4. Populate suggestion_health_issue_links
-- For 'Difusão aromática em colar' (suggestion1-uuid)
-- INSERT INTO public.suggestion_health_issue_links (usage_suggestion_id, health_issue_id) VALUES
--    ('suggestion1-uuid', 'ansiedade-uuid'),
--    ('suggestion1-uuid', 'estresse-uuid'),
--    ('suggestion1-uuid', 'nervosismo-uuid');

-- For 'Difusor Ultrassônico' (suggestion2-uuid)
-- INSERT INTO public.suggestion_health_issue_links (usage_suggestion_id, health_issue_id) VALUES
--    ('suggestion2-uuid', 'ansiedade-uuid'),
--    ('suggestion2-uuid', 'insonia-uuid'),
--    ('suggestion2-uuid', 'agitacao-uuid');


-- Example Query to get "How to Use" data for Lavender (Aromatic mode):
/*
SELECT
    um.name AS usage_mode_name,
    eous.suggestion_title,
    eous.suggestion_details,
    STRING_AGG(hi.name, ', ' ORDER BY hi.name) AS related_health_issues
FROM
    public.essential_oils eo
JOIN
    public.essential_oil_usage_suggestions eous ON eo.id = eous.essential_oil_id
JOIN
    public.usage_modes um ON eous.usage_mode_id = um.id
LEFT JOIN
    public.suggestion_health_issue_links shil ON eous.id = shil.usage_suggestion_id
LEFT JOIN
    public.health_issues hi ON shil.health_issue_id = hi.id
WHERE
    eo.name_english = 'Lavender' AND um.name = 'Aromatic' -- Or use IDs
GROUP BY
    um.name, eous.id, eous.suggestion_title, eous.suggestion_details -- eous.id to keep suggestions distinct
ORDER BY
    um.name, eous.display_order, eous.suggestion_title;
*/
