create extension if not exists "pg_net" with schema "public" version '0.14.0';

drop trigger if exists "before_oil_set_names" on "public"."essential_oils";

drop policy "Allow select and update for public role" on "public"."essential_oils";

drop policy "Allow update for public role" on "public"."essential_oils";

drop function if exists "public"."match_essential_oils"(query_embedding vector, match_threshold double precision, match_count integer);

drop function if exists "public"."search_essential_oils"(query_text text, match_threshold double precision, match_count integer);

drop function if exists "public"."update_names_concatenated"();

alter table "public"."essential_oil_safety" drop constraint "essential_oil_safety_pkey";

drop index if exists "public"."essential_oil_safety_pkey";

create table "public"."essential_oil_health_issues" (
    "essential_oil_id" uuid not null,
    "health_issue_id" uuid not null,
    "notes" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."essential_oil_health_issues" enable row level security;

alter table "public"."essential_oils" alter column "names_concatenated" set default ((((name_english || ' | '::text) || name_scientific) || ' | '::text) || name_portuguese);

CREATE UNIQUE INDEX essential_oil_health_issues_pkey ON public.essential_oil_health_issues USING btree (essential_oil_id, health_issue_id);

CREATE UNIQUE INDEX essential_oil_safety_oil_char_key ON public.essential_oil_safety USING btree (essential_oil_id, safety_characteristic_id);

CREATE INDEX idx_eo_health_issues_issue ON public.essential_oil_health_issues USING btree (health_issue_id);

CREATE INDEX idx_eo_health_issues_oil ON public.essential_oil_health_issues USING btree (essential_oil_id);

CREATE UNIQUE INDEX essential_oil_safety_pkey ON public.essential_oil_safety USING btree (id);

alter table "public"."essential_oil_health_issues" add constraint "essential_oil_health_issues_pkey" PRIMARY KEY using index "essential_oil_health_issues_pkey";

alter table "public"."essential_oil_safety" add constraint "essential_oil_safety_pkey" PRIMARY KEY using index "essential_oil_safety_pkey";

alter table "public"."essential_oil_health_issues" add constraint "essential_oil_health_issues_essential_oil_id_fkey" FOREIGN KEY (essential_oil_id) REFERENCES essential_oils(id) ON DELETE CASCADE not valid;

alter table "public"."essential_oil_health_issues" validate constraint "essential_oil_health_issues_essential_oil_id_fkey";

alter table "public"."essential_oil_health_issues" add constraint "essential_oil_health_issues_health_issue_id_fkey" FOREIGN KEY (health_issue_id) REFERENCES health_issues(id) ON DELETE RESTRICT not valid;

alter table "public"."essential_oil_health_issues" validate constraint "essential_oil_health_issues_health_issue_id_fkey";

alter table "public"."essential_oil_safety" add constraint "essential_oil_safety_oil_char_key" UNIQUE using index "essential_oil_safety_oil_char_key";

set check_function_bodies = off;

create or replace view "public"."essential_oil_aggregated_details" as  SELECT eo.id AS essential_oil_id,
    eo.name_english,
    eo.name_scientific,
    eo.name_portuguese,
    eo.general_description,
    eo.names_concatenated,
    eo.created_at AS oil_created_at,
    eo.updated_at AS oil_updated_at,
    ( SELECT jsonb_agg(DISTINCT ad.descriptor) AS jsonb_agg
           FROM (essential_oil_aromatic_descriptors eoad
             JOIN aromatic_descriptors ad ON ((eoad.descriptor_id = ad.id)))
          WHERE (eoad.essential_oil_id = eo.id)) AS aromatic_descriptors,
    ( SELECT jsonb_agg(DISTINCT jsonb_build_object('name', cat.name, 'description', cat.description)) AS jsonb_agg
           FROM (essential_oil_categories eoc
             JOIN categories cat ON ((eoc.category_id = cat.id)))
          WHERE (eoc.essential_oil_id = eo.id)) AS categories,
    ( SELECT jsonb_agg(jsonb_build_object('name', cc.name, 'description', cc.description, 'min_percentage', eocc.min_percentage, 'max_percentage', eocc.max_percentage, 'typical_percentage', eocc.typical_percentage, 'percentage_range', eocc.percentage_range, 'notes', eocc.notes)) AS jsonb_agg
           FROM (essential_oil_chemical_compounds eocc
             JOIN chemical_compounds cc ON ((eocc.chemical_compound_id = cc.id)))
          WHERE (eocc.essential_oil_id = eo.id)) AS chemical_compounds,
    ( SELECT jsonb_agg(DISTINCT jsonb_build_object('name', co.name, 'iso2', co.iso_code_2)) AS jsonb_agg
           FROM (essential_oil_extraction_countries eoec
             JOIN countries co ON ((eoec.country_id = co.id)))
          WHERE (eoec.essential_oil_id = eo.id)) AS extraction_countries,
    ( SELECT jsonb_agg(DISTINCT jsonb_build_object('name', em.name, 'description', em.description)) AS jsonb_agg
           FROM (essential_oil_extraction_methods eoem
             JOIN extraction_methods em ON ((eoem.extraction_method_id = em.id)))
          WHERE (eoem.essential_oil_id = eo.id)) AS extraction_methods,
    ( SELECT jsonb_agg(DISTINCT jsonb_build_object('name', pp.name, 'description', pp.description)) AS jsonb_agg
           FROM (essential_oil_plant_parts eopp
             JOIN plant_parts pp ON ((eopp.plant_part_id = pp.id)))
          WHERE (eopp.essential_oil_id = eo.id)) AS plant_parts,
    ( SELECT jsonb_agg(jsonb_build_object('name', sc.name, 'description', sc.description, 'severity_level', sc.severity_level, 'notes', eos.notes)) AS jsonb_agg
           FROM (essential_oil_safety eos
             JOIN safety_characteristics sc ON ((eos.safety_characteristic_id = sc.id)))
          WHERE (eos.essential_oil_id = eo.id)) AS safety_info,
    ( SELECT jsonb_agg(jsonb_build_object('title', eus.suggestion_title, 'details', eus.suggestion_details, 'display_order', eus.display_order, 'usage_mode', um.name, 'usage_mode_icon', um.icon_svg, 'health_issues', ( SELECT jsonb_agg(DISTINCT jsonb_build_object('name', hi.name, 'description', hi.description)) AS jsonb_agg
                   FROM (suggestion_health_issue_links shil
                     JOIN health_issues hi ON ((shil.health_issue_id = hi.id)))
                  WHERE (shil.usage_suggestion_id = eus.id)))) AS jsonb_agg
           FROM (essential_oil_usage_suggestions eus
             JOIN usage_modes um ON ((eus.usage_mode_id = um.id)))
          WHERE (eus.essential_oil_id = eo.id)) AS usage_suggestions
   FROM essential_oils eo;


CREATE OR REPLACE FUNCTION public.get_essential_oils(p_query_embedding vector, p_match_threshold double precision, p_match_count integer)
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
$function$
;

CREATE OR REPLACE FUNCTION public.trigger_generate_oil_embedding()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

grant delete on table "public"."essential_oil_health_issues" to "anon";

grant insert on table "public"."essential_oil_health_issues" to "anon";

grant references on table "public"."essential_oil_health_issues" to "anon";

grant select on table "public"."essential_oil_health_issues" to "anon";

grant trigger on table "public"."essential_oil_health_issues" to "anon";

grant truncate on table "public"."essential_oil_health_issues" to "anon";

grant update on table "public"."essential_oil_health_issues" to "anon";

grant delete on table "public"."essential_oil_health_issues" to "authenticated";

grant insert on table "public"."essential_oil_health_issues" to "authenticated";

grant references on table "public"."essential_oil_health_issues" to "authenticated";

grant select on table "public"."essential_oil_health_issues" to "authenticated";

grant trigger on table "public"."essential_oil_health_issues" to "authenticated";

grant truncate on table "public"."essential_oil_health_issues" to "authenticated";

grant update on table "public"."essential_oil_health_issues" to "authenticated";

grant delete on table "public"."essential_oil_health_issues" to "service_role";

grant insert on table "public"."essential_oil_health_issues" to "service_role";

grant references on table "public"."essential_oil_health_issues" to "service_role";

grant select on table "public"."essential_oil_health_issues" to "service_role";

grant trigger on table "public"."essential_oil_health_issues" to "service_role";

grant truncate on table "public"."essential_oil_health_issues" to "service_role";

grant update on table "public"."essential_oil_health_issues" to "service_role";

create policy "Allow all operations for admin users"
on "public"."essential_oil_health_issues"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow read access for all users"
on "public"."essential_oil_health_issues"
as permissive
for select
to public
using (true);


create policy "Allow anonymous read access to essential_oils"
on "public"."essential_oils"
as permissive
for select
to anon
using (true);


create policy "Allow public read access to essential_oils"
on "public"."essential_oils"
as permissive
for select
to public
using (true);



