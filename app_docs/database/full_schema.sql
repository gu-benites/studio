-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS "public"."profiles" CASCADE;
DROP TABLE IF EXISTS "public"."essential_oils" CASCADE;
DROP TABLE IF EXISTS "public"."chemical_compounds" CASCADE;

-- Create tables
CREATE TABLE "public"."chemical_compounds" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "bubble_uid" "text",
    "pubchem_compound_id" "text",
    "carbon_structure" "text",
    CONSTRAINT "chemical_compounds_pkey" PRIMARY KEY ("id")
);


ALTER TABLE "public"."chemical_compounds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eo_application_methods" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eo_application_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eo_aroma_notes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "note_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eo_aroma_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eo_aroma_scents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "scent_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eo_aroma_scents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eo_chakras" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "chakra_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eo_chakras" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eo_child_safety_age_ranges" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "range_description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eo_child_safety_age_ranges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eo_countries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "country_name" "text" NOT NULL,
    "country_code" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eo_countries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eo_dilution_recommendations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eo_dilution_recommendations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eo_energetic_emotional_properties" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "property_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eo_energetic_emotional_properties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eo_extraction_methods" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "method_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eo_extraction_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eo_health_benefits" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "benefit_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eo_health_benefits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eo_internal_use_statuses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eo_internal_use_statuses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eo_pets" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "animal_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eo_pets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eo_phototoxicity_statuses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eo_phototoxicity_statuses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eo_plant_parts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "part_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eo_plant_parts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eo_pregnancy_nursing_statuses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "status_description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eo_pregnancy_nursing_statuses" OWNER TO "postgres";


CREATE TABLE "public"."eo_therapeutic_properties" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "property_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "property_name_portuguese" "text",
    "description_portuguese" "text",
    "description" "text",
    CONSTRAINT "eo_therapeutic_properties_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "eo_therapeutic_properties_property_name_key" UNIQUE ("property_name")
);
);


