

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_essential_oils"("p_query_embedding" "extensions"."vector", "p_match_threshold" double precision, "p_match_count" integer) RETURNS TABLE("id" "uuid", "name_english" "text", "name_scientific" "text", "name_portuguese" "text", "general_description" "text", "similarity" double precision)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        eo.id,
        eo.name_english,
        eo.name_scientific,
        eo.name_portuguese,
        eo.general_description,
        1 - (eo.embedding <=> p_query_embedding) AS similarity
    FROM
        public.essential_oils eo
    WHERE
        eo.embedding IS NOT NULL
        AND (eo.embedding <=> p_query_embedding) < (1 - p_match_threshold)
    ORDER BY
        eo.embedding <=> p_query_embedding
    LIMIT p_match_count;
END;
$$;


ALTER FUNCTION "public"."get_essential_oils"("p_query_embedding" "extensions"."vector", "p_match_threshold" double precision, "p_match_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_generate_oil_embedding"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  function_url TEXT := 'https://iutxzpzbznbgpkdwbzds.supabase.co/functions/v1/generate-oil-embedding';
  supabase_anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dHh6cHpiem5iZ3BrZHdiemRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjI5NjgsImV4cCI6MjA2MjM5ODk2OH0.I6T_fihYCViheL2cCqUGU-al2ZvU5DBOvLcawGrGoOg'; -- Replace with your actual anon key

  request_id BIGINT; -- To store the ID from net.http_post, though not strictly used further if fire-and-forget
  start_time TIMESTAMPTZ;
  names_changed BOOLEAN;
  text_for_embedding TEXT;
BEGIN
  -- Check if any of the name fields have changed
  IF TG_OP = 'INSERT' THEN
    names_changed := TRUE;
  ELSIF TG_OP = 'UPDATE' THEN
    names_changed := (OLD.name_english IS DISTINCT FROM NEW.name_english) OR
                     (OLD.name_scientific IS DISTINCT FROM NEW.name_scientific) OR
                     (OLD.name_portuguese IS DISTINCT FROM NEW.name_portuguese);

    IF NOT names_changed THEN
      RAISE LOG '[AROMACHAT] No relevant fields changed for oil ID: %, skipping embedding generation', NEW.id;
      RETURN NULL;
    END IF;
  END IF;

  text_for_embedding := NEW.names_concatenated;
  RAISE LOG '[AROMACHAT] Text for embedding for oil ID %: "%"', NEW.id, text_for_embedding;

  IF text_for_embedding IS NULL OR trim(text_for_embedding) = '' THEN
    RAISE LOG '[AROMACHAT] Text for embedding is empty for oil ID: %, skipping Edge Function call.', NEW.id;
    RETURN NULL;
  END IF;

  start_time := clock_timestamp();
  RAISE LOG '[AROMACHAT] Iniciando envio de requisição (fire-and-forget) para Edge Function. Óleo ID: %, timestamp: %', NEW.id, start_time;

  IF supabase_anon_key IS NULL OR supabase_anon_key = '' THEN
    RAISE WARNING '[AROMACHAT] Chave anônima do Supabase não encontrada ou vazia. Impossível chamar Edge Function.';
    RETURN NULL;
  END IF;

  -- Send the HTTP request. We get the request_id but won't wait for the response here.
  BEGIN
    SELECT http_post INTO request_id -- Column name is 'http_post'
    FROM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_anon_key
      ),
      body := jsonb_build_object(
        'id', NEW.id,
        'operation_type', TG_OP,
        'text_to_embed', text_for_embedding
      ),
      timeout_milliseconds := 3000 -- Short timeout for just sending the request
    );

    IF request_id IS NOT NULL THEN
      RAISE LOG '[AROMACHAT] Requisição HTTP enviada (fire-and-forget) para óleo ID: %. Request ID: %. Edge Function processará em segundo plano.', NEW.id, request_id;
    ELSE
      RAISE WARNING '[AROMACHAT] net.http_post retornou NULL como request_id para óleo ID: %. A requisição pode não ter sido enviada.', NEW.id;
    END IF;

  EXCEPTION
    WHEN OTHERS THEN
      -- This catches errors during the net.http_post call itself (e.g., network, pg_net internal error)
      RAISE WARNING '[AROMACHAT] Erro ao ENVIAR requisição HTTP (net.http_post fire-and-forget) para óleo ID: %. Detalhes: %, SQL State: %',
        NEW.id, SQLERRM, SQLSTATE;
      -- No further action needed in the trigger if it's fire-and-forget
  END;

  RAISE LOG '[AROMACHAT] Trigger (fire-and-forget) para óleo ID: % concluído. Tempo de execução do trigger: % ms.',
    NEW.id,
    extract(epoch from (clock_timestamp() - start_time)) * 1000;

  RETURN NULL; -- For AFTER triggers, RETURN NULL is conventional.

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '[AROMACHAT] Erro INESPERADO na função trigger_generate_oil_embedding (fire-and-forget) para óleo ID: %. Detalhes: %, SQL State: %',
      NEW.id, SQLERRM, SQLSTATE;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."trigger_generate_oil_embedding"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_timestamp"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."aromatic_descriptors" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "descriptor" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."aromatic_descriptors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chemical_compounds" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "bubble_uid" "text",
    "pubchem_compound_id" "text",
    "carbon_structure" "text"
);


