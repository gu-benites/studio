create extension if not exists "vector" with schema "extensions";


create extension if not exists "pg_net" with schema "public" version '0.14.0';

create table "public"."aromatic_descriptors" (
    "id" uuid not null default uuid_generate_v4(),
    "descriptor" text not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."aromatic_descriptors" enable row level security;

create table "public"."categories" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."categories" enable row level security;

create table "public"."chemical_compounds" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default now(),
    "bubble_uid" text,
    "pubchem_compound_id" text,
    "carbon_structure" text
);


alter table "public"."chemical_compounds" enable row level security;

create table "public"."countries" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "iso_code_2" character(2),
    "iso_code_3" character(3),
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."countries" enable row level security;

create table "public"."essential_oil_aromatic_descriptors" (
    "essential_oil_id" uuid not null,
    "descriptor_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."essential_oil_aromatic_descriptors" enable row level security;

create table "public"."essential_oil_categories" (
    "essential_oil_id" uuid not null,
    "category_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."essential_oil_categories" enable row level security;

create table "public"."essential_oil_chemical_compounds" (
    "essential_oil_id" uuid not null,
    "chemical_compound_id" uuid not null,
    "min_percentage" numeric(5,4),
    "max_percentage" numeric(5,4),
    "typical_percentage" numeric(5,4),
    "notes" text,
    "created_at" timestamp with time zone not null default now(),
    "percentage_range" numrange
);


alter table "public"."essential_oil_chemical_compounds" enable row level security;

create table "public"."essential_oil_extraction_countries" (
    "essential_oil_id" uuid not null,
    "country_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."essential_oil_extraction_countries" enable row level security;

create table "public"."essential_oil_extraction_methods" (
    "essential_oil_id" uuid not null,
    "extraction_method_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."essential_oil_extraction_methods" enable row level security;

create table "public"."essential_oil_plant_parts" (
    "essential_oil_id" uuid not null,
    "plant_part_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."essential_oil_plant_parts" enable row level security;

create table "public"."essential_oil_safety" (
    "id" uuid not null default uuid_generate_v4(),
    "essential_oil_id" uuid not null,
    "safety_characteristic_id" uuid not null,
    "notes" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."essential_oil_safety" enable row level security;

create table "public"."essential_oil_usage_suggestions" (
    "id" uuid not null default uuid_generate_v4(),
    "essential_oil_id" uuid not null,
    "usage_mode_id" uuid not null,
    "suggestion_title" text not null,
    "suggestion_details" text not null,
    "display_order" smallint default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."essential_oil_usage_suggestions" enable row level security;

create table "public"."essential_oils" (
    "id" uuid not null default uuid_generate_v4(),
    "name_english" text not null,
    "name_scientific" text not null,
    "name_portuguese" text not null,
    "general_description" text,
    "names_concatenated" text generated always as (((((name_english || ' '::text) || name_scientific) || ' '::text) || name_portuguese)) stored,
    "embedding" vector(1536),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "bubble_uid" text
);


alter table "public"."essential_oils" enable row level security;

create table "public"."extraction_methods" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default now(),
    "bubble_uid" text
);


alter table "public"."extraction_methods" enable row level security;

create table "public"."health_issues" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."health_issues" enable row level security;

create table "public"."plant_parts" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default now(),
    "bubble_uid" text
);


alter table "public"."plant_parts" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "first_name" text,
    "last_name" text,
    "gender" text,
    "age_category" text,
    "specific_age" integer,
    "language" text default 'en'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "avatar_url" text,
    "role" text not null default 'user'::text,
    "stripe_customer_id" text,
    "subscription_status" text,
    "subscription_tier" text,
    "subscription_period" text,
    "subscription_start_date" timestamp with time zone,
    "subscription_end_date" timestamp with time zone
);


alter table "public"."profiles" enable row level security;

create table "public"."safety_characteristics" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "severity_level" smallint,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."safety_characteristics" enable row level security;

create table "public"."suggestion_health_issue_links" (
    "usage_suggestion_id" uuid not null,
    "health_issue_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."suggestion_health_issue_links" enable row level security;

create table "public"."usage_modes" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "icon_svg" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."usage_modes" enable row level security;

CREATE UNIQUE INDEX aromatic_descriptors_descriptor_key ON public.aromatic_descriptors USING btree (descriptor);

CREATE UNIQUE INDEX aromatic_descriptors_pkey ON public.aromatic_descriptors USING btree (id);

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE UNIQUE INDEX chemical_compounds_name_key ON public.chemical_compounds USING btree (name);

CREATE UNIQUE INDEX chemical_compounds_pkey ON public.chemical_compounds USING btree (id);

CREATE UNIQUE INDEX countries_iso_code_2_key ON public.countries USING btree (iso_code_2);

CREATE UNIQUE INDEX countries_iso_code_3_key ON public.countries USING btree (iso_code_3);

CREATE UNIQUE INDEX countries_name_key ON public.countries USING btree (name);

CREATE UNIQUE INDEX countries_pkey ON public.countries USING btree (id);

CREATE UNIQUE INDEX essential_oil_aromatic_descriptors_pkey ON public.essential_oil_aromatic_descriptors USING btree (essential_oil_id, descriptor_id);

CREATE UNIQUE INDEX essential_oil_categories_pkey ON public.essential_oil_categories USING btree (essential_oil_id, category_id);

CREATE UNIQUE INDEX essential_oil_chemical_compounds_pkey ON public.essential_oil_chemical_compounds USING btree (essential_oil_id, chemical_compound_id);

CREATE UNIQUE INDEX essential_oil_extraction_countries_pkey ON public.essential_oil_extraction_countries USING btree (essential_oil_id, country_id);

CREATE UNIQUE INDEX essential_oil_extraction_methods_pkey ON public.essential_oil_extraction_methods USING btree (essential_oil_id, extraction_method_id);

CREATE UNIQUE INDEX essential_oil_plant_parts_pkey ON public.essential_oil_plant_parts USING btree (essential_oil_id, plant_part_id);

CREATE UNIQUE INDEX essential_oil_safety_pkey ON public.essential_oil_safety USING btree (essential_oil_id, safety_characteristic_id);

CREATE UNIQUE INDEX essential_oil_usage_suggestions_pkey ON public.essential_oil_usage_suggestions USING btree (id);

CREATE INDEX essential_oils_embedding_idx ON public.essential_oils USING ivfflat (embedding vector_cosine_ops) WITH (lists='100');

CREATE UNIQUE INDEX essential_oils_name_english_unique ON public.essential_oils USING btree (name_english);

CREATE UNIQUE INDEX essential_oils_pkey ON public.essential_oils USING btree (id);

CREATE UNIQUE INDEX extraction_methods_name_key ON public.extraction_methods USING btree (name);

CREATE UNIQUE INDEX extraction_methods_pkey ON public.extraction_methods USING btree (id);

CREATE UNIQUE INDEX health_issues_name_key ON public.health_issues USING btree (name);

CREATE UNIQUE INDEX health_issues_pkey ON public.health_issues USING btree (id);

CREATE INDEX idx_eo_usage_suggestions_oil_mode ON public.essential_oil_usage_suggestions USING btree (essential_oil_id, usage_mode_id);

CREATE INDEX idx_essential_oil_aromatic_descriptors_desc ON public.essential_oil_aromatic_descriptors USING btree (descriptor_id);

CREATE INDEX idx_essential_oil_aromatic_descriptors_oil ON public.essential_oil_aromatic_descriptors USING btree (essential_oil_id);

CREATE INDEX idx_essential_oil_categories_cat ON public.essential_oil_categories USING btree (category_id);

CREATE INDEX idx_essential_oil_categories_oil ON public.essential_oil_categories USING btree (essential_oil_id);

CREATE INDEX idx_essential_oil_chem_comp_comp ON public.essential_oil_chemical_compounds USING btree (chemical_compound_id);

CREATE INDEX idx_essential_oil_chem_comp_oil ON public.essential_oil_chemical_compounds USING btree (essential_oil_id);

CREATE INDEX idx_essential_oil_ext_countries_ctry ON public.essential_oil_extraction_countries USING btree (country_id);

CREATE INDEX idx_essential_oil_ext_countries_oil ON public.essential_oil_extraction_countries USING btree (essential_oil_id);

CREATE INDEX idx_essential_oil_ext_methods_meth ON public.essential_oil_extraction_methods USING btree (extraction_method_id);

CREATE INDEX idx_essential_oil_ext_methods_oil ON public.essential_oil_extraction_methods USING btree (essential_oil_id);

CREATE INDEX idx_essential_oil_plant_parts_oil ON public.essential_oil_plant_parts USING btree (essential_oil_id);

CREATE INDEX idx_essential_oil_plant_parts_part ON public.essential_oil_plant_parts USING btree (plant_part_id);

CREATE INDEX idx_essential_oil_safety_char ON public.essential_oil_safety USING btree (safety_characteristic_id);

CREATE INDEX idx_essential_oil_safety_oil ON public.essential_oil_safety USING btree (essential_oil_id);

CREATE INDEX idx_suggestion_health_links_issue ON public.suggestion_health_issue_links USING btree (health_issue_id);

CREATE INDEX idx_suggestion_health_links_sugg ON public.suggestion_health_issue_links USING btree (usage_suggestion_id);

CREATE UNIQUE INDEX plant_parts_name_key ON public.plant_parts USING btree (name);

CREATE UNIQUE INDEX plant_parts_pkey ON public.plant_parts USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_stripe_customer_id_key ON public.profiles USING btree (stripe_customer_id);

CREATE UNIQUE INDEX safety_characteristics_name_key ON public.safety_characteristics USING btree (name);

CREATE UNIQUE INDEX safety_characteristics_pkey ON public.safety_characteristics USING btree (id);

CREATE UNIQUE INDEX suggestion_health_issue_links_pkey ON public.suggestion_health_issue_links USING btree (usage_suggestion_id, health_issue_id);

CREATE UNIQUE INDEX usage_modes_name_key ON public.usage_modes USING btree (name);

CREATE UNIQUE INDEX usage_modes_pkey ON public.usage_modes USING btree (id);

alter table "public"."aromatic_descriptors" add constraint "aromatic_descriptors_pkey" PRIMARY KEY using index "aromatic_descriptors_pkey";

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."chemical_compounds" add constraint "chemical_compounds_pkey" PRIMARY KEY using index "chemical_compounds_pkey";

alter table "public"."countries" add constraint "countries_pkey" PRIMARY KEY using index "countries_pkey";

alter table "public"."essential_oil_aromatic_descriptors" add constraint "essential_oil_aromatic_descriptors_pkey" PRIMARY KEY using index "essential_oil_aromatic_descriptors_pkey";

alter table "public"."essential_oil_categories" add constraint "essential_oil_categories_pkey" PRIMARY KEY using index "essential_oil_categories_pkey";

alter table "public"."essential_oil_chemical_compounds" add constraint "essential_oil_chemical_compounds_pkey" PRIMARY KEY using index "essential_oil_chemical_compounds_pkey";

alter table "public"."essential_oil_extraction_countries" add constraint "essential_oil_extraction_countries_pkey" PRIMARY KEY using index "essential_oil_extraction_countries_pkey";

alter table "public"."essential_oil_extraction_methods" add constraint "essential_oil_extraction_methods_pkey" PRIMARY KEY using index "essential_oil_extraction_methods_pkey";

alter table "public"."essential_oil_plant_parts" add constraint "essential_oil_plant_parts_pkey" PRIMARY KEY using index "essential_oil_plant_parts_pkey";

alter table "public"."essential_oil_safety" add constraint "essential_oil_safety_pkey" PRIMARY KEY using index "essential_oil_safety_pkey";

alter table "public"."essential_oil_usage_suggestions" add constraint "essential_oil_usage_suggestions_pkey" PRIMARY KEY using index "essential_oil_usage_suggestions_pkey";

alter table "public"."essential_oils" add constraint "essential_oils_pkey" PRIMARY KEY using index "essential_oils_pkey";

alter table "public"."extraction_methods" add constraint "extraction_methods_pkey" PRIMARY KEY using index "extraction_methods_pkey";

alter table "public"."health_issues" add constraint "health_issues_pkey" PRIMARY KEY using index "health_issues_pkey";

alter table "public"."plant_parts" add constraint "plant_parts_pkey" PRIMARY KEY using index "plant_parts_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."safety_characteristics" add constraint "safety_characteristics_pkey" PRIMARY KEY using index "safety_characteristics_pkey";

alter table "public"."suggestion_health_issue_links" add constraint "suggestion_health_issue_links_pkey" PRIMARY KEY using index "suggestion_health_issue_links_pkey";

alter table "public"."usage_modes" add constraint "usage_modes_pkey" PRIMARY KEY using index "usage_modes_pkey";

alter table "public"."aromatic_descriptors" add constraint "aromatic_descriptors_descriptor_key" UNIQUE using index "aromatic_descriptors_descriptor_key";

alter table "public"."categories" add constraint "categories_name_key" UNIQUE using index "categories_name_key";

alter table "public"."chemical_compounds" add constraint "chemical_compounds_name_key" UNIQUE using index "chemical_compounds_name_key";

alter table "public"."countries" add constraint "countries_iso_code_2_key" UNIQUE using index "countries_iso_code_2_key";

alter table "public"."countries" add constraint "countries_iso_code_3_key" UNIQUE using index "countries_iso_code_3_key";

alter table "public"."countries" add constraint "countries_name_key" UNIQUE using index "countries_name_key";

alter table "public"."essential_oil_aromatic_descriptors" add constraint "essential_oil_aromatic_descriptors_descriptor_id_fkey" FOREIGN KEY (descriptor_id) REFERENCES aromatic_descriptors(id) ON DELETE RESTRICT not valid;

alter table "public"."essential_oil_aromatic_descriptors" validate constraint "essential_oil_aromatic_descriptors_descriptor_id_fkey";

alter table "public"."essential_oil_aromatic_descriptors" add constraint "essential_oil_aromatic_descriptors_essential_oil_id_fkey" FOREIGN KEY (essential_oil_id) REFERENCES essential_oils(id) ON DELETE CASCADE not valid;

alter table "public"."essential_oil_aromatic_descriptors" validate constraint "essential_oil_aromatic_descriptors_essential_oil_id_fkey";

alter table "public"."essential_oil_categories" add constraint "essential_oil_categories_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT not valid;

alter table "public"."essential_oil_categories" validate constraint "essential_oil_categories_category_id_fkey";

alter table "public"."essential_oil_categories" add constraint "essential_oil_categories_essential_oil_id_fkey" FOREIGN KEY (essential_oil_id) REFERENCES essential_oils(id) ON DELETE CASCADE not valid;

alter table "public"."essential_oil_categories" validate constraint "essential_oil_categories_essential_oil_id_fkey";

alter table "public"."essential_oil_chemical_compounds" add constraint "chk_max_percentage_range" CHECK (((max_percentage IS NULL) OR ((max_percentage >= (0)::numeric) AND (max_percentage <= (1)::numeric)))) not valid;

alter table "public"."essential_oil_chemical_compounds" validate constraint "chk_max_percentage_range";

alter table "public"."essential_oil_chemical_compounds" add constraint "chk_min_max_percentage" CHECK (((min_percentage IS NULL) OR (max_percentage IS NULL) OR (min_percentage <= max_percentage))) not valid;

alter table "public"."essential_oil_chemical_compounds" validate constraint "chk_min_max_percentage";

alter table "public"."essential_oil_chemical_compounds" add constraint "chk_min_percentage_range" CHECK (((min_percentage IS NULL) OR ((min_percentage >= (0)::numeric) AND (min_percentage <= (1)::numeric)))) not valid;

alter table "public"."essential_oil_chemical_compounds" validate constraint "chk_min_percentage_range";

alter table "public"."essential_oil_chemical_compounds" add constraint "chk_percentage_range" CHECK (((percentage_range IS NULL) OR ((lower(percentage_range) >= (0)::numeric) AND (upper(percentage_range) <= (1)::numeric) AND (lower(percentage_range) <= upper(percentage_range))))) not valid;

alter table "public"."essential_oil_chemical_compounds" validate constraint "chk_percentage_range";

alter table "public"."essential_oil_chemical_compounds" add constraint "chk_typical_percentage_range" CHECK (((typical_percentage IS NULL) OR ((typical_percentage >= (0)::numeric) AND (typical_percentage <= (1)::numeric)))) not valid;

alter table "public"."essential_oil_chemical_compounds" validate constraint "chk_typical_percentage_range";

alter table "public"."essential_oil_chemical_compounds" add constraint "essential_oil_chemical_compounds_chemical_compound_id_fkey" FOREIGN KEY (chemical_compound_id) REFERENCES chemical_compounds(id) ON DELETE RESTRICT not valid;

alter table "public"."essential_oil_chemical_compounds" validate constraint "essential_oil_chemical_compounds_chemical_compound_id_fkey";

alter table "public"."essential_oil_chemical_compounds" add constraint "essential_oil_chemical_compounds_essential_oil_id_fkey" FOREIGN KEY (essential_oil_id) REFERENCES essential_oils(id) ON DELETE CASCADE not valid;

alter table "public"."essential_oil_chemical_compounds" validate constraint "essential_oil_chemical_compounds_essential_oil_id_fkey";

alter table "public"."essential_oil_extraction_countries" add constraint "essential_oil_extraction_countries_country_id_fkey" FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE RESTRICT not valid;

alter table "public"."essential_oil_extraction_countries" validate constraint "essential_oil_extraction_countries_country_id_fkey";

alter table "public"."essential_oil_extraction_countries" add constraint "essential_oil_extraction_countries_essential_oil_id_fkey" FOREIGN KEY (essential_oil_id) REFERENCES essential_oils(id) ON DELETE CASCADE not valid;

alter table "public"."essential_oil_extraction_countries" validate constraint "essential_oil_extraction_countries_essential_oil_id_fkey";

alter table "public"."essential_oil_extraction_methods" add constraint "essential_oil_extraction_methods_essential_oil_id_fkey" FOREIGN KEY (essential_oil_id) REFERENCES essential_oils(id) ON DELETE CASCADE not valid;

alter table "public"."essential_oil_extraction_methods" validate constraint "essential_oil_extraction_methods_essential_oil_id_fkey";

alter table "public"."essential_oil_extraction_methods" add constraint "essential_oil_extraction_methods_extraction_method_id_fkey" FOREIGN KEY (extraction_method_id) REFERENCES extraction_methods(id) ON DELETE RESTRICT not valid;

alter table "public"."essential_oil_extraction_methods" validate constraint "essential_oil_extraction_methods_extraction_method_id_fkey";

alter table "public"."essential_oil_plant_parts" add constraint "essential_oil_plant_parts_essential_oil_id_fkey" FOREIGN KEY (essential_oil_id) REFERENCES essential_oils(id) ON DELETE CASCADE not valid;

alter table "public"."essential_oil_plant_parts" validate constraint "essential_oil_plant_parts_essential_oil_id_fkey";

alter table "public"."essential_oil_plant_parts" add constraint "essential_oil_plant_parts_plant_part_id_fkey" FOREIGN KEY (plant_part_id) REFERENCES plant_parts(id) ON DELETE RESTRICT not valid;

alter table "public"."essential_oil_plant_parts" validate constraint "essential_oil_plant_parts_plant_part_id_fkey";

alter table "public"."essential_oil_safety" add constraint "essential_oil_safety_essential_oil_id_fkey" FOREIGN KEY (essential_oil_id) REFERENCES essential_oils(id) ON DELETE CASCADE not valid;

alter table "public"."essential_oil_safety" validate constraint "essential_oil_safety_essential_oil_id_fkey";

alter table "public"."essential_oil_safety" add constraint "essential_oil_safety_safety_characteristic_id_fkey" FOREIGN KEY (safety_characteristic_id) REFERENCES safety_characteristics(id) ON DELETE RESTRICT not valid;

alter table "public"."essential_oil_safety" validate constraint "essential_oil_safety_safety_characteristic_id_fkey";

alter table "public"."essential_oil_usage_suggestions" add constraint "essential_oil_usage_suggestions_essential_oil_id_fkey" FOREIGN KEY (essential_oil_id) REFERENCES essential_oils(id) ON DELETE CASCADE not valid;

alter table "public"."essential_oil_usage_suggestions" validate constraint "essential_oil_usage_suggestions_essential_oil_id_fkey";

alter table "public"."essential_oil_usage_suggestions" add constraint "essential_oil_usage_suggestions_usage_mode_id_fkey" FOREIGN KEY (usage_mode_id) REFERENCES usage_modes(id) ON DELETE RESTRICT not valid;

alter table "public"."essential_oil_usage_suggestions" validate constraint "essential_oil_usage_suggestions_usage_mode_id_fkey";

alter table "public"."essential_oils" add constraint "essential_oils_name_english_unique" UNIQUE using index "essential_oils_name_english_unique";

alter table "public"."extraction_methods" add constraint "extraction_methods_name_key" UNIQUE using index "extraction_methods_name_key";

alter table "public"."health_issues" add constraint "health_issues_name_key" UNIQUE using index "health_issues_name_key";

alter table "public"."plant_parts" add constraint "plant_parts_name_key" UNIQUE using index "plant_parts_name_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['user'::text, 'premium'::text, 'admin'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

alter table "public"."profiles" add constraint "profiles_stripe_customer_id_key" UNIQUE using index "profiles_stripe_customer_id_key";

alter table "public"."profiles" add constraint "profiles_subscription_period_check" CHECK ((subscription_period = ANY (ARRAY['monthly'::text, 'annual'::text, NULL::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_subscription_period_check";

alter table "public"."safety_characteristics" add constraint "safety_characteristics_name_key" UNIQUE using index "safety_characteristics_name_key";

alter table "public"."suggestion_health_issue_links" add constraint "suggestion_health_issue_links_health_issue_id_fkey" FOREIGN KEY (health_issue_id) REFERENCES health_issues(id) ON DELETE RESTRICT not valid;

alter table "public"."suggestion_health_issue_links" validate constraint "suggestion_health_issue_links_health_issue_id_fkey";

alter table "public"."suggestion_health_issue_links" add constraint "suggestion_health_issue_links_usage_suggestion_id_fkey" FOREIGN KEY (usage_suggestion_id) REFERENCES essential_oil_usage_suggestions(id) ON DELETE CASCADE not valid;

alter table "public"."suggestion_health_issue_links" validate constraint "suggestion_health_issue_links_usage_suggestion_id_fkey";

alter table "public"."usage_modes" add constraint "usage_modes_name_key" UNIQUE using index "usage_modes_name_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.match_essential_oils(query_embedding vector, match_threshold double precision DEFAULT 0.3, match_count integer DEFAULT 10)
 RETURNS TABLE(id uuid, name_english text, name_scientific text, name_portuguese text, general_description text, similarity double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    eo.id,
    eo.name_english,
    eo.name_scientific,
    eo.name_portuguese,
    eo.general_description,
    1 - (eo.embedding <=> query_embedding) AS similarity
  FROM
    public.essential_oils eo
  WHERE
    eo.embedding IS NOT NULL
    AND 1 - (eo.embedding <=> query_embedding) > match_threshold
  ORDER BY
    eo.embedding <=> query_embedding
  LIMIT
    match_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_essential_oils(query_text text, match_threshold double precision DEFAULT 0.3, match_count integer DEFAULT 10)
 RETURNS TABLE(id uuid, name_english text, name_scientific text, name_portuguese text, general_description text, similarity double precision)
 LANGUAGE plpgsql
AS $function$
DECLARE 
  embedding_vector vector(1536);
  openai_key TEXT;
BEGIN
  -- Get the OpenAI API key from Supabase secrets
  SELECT current_setting('app.settings.openai_key', true) INTO openai_key;
  
  IF openai_key IS NULL THEN
    RAISE EXCEPTION 'OpenAI API key not configured. Contact your administrator.';
  END IF;

  -- Use the OpenAI embeddings API directly
  WITH openai_response AS (
    SELECT
      content AS embedding_json
    FROM
      http((
        'POST',
        'https://api.openai.com/v1/embeddings',
        ARRAY[
          ('Content-Type', 'application/json'),
          ('Authorization', 'Bearer ' || openai_key)
        ],
        'application/json',
        JSON_BUILD_OBJECT(
          'model', 'text-embedding-3-small',
          'input', query_text
        )::text
      ))
    WHERE
      status_code = 200
  ),
  parsed_embedding AS (
    SELECT
      ARRAY(
        SELECT
          CAST(value AS FLOAT)
        FROM
          JSON_ARRAY_ELEMENTS_TEXT(
            (JSON_EXTRACT_PATH(embedding_json::json, 'data', '0', 'embedding')::json)
          )
      ) AS embedding
    FROM
      openai_response
  )
  SELECT
    embedding::vector(1536) INTO embedding_vector
  FROM
    parsed_embedding;

  -- Return the matching essential oils
  RETURN QUERY
  SELECT
    eo.id,
    eo.name_english,
    eo.name_scientific,
    eo.name_portuguese,
    eo.general_description,
    1 - (eo.embedding <=> embedding_vector) AS similarity
  FROM
    public.essential_oils eo
  WHERE
    eo.embedding IS NOT NULL
    AND 1 - (eo.embedding <=> embedding_vector) > match_threshold
  ORDER BY
    similarity DESC
  LIMIT
    match_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trigger_generate_oil_embedding()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$DECLARE
  function_url TEXT := 'https://iutxzpzbznbgpkdwbzds.supabase.co/functions/v1/generate-oil-embedding';
  supabase_anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dHh6cHpiem5iZ3BrZHdiemRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjI5NjgsImV4cCI6MjA2MjM5ODk2OH0.I6T_fihYCViheL2cCqUGU-al2ZvU5DBOvLcawGrGoOg';
  http_response_status INT;
  http_response_body JSONB;
  start_time TIMESTAMPTZ;
  names_changed BOOLEAN;
BEGIN
  -- Check if any of the name fields have changed
  IF TG_OP = 'INSERT' THEN
    names_changed := TRUE; -- For new records, always generate embedding
  ELSIF TG_OP = 'UPDATE' THEN
    names_changed := (OLD.name_english != NEW.name_english) OR 
                     (OLD.name_scientific != NEW.name_scientific) OR 
                     (OLD.name_portuguese != NEW.name_portuguese);
    
    -- If none of the name fields changed, skip the embedding generation
    IF NOT names_changed THEN
      RAISE LOG 'AROMACHAT No name fields changed for oil ID: %, skipping embedding generation', NEW.id;
      RETURN NEW;
    END IF;
  END IF;

  -- Generate concatenated name
  NEW.names_concatenated := NEW.name_english || ' | ' || NEW.name_scientific || ' | ' || NEW.name_portuguese;
  RAISE LOG 'AROMACHAT names_concatenated gerado: %', NEW.names_concatenated;

  -- Start timestamp
  start_time := clock_timestamp();
  RAISE LOG 'AROMACHAT Iniciando geração de embedding para óleo ID: %, timestamp: %', NEW.id, start_time;

  -- Check for API key
  IF supabase_anon_key IS NULL OR supabase_anon_key = '' THEN
    RAISE WARNING 'AROMACHAT Chave de serviço do Supabase não encontrada ou vazia';
    RETURN NEW;
  END IF;

  -- HTTP POST call to Edge Function
  BEGIN
    -- Perform HTTP POST request to the Edge function
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_anon_key
      ),
      body := jsonb_build_object(
        'id', NEW.id,
        'operation_type', TG_OP
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Handle errors in the HTTP request
    RAISE WARNING 'AROMACHAT Erro ao chamar função de Edge para óleo ID: %. Detalhes: %, SQL State: %', 
      NEW.id, SQLERRM, SQLSTATE;
  END;

  -- Log detailed execution time and result after HTTP request
  RAISE LOG 'AROMACHAT Resultado da geração de embedding para óleo ID: % - Tempo de execução: % ms',
    NEW.id, extract(epoch from (clock_timestamp() - start_time)) * 1000;

  -- Log success or failure based on HTTP response status
  IF http_response_status BETWEEN 200 AND 299 THEN
    RAISE LOG 'AROMACHAT Embedding gerado com sucesso para óleo ID: %. Resposta: %', NEW.id, http_response_body;
  ELSE
    RAISE WARNING 'AROMACHAT Falha na resposta da função de embedding para óleo ID: %. Status: %, Resposta: %', 
      NEW.id, http_response_status, http_response_body;
  END IF;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'AROMACHAT Erro ao gerar embedding para óleo ID: %. Detalhes: %, SQL State: %', 
    NEW.id, SQLERRM, SQLSTATE;

  RETURN NULL;
END;$function$
;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_names_concatenated()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  NEW.names_concatenated :=
    NEW.name_english || ' | ' ||
    NEW.name_scientific || ' | ' ||
    NEW.name_portuguese;

  RAISE LOG 'AROMACHAT names_concatenated generated: %', NEW.names_concatenated;

  RETURN NEW;
END;$function$
;

grant delete on table "public"."aromatic_descriptors" to "anon";

grant insert on table "public"."aromatic_descriptors" to "anon";

grant references on table "public"."aromatic_descriptors" to "anon";

grant select on table "public"."aromatic_descriptors" to "anon";

grant trigger on table "public"."aromatic_descriptors" to "anon";

grant truncate on table "public"."aromatic_descriptors" to "anon";

grant update on table "public"."aromatic_descriptors" to "anon";

grant delete on table "public"."aromatic_descriptors" to "authenticated";

grant insert on table "public"."aromatic_descriptors" to "authenticated";

grant references on table "public"."aromatic_descriptors" to "authenticated";

grant select on table "public"."aromatic_descriptors" to "authenticated";

grant trigger on table "public"."aromatic_descriptors" to "authenticated";

grant truncate on table "public"."aromatic_descriptors" to "authenticated";

grant update on table "public"."aromatic_descriptors" to "authenticated";

grant delete on table "public"."aromatic_descriptors" to "service_role";

grant insert on table "public"."aromatic_descriptors" to "service_role";

grant references on table "public"."aromatic_descriptors" to "service_role";

grant select on table "public"."aromatic_descriptors" to "service_role";

grant trigger on table "public"."aromatic_descriptors" to "service_role";

grant truncate on table "public"."aromatic_descriptors" to "service_role";

grant update on table "public"."aromatic_descriptors" to "service_role";

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."chemical_compounds" to "anon";

grant insert on table "public"."chemical_compounds" to "anon";

grant references on table "public"."chemical_compounds" to "anon";

grant select on table "public"."chemical_compounds" to "anon";

grant trigger on table "public"."chemical_compounds" to "anon";

grant truncate on table "public"."chemical_compounds" to "anon";

grant update on table "public"."chemical_compounds" to "anon";

grant delete on table "public"."chemical_compounds" to "authenticated";

grant insert on table "public"."chemical_compounds" to "authenticated";

grant references on table "public"."chemical_compounds" to "authenticated";

grant select on table "public"."chemical_compounds" to "authenticated";

grant trigger on table "public"."chemical_compounds" to "authenticated";

grant truncate on table "public"."chemical_compounds" to "authenticated";

grant update on table "public"."chemical_compounds" to "authenticated";

grant delete on table "public"."chemical_compounds" to "service_role";

grant insert on table "public"."chemical_compounds" to "service_role";

grant references on table "public"."chemical_compounds" to "service_role";

grant select on table "public"."chemical_compounds" to "service_role";

grant trigger on table "public"."chemical_compounds" to "service_role";

grant truncate on table "public"."chemical_compounds" to "service_role";

grant update on table "public"."chemical_compounds" to "service_role";

grant delete on table "public"."countries" to "anon";

grant insert on table "public"."countries" to "anon";

grant references on table "public"."countries" to "anon";

grant select on table "public"."countries" to "anon";

grant trigger on table "public"."countries" to "anon";

grant truncate on table "public"."countries" to "anon";

grant update on table "public"."countries" to "anon";

grant delete on table "public"."countries" to "authenticated";

grant insert on table "public"."countries" to "authenticated";

grant references on table "public"."countries" to "authenticated";

grant select on table "public"."countries" to "authenticated";

grant trigger on table "public"."countries" to "authenticated";

grant truncate on table "public"."countries" to "authenticated";

grant update on table "public"."countries" to "authenticated";

grant delete on table "public"."countries" to "service_role";

grant insert on table "public"."countries" to "service_role";

grant references on table "public"."countries" to "service_role";

grant select on table "public"."countries" to "service_role";

grant trigger on table "public"."countries" to "service_role";

grant truncate on table "public"."countries" to "service_role";

grant update on table "public"."countries" to "service_role";

grant delete on table "public"."essential_oil_aromatic_descriptors" to "anon";

grant insert on table "public"."essential_oil_aromatic_descriptors" to "anon";

grant references on table "public"."essential_oil_aromatic_descriptors" to "anon";

grant select on table "public"."essential_oil_aromatic_descriptors" to "anon";

grant trigger on table "public"."essential_oil_aromatic_descriptors" to "anon";

grant truncate on table "public"."essential_oil_aromatic_descriptors" to "anon";

grant update on table "public"."essential_oil_aromatic_descriptors" to "anon";

grant delete on table "public"."essential_oil_aromatic_descriptors" to "authenticated";

grant insert on table "public"."essential_oil_aromatic_descriptors" to "authenticated";

grant references on table "public"."essential_oil_aromatic_descriptors" to "authenticated";

grant select on table "public"."essential_oil_aromatic_descriptors" to "authenticated";

grant trigger on table "public"."essential_oil_aromatic_descriptors" to "authenticated";

grant truncate on table "public"."essential_oil_aromatic_descriptors" to "authenticated";

grant update on table "public"."essential_oil_aromatic_descriptors" to "authenticated";

grant delete on table "public"."essential_oil_aromatic_descriptors" to "service_role";

grant insert on table "public"."essential_oil_aromatic_descriptors" to "service_role";

grant references on table "public"."essential_oil_aromatic_descriptors" to "service_role";

grant select on table "public"."essential_oil_aromatic_descriptors" to "service_role";

grant trigger on table "public"."essential_oil_aromatic_descriptors" to "service_role";

grant truncate on table "public"."essential_oil_aromatic_descriptors" to "service_role";

grant update on table "public"."essential_oil_aromatic_descriptors" to "service_role";

grant delete on table "public"."essential_oil_categories" to "anon";

grant insert on table "public"."essential_oil_categories" to "anon";

grant references on table "public"."essential_oil_categories" to "anon";

grant select on table "public"."essential_oil_categories" to "anon";

grant trigger on table "public"."essential_oil_categories" to "anon";

grant truncate on table "public"."essential_oil_categories" to "anon";

grant update on table "public"."essential_oil_categories" to "anon";

grant delete on table "public"."essential_oil_categories" to "authenticated";

grant insert on table "public"."essential_oil_categories" to "authenticated";

grant references on table "public"."essential_oil_categories" to "authenticated";

grant select on table "public"."essential_oil_categories" to "authenticated";

grant trigger on table "public"."essential_oil_categories" to "authenticated";

grant truncate on table "public"."essential_oil_categories" to "authenticated";

grant update on table "public"."essential_oil_categories" to "authenticated";

grant delete on table "public"."essential_oil_categories" to "service_role";

grant insert on table "public"."essential_oil_categories" to "service_role";

grant references on table "public"."essential_oil_categories" to "service_role";

grant select on table "public"."essential_oil_categories" to "service_role";

grant trigger on table "public"."essential_oil_categories" to "service_role";

grant truncate on table "public"."essential_oil_categories" to "service_role";

grant update on table "public"."essential_oil_categories" to "service_role";

grant delete on table "public"."essential_oil_chemical_compounds" to "anon";

grant insert on table "public"."essential_oil_chemical_compounds" to "anon";

grant references on table "public"."essential_oil_chemical_compounds" to "anon";

grant select on table "public"."essential_oil_chemical_compounds" to "anon";

grant trigger on table "public"."essential_oil_chemical_compounds" to "anon";

grant truncate on table "public"."essential_oil_chemical_compounds" to "anon";

grant update on table "public"."essential_oil_chemical_compounds" to "anon";

grant delete on table "public"."essential_oil_chemical_compounds" to "authenticated";

grant insert on table "public"."essential_oil_chemical_compounds" to "authenticated";

grant references on table "public"."essential_oil_chemical_compounds" to "authenticated";

grant select on table "public"."essential_oil_chemical_compounds" to "authenticated";

grant trigger on table "public"."essential_oil_chemical_compounds" to "authenticated";

grant truncate on table "public"."essential_oil_chemical_compounds" to "authenticated";

grant update on table "public"."essential_oil_chemical_compounds" to "authenticated";

grant delete on table "public"."essential_oil_chemical_compounds" to "service_role";

grant insert on table "public"."essential_oil_chemical_compounds" to "service_role";

grant references on table "public"."essential_oil_chemical_compounds" to "service_role";

grant select on table "public"."essential_oil_chemical_compounds" to "service_role";

grant trigger on table "public"."essential_oil_chemical_compounds" to "service_role";

grant truncate on table "public"."essential_oil_chemical_compounds" to "service_role";

grant update on table "public"."essential_oil_chemical_compounds" to "service_role";

grant delete on table "public"."essential_oil_extraction_countries" to "anon";

grant insert on table "public"."essential_oil_extraction_countries" to "anon";

grant references on table "public"."essential_oil_extraction_countries" to "anon";

grant select on table "public"."essential_oil_extraction_countries" to "anon";

grant trigger on table "public"."essential_oil_extraction_countries" to "anon";

grant truncate on table "public"."essential_oil_extraction_countries" to "anon";

grant update on table "public"."essential_oil_extraction_countries" to "anon";

grant delete on table "public"."essential_oil_extraction_countries" to "authenticated";

grant insert on table "public"."essential_oil_extraction_countries" to "authenticated";

grant references on table "public"."essential_oil_extraction_countries" to "authenticated";

grant select on table "public"."essential_oil_extraction_countries" to "authenticated";

grant trigger on table "public"."essential_oil_extraction_countries" to "authenticated";

grant truncate on table "public"."essential_oil_extraction_countries" to "authenticated";

grant update on table "public"."essential_oil_extraction_countries" to "authenticated";

grant delete on table "public"."essential_oil_extraction_countries" to "service_role";

grant insert on table "public"."essential_oil_extraction_countries" to "service_role";

grant references on table "public"."essential_oil_extraction_countries" to "service_role";

grant select on table "public"."essential_oil_extraction_countries" to "service_role";

grant trigger on table "public"."essential_oil_extraction_countries" to "service_role";

grant truncate on table "public"."essential_oil_extraction_countries" to "service_role";

grant update on table "public"."essential_oil_extraction_countries" to "service_role";

grant delete on table "public"."essential_oil_extraction_methods" to "anon";

grant insert on table "public"."essential_oil_extraction_methods" to "anon";

grant references on table "public"."essential_oil_extraction_methods" to "anon";

grant select on table "public"."essential_oil_extraction_methods" to "anon";

grant trigger on table "public"."essential_oil_extraction_methods" to "anon";

grant truncate on table "public"."essential_oil_extraction_methods" to "anon";

grant update on table "public"."essential_oil_extraction_methods" to "anon";

grant delete on table "public"."essential_oil_extraction_methods" to "authenticated";

grant insert on table "public"."essential_oil_extraction_methods" to "authenticated";

grant references on table "public"."essential_oil_extraction_methods" to "authenticated";

grant select on table "public"."essential_oil_extraction_methods" to "authenticated";

grant trigger on table "public"."essential_oil_extraction_methods" to "authenticated";

grant truncate on table "public"."essential_oil_extraction_methods" to "authenticated";

grant update on table "public"."essential_oil_extraction_methods" to "authenticated";

grant delete on table "public"."essential_oil_extraction_methods" to "service_role";

grant insert on table "public"."essential_oil_extraction_methods" to "service_role";

grant references on table "public"."essential_oil_extraction_methods" to "service_role";

grant select on table "public"."essential_oil_extraction_methods" to "service_role";

grant trigger on table "public"."essential_oil_extraction_methods" to "service_role";

grant truncate on table "public"."essential_oil_extraction_methods" to "service_role";

grant update on table "public"."essential_oil_extraction_methods" to "service_role";

grant delete on table "public"."essential_oil_plant_parts" to "anon";

grant insert on table "public"."essential_oil_plant_parts" to "anon";

grant references on table "public"."essential_oil_plant_parts" to "anon";

grant select on table "public"."essential_oil_plant_parts" to "anon";

grant trigger on table "public"."essential_oil_plant_parts" to "anon";

grant truncate on table "public"."essential_oil_plant_parts" to "anon";

grant update on table "public"."essential_oil_plant_parts" to "anon";

grant delete on table "public"."essential_oil_plant_parts" to "authenticated";

grant insert on table "public"."essential_oil_plant_parts" to "authenticated";

grant references on table "public"."essential_oil_plant_parts" to "authenticated";

grant select on table "public"."essential_oil_plant_parts" to "authenticated";

grant trigger on table "public"."essential_oil_plant_parts" to "authenticated";

grant truncate on table "public"."essential_oil_plant_parts" to "authenticated";

grant update on table "public"."essential_oil_plant_parts" to "authenticated";

grant delete on table "public"."essential_oil_plant_parts" to "service_role";

grant insert on table "public"."essential_oil_plant_parts" to "service_role";

grant references on table "public"."essential_oil_plant_parts" to "service_role";

grant select on table "public"."essential_oil_plant_parts" to "service_role";

grant trigger on table "public"."essential_oil_plant_parts" to "service_role";

grant truncate on table "public"."essential_oil_plant_parts" to "service_role";

grant update on table "public"."essential_oil_plant_parts" to "service_role";

grant delete on table "public"."essential_oil_safety" to "anon";

grant insert on table "public"."essential_oil_safety" to "anon";

grant references on table "public"."essential_oil_safety" to "anon";

grant select on table "public"."essential_oil_safety" to "anon";

grant trigger on table "public"."essential_oil_safety" to "anon";

grant truncate on table "public"."essential_oil_safety" to "anon";

grant update on table "public"."essential_oil_safety" to "anon";

grant delete on table "public"."essential_oil_safety" to "authenticated";

grant insert on table "public"."essential_oil_safety" to "authenticated";

grant references on table "public"."essential_oil_safety" to "authenticated";

grant select on table "public"."essential_oil_safety" to "authenticated";

grant trigger on table "public"."essential_oil_safety" to "authenticated";

grant truncate on table "public"."essential_oil_safety" to "authenticated";

grant update on table "public"."essential_oil_safety" to "authenticated";

grant delete on table "public"."essential_oil_safety" to "service_role";

grant insert on table "public"."essential_oil_safety" to "service_role";

grant references on table "public"."essential_oil_safety" to "service_role";

grant select on table "public"."essential_oil_safety" to "service_role";

grant trigger on table "public"."essential_oil_safety" to "service_role";

grant truncate on table "public"."essential_oil_safety" to "service_role";

grant update on table "public"."essential_oil_safety" to "service_role";

grant delete on table "public"."essential_oil_usage_suggestions" to "anon";

grant insert on table "public"."essential_oil_usage_suggestions" to "anon";

grant references on table "public"."essential_oil_usage_suggestions" to "anon";

grant select on table "public"."essential_oil_usage_suggestions" to "anon";

grant trigger on table "public"."essential_oil_usage_suggestions" to "anon";

grant truncate on table "public"."essential_oil_usage_suggestions" to "anon";

grant update on table "public"."essential_oil_usage_suggestions" to "anon";

grant delete on table "public"."essential_oil_usage_suggestions" to "authenticated";

grant insert on table "public"."essential_oil_usage_suggestions" to "authenticated";

grant references on table "public"."essential_oil_usage_suggestions" to "authenticated";

grant select on table "public"."essential_oil_usage_suggestions" to "authenticated";

grant trigger on table "public"."essential_oil_usage_suggestions" to "authenticated";

grant truncate on table "public"."essential_oil_usage_suggestions" to "authenticated";

grant update on table "public"."essential_oil_usage_suggestions" to "authenticated";

grant delete on table "public"."essential_oil_usage_suggestions" to "service_role";

grant insert on table "public"."essential_oil_usage_suggestions" to "service_role";

grant references on table "public"."essential_oil_usage_suggestions" to "service_role";

grant select on table "public"."essential_oil_usage_suggestions" to "service_role";

grant trigger on table "public"."essential_oil_usage_suggestions" to "service_role";

grant truncate on table "public"."essential_oil_usage_suggestions" to "service_role";

grant update on table "public"."essential_oil_usage_suggestions" to "service_role";

grant delete on table "public"."essential_oils" to "anon";

grant insert on table "public"."essential_oils" to "anon";

grant references on table "public"."essential_oils" to "anon";

grant select on table "public"."essential_oils" to "anon";

grant trigger on table "public"."essential_oils" to "anon";

grant truncate on table "public"."essential_oils" to "anon";

grant update on table "public"."essential_oils" to "anon";

grant delete on table "public"."essential_oils" to "authenticated";

grant insert on table "public"."essential_oils" to "authenticated";

grant references on table "public"."essential_oils" to "authenticated";

grant select on table "public"."essential_oils" to "authenticated";

grant trigger on table "public"."essential_oils" to "authenticated";

grant truncate on table "public"."essential_oils" to "authenticated";

grant update on table "public"."essential_oils" to "authenticated";

grant delete on table "public"."essential_oils" to "service_role";

grant insert on table "public"."essential_oils" to "service_role";

grant references on table "public"."essential_oils" to "service_role";

grant select on table "public"."essential_oils" to "service_role";

grant trigger on table "public"."essential_oils" to "service_role";

grant truncate on table "public"."essential_oils" to "service_role";

grant update on table "public"."essential_oils" to "service_role";

grant delete on table "public"."extraction_methods" to "anon";

grant insert on table "public"."extraction_methods" to "anon";

grant references on table "public"."extraction_methods" to "anon";

grant select on table "public"."extraction_methods" to "anon";

grant trigger on table "public"."extraction_methods" to "anon";

grant truncate on table "public"."extraction_methods" to "anon";

grant update on table "public"."extraction_methods" to "anon";

grant delete on table "public"."extraction_methods" to "authenticated";

grant insert on table "public"."extraction_methods" to "authenticated";

grant references on table "public"."extraction_methods" to "authenticated";

grant select on table "public"."extraction_methods" to "authenticated";

grant trigger on table "public"."extraction_methods" to "authenticated";

grant truncate on table "public"."extraction_methods" to "authenticated";

grant update on table "public"."extraction_methods" to "authenticated";

grant delete on table "public"."extraction_methods" to "service_role";

grant insert on table "public"."extraction_methods" to "service_role";

grant references on table "public"."extraction_methods" to "service_role";

grant select on table "public"."extraction_methods" to "service_role";

grant trigger on table "public"."extraction_methods" to "service_role";

grant truncate on table "public"."extraction_methods" to "service_role";

grant update on table "public"."extraction_methods" to "service_role";

grant delete on table "public"."health_issues" to "anon";

grant insert on table "public"."health_issues" to "anon";

grant references on table "public"."health_issues" to "anon";

grant select on table "public"."health_issues" to "anon";

grant trigger on table "public"."health_issues" to "anon";

grant truncate on table "public"."health_issues" to "anon";

grant update on table "public"."health_issues" to "anon";

grant delete on table "public"."health_issues" to "authenticated";

grant insert on table "public"."health_issues" to "authenticated";

grant references on table "public"."health_issues" to "authenticated";

grant select on table "public"."health_issues" to "authenticated";

grant trigger on table "public"."health_issues" to "authenticated";

grant truncate on table "public"."health_issues" to "authenticated";

grant update on table "public"."health_issues" to "authenticated";

grant delete on table "public"."health_issues" to "service_role";

grant insert on table "public"."health_issues" to "service_role";

grant references on table "public"."health_issues" to "service_role";

grant select on table "public"."health_issues" to "service_role";

grant trigger on table "public"."health_issues" to "service_role";

grant truncate on table "public"."health_issues" to "service_role";

grant update on table "public"."health_issues" to "service_role";

grant delete on table "public"."plant_parts" to "anon";

grant insert on table "public"."plant_parts" to "anon";

grant references on table "public"."plant_parts" to "anon";

grant select on table "public"."plant_parts" to "anon";

grant trigger on table "public"."plant_parts" to "anon";

grant truncate on table "public"."plant_parts" to "anon";

grant update on table "public"."plant_parts" to "anon";

grant delete on table "public"."plant_parts" to "authenticated";

grant insert on table "public"."plant_parts" to "authenticated";

grant references on table "public"."plant_parts" to "authenticated";

grant select on table "public"."plant_parts" to "authenticated";

grant trigger on table "public"."plant_parts" to "authenticated";

grant truncate on table "public"."plant_parts" to "authenticated";

grant update on table "public"."plant_parts" to "authenticated";

grant delete on table "public"."plant_parts" to "service_role";

grant insert on table "public"."plant_parts" to "service_role";

grant references on table "public"."plant_parts" to "service_role";

grant select on table "public"."plant_parts" to "service_role";

grant trigger on table "public"."plant_parts" to "service_role";

grant truncate on table "public"."plant_parts" to "service_role";

grant update on table "public"."plant_parts" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."safety_characteristics" to "anon";

grant insert on table "public"."safety_characteristics" to "anon";

grant references on table "public"."safety_characteristics" to "anon";

grant select on table "public"."safety_characteristics" to "anon";

grant trigger on table "public"."safety_characteristics" to "anon";

grant truncate on table "public"."safety_characteristics" to "anon";

grant update on table "public"."safety_characteristics" to "anon";

grant delete on table "public"."safety_characteristics" to "authenticated";

grant insert on table "public"."safety_characteristics" to "authenticated";

grant references on table "public"."safety_characteristics" to "authenticated";

grant select on table "public"."safety_characteristics" to "authenticated";

grant trigger on table "public"."safety_characteristics" to "authenticated";

grant truncate on table "public"."safety_characteristics" to "authenticated";

grant update on table "public"."safety_characteristics" to "authenticated";

grant delete on table "public"."safety_characteristics" to "service_role";

grant insert on table "public"."safety_characteristics" to "service_role";

grant references on table "public"."safety_characteristics" to "service_role";

grant select on table "public"."safety_characteristics" to "service_role";

grant trigger on table "public"."safety_characteristics" to "service_role";

grant truncate on table "public"."safety_characteristics" to "service_role";

grant update on table "public"."safety_characteristics" to "service_role";

grant delete on table "public"."suggestion_health_issue_links" to "anon";

grant insert on table "public"."suggestion_health_issue_links" to "anon";

grant references on table "public"."suggestion_health_issue_links" to "anon";

grant select on table "public"."suggestion_health_issue_links" to "anon";

grant trigger on table "public"."suggestion_health_issue_links" to "anon";

grant truncate on table "public"."suggestion_health_issue_links" to "anon";

grant update on table "public"."suggestion_health_issue_links" to "anon";

grant delete on table "public"."suggestion_health_issue_links" to "authenticated";

grant insert on table "public"."suggestion_health_issue_links" to "authenticated";

grant references on table "public"."suggestion_health_issue_links" to "authenticated";

grant select on table "public"."suggestion_health_issue_links" to "authenticated";

grant trigger on table "public"."suggestion_health_issue_links" to "authenticated";

grant truncate on table "public"."suggestion_health_issue_links" to "authenticated";

grant update on table "public"."suggestion_health_issue_links" to "authenticated";

grant delete on table "public"."suggestion_health_issue_links" to "service_role";

grant insert on table "public"."suggestion_health_issue_links" to "service_role";

grant references on table "public"."suggestion_health_issue_links" to "service_role";

grant select on table "public"."suggestion_health_issue_links" to "service_role";

grant trigger on table "public"."suggestion_health_issue_links" to "service_role";

grant truncate on table "public"."suggestion_health_issue_links" to "service_role";

grant update on table "public"."suggestion_health_issue_links" to "service_role";

grant delete on table "public"."usage_modes" to "anon";

grant insert on table "public"."usage_modes" to "anon";

grant references on table "public"."usage_modes" to "anon";

grant select on table "public"."usage_modes" to "anon";

grant trigger on table "public"."usage_modes" to "anon";

grant truncate on table "public"."usage_modes" to "anon";

grant update on table "public"."usage_modes" to "anon";

grant delete on table "public"."usage_modes" to "authenticated";

grant insert on table "public"."usage_modes" to "authenticated";

grant references on table "public"."usage_modes" to "authenticated";

grant select on table "public"."usage_modes" to "authenticated";

grant trigger on table "public"."usage_modes" to "authenticated";

grant truncate on table "public"."usage_modes" to "authenticated";

grant update on table "public"."usage_modes" to "authenticated";

grant delete on table "public"."usage_modes" to "service_role";

grant insert on table "public"."usage_modes" to "service_role";

grant references on table "public"."usage_modes" to "service_role";

grant select on table "public"."usage_modes" to "service_role";

grant trigger on table "public"."usage_modes" to "service_role";

grant truncate on table "public"."usage_modes" to "service_role";

grant update on table "public"."usage_modes" to "service_role";

create policy "Allow all operations for admin users"
on "public"."aromatic_descriptors"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."aromatic_descriptors"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."categories"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."categories"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."chemical_compounds"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."chemical_compounds"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."countries"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."countries"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."essential_oil_aromatic_descriptors"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."essential_oil_aromatic_descriptors"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."essential_oil_categories"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."essential_oil_categories"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."essential_oil_chemical_compounds"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."essential_oil_chemical_compounds"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."essential_oil_extraction_countries"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."essential_oil_extraction_countries"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."essential_oil_extraction_methods"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."essential_oil_extraction_methods"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."essential_oil_plant_parts"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."essential_oil_plant_parts"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."essential_oil_safety"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."essential_oil_safety"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."essential_oil_usage_suggestions"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."essential_oil_usage_suggestions"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."essential_oils"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."essential_oils"
as permissive
for select
to public
using (true);


create policy "Allow select and update for public role"
on "public"."essential_oils"
as permissive
for select
to public
using (true);


create policy "Allow update for public role"
on "public"."essential_oils"
as permissive
for update
to public
using (true)
with check (true);


create policy "Allow all operations for admin users"
on "public"."extraction_methods"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."extraction_methods"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."health_issues"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."health_issues"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."plant_parts"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."plant_parts"
as permissive
for select
to public
using (true);


create policy "Allow users to create their own profile"
on "public"."profiles"
as permissive
for insert
to authenticated
with check ((id = auth.uid()));


create policy "Allow users to update their own profile"
on "public"."profiles"
as permissive
for update
to authenticated
using ((id = auth.uid()));


create policy "Allow users to view their own profile"
on "public"."profiles"
as permissive
for select
to authenticated
using ((id = auth.uid()));


create policy "Allow all operations for admin users"
on "public"."safety_characteristics"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."safety_characteristics"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."suggestion_health_issue_links"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."suggestion_health_issue_links"
as permissive
for select
to public
using (true);


create policy "Allow all operations for admin users"
on "public"."usage_modes"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."usage_modes"
as permissive
for select
to public
using (true);


CREATE TRIGGER set_timestamp_eo_usage_suggestions BEFORE UPDATE ON public.essential_oil_usage_suggestions FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER before_oil_set_names BEFORE INSERT OR UPDATE ON public.essential_oils FOR EACH ROW EXECUTE FUNCTION update_names_concatenated();

CREATE TRIGGER embeddings_oils AFTER INSERT OR UPDATE ON public.essential_oils FOR EACH ROW EXECUTE FUNCTION trigger_generate_oil_embedding();

CREATE TRIGGER set_timestamp_essential_oils BEFORE UPDATE ON public.essential_oils FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();