ALTER TABLE "public"."eo_therapeutic_properties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_application_methods" (
    "essential_oil_id" "uuid" NOT NULL,
    "application_method_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_application_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_aroma_notes" (
    "essential_oil_id" "uuid" NOT NULL,
    "aroma_note_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_aroma_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_aroma_scents" (
    "essential_oil_id" "uuid" NOT NULL,
    "scent_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_aroma_scents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_chakra_association" (
    "essential_oil_id" "uuid" NOT NULL,
    "chakra_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_chakra_association" OWNER TO "postgres";


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


CREATE TABLE IF NOT EXISTS "public"."essential_oil_child_safety" (
    "essential_oil_id" "uuid" NOT NULL,
    "age_range_id" "uuid" NOT NULL,
    "safety_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_child_safety" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_energetic_emotional_properties" (
    "essential_oil_id" "uuid" NOT NULL,
    "energetic_property_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_energetic_emotional_properties" OWNER TO "postgres";


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


CREATE TABLE IF NOT EXISTS "public"."essential_oil_health_benefits" (
    "essential_oil_id" "uuid" NOT NULL,
    "health_benefit_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_health_benefits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_pet_safety" (
    "essential_oil_id" "uuid" NOT NULL,
    "pet_id" "uuid" NOT NULL,
    "safety_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_pet_safety" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_plant_parts" (
    "essential_oil_id" "uuid" NOT NULL,
    "plant_part_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_plant_parts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_pregnancy_nursing_safety" (
    "essential_oil_id" "uuid" NOT NULL,
    "pregnancy_nursing_status_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_pregnancy_nursing_safety" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essential_oil_therapeutic_properties" (
    "essential_oil_id" "uuid" NOT NULL,
    "property_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."essential_oil_therapeutic_properties" OWNER TO "postgres";


CREATE TABLE "public"."essential_oils" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name_english" "text" NOT NULL,
    "name_scientific" "text",
    "name_portuguese" "text",
    "general_description" "text",
    "embedding" "extensions"."vector"(1536),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "bubble_uid" "text",
    "names_concatenated" "text",
    "image_url" "text",
    "internal_use_status_id" "uuid",
    "dilution_recommendation_id" "uuid",
    "phototoxicity_status_id" "uuid",
    CONSTRAINT "essential_oils_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "essential_oils_dilution_recommendation_id_fkey" FOREIGN KEY ("dilution_recommendation_id") 
        REFERENCES "public"."eo_dilution_recommendations"("id") ON DELETE SET NULL,
    CONSTRAINT "essential_oils_internal_use_status_id_fkey" FOREIGN KEY ("internal_use_status_id") 
        REFERENCES "public"."eo_internal_use_statuses"("id") ON DELETE SET NULL,
    CONSTRAINT "essential_oils_phototoxicity_status_id_fkey" FOREIGN KEY ("phototoxicity_status_id") 
        REFERENCES "public"."eo_phototoxicity_statuses"("id") ON DELETE SET NULL
);
);


ALTER TABLE "public"."essential_oils" OWNER TO "postgres";


COMMENT ON TABLE "public"."essential_oils" IS 'Essential oils table. Multiple entries with the same scientific name are allowed to represent different extraction methods, parts of the plant, or specific variants.';



CREATE TABLE "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "gender" "text",
    "age_category" "text",
    "specific_age" integer,
    "language" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "avatar_url" "text",
    "role" "text" DEFAULT 'user'::text,
    "stripe_customer_id" "text",
    "subscription_status" "text",
    "subscription_tier" "text",
    "subscription_period" "text",
    "subscription_start_date" timestamp with time zone,
    "subscription_end_date" timestamp with time zone,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") 
        REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "essential_oils_name_english_idx" ON "public"."essential_oils" ("name_english");
CREATE INDEX IF NOT EXISTS "essential_oils_embedding_idx" ON "public"."essential_oils" USING hnsw ("embedding" vector_cosine_ops);

-- Enable Row Level Security
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" 
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile." ON "public"."profiles"
    FOR UPDATE USING ("auth"."uid"() = "id");

-- Create a function to update timestamps
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;   
END;
$$ LANGUAGE plpgsql;

-- Apply the update trigger to all tables with updated_at
DO $$
DECLARE
    t record;
BEGIN
    FOR t IN 
        SELECT table_schema, table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %I.%I', 
                      t.table_name, t.table_schema, t.table_name);
        EXECUTE format('CREATE TRIGGER update_%s_updated_at
                      BEFORE UPDATE ON %I.%I
                      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
                      t.table_name, t.table_schema, t.table_name);
    END LOOP;
END;
$$;

CREATE TABLE IF NOT EXISTS "public"."usage_instructions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "essential_oil_id" "uuid" NOT NULL,
    "health_benefit_id" "uuid" NOT NULL,
    "application_method_id" "uuid",
    "instruction_text" "text" NOT NULL,
    "dilution_details" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."usage_instructions" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."v_essential_oil_full_details" WITH ("security_invoker"='on') AS
 SELECT "eo"."id",
    "eo"."name_english",
    "eo"."name_scientific",
    "eo"."name_portuguese",
    "eo"."general_description",
    "eo"."embedding",
    "eo"."created_at",
    "eo"."updated_at",
    "eo"."bubble_uid",
    "eo"."names_concatenated",
    "eo"."image_url",
    "eo"."internal_use_status_id",
    "eo"."dilution_recommendation_id",
    "eo"."phototoxicity_status_id",
    COALESCE("array_agg"(DISTINCT "eam"."application_method_id") FILTER (WHERE ("eam"."application_method_id" IS NOT NULL)), '{}'::"uuid"[]) AS "application_methods",
    COALESCE("jsonb_agg"(DISTINCT "jsonb_build_object"('pet_id', "eps"."pet_id", 'safety_notes', "eps"."safety_notes")) FILTER (WHERE ("eps"."pet_id" IS NOT NULL)), '[]'::"jsonb") AS "pet_safety",
    COALESCE("jsonb_agg"(DISTINCT "jsonb_build_object"('age_range_id', "ecs"."age_range_id", 'safety_notes', "ecs"."safety_notes")) FILTER (WHERE ("ecs"."age_range_id" IS NOT NULL)), '[]'::"jsonb") AS "child_safety",
    COALESCE("array_agg"(DISTINCT "eopns"."pregnancy_nursing_status_id") FILTER (WHERE ("eopns"."pregnancy_nursing_status_id" IS NOT NULL)), '{}'::"uuid"[]) AS "pregnancy_nursing_status",
    COALESCE("array_agg"(DISTINCT "eotp"."property_id") FILTER (WHERE ("eotp"."property_id" IS NOT NULL)), '{}'::"uuid"[]) AS "therapeutic_properties",
    COALESCE("array_agg"(DISTINCT "eohb"."health_benefit_id") FILTER (WHERE ("eohb"."health_benefit_id" IS NOT NULL)), '{}'::"uuid"[]) AS "health_benefits",
    COALESCE("array_agg"(DISTINCT "eoeep"."energetic_property_id") FILTER (WHERE ("eoeep"."energetic_property_id" IS NOT NULL)), '{}'::"uuid"[]) AS "energetic_emotional_properties",
    COALESCE("array_agg"(DISTINCT "eoca"."chakra_id") FILTER (WHERE ("eoca"."chakra_id" IS NOT NULL)), '{}'::"uuid"[]) AS "chakras",
    COALESCE("array_agg"(DISTINCT "eoem"."extraction_method_id") FILTER (WHERE ("eoem"."extraction_method_id" IS NOT NULL)), '{}'::"uuid"[]) AS "extraction_methods",
    COALESCE("array_agg"(DISTINCT "eoec"."country_id") FILTER (WHERE ("eoec"."country_id" IS NOT NULL)), '{}'::"uuid"[]) AS "extraction_countries",
    COALESCE("array_agg"(DISTINCT "eopp"."plant_part_id") FILTER (WHERE ("eopp"."plant_part_id" IS NOT NULL)), '{}'::"uuid"[]) AS "plant_parts",
    COALESCE("array_agg"(DISTINCT "eoas"."scent_id") FILTER (WHERE ("eoas"."scent_id" IS NOT NULL)), '{}'::"uuid"[]) AS "aroma_scents"
   FROM (((((((((((("public"."essential_oils" "eo"
     LEFT JOIN "public"."essential_oil_application_methods" "eam" ON (("eo"."id" = "eam"."essential_oil_id")))
     LEFT JOIN "public"."essential_oil_pet_safety" "eps" ON (("eo"."id" = "eps"."essential_oil_id")))
     LEFT JOIN "public"."essential_oil_child_safety" "ecs" ON (("eo"."id" = "ecs"."essential_oil_id")))
     LEFT JOIN "public"."essential_oil_pregnancy_nursing_safety" "eopns" ON (("eo"."id" = "eopns"."essential_oil_id")))
     LEFT JOIN "public"."essential_oil_therapeutic_properties" "eotp" ON (("eo"."id" = "eotp"."essential_oil_id")))
     LEFT JOIN "public"."essential_oil_health_benefits" "eohb" ON (("eo"."id" = "eohb"."essential_oil_id")))
     LEFT JOIN "public"."essential_oil_energetic_emotional_properties" "eoeep" ON (("eo"."id" = "eoeep"."essential_oil_id")))
     LEFT JOIN "public"."essential_oil_chakra_association" "eoca" ON (("eo"."id" = "eoca"."essential_oil_id")))
     LEFT JOIN "public"."essential_oil_extraction_methods" "eoem" ON (("eo"."id" = "eoem"."essential_oil_id")))
     LEFT JOIN "public"."essential_oil_extraction_countries" "eoec" ON (("eo"."id" = "eoec"."essential_oil_id")))
     LEFT JOIN "public"."essential_oil_plant_parts" "eopp" ON (("eo"."id" = "eopp"."essential_oil_id")))
     LEFT JOIN "public"."essential_oil_aroma_scents" "eoas" ON (("eo"."id" = "eoas"."essential_oil_id")))
  GROUP BY "eo"."id";