ALTER TABLE "public"."chemical_compounds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."countries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "iso_code_2" character(2),
    "iso_code_3" character(3),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."countries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_aromatic_descriptors" (
    "essential_oil_id" "uuid" NOT NULL,
    "descriptor_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_aromatic_descriptors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_categories" (
    "essential_oil_id" "uuid" NOT NULL,
    "category_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_chemical_compounds" (
    "essential_oil_id" "uuid" NOT NULL,
    "chemical_compound_id" "uuid" NOT NULL,
    "min_percentage" numeric(5,4),
    "max_percentage" numeric(5,4),
    "typical_percentage" numeric(5,4),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "percentage_range" "numrange",
    CONSTRAINT "chk_max_percentage_range" CHECK ((("max_percentage" IS NULL) OR (("max_percentage" >= (0)::numeric) AND ("max_percentage" <= (1)::numeric)))),
    CONSTRAINT "chk_min_max_percentage" CHECK ((("min_percentage" IS NULL) OR ("max_percentage" IS NULL) OR ("min_percentage" <= "max_percentage"))),
    CONSTRAINT "chk_min_percentage_range" CHECK ((("min_percentage" IS NULL) OR (("min_percentage" >= (0)::numeric) AND ("min_percentage" <= (1)::numeric)))),
    CONSTRAINT "chk_percentage_range" CHECK ((("percentage_range" IS NULL) OR (("lower"("percentage_range") >= (0)::numeric) AND ("upper"("percentage_range") <= (1)::numeric) AND ("lower"("percentage_range") <= "upper"("percentage_range"))))),
    CONSTRAINT "chk_typical_percentage_range" CHECK ((("typical_percentage" IS NULL) OR (("typical_percentage" >= (0)::numeric) AND ("typical_percentage" <= (1)::numeric))))
);


ALTER TABLE "public"."essential_oil_chemical_compounds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_extraction_countries" (
    "essential_oil_id" "uuid" NOT NULL,
    "country_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_extraction_countries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_extraction_methods" (
    "essential_oil_id" "uuid" NOT NULL,
    "extraction_method_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_extraction_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_plant_parts" (
    "essential_oil_id" "uuid" NOT NULL,
    "plant_part_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_plant_parts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_safety" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "essential_oil_id" "uuid" NOT NULL,
    "safety_characteristic_id" "uuid" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_safety" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_usage_suggestions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "essential_oil_id" "uuid" NOT NULL,
    "usage_mode_id" "uuid" NOT NULL,
    "suggestion_title" "text" NOT NULL,
    "suggestion_details" "text" NOT NULL,
    "display_order" smallint DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_usage_suggestions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oils" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name_english" "text" NOT NULL,
    "name_scientific" "text" NOT NULL,
    "name_portuguese" "text" NOT NULL,
    "general_description" "text",
    "embedding" "extensions"."vector"(1536),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "bubble_uid" "text",
    "names_concatenated" "text" GENERATED ALWAYS AS ((((("name_english" || ' | '::"text") || "name_scientific") || ' | '::"text") || "name_portuguese")) STORED
);


ALTER TABLE "public"."essential_oils" OWNER TO "postgres";


COMMENT ON TABLE "public"."essential_oils" IS 'Essential oils table. Multiple entries with the same scientific name are allowed to represent different extraction methods, parts of the plant, or specific variants.';



CREATE TABLE IF NOT EXISTS "public"."extraction_methods" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "bubble_uid" "text"
);


ALTER TABLE "public"."extraction_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."health_issues" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."health_issues" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plant_parts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "bubble_uid" "text"
);


ALTER TABLE "public"."plant_parts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."safety_characteristics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "severity_level" smallint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."safety_characteristics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."suggestion_health_issue_links" (
    "usage_suggestion_id" "uuid" NOT NULL,
    "health_issue_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."suggestion_health_issue_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_modes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon_svg" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."usage_modes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."essential_oil_aggregated_details" AS
 SELECT "eo"."id" AS "essential_oil_id",
    "eo"."name_english",
    "eo"."name_scientific",
    "eo"."name_portuguese",
    "eo"."general_description",
    "eo"."names_concatenated",
    "eo"."created_at" AS "oil_created_at",
    "eo"."updated_at" AS "oil_updated_at",
    ( SELECT "jsonb_agg"(DISTINCT "ad"."descriptor") AS "jsonb_agg"
           FROM ("public"."essential_oil_aromatic_descriptors" "eoad"
             JOIN "public"."aromatic_descriptors" "ad" ON (("eoad"."descriptor_id" = "ad"."id")))
          WHERE ("eoad"."essential_oil_id" = "eo"."id")) AS "aromatic_descriptors",
    ( SELECT "jsonb_agg"(DISTINCT "jsonb_build_object"('name', "cat"."name", 'description', "cat"."description")) AS "jsonb_agg"
           FROM ("public"."essential_oil_categories" "eoc"
             JOIN "public"."categories" "cat" ON (("eoc"."category_id" = "cat"."id")))
          WHERE ("eoc"."essential_oil_id" = "eo"."id")) AS "categories",
    ( SELECT "jsonb_agg"("jsonb_build_object"('name', "cc"."name", 'description', "cc"."description", 'min_percentage', "eocc"."min_percentage", 'max_percentage', "eocc"."max_percentage", 'typical_percentage', "eocc"."typical_percentage", 'percentage_range', "eocc"."percentage_range", 'notes', "eocc"."notes")) AS "jsonb_agg"
           FROM ("public"."essential_oil_chemical_compounds" "eocc"
             JOIN "public"."chemical_compounds" "cc" ON (("eocc"."chemical_compound_id" = "cc"."id")))
          WHERE ("eocc"."essential_oil_id" = "eo"."id")) AS "chemical_compounds",
    ( SELECT "jsonb_agg"(DISTINCT "jsonb_build_object"('name', "co"."name", 'iso2', "co"."iso_code_2")) AS "jsonb_agg"
           FROM ("public"."essential_oil_extraction_countries" "eoec"
             JOIN "public"."countries" "co" ON (("eoec"."country_id" = "co"."id")))
          WHERE ("eoec"."essential_oil_id" = "eo"."id")) AS "extraction_countries",
    ( SELECT "jsonb_agg"(DISTINCT "jsonb_build_object"('name', "em"."name", 'description', "em"."description")) AS "jsonb_agg"
           FROM ("public"."essential_oil_extraction_methods" "eoem"
             JOIN "public"."extraction_methods" "em" ON (("eoem"."extraction_method_id" = "em"."id")))
          WHERE ("eoem"."essential_oil_id" = "eo"."id")) AS "extraction_methods",
    ( SELECT "jsonb_agg"(DISTINCT "jsonb_build_object"('name', "pp"."name", 'description', "pp"."description")) AS "jsonb_agg"
           FROM ("public"."essential_oil_plant_parts" "eopp"
             JOIN "public"."plant_parts" "pp" ON (("eopp"."plant_part_id" = "pp"."id")))
          WHERE ("eopp"."essential_oil_id" = "eo"."id")) AS "plant_parts",
    ( SELECT "jsonb_agg"("jsonb_build_object"('name', "sc"."name", 'description', "sc"."description", 'severity_level', "sc"."severity_level", 'notes', "eos"."notes")) AS "jsonb_agg"
           FROM ("public"."essential_oil_safety" "eos"
             JOIN "public"."safety_characteristics" "sc" ON (("eos"."safety_characteristic_id" = "sc"."id")))
          WHERE ("eos"."essential_oil_id" = "eo"."id")) AS "safety_info",
    ( SELECT "jsonb_agg"("jsonb_build_object"('title', "eus"."suggestion_title", 'details', "eus"."suggestion_details", 'display_order', "eus"."display_order", 'usage_mode', "um"."name", 'usage_mode_icon', "um"."icon_svg", 'health_issues', ( SELECT "jsonb_agg"(DISTINCT "jsonb_build_object"('name', "hi"."name", 'description', "hi"."description")) AS "jsonb_agg"
                   FROM ("public"."suggestion_health_issue_links" "shil"
                     JOIN "public"."health_issues" "hi" ON (("shil"."health_issue_id" = "hi"."id")))
                  WHERE ("shil"."usage_suggestion_id" = "eus"."id")))) AS "jsonb_agg"
           FROM ("public"."essential_oil_usage_suggestions" "eus"
             JOIN "public"."usage_modes" "um" ON (("eus"."usage_mode_id" = "um"."id")))
          WHERE ("eus"."essential_oil_id" = "eo"."id")) AS "usage_suggestions"
   FROM "public"."essential_oils" "eo";


ALTER TABLE "public"."essential_oil_aggregated_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_health_issues" (
    "essential_oil_id" "uuid" NOT NULL,
    "health_issue_id" "uuid" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_health_issues" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "gender" "text",
    "age_category" "text",
    "specific_age" integer,
    "language" "text" DEFAULT 'en'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "avatar_url" "text",
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "stripe_customer_id" "text",
    "subscription_status" "text",
    "subscription_tier" "text",
    "subscription_period" "text",
    "subscription_start_date" timestamp with time zone,
    "subscription_end_date" timestamp with time zone,
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'premium'::"text", 'admin'::"text"]))),
    CONSTRAINT "profiles_subscription_period_check" CHECK (("subscription_period" = ANY (ARRAY['monthly'::"text", 'annual'::"text", NULL::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."role" IS 'User role: user (free), premium (paid), or admin';



COMMENT ON COLUMN "public"."profiles"."stripe_customer_id" IS 'Stripe customer ID reference';



COMMENT ON COLUMN "public"."profiles"."subscription_status" IS 'Current status of subscription (active, canceled, past_due, etc.)';



COMMENT ON COLUMN "public"."profiles"."subscription_tier" IS 'Level of subscription (basic, pro, etc.)';



COMMENT ON COLUMN "public"."profiles"."subscription_period" IS 'Billing period (monthly or annual)';



ALTER TABLE ONLY "public"."aromatic_descriptors"
    ADD CONSTRAINT "aromatic_descriptors_descriptor_key" UNIQUE ("descriptor");



ALTER TABLE ONLY "public"."aromatic_descriptors"
    ADD CONSTRAINT "aromatic_descriptors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chemical_compounds"
    ADD CONSTRAINT "chemical_compounds_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."chemical_compounds"
    ADD CONSTRAINT "chemical_compounds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_iso_code_2_key" UNIQUE ("iso_code_2");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_iso_code_3_key" UNIQUE ("iso_code_3");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."essential_oil_aromatic_descriptors"
    ADD CONSTRAINT "essential_oil_aromatic_descriptors_pkey" PRIMARY KEY ("essential_oil_id", "descriptor_id");



ALTER TABLE ONLY "public"."essential_oil_categories"
    ADD CONSTRAINT "essential_oil_categories_pkey" PRIMARY KEY ("essential_oil_id", "category_id");



ALTER TABLE ONLY "public"."essential_oil_chemical_compounds"
    ADD CONSTRAINT "essential_oil_chemical_compounds_pkey" PRIMARY KEY ("essential_oil_id", "chemical_compound_id");



ALTER TABLE ONLY "public"."essential_oil_extraction_countries"
    ADD CONSTRAINT "essential_oil_extraction_countries_pkey" PRIMARY KEY ("essential_oil_id", "country_id");



ALTER TABLE ONLY "public"."essential_oil_extraction_methods"
    ADD CONSTRAINT "essential_oil_extraction_methods_pkey" PRIMARY KEY ("essential_oil_id", "extraction_method_id");



ALTER TABLE ONLY "public"."essential_oil_health_issues"
    ADD CONSTRAINT "essential_oil_health_issues_pkey" PRIMARY KEY ("essential_oil_id", "health_issue_id");



ALTER TABLE ONLY "public"."essential_oil_plant_parts"
    ADD CONSTRAINT "essential_oil_plant_parts_pkey" PRIMARY KEY ("essential_oil_id", "plant_part_id");



ALTER TABLE ONLY "public"."essential_oil_safety"
    ADD CONSTRAINT "essential_oil_safety_oil_char_key" UNIQUE ("essential_oil_id", "safety_characteristic_id");



ALTER TABLE ONLY "public"."essential_oil_safety"
    ADD CONSTRAINT "essential_oil_safety_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."essential_oil_usage_suggestions"
    ADD CONSTRAINT "essential_oil_usage_suggestions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."essential_oils"
    ADD CONSTRAINT "essential_oils_name_english_unique" UNIQUE ("name_english");



ALTER TABLE ONLY "public"."essential_oils"
    ADD CONSTRAINT "essential_oils_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."extraction_methods"
    ADD CONSTRAINT "extraction_methods_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."extraction_methods"
    ADD CONSTRAINT "extraction_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."health_issues"
    ADD CONSTRAINT "health_issues_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."health_issues"
    ADD CONSTRAINT "health_issues_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plant_parts"
    ADD CONSTRAINT "plant_parts_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."plant_parts"
    ADD CONSTRAINT "plant_parts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_stripe_customer_id_key" UNIQUE ("stripe_customer_id");



ALTER TABLE ONLY "public"."safety_characteristics"
    ADD CONSTRAINT "safety_characteristics_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."safety_characteristics"
    ADD CONSTRAINT "safety_characteristics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suggestion_health_issue_links"
    ADD CONSTRAINT "suggestion_health_issue_links_pkey" PRIMARY KEY ("usage_suggestion_id", "health_issue_id");



ALTER TABLE ONLY "public"."usage_modes"
    ADD CONSTRAINT "usage_modes_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."usage_modes"
    ADD CONSTRAINT "usage_modes_pkey" PRIMARY KEY ("id");



CREATE INDEX "essential_oils_embedding_idx" ON "public"."essential_oils" USING "ivfflat" ("embedding" "extensions"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "idx_eo_health_issues_issue" ON "public"."essential_oil_health_issues" USING "btree" ("health_issue_id");



CREATE INDEX "idx_eo_health_issues_oil" ON "public"."essential_oil_health_issues" USING "btree" ("essential_oil_id");



CREATE INDEX "idx_eo_usage_suggestions_oil_mode" ON "public"."essential_oil_usage_suggestions" USING "btree" ("essential_oil_id", "usage_mode_id");



CREATE INDEX "idx_essential_oil_aromatic_descriptors_desc" ON "public"."essential_oil_aromatic_descriptors" USING "btree" ("descriptor_id");



CREATE INDEX "idx_essential_oil_aromatic_descriptors_oil" ON "public"."essential_oil_aromatic_descriptors" USING "btree" ("essential_oil_id");



CREATE INDEX "idx_essential_oil_categories_cat" ON "public"."essential_oil_categories" USING "btree" ("category_id");



CREATE INDEX "idx_essential_oil_categories_oil" ON "public"."essential_oil_categories" USING "btree" ("essential_oil_id");



CREATE INDEX "idx_essential_oil_chem_comp_comp" ON "public"."essential_oil_chemical_compounds" USING "btree" ("chemical_compound_id");



CREATE INDEX "idx_essential_oil_chem_comp_oil" ON "public"."essential_oil_chemical_compounds" USING "btree" ("essential_oil_id");



CREATE INDEX "idx_essential_oil_ext_countries_ctry" ON "public"."essential_oil_extraction_countries" USING "btree" ("country_id");



CREATE INDEX "idx_essential_oil_ext_countries_oil" ON "public"."essential_oil_extraction_countries" USING "btree" ("essential_oil_id");



CREATE INDEX "idx_essential_oil_ext_methods_meth" ON "public"."essential_oil_extraction_methods" USING "btree" ("extraction_method_id");



CREATE INDEX "idx_essential_oil_ext_methods_oil" ON "public"."essential_oil_extraction_methods" USING "btree" ("essential_oil_id");



CREATE INDEX "idx_essential_oil_plant_parts_oil" ON "public"."essential_oil_plant_parts" USING "btree" ("essential_oil_id");



CREATE INDEX "idx_essential_oil_plant_parts_part" ON "public"."essential_oil_plant_parts" USING "btree" ("plant_part_id");



CREATE INDEX "idx_essential_oil_safety_char" ON "public"."essential_oil_safety" USING "btree" ("safety_characteristic_id");



CREATE INDEX "idx_essential_oil_safety_oil" ON "public"."essential_oil_safety" USING "btree" ("essential_oil_id");



CREATE INDEX "idx_suggestion_health_links_issue" ON "public"."suggestion_health_issue_links" USING "btree" ("health_issue_id");



CREATE INDEX "idx_suggestion_health_links_sugg" ON "public"."suggestion_health_issue_links" USING "btree" ("usage_suggestion_id");



CREATE OR REPLACE TRIGGER "embeddings_oils" AFTER INSERT OR UPDATE ON "public"."essential_oils" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_generate_oil_embedding"();



CREATE OR REPLACE TRIGGER "set_timestamp_eo_usage_suggestions" BEFORE UPDATE ON "public"."essential_oil_usage_suggestions" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp_essential_oils" BEFORE UPDATE ON "public"."essential_oils" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



ALTER TABLE ONLY "public"."essential_oil_aromatic_descriptors"
    ADD CONSTRAINT "essential_oil_aromatic_descriptors_descriptor_id_fkey" FOREIGN KEY ("descriptor_id") REFERENCES "public"."aromatic_descriptors"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."essential_oil_aromatic_descriptors"
    ADD CONSTRAINT "essential_oil_aromatic_descriptors_essential_oil_id_fkey" FOREIGN KEY ("essential_oil_id") REFERENCES "public"."essential_oils"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."essential_oil_categories"
    ADD CONSTRAINT "essential_oil_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."essential_oil_categories"
    ADD CONSTRAINT "essential_oil_categories_essential_oil_id_fkey" FOREIGN KEY ("essential_oil_id") REFERENCES "public"."essential_oils"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."essential_oil_chemical_compounds"
    ADD CONSTRAINT "essential_oil_chemical_compounds_chemical_compound_id_fkey" FOREIGN KEY ("chemical_compound_id") REFERENCES "public"."chemical_compounds"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."essential_oil_chemical_compounds"
    ADD CONSTRAINT "essential_oil_chemical_compounds_essential_oil_id_fkey" FOREIGN KEY ("essential_oil_id") REFERENCES "public"."essential_oils"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."essential_oil_extraction_countries"
    ADD CONSTRAINT "essential_oil_extraction_countries_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."essential_oil_extraction_countries"
    ADD CONSTRAINT "essential_oil_extraction_countries_essential_oil_id_fkey" FOREIGN KEY ("essential_oil_id") REFERENCES "public"."essential_oils"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."essential_oil_extraction_methods"
    ADD CONSTRAINT "essential_oil_extraction_methods_essential_oil_id_fkey" FOREIGN KEY ("essential_oil_id") REFERENCES "public"."essential_oils"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."essential_oil_extraction_methods"
    ADD CONSTRAINT "essential_oil_extraction_methods_extraction_method_id_fkey" FOREIGN KEY ("extraction_method_id") REFERENCES "public"."extraction_methods"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."essential_oil_health_issues"
    ADD CONSTRAINT "essential_oil_health_issues_essential_oil_id_fkey" FOREIGN KEY ("essential_oil_id") REFERENCES "public"."essential_oils"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."essential_oil_health_issues"
    ADD CONSTRAINT "essential_oil_health_issues_health_issue_id_fkey" FOREIGN KEY ("health_issue_id") REFERENCES "public"."health_issues"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."essential_oil_plant_parts"
    ADD CONSTRAINT "essential_oil_plant_parts_essential_oil_id_fkey" FOREIGN KEY ("essential_oil_id") REFERENCES "public"."essential_oils"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."essential_oil_plant_parts"
    ADD CONSTRAINT "essential_oil_plant_parts_plant_part_id_fkey" FOREIGN KEY ("plant_part_id") REFERENCES "public"."plant_parts"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."essential_oil_safety"
    ADD CONSTRAINT "essential_oil_safety_essential_oil_id_fkey" FOREIGN KEY ("essential_oil_id") REFERENCES "public"."essential_oils"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."essential_oil_safety"
    ADD CONSTRAINT "essential_oil_safety_safety_characteristic_id_fkey" FOREIGN KEY ("safety_characteristic_id") REFERENCES "public"."safety_characteristics"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."essential_oil_usage_suggestions"
    ADD CONSTRAINT "essential_oil_usage_suggestions_essential_oil_id_fkey" FOREIGN KEY ("essential_oil_id") REFERENCES "public"."essential_oils"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."essential_oil_usage_suggestions"
    ADD CONSTRAINT "essential_oil_usage_suggestions_usage_mode_id_fkey" FOREIGN KEY ("usage_mode_id") REFERENCES "public"."usage_modes"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."suggestion_health_issue_links"
    ADD CONSTRAINT "suggestion_health_issue_links_health_issue_id_fkey" FOREIGN KEY ("health_issue_id") REFERENCES "public"."health_issues"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."suggestion_health_issue_links"
    ADD CONSTRAINT "suggestion_health_issue_links_usage_suggestion_id_fkey" FOREIGN KEY ("usage_suggestion_id") REFERENCES "public"."essential_oil_usage_suggestions"("id") ON DELETE CASCADE;



CREATE POLICY "Allow all operations for admin users" ON "public"."aromatic_descriptors" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."categories" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."chemical_compounds" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."countries" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."essential_oil_aromatic_descriptors" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."essential_oil_categories" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."essential_oil_chemical_compounds" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."essential_oil_extraction_countries" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."essential_oil_extraction_methods" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."essential_oil_health_issues" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."essential_oil_plant_parts" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."essential_oil_safety" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."essential_oil_usage_suggestions" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."essential_oils" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."extraction_methods" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."health_issues" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."plant_parts" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."safety_characteristics" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."suggestion_health_issue_links" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow all operations for admin users" ON "public"."usage_modes" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow anonymous read access to essential_oils" ON "public"."essential_oils" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow public read access to essential_oils" ON "public"."essential_oils" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."aromatic_descriptors" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."chemical_compounds" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."countries" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."essential_oil_aromatic_descriptors" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."essential_oil_categories" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."essential_oil_chemical_compounds" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."essential_oil_extraction_countries" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."essential_oil_extraction_methods" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."essential_oil_health_issues" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."essential_oil_plant_parts" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."essential_oil_safety" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."essential_oil_usage_suggestions" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."essential_oils" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."extraction_methods" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."health_issues" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."plant_parts" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."safety_characteristics" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."suggestion_health_issue_links" FOR SELECT USING (true);



CREATE POLICY "Allow read access for all users" ON "public"."usage_modes" FOR SELECT USING (true);



CREATE POLICY "Allow users to create their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Allow users to update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "Allow users to view their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



ALTER TABLE "public"."aromatic_descriptors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chemical_compounds" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."essential_oil_aromatic_descriptors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."essential_oil_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."essential_oil_chemical_compounds" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."essential_oil_extraction_countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."essential_oil_extraction_methods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."essential_oil_health_issues" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."essential_oil_plant_parts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."essential_oil_safety" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."essential_oil_usage_suggestions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."essential_oils" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."extraction_methods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."health_issues" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plant_parts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."safety_characteristics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."suggestion_health_issue_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usage_modes" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";







































































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_generate_oil_embedding"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_generate_oil_embedding"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_generate_oil_embedding"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "service_role";






























GRANT ALL ON TABLE "public"."aromatic_descriptors" TO "anon";
GRANT ALL ON TABLE "public"."aromatic_descriptors" TO "authenticated";
GRANT ALL ON TABLE "public"."aromatic_descriptors" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."chemical_compounds" TO "anon";
GRANT ALL ON TABLE "public"."chemical_compounds" TO "authenticated";
GRANT ALL ON TABLE "public"."chemical_compounds" TO "service_role";



GRANT ALL ON TABLE "public"."countries" TO "anon";
GRANT ALL ON TABLE "public"."countries" TO "authenticated";
GRANT ALL ON TABLE "public"."countries" TO "service_role";



GRANT ALL ON TABLE "public"."essential_oil_aromatic_descriptors" TO "anon";
GRANT ALL ON TABLE "public"."essential_oil_aromatic_descriptors" TO "authenticated";
GRANT ALL ON TABLE "public"."essential_oil_aromatic_descriptors" TO "service_role";



GRANT ALL ON TABLE "public"."essential_oil_categories" TO "anon";
GRANT ALL ON TABLE "public"."essential_oil_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."essential_oil_categories" TO "service_role";



GRANT ALL ON TABLE "public"."essential_oil_chemical_compounds" TO "anon";
GRANT ALL ON TABLE "public"."essential_oil_chemical_compounds" TO "authenticated";
GRANT ALL ON TABLE "public"."essential_oil_chemical_compounds" TO "service_role";



GRANT ALL ON TABLE "public"."essential_oil_extraction_countries" TO "anon";
GRANT ALL ON TABLE "public"."essential_oil_extraction_countries" TO "authenticated";
GRANT ALL ON TABLE "public"."essential_oil_extraction_countries" TO "service_role";



GRANT ALL ON TABLE "public"."essential_oil_extraction_methods" TO "anon";
GRANT ALL ON TABLE "public"."essential_oil_extraction_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."essential_oil_extraction_methods" TO "service_role";



GRANT ALL ON TABLE "public"."essential_oil_plant_parts" TO "anon";
GRANT ALL ON TABLE "public"."essential_oil_plant_parts" TO "authenticated";
GRANT ALL ON TABLE "public"."essential_oil_plant_parts" TO "service_role";



GRANT ALL ON TABLE "public"."essential_oil_safety" TO "anon";
GRANT ALL ON TABLE "public"."essential_oil_safety" TO "authenticated";
GRANT ALL ON TABLE "public"."essential_oil_safety" TO "service_role";



GRANT ALL ON TABLE "public"."essential_oil_usage_suggestions" TO "anon";
GRANT ALL ON TABLE "public"."essential_oil_usage_suggestions" TO "authenticated";
GRANT ALL ON TABLE "public"."essential_oil_usage_suggestions" TO "service_role";



GRANT ALL ON TABLE "public"."essential_oils" TO "anon";
GRANT ALL ON TABLE "public"."essential_oils" TO "authenticated";
GRANT ALL ON TABLE "public"."essential_oils" TO "service_role";



GRANT ALL ON TABLE "public"."extraction_methods" TO "anon";
GRANT ALL ON TABLE "public"."extraction_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."extraction_methods" TO "service_role";



GRANT ALL ON TABLE "public"."health_issues" TO "anon";
GRANT ALL ON TABLE "public"."health_issues" TO "authenticated";
GRANT ALL ON TABLE "public"."health_issues" TO "service_role";



GRANT ALL ON TABLE "public"."plant_parts" TO "anon";
GRANT ALL ON TABLE "public"."plant_parts" TO "authenticated";
GRANT ALL ON TABLE "public"."plant_parts" TO "service_role";



GRANT ALL ON TABLE "public"."safety_characteristics" TO "anon";
GRANT ALL ON TABLE "public"."safety_characteristics" TO "authenticated";
GRANT ALL ON TABLE "public"."safety_characteristics" TO "service_role";



GRANT ALL ON TABLE "public"."suggestion_health_issue_links" TO "anon";
GRANT ALL ON TABLE "public"."suggestion_health_issue_links" TO "authenticated";
GRANT ALL ON TABLE "public"."suggestion_health_issue_links" TO "service_role";



GRANT ALL ON TABLE "public"."usage_modes" TO "anon";
GRANT ALL ON TABLE "public"."usage_modes" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_modes" TO "service_role";



GRANT ALL ON TABLE "public"."essential_oil_aggregated_details" TO "anon";
GRANT ALL ON TABLE "public"."essential_oil_aggregated_details" TO "authenticated";
GRANT ALL ON TABLE "public"."essential_oil_aggregated_details" TO "service_role";



GRANT ALL ON TABLE "public"."essential_oil_health_issues" TO "anon";
GRANT ALL ON TABLE "public"."essential_oil_health_issues" TO "authenticated";
GRANT ALL ON TABLE "public"."essential_oil_health_issues" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
