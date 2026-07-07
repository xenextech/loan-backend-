--
-- PostgreSQL database dump
--

\restrict OpqnCGxn2VPXZBYOg9xuzOGZlZYHi09aRjB9OKY768KffOVQTrfYQi8SItaTDXO

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.10 (Ubuntu 17.10-1.pgdg22.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: ApplicationLinkType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ApplicationLinkType" AS ENUM (
    'PARENT',
    'COLLEGE'
);


ALTER TYPE public."ApplicationLinkType" OWNER TO postgres;

--
-- Name: ApplicationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ApplicationStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED'
);


ALTER TYPE public."ApplicationStatus" OWNER TO postgres;

--
-- Name: AuditAction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AuditAction" AS ENUM (
    'APPLICATION_CREATED',
    'APPLICATION_UPDATED',
    'APPLICATION_SUBMITTED',
    'APPLICATION_LINK_GENERATED',
    'COLLEGE_FORM_SUBMITTED',
    'PARENT_FORM_SUBMITTED'
);


ALTER TYPE public."AuditAction" OWNER TO postgres;

--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DocumentType" AS ENUM (
    'IDENTITY_FRONT',
    'IDENTITY_BACK',
    'APPLICANT_PHOTO',
    'ACADEMIC_RECORD',
    'FEE_STRUCTURE',
    'STUDENT_APPLICATION',
    'OFFER_LETTER',
    'ENROLLMENT_DOCUMENT'
);


ALTER TYPE public."DocumentType" OWNER TO postgres;

--
-- Name: FamilyStructure; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FamilyStructure" AS ENUM (
    'NUCLEAR',
    'JOINT',
    'EXTENDED',
    'SINGLE_PARENT',
    'OTHER'
);


ALTER TYPE public."FamilyStructure" OWNER TO postgres;

--
-- Name: FeeStructureMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FeeStructureMethod" AS ENUM (
    'DOCUMENT',
    'LINK',
    'MANUAL'
);


ALTER TYPE public."FeeStructureMethod" OWNER TO postgres;

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);


ALTER TYPE public."Gender" OWNER TO postgres;

--
-- Name: IdentityType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."IdentityType" AS ENUM (
    'CITIZENSHIP',
    'PASSPORT',
    'DRIVING_LICENSE'
);


ALTER TYPE public."IdentityType" OWNER TO postgres;

--
-- Name: MaritalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MaritalStatus" AS ENUM (
    'SINGLE',
    'MARRIED',
    'DIVORCED',
    'WIDOWED'
);


ALTER TYPE public."MaritalStatus" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'DATABASE',
    'EMAIL'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: Occupation; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Occupation" AS ENUM (
    'STUDENT',
    'EMPLOYED',
    'SELF_EMPLOYED',
    'UNEMPLOYED'
);


ALTER TYPE public."Occupation" OWNER TO postgres;

--
-- Name: PeriodUnit; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PeriodUnit" AS ENUM (
    'YEAR',
    'MONTH'
);


ALTER TYPE public."PeriodUnit" OWNER TO postgres;

--
-- Name: StudyType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StudyType" AS ENUM (
    'PROGRAM',
    'COURSE',
    'DIPLOMA',
    'CERTIFICATION'
);


ALTER TYPE public."StudyType" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'STUDENT',
    'ADMIN',
    'PARENT',
    'COLLEGE',
    'INITIATOR',
    'SUPPORTER',
    'APPROVER',
    'CHECKER'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
begin
    if not exists (
        select 1
        from pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: supabase_admin
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


ALTER FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) OWNER TO supabase_admin;

--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        else
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value),
        '{}'
    ) from unnest(new.filters) f;

    new.selected_columns = (
        select array_agg(c order by c)
        from unnest(new.selected_columns) c
    );

    return new;
end;
$$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


ALTER FUNCTION realtime.wal2json_escape_identifier(name text) OWNER TO supabase_admin;

--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


ALTER FUNCTION storage.allow_any_operation(expected_operations text[]) OWNER TO supabase_storage_admin;

--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


ALTER FUNCTION storage.allow_only_operation(expected_operation text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


ALTER TABLE auth.custom_oauth_providers OWNER TO supabase_auth_admin;

--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


ALTER TABLE auth.webauthn_challenges OWNER TO supabase_auth_admin;

--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


ALTER TABLE auth.webauthn_credentials OWNER TO supabase_auth_admin;

--
-- Name: FamilyMember; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FamilyMember" (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "personName" text,
    age integer,
    qualification text,
    "relationshipWithBorrower" text,
    "occupationSocialInvolvement" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FamilyMember" OWNER TO postgres;

--
-- Name: Insurance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Insurance" (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "insuredAssets" text,
    "valueOfAssets" numeric(18,2),
    "sumOfInsurance" numeric(18,2),
    "insuranceCoverage" numeric(5,2),
    "insuranceRemarks" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Insurance" OWNER TO postgres;

--
-- Name: PersonalGuarantee; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PersonalGuarantee" (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "nameOfGuarantor" text,
    relationship text,
    age integer,
    "netWorth" numeric(18,2),
    "guarantorConsent" boolean,
    "ciclStatus" boolean,
    "ciclRemarks" text,
    "blackListedDate" timestamp(3) without time zone,
    "releasedDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PersonalGuarantee" OWNER TO postgres;

--
-- Name: RepaymentCapacity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RepaymentCapacity" (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "insuredAssets" integer,
    "valueOfAssets" numeric(18,2),
    "sumOfInsurance" numeric(18,2),
    "insuranceCoverage" numeric(5,2),
    "insuranceRemarks" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RepaymentCapacity" OWNER TO postgres;

--
-- Name: Security; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Security" (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "securityDetails" text,
    fmv numeric(18,2),
    "proposedLoan" numeric(18,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "financeAgainstFmv" numeric(5,2)
);


ALTER TABLE public."Security" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: agreements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agreements (
    id text NOT NULL,
    "createdByEmail" text NOT NULL,
    "collegeName" text NOT NULL,
    "collegeAddress" text,
    "collegeRegNo" text,
    "collegeAffiliation" text,
    "collegePhone" text,
    "collegeEmail" text,
    "collegeWebsite" text,
    "logoUrl" text,
    "refNo" text NOT NULL,
    "issuedDateAD" text,
    "issuedDateBS" text,
    "studentFullName" text NOT NULL,
    "tuRollNo" text,
    "enrollmentNo" text,
    "programName" text,
    "currentYear" text,
    "currentSemester" text,
    "academicYearBS" text,
    "studentStatus" text,
    "isEnrolled" boolean DEFAULT true NOT NULL,
    "hasBacklogs" boolean DEFAULT false NOT NULL,
    "disciplinaryHold" boolean DEFAULT false NOT NULL,
    "feeDueRs" numeric(14,2),
    "qrToken" text,
    "qrVerifyUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.agreements OWNER TO postgres;

--
-- Name: application_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_links (
    id text NOT NULL,
    token text NOT NULL,
    "applicationId" text NOT NULL,
    "linkType" public."ApplicationLinkType" NOT NULL,
    "recipientEmail" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "accessedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.application_links OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text NOT NULL,
    "applicationId" text,
    action public."AuditAction" NOT NULL,
    payload jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: college_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.college_verifications (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "collegeName" text,
    "collegeEmail" text,
    "contactPerson" text,
    "contactPhone" text,
    "isApplicationVerified" boolean DEFAULT false NOT NULL,
    "verificationNotes" text,
    "offerLetterFileName" text,
    "offerLetterOriginalFileName" text,
    "offerLetterMimeType" text,
    "offerLetterSize" integer,
    "offerLetterBucketName" text,
    "offerLetterFilePath" text,
    "offerLetterPublicUrl" text,
    "enrollmentDocFileName" text,
    "enrollmentDocOriginalFileName" text,
    "enrollmentDocMimeType" text,
    "enrollmentDocSize" integer,
    "enrollmentDocBucketName" text,
    "enrollmentDocFilePath" text,
    "enrollmentDocPublicUrl" text,
    "submittedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.college_verifications OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "documentType" public."DocumentType" NOT NULL,
    "fileName" text NOT NULL,
    "originalFileName" text NOT NULL,
    "mimeType" text NOT NULL,
    size integer NOT NULL,
    "bucketName" text NOT NULL,
    "filePath" text NOT NULL,
    "publicUrl" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: enrollment_certificates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enrollment_certificates (
    id text NOT NULL,
    "createdByEmail" text NOT NULL,
    "collegeName" text NOT NULL,
    "collegeCode" text,
    "collegeAddress" text,
    "collegeRegNo" text,
    "collegeAffiliation" text,
    "collegePhone" text,
    "collegeEmail" text,
    "collegeWebsite" text,
    "logoUrl" text,
    "refNo" text NOT NULL,
    "issuedDateAD" text,
    "issuedDateBS" text,
    "studentFullName" text NOT NULL,
    "tuRollNo" text,
    "enrollmentNo" text,
    "programName" text,
    "currentYear" text,
    "currentSemester" text,
    "academicYearBS" text,
    "studentStatus" text,
    "isEnrolled" boolean DEFAULT true NOT NULL,
    "hasBacklogs" boolean DEFAULT false NOT NULL,
    "disciplinaryHold" boolean DEFAULT false NOT NULL,
    "feeDueRs" numeric(14,2),
    "qrToken" text,
    "qrVerifyUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.enrollment_certificates OWNER TO postgres;

--
-- Name: loan_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loan_applications (
    id text NOT NULL,
    "applicationNumber" text,
    status public."ApplicationStatus" DEFAULT 'DRAFT'::public."ApplicationStatus" NOT NULL,
    "userId" text,
    "fullName" text,
    email text,
    "phoneNumber" text,
    "identityType" public."IdentityType",
    "identityNumber" text,
    "identityName" text,
    "dateOfBirth" timestamp(3) without time zone,
    gender public."Gender",
    occupation public."Occupation",
    "issuedDistrict" text,
    "issuedDate" timestamp(3) without time zone,
    province text,
    district text,
    municipality text,
    ward text,
    "fatherName" text,
    "motherName" text,
    "grandfatherName" text,
    "maritalStatus" public."MaritalStatus",
    "spouseName" text,
    "informationAccurate" boolean,
    "authorizeVerification" boolean,
    "submittedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "accountStrategy" text,
    "approverDate" timestamp(3) without time zone,
    "approverName" text,
    "approverPost" text,
    "approverSignature" text,
    "bankingRelationship" text,
    "baselClassification" text,
    "baselRiskWeight" integer,
    "citizenshipIssuedDate" timestamp(3) without time zone,
    "citizenshipIssuedPlace" text,
    "citizenshipNumber" text,
    "conclusionAndRecommendation" text,
    "correspondenceAddress" text,
    "customerGroup" text,
    "disbursementSection" text,
    "existingBankingRelationship" text,
    facility text,
    "familyStructureType" public."FamilyStructure",
    fee numeric(18,2),
    "greenFinanceEconomicSector" text,
    "greenFinanceSubSector" text,
    "greenFinanceTaxonomyTag" text,
    "initiatorDate" timestamp(3) without time zone,
    "initiatorName" text,
    "initiatorPost" text,
    "initiatorSignature" text,
    "interestRate" numeric(5,2),
    "isBlacklisted" boolean,
    "justificationOfLoan" text,
    "keyCreditRiskMitigation" text,
    "licenseNumber" text,
    "limit" numeric(18,2),
    "moneyLaunderingRisk" text,
    "nidNumber" text,
    "nrb93KaProductCode" text,
    "nrb93SectorCode" text,
    "nrb94SecurityTypeCode" text,
    "obligorNumber" text,
    "panNumber" text,
    period integer,
    "periodUnit" public."PeriodUnit",
    "permanentAddress" text,
    profession text,
    purpose text,
    "relationshipStartDate" timestamp(3) without time zone,
    remarks text,
    "repaymentSource" text,
    "sis0IndustrialClassification" text,
    "sis1ProductType" text,
    "sis2Sector" text,
    "sis3Security" text,
    "sis4InstitutionalGroupingOfBorrower" text,
    "sis9PriorityLending" text,
    "supporterDate" timestamp(3) without time zone,
    "supporterName" text,
    "supporterPost" text,
    "supporterSignature" text,
    "termsAndConditions" text,
    "utilizationOfFund" text,
    waiver text,
    dsgir integer,
    "loanToValueRatio" numeric(5,2),
    "operationOfInstitution" integer,
    "parentsBorrowingsWithBFIs" text,
    "performanceYears" integer,
    "satisfactoryPerformance" integer,
    "sourceOfIncome" text,
    "bankingRelationshipScore" integer,
    "creditLimit" numeric(18,2),
    "creditRiskScoring" text,
    "riskGrade" text,
    "sourceOfIncomeScore" integer,
    "totalPercentage" numeric(5,2),
    "totalScore" integer,
    "customerName" text
);


ALTER TABLE public.loan_applications OWNER TO postgres;

--
-- Name: loan_information; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loan_information (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "loanAmount" numeric(12,2),
    "expectedSalary" numeric(12,2),
    "feeStructureMethod" public."FeeStructureMethod",
    "feeStructureUrl" text,
    "feeStructureText" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.loan_information OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    "applicationId" text,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: offer_letters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offer_letters (
    id text NOT NULL,
    "createdByEmail" text NOT NULL,
    "collegeName" text NOT NULL,
    "collegeAddress" text,
    "collegeRegNo" text,
    "collegeAffiliation" text,
    "collegePhone" text,
    "collegeEmail" text,
    "collegeWebsite" text,
    "logoUrl" text,
    "refNo" text NOT NULL,
    "issuedDateAD" text,
    "issuedDateBS" text,
    "validUntilAD" text,
    "validUntilBS" text,
    "studentFullName" text NOT NULL,
    "studentDobAD" text,
    "studentDobBS" text,
    "citizenshipNumber" text,
    "fatherName" text,
    "motherName" text,
    "permanentAddress" text,
    district text,
    province text,
    "programName" text,
    "programFullName" text,
    "programAffiliation" text,
    "durationYears" integer,
    "totalSemesters" integer,
    "creditHours" integer,
    "academicYearBS" text,
    "intakeMonthBS" text,
    "admissionFee" numeric(14,2),
    "tuitionPerSem" numeric(14,2),
    "examFeePerSem" numeric(14,2),
    "labFeePerSem" numeric(14,2),
    "totalApprox" numeric(14,2),
    conditions jsonb,
    signatories jsonb,
    "qrToken" text,
    "qrVerifyUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.offer_letters OWNER TO postgres;

--
-- Name: parent_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parent_profiles (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text,
    phone text,
    contact text,
    "citizenshipNumber" text,
    "salaryBankName" text,
    "bankAccountNumber" text,
    "salarySheetFileName" text,
    "salarySheetOriginalFileName" text,
    "salarySheetMimeType" text,
    "salarySheetSize" integer,
    "salarySheetBucketName" text,
    "salarySheetFilePath" text,
    "salarySheetPublicUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.parent_profiles OWNER TO postgres;

--
-- Name: parent_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parent_verifications (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    name text,
    phone text,
    contact text,
    "citizenshipNumber" text,
    "salaryBankName" text,
    "bankAccountNumber" text,
    "salarySheetFileName" text,
    "salarySheetOriginalFileName" text,
    "salarySheetMimeType" text,
    "salarySheetSize" integer,
    "salarySheetBucketName" text,
    "salarySheetFilePath" text,
    "salarySheetPublicUrl" text,
    "submittedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.parent_verifications OWNER TO postgres;

--
-- Name: study_information; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.study_information (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "studyType" public."StudyType",
    "courseName" text,
    "boardUniversity" text,
    "courseDuration" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.study_information OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."UserRole" DEFAULT 'STUDENT'::public."UserRole" NOT NULL,
    "isEmailVerified" boolean DEFAULT false NOT NULL,
    "emailVerifyToken" text,
    "emailVerifyExpiry" timestamp(3) without time zone,
    "passwordResetToken" text,
    "passwordResetExpiry" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at, custom_claims_allowlist) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
20260625000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: FamilyMember; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FamilyMember" (id, "applicationId", "personName", age, qualification, "relationshipWithBorrower", "occupationSocialInvolvement", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Insurance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Insurance" (id, "applicationId", "insuredAssets", "valueOfAssets", "sumOfInsurance", "insuranceCoverage", "insuranceRemarks", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PersonalGuarantee; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PersonalGuarantee" (id, "applicationId", "nameOfGuarantor", relationship, age, "netWorth", "guarantorConsent", "ciclStatus", "ciclRemarks", "blackListedDate", "releasedDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RepaymentCapacity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RepaymentCapacity" (id, "applicationId", "insuredAssets", "valueOfAssets", "sumOfInsurance", "insuranceCoverage", "insuranceRemarks", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Security; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Security" (id, "applicationId", "securityDetails", fmv, "proposedLoan", "createdAt", "updatedAt", "financeAgainstFmv") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
71348f33-02e1-4629-b19d-7fab6725d8e6	4e8f3f014c37336961d658c8255b46e1de3ae8c8cf25ac2978611575117a64b5	2026-07-03 01:23:47.333417+00	20260701122417_add	\N	\N	2026-07-03 01:23:32.486192+00	1
1cbb1bb7-2c72-422f-92f7-d9629b1abc14	74e209fa603cd398b3315b5f8228225bb9f8064317e25baa555982205089b078	2026-07-03 01:23:48.551176+00	20260702044534_add	\N	\N	2026-07-03 01:23:47.712221+00	1
3d54c555-fe21-48f1-992f-1caffc61bee4	2edca574601e43cfee94d0e29c1d7fdd9792655694f0034f3af88b64c2b02a78	2026-07-03 01:23:50.809946+00	20260702052935_changed	\N	\N	2026-07-03 01:23:48.892212+00	1
7748048b-3b3c-47a8-b146-abc703b5adef	1fde4578eb5cd4788de92483ff2a6b6e98b85f791e3c0b182378469fa38508f2	2026-07-03 01:23:54.65212+00	20260702070514_changed	\N	\N	2026-07-03 01:23:51.144288+00	1
1b478beb-3e0e-4456-9724-356fd9a682d4	eda4f5eff7c04c69c36fa08f319b3547517e3095ef116bbea47c3ff8ec889569	2026-07-03 01:23:56.179207+00	20260702080544_changed	\N	\N	2026-07-03 01:23:54.998348+00	1
e228447e-7279-4d99-a07f-713a2ddf041f	3d69e9cdc0294a3e4ea38ab4dfc5850eea544f8af8a9b08130aa08be43851a67	2026-07-03 01:23:59.100357+00	20260702111047_schema_updated	\N	\N	2026-07-03 01:23:56.515213+00	1
b7ba2f39-e995-445b-9661-0a0fed5f6833	000382089106c42f366cb42642bc8eb90d25da75d156134beb6872a2d1041f61	2026-07-03 01:24:00.275895+00	20260702120251_option	\N	\N	2026-07-03 01:23:59.435622+00	1
e758677f-39a5-4926-bb97-fd887a055194	da3584b5feac62fa62cdc463b206ce2ebb6ab756b317f87f8287692366988113	2026-07-03 01:24:01.441011+00	20260702120916_option	\N	\N	2026-07-03 01:24:00.607952+00	1
ae16f878-03e1-43d0-a0f1-89b858f3ad3e	f02a78292cff1028652f430a11aa6c5bca0fbbe88e5345ba1d55c89a617e1a9d	2026-07-03 01:24:02.613073+00	20260702162935_option	\N	\N	2026-07-03 01:24:01.775607+00	1
0d21140f-dc53-414b-b67a-ccb09223d86d	7a3946de566d56192ee2122c5e5c2b8abd8a39457142deda62e2754a881d1ad2	2026-07-02 11:20:13.961501+00	20260701122417_add	\N	\N	2026-07-02 11:19:49.600728+00	1
0bc2ac13-baa3-4d97-8746-5f506d456aa2	74e209fa603cd398b3315b5f8228225bb9f8064317e25baa555982205089b078	2026-07-02 11:20:16.838063+00	20260702044534_add	\N	\N	2026-07-02 11:20:14.611779+00	1
a3d98b26-2f44-48ae-8895-848ec6377bdd	2edca574601e43cfee94d0e29c1d7fdd9792655694f0034f3af88b64c2b02a78	2026-07-02 11:20:25.23591+00	20260702052935_changed	\N	\N	2026-07-02 11:20:17.393692+00	1
376b2124-16a1-48c7-91dd-a93f83abb750	1fde4578eb5cd4788de92483ff2a6b6e98b85f791e3c0b182378469fa38508f2	2026-07-02 11:20:33.10349+00	20260702070514_changed	\N	\N	2026-07-02 11:20:25.852799+00	1
da665bb1-123b-4786-832c-7b398d10420b	eda4f5eff7c04c69c36fa08f319b3547517e3095ef116bbea47c3ff8ec889569	2026-07-02 11:20:36.583294+00	20260702080544_changed	\N	\N	2026-07-02 11:20:33.803476+00	1
990cd67c-681a-4cbd-b176-ea551b5a6fde	3d69e9cdc0294a3e4ea38ab4dfc5850eea544f8af8a9b08130aa08be43851a67	2026-07-02 11:20:42.439555+00	20260702111047_schema_updated	\N	\N	2026-07-02 11:20:37.217338+00	1
d70db861-3a38-4d87-aacb-3192b8440397	000382089106c42f366cb42642bc8eb90d25da75d156134beb6872a2d1041f61	2026-07-02 12:02:54.179081+00	20260702120251_option	\N	\N	2026-07-02 12:02:52.549669+00	1
239944b2-9aa6-4b2d-bcc9-7db543d67d67	da3584b5feac62fa62cdc463b206ce2ebb6ab756b317f87f8287692366988113	2026-07-02 12:09:19.240531+00	20260702120916_option	\N	\N	2026-07-02 12:09:17.805617+00	1
d7df2309-74d1-4454-900f-6ff699b6cee4	f02a78292cff1028652f430a11aa6c5bca0fbbe88e5345ba1d55c89a617e1a9d	2026-07-02 16:29:37.550321+00	20260702162935_option	\N	\N	2026-07-02 16:29:36.626121+00	1
05d4fac5-a9e7-4695-985f-4f2100528aa8	70b61744ee2ca16210d1b16c49453abd79449968aa8b880d351ff2e657b3dd87	2026-07-02 16:45:48.987617+00	20260702164547_option	\N	\N	2026-07-02 16:45:48.125812+00	1
\.


--
-- Data for Name: agreements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agreements (id, "createdByEmail", "collegeName", "collegeAddress", "collegeRegNo", "collegeAffiliation", "collegePhone", "collegeEmail", "collegeWebsite", "logoUrl", "refNo", "issuedDateAD", "issuedDateBS", "studentFullName", "tuRollNo", "enrollmentNo", "programName", "currentYear", "currentSemester", "academicYearBS", "studentStatus", "isEnrolled", "hasBacklogs", "disciplinaryHold", "feeDueRs", "qrToken", "qrVerifyUrl", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: application_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_links (id, token, "applicationId", "linkType", "recipientEmail", "expiresAt", "accessedAt", "createdAt") FROM stdin;
3d3039fb-4cce-4bda-8223-60059ea3c1cd	202e5b9ffcee7ba7eaf912662377d97830ac45eea2dfade9a040d793b9f28491	7c34b546-c77f-4364-b30f-0401e6d673f4	PARENT	parent1@yopmail.com	2026-07-06 02:06:08.678	\N	2026-07-03 02:06:09.581
657cce6c-6497-41c2-9a99-42e741b6f4c2	55c3c7335fd08aa67fdd99347ac5cab7ca15fb9787697e2880319a221f769ff1	7c34b546-c77f-4364-b30f-0401e6d673f4	COLLEGE	parent2@yopmail.com	2026-07-06 02:06:08.678	\N	2026-07-03 02:06:09.766
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, "userId", "applicationId", action, payload, "createdAt") FROM stdin;
d43bd37a-3fc1-40ee-83ff-60c012764770	5a27461a-5a1e-4d2a-b84f-a7b2be459551	7c34b546-c77f-4364-b30f-0401e6d673f4	APPLICATION_CREATED	{"applicationId": "7c34b546-c77f-4364-b30f-0401e6d673f4", "applicationNumber": "Unnati-2026-44069"}	2026-07-03 02:04:01.489
6c9f14b7-6be6-4353-9fba-43161dda8425	5a27461a-5a1e-4d2a-b84f-a7b2be459551	7c34b546-c77f-4364-b30f-0401e6d673f4	APPLICATION_UPDATED	{"step": 1}	2026-07-03 02:04:21.436
d41d137f-3026-4fe1-b40f-dca8279c029c	5a27461a-5a1e-4d2a-b84f-a7b2be459551	7c34b546-c77f-4364-b30f-0401e6d673f4	APPLICATION_UPDATED	{"step": 2}	2026-07-03 02:05:11.765
9d67da9c-19d4-4f6a-8c36-d4caa09a1fda	5a27461a-5a1e-4d2a-b84f-a7b2be459551	7c34b546-c77f-4364-b30f-0401e6d673f4	APPLICATION_UPDATED	{"step": 3}	2026-07-03 02:05:39.219
98d67ee4-4415-4503-944d-90a7ddcc745d	5a27461a-5a1e-4d2a-b84f-a7b2be459551	7c34b546-c77f-4364-b30f-0401e6d673f4	APPLICATION_SUBMITTED	{"applicationNumber": "Unnati-2026-44069"}	2026-07-03 02:06:10.127
81b09c0f-d791-426d-a991-299fa58c5b42	5a27461a-5a1e-4d2a-b84f-a7b2be459551	7c34b546-c77f-4364-b30f-0401e6d673f4	APPLICATION_LINK_GENERATED	{"applicationNumber": "Unnati-2026-44069"}	2026-07-03 02:06:10.309
\.


--
-- Data for Name: college_verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.college_verifications (id, "applicationId", "collegeName", "collegeEmail", "contactPerson", "contactPhone", "isApplicationVerified", "verificationNotes", "offerLetterFileName", "offerLetterOriginalFileName", "offerLetterMimeType", "offerLetterSize", "offerLetterBucketName", "offerLetterFilePath", "offerLetterPublicUrl", "enrollmentDocFileName", "enrollmentDocOriginalFileName", "enrollmentDocMimeType", "enrollmentDocSize", "enrollmentDocBucketName", "enrollmentDocFilePath", "enrollmentDocPublicUrl", "submittedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, "applicationId", "documentType", "fileName", "originalFileName", "mimeType", size, "bucketName", "filePath", "publicUrl", "uploadedAt", "createdAt", "updatedAt") FROM stdin;
0cef5bc0-7144-4d3d-ae9f-a4d1136eff43	7c34b546-c77f-4364-b30f-0401e6d673f4	APPLICANT_PHOTO	2c6282ef-2e20-4074-99d1-aa048a069928.png	Screenshot from 2026-06-25 17-05-15.png	image/png	409484	Private	7c34b546-c77f-4364-b30f-0401e6d673f4/2c6282ef-2e20-4074-99d1-aa048a069928.png	https://bbmeqqukbqeqxhvdlors.supabase.co/storage/v1/object/sign/Private/7c34b546-c77f-4364-b30f-0401e6d673f4/2c6282ef-2e20-4074-99d1-aa048a069928.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kY2U0ODEzMS0yNTIxLTRmOWItYTdjNC01ZjAwYmRmNDUxMGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQcml2YXRlLzdjMzRiNTQ2LWM3N2YtNDM2NC1iMzBmLTA0MDFlNmQ2NzNmNC8yYzYyODJlZi0yZTIwLTQwNzQtOTlkMS1hYTA0OGEwNjk5MjgucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MzA0NDMwMSwiZXhwIjoxODE0NTgwMzAxfQ.eqcaFuCCtZutHoALvgYDwQ6_xAKX1Rlv5OGVAkB2L6I	2026-07-03 02:05:01.602	2026-07-03 02:05:01.602	2026-07-03 02:05:01.602
9d340811-1cb5-452a-b360-78bc1f755239	7c34b546-c77f-4364-b30f-0401e6d673f4	IDENTITY_FRONT	47fd1404-0760-4ed9-a9ad-0135e08ca8da.png	Screenshot from 2026-06-25 17-05-15.png	image/png	409484	Private	7c34b546-c77f-4364-b30f-0401e6d673f4/47fd1404-0760-4ed9-a9ad-0135e08ca8da.png	https://bbmeqqukbqeqxhvdlors.supabase.co/storage/v1/object/sign/Private/7c34b546-c77f-4364-b30f-0401e6d673f4/47fd1404-0760-4ed9-a9ad-0135e08ca8da.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kY2U0ODEzMS0yNTIxLTRmOWItYTdjNC01ZjAwYmRmNDUxMGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQcml2YXRlLzdjMzRiNTQ2LWM3N2YtNDM2NC1iMzBmLTA0MDFlNmQ2NzNmNC80N2ZkMTQwNC0wNzYwLTRlZDktYTlhZC0wMTM1ZTA4Y2E4ZGEucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MzA0NDMwOSwiZXhwIjoxODE0NTgwMzA5fQ.VaaBAbR-siFt2DmPsirOjx-Nc3gf1KY5l2Z5DiAnj3o	2026-07-03 02:05:09.24	2026-07-03 02:05:09.24	2026-07-03 02:05:09.24
be2509d9-f6e5-4bed-ad48-1c4bbc49e835	7c34b546-c77f-4364-b30f-0401e6d673f4	IDENTITY_BACK	2fc2482c-6beb-43af-a44b-f9d36c49126c.png	Screenshot from 2026-06-22 09-39-44.png	image/png	247755	Private	7c34b546-c77f-4364-b30f-0401e6d673f4/2fc2482c-6beb-43af-a44b-f9d36c49126c.png	https://bbmeqqukbqeqxhvdlors.supabase.co/storage/v1/object/sign/Private/7c34b546-c77f-4364-b30f-0401e6d673f4/2fc2482c-6beb-43af-a44b-f9d36c49126c.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kY2U0ODEzMS0yNTIxLTRmOWItYTdjNC01ZjAwYmRmNDUxMGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQcml2YXRlLzdjMzRiNTQ2LWM3N2YtNDM2NC1iMzBmLTA0MDFlNmQ2NzNmNC8yZmMyNDgyYy02YmViLTQzYWYtYTQ0Yi1mOWQzNmM0OTEyNmMucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MzA0NDMxMSwiZXhwIjoxODE0NTgwMzExfQ.g_6TUdMfAQtPNehchUEVroysJSceDP3C2P9AdVF4sqw	2026-07-03 02:05:11.998	2026-07-03 02:05:11.998	2026-07-03 02:05:11.998
135857e4-7bd5-48e2-8680-70b5565160f0	7c34b546-c77f-4364-b30f-0401e6d673f4	ACADEMIC_RECORD	13438782-15e6-407b-9d48-82bcb0280077.docx	Unnati_Full_Platform_PRD_v1.0 (2).docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	41178	Private	7c34b546-c77f-4364-b30f-0401e6d673f4/13438782-15e6-407b-9d48-82bcb0280077.docx	https://bbmeqqukbqeqxhvdlors.supabase.co/storage/v1/object/sign/Private/7c34b546-c77f-4364-b30f-0401e6d673f4/13438782-15e6-407b-9d48-82bcb0280077.docx?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kY2U0ODEzMS0yNTIxLTRmOWItYTdjNC01ZjAwYmRmNDUxMGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQcml2YXRlLzdjMzRiNTQ2LWM3N2YtNDM2NC1iMzBmLTA0MDFlNmQ2NzNmNC8xMzQzODc4Mi0xNWU2LTQwN2ItOWQ0OC04MmJjYjAyODAwNzcuZG9jeCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODMwNDQzMzMsImV4cCI6MTgxNDU4MDMzM30.Get7ZPTcSdafv3mD2AyuNzUINCjhwgix1r9caW6JniE	2026-07-03 02:05:33.369	2026-07-03 02:05:33.369	2026-07-03 02:05:33.369
38a76024-fc7a-4ca2-94ec-ca66e96db538	7c34b546-c77f-4364-b30f-0401e6d673f4	FEE_STRUCTURE	d3c1cc77-1eb9-44d0-8e4d-b0da89198340.docx	Unnati_Full_Platform_PRD_v1.0 (2).docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	41178	Private	7c34b546-c77f-4364-b30f-0401e6d673f4/d3c1cc77-1eb9-44d0-8e4d-b0da89198340.docx	https://bbmeqqukbqeqxhvdlors.supabase.co/storage/v1/object/sign/Private/7c34b546-c77f-4364-b30f-0401e6d673f4/d3c1cc77-1eb9-44d0-8e4d-b0da89198340.docx?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kY2U0ODEzMS0yNTIxLTRmOWItYTdjNC01ZjAwYmRmNDUxMGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQcml2YXRlLzdjMzRiNTQ2LWM3N2YtNDM2NC1iMzBmLTA0MDFlNmQ2NzNmNC9kM2MxY2M3Ny0xZWI5LTQ0ZDAtOGU0ZC1iMGRhODkxOTgzNDAuZG9jeCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODMwNDQzMzgsImV4cCI6MTgxNDU4MDMzOH0.XMvdWg4YuseacRPTzaDDJnHeQdxJ-NEkRhMPOiK8rL0	2026-07-03 02:05:38.32	2026-07-03 02:05:38.32	2026-07-03 02:05:38.32
\.


--
-- Data for Name: enrollment_certificates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollment_certificates (id, "createdByEmail", "collegeName", "collegeCode", "collegeAddress", "collegeRegNo", "collegeAffiliation", "collegePhone", "collegeEmail", "collegeWebsite", "logoUrl", "refNo", "issuedDateAD", "issuedDateBS", "studentFullName", "tuRollNo", "enrollmentNo", "programName", "currentYear", "currentSemester", "academicYearBS", "studentStatus", "isEnrolled", "hasBacklogs", "disciplinaryHold", "feeDueRs", "qrToken", "qrVerifyUrl", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: loan_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loan_applications (id, "applicationNumber", status, "userId", "fullName", email, "phoneNumber", "identityType", "identityNumber", "identityName", "dateOfBirth", gender, occupation, "issuedDistrict", "issuedDate", province, district, municipality, ward, "fatherName", "motherName", "grandfatherName", "maritalStatus", "spouseName", "informationAccurate", "authorizeVerification", "submittedAt", "createdAt", "updatedAt", "accountStrategy", "approverDate", "approverName", "approverPost", "approverSignature", "bankingRelationship", "baselClassification", "baselRiskWeight", "citizenshipIssuedDate", "citizenshipIssuedPlace", "citizenshipNumber", "conclusionAndRecommendation", "correspondenceAddress", "customerGroup", "disbursementSection", "existingBankingRelationship", facility, "familyStructureType", fee, "greenFinanceEconomicSector", "greenFinanceSubSector", "greenFinanceTaxonomyTag", "initiatorDate", "initiatorName", "initiatorPost", "initiatorSignature", "interestRate", "isBlacklisted", "justificationOfLoan", "keyCreditRiskMitigation", "licenseNumber", "limit", "moneyLaunderingRisk", "nidNumber", "nrb93KaProductCode", "nrb93SectorCode", "nrb94SecurityTypeCode", "obligorNumber", "panNumber", period, "periodUnit", "permanentAddress", profession, purpose, "relationshipStartDate", remarks, "repaymentSource", "sis0IndustrialClassification", "sis1ProductType", "sis2Sector", "sis3Security", "sis4InstitutionalGroupingOfBorrower", "sis9PriorityLending", "supporterDate", "supporterName", "supporterPost", "supporterSignature", "termsAndConditions", "utilizationOfFund", waiver, dsgir, "loanToValueRatio", "operationOfInstitution", "parentsBorrowingsWithBFIs", "performanceYears", "satisfactoryPerformance", "sourceOfIncome", "bankingRelationshipScore", "creditLimit", "creditRiskScoring", "riskGrade", "sourceOfIncomeScore", "totalPercentage", "totalScore", "customerName") FROM stdin;
7c34b546-c77f-4364-b30f-0401e6d673f4	Unnati-2026-44069	SUBMITTED	5a27461a-5a1e-4d2a-b84f-a7b2be459551	Rabi Gautam	rabigautam43@gmail.com	+9779863445987	CITIZENSHIP	25-02-77-03456	Ram Bahadur Thapa	2026-07-03 00:00:00	MALE	EMPLOYED	Kathmandu	2026-07-04 00:00:00	Bagmati	lalitpur	mahalaxmi	4	Abc xyz	Abc xyz	hjggvj	SINGLE	\N	t	t	2026-07-03 02:06:08.679	2026-07-03 02:04:01.282	2026-07-03 02:06:08.862	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: loan_information; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loan_information (id, "applicationId", "loanAmount", "expectedSalary", "feeStructureMethod", "feeStructureUrl", "feeStructureText", "createdAt", "updatedAt") FROM stdin;
8a326c8c-8b98-4822-b46d-646f470e5904	7c34b546-c77f-4364-b30f-0401e6d673f4	100000.00	100000.00	DOCUMENT	\N	\N	2026-07-03 02:04:21.068	2026-07-03 02:05:38.864
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, "userId", "applicationId", type, title, message, "isRead", "createdAt", "updatedAt") FROM stdin;
1906581d-8b2c-4a82-944e-47de1d2ff479	5a27461a-5a1e-4d2a-b84f-a7b2be459551	\N	DATABASE	Application Submitted Successfully	Your education loan application Unnati-2026-44069 has been successfully submitted. Our team will review it within 3-5 business days.	f	2026-07-03 02:06:10.671	2026-07-03 02:06:10.671
\.


--
-- Data for Name: offer_letters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offer_letters (id, "createdByEmail", "collegeName", "collegeAddress", "collegeRegNo", "collegeAffiliation", "collegePhone", "collegeEmail", "collegeWebsite", "logoUrl", "refNo", "issuedDateAD", "issuedDateBS", "validUntilAD", "validUntilBS", "studentFullName", "studentDobAD", "studentDobBS", "citizenshipNumber", "fatherName", "motherName", "permanentAddress", district, province, "programName", "programFullName", "programAffiliation", "durationYears", "totalSemesters", "creditHours", "academicYearBS", "intakeMonthBS", "admissionFee", "tuitionPerSem", "examFeePerSem", "labFeePerSem", "totalApprox", conditions, signatories, "qrToken", "qrVerifyUrl", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: parent_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parent_profiles (id, "userId", name, phone, contact, "citizenshipNumber", "salaryBankName", "bankAccountNumber", "salarySheetFileName", "salarySheetOriginalFileName", "salarySheetMimeType", "salarySheetSize", "salarySheetBucketName", "salarySheetFilePath", "salarySheetPublicUrl", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: parent_verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parent_verifications (id, "applicationId", name, phone, contact, "citizenshipNumber", "salaryBankName", "bankAccountNumber", "salarySheetFileName", "salarySheetOriginalFileName", "salarySheetMimeType", "salarySheetSize", "salarySheetBucketName", "salarySheetFilePath", "salarySheetPublicUrl", "submittedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: study_information; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.study_information (id, "applicationId", "studyType", "courseName", "boardUniversity", "courseDuration", "createdAt", "updatedAt") FROM stdin;
bf549b62-92e0-4ef1-b642-7a064c2157c4	7c34b546-c77f-4364-b30f-0401e6d673f4	COURSE	Bachelor	Tribhuvan	1.5 Years	2026-07-03 02:04:20.883	2026-07-03 02:04:20.883
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, "passwordHash", role, "isEmailVerified", "emailVerifyToken", "emailVerifyExpiry", "passwordResetToken", "passwordResetExpiry", "createdAt", "updatedAt") FROM stdin;
5a27461a-5a1e-4d2a-b84f-a7b2be459551	student@yopmail.com	$2b$12$SwFmvQQN0QloqZ7oe1Tmt.FAhgqEK8.U8DgT6uJsccv/SmU2WkTDK	STUDENT	t	\N	\N	\N	\N	2026-07-02 11:34:23.887	2026-07-02 11:34:37.503
8f7399fa-ecab-4f02-8622-880f23559760	college@yopmail.com	$2b$12$izoTeuqFUbIueQpR57uHz.LrjWLSuP5hT9jLsSm4C7zlcvfcAFzti	COLLEGE	t	\N	\N	\N	\N	2026-07-02 11:35:24.314	2026-07-02 11:35:36.788
f30d90f8-e203-47b8-8489-4be198cf929d	initiator@yopmail.com	$2b$12$SwFmvQQN0QloqZ7oe1Tmt.FAhgqEK8.U8DgT6uJsccv/SmU2WkTDK	INITIATOR	t	\N	\N	\N	\N	2026-07-02 11:33:23.456	2026-07-02 11:33:44.961
8f72c727-6742-4d14-aee8-0308176ce7d9	student1@yopmail.com	$2b$12$q9VTL6SdS8uwDv2kaMoYgeqinE.8nbSa2/4L4HUl7i1VNwSKh3cla	STUDENT	t	\N	\N	\N	\N	2026-07-02 11:37:38.902	2026-07-02 11:37:52.637
7a3ead3b-74e4-40e7-bf55-2c6b5bdb97fb	initiator2@yopmail.com	$2b$12$3vtF.UNA67PaPCFwpuvtQ.1b9ybyOtufnHA8Yas1nraKqQJUwHiDq	STUDENT	f	c74c6e93c6d46beb5964686f37a162d43a2f6d2414d8977ba4a1b297c38236d6	2026-07-04 02:02:31.5	\N	\N	2026-07-03 02:02:31.505	2026-07-03 02:02:31.505
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-06-24 08:26:07
20211116045059	2026-06-24 08:26:08
20211116050929	2026-06-24 08:26:09
20211116051442	2026-06-24 08:26:09
20211116212300	2026-06-24 08:26:10
20211116213355	2026-06-24 08:26:11
20211116213934	2026-06-24 08:26:11
20211116214523	2026-06-24 08:26:12
20211122062447	2026-06-24 08:26:13
20211124070109	2026-06-24 08:26:14
20211202204204	2026-06-24 08:26:14
20211202204605	2026-06-24 08:26:15
20211210212804	2026-06-24 08:26:17
20211228014915	2026-06-24 08:26:18
20220107221237	2026-06-24 08:26:18
20220228202821	2026-06-24 08:26:19
20220312004840	2026-06-24 08:26:20
20220603231003	2026-06-24 08:26:21
20220603232444	2026-06-24 08:26:21
20220615214548	2026-06-24 08:26:22
20220712093339	2026-06-24 08:26:23
20220908172859	2026-06-24 08:26:23
20220916233421	2026-06-24 08:26:24
20230119133233	2026-06-24 08:26:25
20230128025114	2026-06-24 08:26:26
20230128025212	2026-06-24 08:26:26
20230227211149	2026-06-24 08:26:27
20230228184745	2026-06-24 08:26:28
20230308225145	2026-06-24 08:26:28
20230328144023	2026-06-24 08:26:29
20231018144023	2026-06-24 08:26:30
20231204144023	2026-06-24 08:26:31
20231204144024	2026-06-24 08:26:31
20231204144025	2026-06-24 08:26:32
20240108234812	2026-06-24 08:26:33
20240109165339	2026-06-24 08:26:33
20240227174441	2026-06-24 08:26:34
20240311171622	2026-06-24 08:26:35
20240321100241	2026-06-24 08:26:37
20240401105812	2026-06-24 08:26:39
20240418121054	2026-06-24 08:26:40
20240523004032	2026-06-24 08:26:42
20240618124746	2026-06-24 08:26:43
20240801235015	2026-06-24 08:26:43
20240805133720	2026-06-24 08:26:44
20240827160934	2026-06-24 08:26:44
20240919163303	2026-06-24 08:26:45
20240919163305	2026-06-24 08:26:46
20241019105805	2026-06-24 08:26:47
20241030150047	2026-06-24 08:26:49
20241108114728	2026-06-24 08:26:50
20241121104152	2026-06-24 08:26:51
20241130184212	2026-06-24 08:26:51
20241220035512	2026-06-24 08:26:52
20241220123912	2026-06-24 08:26:53
20241224161212	2026-06-24 08:26:53
20250107150512	2026-06-24 08:26:54
20250110162412	2026-06-24 08:26:55
20250123174212	2026-06-24 08:26:55
20250128220012	2026-06-24 08:26:56
20250506224012	2026-06-24 08:26:57
20250523164012	2026-06-24 08:26:57
20250714121412	2026-06-24 08:26:58
20250905041441	2026-06-24 08:26:58
20251103001201	2026-06-24 08:26:59
20251120212548	2026-06-24 08:27:00
20251120215549	2026-06-24 08:27:01
20260218120000	2026-06-24 08:27:01
20260326120000	2026-06-24 08:27:02
20260514120000	2026-06-24 08:27:03
20260527120000	2026-06-24 08:27:04
20260528120000	2026-06-24 08:27:05
20260603120000	2026-06-24 08:27:06
20260605120000	2026-06-24 08:27:07
20260606110000	2026-06-24 08:27:08
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter, selected_columns) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
Public Image	Public Image	\N	2026-06-24 08:26:31.579243+00	2026-06-24 08:26:31.579243+00	t	f	\N	\N	\N	STANDARD
Private	Private	\N	2026-06-24 08:26:42.875051+00	2026-06-24 08:26:42.875051+00	f	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-06-24 06:11:45.403577
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-06-24 06:11:45.444565
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-06-24 06:11:45.45345
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-06-24 06:11:45.478849
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-06-24 06:11:45.496009
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-06-24 06:11:45.504136
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-06-24 06:11:45.512601
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-06-24 06:11:45.521037
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-06-24 06:11:45.528939
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-06-24 06:11:45.537103
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-06-24 06:11:45.545254
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-06-24 06:11:45.554136
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-06-24 06:11:45.56264
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-06-24 06:11:45.57078
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-06-24 06:11:45.578995
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-06-24 06:11:45.606721
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-06-24 06:11:45.614631
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-06-24 06:11:45.622321
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-06-24 06:11:45.63011
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-06-24 06:11:45.639605
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-06-24 06:11:45.647819
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-06-24 06:11:45.659212
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-06-24 06:11:45.678349
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-06-24 06:11:45.691176
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-06-24 06:11:45.699354
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-06-24 06:11:45.707905
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-06-24 06:11:45.716317
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-06-24 06:11:45.723875
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-06-24 06:11:45.731357
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-06-24 06:11:45.738939
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-06-24 06:11:45.746602
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-06-24 06:11:45.754342
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-06-24 06:11:45.762117
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-06-24 06:11:45.769866
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-06-24 06:11:45.777658
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-06-24 06:11:45.785406
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-06-24 06:11:45.793179
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-06-24 06:11:45.800912
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-06-24 06:11:45.809764
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-06-24 06:11:45.825008
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-06-24 06:11:45.832967
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-06-24 06:11:45.840843
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-06-24 06:11:45.848619
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-06-24 06:11:45.856382
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-06-24 06:11:45.864413
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-06-24 06:11:45.872986
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-06-24 06:11:45.886782
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-06-24 06:11:45.89537
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-06-24 06:11:45.9033
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-06-24 06:11:45.922073
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-06-24 06:11:45.930625
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-06-24 06:11:46.245532
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-06-24 06:11:46.248466
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-06-24 06:11:46.263376
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-06-24 06:11:46.268075
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-06-24 06:11:46.270941
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-06-24 06:11:46.279756
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-06-24 06:11:46.289537
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-06-24 06:11:46.297712
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-06-24 06:11:46.306367
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-06-24 06:11:46.314748
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
89a2f818-fc26-4b27-a56b-5616fedd6386	Private	57bb9d35-5498-42d6-a58e-0062fe74c15e/40ba2a59-1f80-44bc-bbfc-0dd4241fc8a7.png	\N	2026-06-24 11:09:02.519255+00	2026-06-24 11:09:02.519255+00	2026-06-24 11:09:02.519255+00	{"eTag": "\\"b0ebefec575b456efb5881e8efcd2ff3\\"", "size": 139410, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-24T11:09:03.000Z", "contentLength": 139410, "httpStatusCode": 200}	c0612578-7733-453a-b10f-5e37066ced7a	\N	{}
1e4bfa68-a1b3-4c2c-b8b7-ace942a53431	Private	d6a0b908-89c5-4b9f-a8ff-933ea2d386d2/6f5a6b07-94d2-4db6-a72c-a79ce795d09f.png	\N	2026-06-30 05:10:03.276578+00	2026-06-30 05:10:03.276578+00	2026-06-30 05:10:03.276578+00	{"eTag": "\\"fb015b17658c0dba9ef00433ee8705ec\\"", "size": 153025, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T05:10:04.000Z", "contentLength": 153025, "httpStatusCode": 200}	96b72bcc-6824-4803-ba3d-fda48f845e7f	\N	{}
354e660c-56d1-4792-b3b9-94ff01ff9015	Private	57bb9d35-5498-42d6-a58e-0062fe74c15e/6e81fef6-ce09-4de8-b769-f9a4ca4688ee.png	\N	2026-06-24 11:09:03.460987+00	2026-06-24 11:09:03.460987+00	2026-06-24 11:09:03.460987+00	{"eTag": "\\"52ca44b133383e235d2d91e7858e830c\\"", "size": 428, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-24T11:09:04.000Z", "contentLength": 428, "httpStatusCode": 200}	6e1d3233-a6c1-42ad-8e50-4dcc5d95a444	\N	{}
0514a9ef-5c19-449d-ab2d-f863975e4f3f	Private	57bb9d35-5498-42d6-a58e-0062fe74c15e/9105c8fb-849e-4b20-a128-5b0911b19b8a.png	\N	2026-06-24 11:09:27.254585+00	2026-06-24 11:09:27.254585+00	2026-06-24 11:09:27.254585+00	{"eTag": "\\"b0ebefec575b456efb5881e8efcd2ff3\\"", "size": 139410, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-24T11:09:28.000Z", "contentLength": 139410, "httpStatusCode": 200}	af76864d-c19b-4c4b-b26b-35868036da35	\N	{}
bcade16a-bf3f-4dcf-a5e0-533f33abd823	Private	d6a0b908-89c5-4b9f-a8ff-933ea2d386d2/f38fab36-bbe4-41e3-82f7-6f4b1f5cd3d8.docx	\N	2026-06-30 05:10:25.229036+00	2026-06-30 05:10:25.229036+00	2026-06-30 05:10:25.229036+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T05:10:26.000Z", "contentLength": 511383, "httpStatusCode": 200}	9c04ed2f-ab85-44da-a193-029d7f098dc1	\N	{}
84b284f2-a45b-4e3b-b969-57335f2a0818	Private	57bb9d35-5498-42d6-a58e-0062fe74c15e/debfc51d-5272-435e-94f8-8c1cb6be212b.docx	\N	2026-06-24 11:09:44.364387+00	2026-06-24 11:09:44.364387+00	2026-06-24 11:09:44.364387+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-24T11:09:45.000Z", "contentLength": 511383, "httpStatusCode": 200}	3591a1dd-e2fb-4b5f-a9f8-51ef4df7fe95	\N	{}
a4b80e24-82b6-4d14-b0cb-d748683e1a6a	Private	57bb9d35-5498-42d6-a58e-0062fe74c15e/807eb674-db9a-4171-a9e4-5f45ebad0668.docx	\N	2026-06-24 11:09:48.354867+00	2026-06-24 11:09:48.354867+00	2026-06-24 11:09:48.354867+00	{"eTag": "\\"c95e5cd7cd5574f0ddf09a86b44c8779\\"", "size": 3934274, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-24T11:09:49.000Z", "contentLength": 3934274, "httpStatusCode": 200}	98e3634f-0672-45a2-a1aa-fb17bdf6c0e4	\N	{}
49ddba8b-b92e-4813-b8ab-a7713f58b64d	Private	3e8c8d5c-d459-453d-b7a8-3d34fe370742/0cec1a86-e8ee-4b28-8ccf-9664135fd78f.png	\N	2026-06-30 05:14:54.318225+00	2026-06-30 05:14:54.318225+00	2026-06-30 05:14:54.318225+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T05:14:55.000Z", "contentLength": 210372, "httpStatusCode": 200}	23c0afaf-5aec-435a-9059-c6d12805f34e	\N	{}
9851d1da-5333-427c-8034-1a3e03edf2be	Private	bb1339b1-fb5c-414f-889d-9f2a5d866e7c/6fcd7e90-7b6c-4713-9d79-b0f7176cf182.png	\N	2026-06-24 11:13:29.826204+00	2026-06-24 11:13:29.826204+00	2026-06-24 11:13:29.826204+00	{"eTag": "\\"b0ebefec575b456efb5881e8efcd2ff3\\"", "size": 139410, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-24T11:13:30.000Z", "contentLength": 139410, "httpStatusCode": 200}	1967c648-7ec0-4830-85c9-3b984349c7ee	\N	{}
72eb3724-d146-4c45-8779-dcaf4b86fafd	Private	bb1339b1-fb5c-414f-889d-9f2a5d866e7c/1e84041c-8d37-4f4f-973f-30599c73f70e.png	\N	2026-06-24 11:13:31.323071+00	2026-06-24 11:13:31.323071+00	2026-06-24 11:13:31.323071+00	{"eTag": "\\"52ca44b133383e235d2d91e7858e830c\\"", "size": 428, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-24T11:13:32.000Z", "contentLength": 428, "httpStatusCode": 200}	401f4b5d-a7b6-4de8-a62f-c3c78b55ef78	\N	{}
76160183-7384-4e15-9c26-7f1d67414b18	Private	bb1339b1-fb5c-414f-889d-9f2a5d866e7c/9fe4942e-9aba-44d9-95dd-2e2b13381842.png	\N	2026-06-24 11:13:47.268328+00	2026-06-24 11:13:47.268328+00	2026-06-24 11:13:47.268328+00	{"eTag": "\\"b0ebefec575b456efb5881e8efcd2ff3\\"", "size": 139410, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-24T11:13:48.000Z", "contentLength": 139410, "httpStatusCode": 200}	3db395ac-4d85-4807-93a5-a83ae6bae82c	\N	{}
67109d93-0e20-4037-b593-345d7f05e1ff	Private	bb1339b1-fb5c-414f-889d-9f2a5d866e7c/b3b2409b-1948-44e0-a4f4-73c5dc5e8f23.docx	\N	2026-06-24 11:14:06.562917+00	2026-06-24 11:14:06.562917+00	2026-06-24 11:14:06.562917+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-24T11:14:07.000Z", "contentLength": 511383, "httpStatusCode": 200}	3fd31aea-35a7-49e8-a9f2-000f9c00068f	\N	{}
9e6735f6-54eb-4c89-af13-fc656f392055	Private	3e8c8d5c-d459-453d-b7a8-3d34fe370742/143c7c23-0dac-4153-914c-afa97eb842c4.png	\N	2026-06-30 05:14:55.359934+00	2026-06-30 05:14:55.359934+00	2026-06-30 05:14:55.359934+00	{"eTag": "\\"d216e72df6d2b8db9384eb344800a98b\\"", "size": 209247, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T05:14:56.000Z", "contentLength": 209247, "httpStatusCode": 200}	24c1291a-44f0-4e7a-9e24-a37ebd1e2366	\N	{}
bca065bb-b878-4b85-a809-d24efeb5e872	Private	bb1339b1-fb5c-414f-889d-9f2a5d866e7c/d8e8dc57-c146-4ad8-b5c9-ac83e537b348.docx	\N	2026-06-24 11:14:08.124931+00	2026-06-24 11:14:08.124931+00	2026-06-24 11:14:08.124931+00	{"eTag": "\\"c95e5cd7cd5574f0ddf09a86b44c8779\\"", "size": 3934274, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-24T11:14:09.000Z", "contentLength": 3934274, "httpStatusCode": 200}	79b6d622-b8ec-406d-a5df-bfe92c8550e5	\N	{}
407371c4-0fd4-444d-956b-a2695e8a0d22	Private	735d8993-b8ba-45c0-bb39-c9b8637c5004/a5a9e11e-dfc2-4039-bd93-4c8274ca55e2.png	\N	2026-06-24 11:32:40.466855+00	2026-06-24 11:32:40.466855+00	2026-06-24 11:32:40.466855+00	{"eTag": "\\"b0ebefec575b456efb5881e8efcd2ff3\\"", "size": 139410, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-24T11:32:41.000Z", "contentLength": 139410, "httpStatusCode": 200}	7ca23192-0deb-44eb-9f10-03f24e9a7f6f	\N	{}
4aa5afc3-15df-4979-b8b8-e317e32510ff	Private	3e8c8d5c-d459-453d-b7a8-3d34fe370742/02d0d258-8e6f-4c2c-bd60-0c1afda7b2dd.png	\N	2026-06-30 05:15:22.65951+00	2026-06-30 05:15:22.65951+00	2026-06-30 05:15:22.65951+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T05:15:23.000Z", "contentLength": 210372, "httpStatusCode": 200}	d9e2b6b3-7612-46a1-bd9f-4ff93c0b0476	\N	{}
e7321236-be7e-40f0-8c50-da5891ae9e87	Private	735d8993-b8ba-45c0-bb39-c9b8637c5004/791bbe15-c6df-4150-9000-93efbc3d328d.png	\N	2026-06-24 11:32:41.227556+00	2026-06-24 11:32:41.227556+00	2026-06-24 11:32:41.227556+00	{"eTag": "\\"52ca44b133383e235d2d91e7858e830c\\"", "size": 428, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-24T11:32:42.000Z", "contentLength": 428, "httpStatusCode": 200}	787a81c5-f13c-49a6-bbad-9dba05f50506	\N	{}
a21d6b64-7c40-4ffd-b704-15c5e55c81bc	Private	735d8993-b8ba-45c0-bb39-c9b8637c5004/94f79522-182e-4575-8c8c-1c6c5d9cd560.png	\N	2026-06-24 11:32:57.06772+00	2026-06-24 11:32:57.06772+00	2026-06-24 11:32:57.06772+00	{"eTag": "\\"b0ebefec575b456efb5881e8efcd2ff3\\"", "size": 139410, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-24T11:32:58.000Z", "contentLength": 139410, "httpStatusCode": 200}	68369a4a-40db-4a91-96e5-c4d03bc409b1	\N	{}
9f133da1-84db-4ac1-b6c1-93adf7a3cd9f	Private	3e8c8d5c-d459-453d-b7a8-3d34fe370742/e8dcfeef-ea43-4200-a700-726cde1845ba.docx	\N	2026-06-30 05:15:40.043749+00	2026-06-30 05:15:40.043749+00	2026-06-30 05:15:40.043749+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T05:15:40.000Z", "contentLength": 511383, "httpStatusCode": 200}	901bde40-3fce-4868-af83-2a9071ddac56	\N	{}
cefb9b15-e1dc-4e5f-a817-28ce34cd5ed1	Private	735d8993-b8ba-45c0-bb39-c9b8637c5004/04f0b76e-795d-4d94-b4b5-d013c587af24.docx	\N	2026-06-24 11:33:13.153981+00	2026-06-24 11:33:13.153981+00	2026-06-24 11:33:13.153981+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-24T11:33:14.000Z", "contentLength": 511383, "httpStatusCode": 200}	f0ed024a-4a8b-4bda-8f65-d2f447bee1b6	\N	{}
c693cd28-bb47-4b94-ac21-cc2ad2ef9ced	Private	735d8993-b8ba-45c0-bb39-c9b8637c5004/dca7f628-3297-4668-8849-cb0dd6425f97.docx	\N	2026-06-24 11:33:15.286713+00	2026-06-24 11:33:15.286713+00	2026-06-24 11:33:15.286713+00	{"eTag": "\\"c95e5cd7cd5574f0ddf09a86b44c8779\\"", "size": 3934274, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-24T11:33:16.000Z", "contentLength": 3934274, "httpStatusCode": 200}	ca3c3e77-1e4f-4730-a54f-4989f64da220	\N	{}
6005f3ef-63ea-4b17-a1b8-ae64002bce1f	Private	d2857e1b-0108-4039-b0ad-be26295b4ef2/4ef49af8-3f1e-4ea9-8c99-4ce76309b06d.png	\N	2026-06-25 03:43:54.269855+00	2026-06-25 03:43:54.269855+00	2026-06-25 03:43:54.269855+00	{"eTag": "\\"52ca44b133383e235d2d91e7858e830c\\"", "size": 428, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T03:43:55.000Z", "contentLength": 428, "httpStatusCode": 200}	45fe4c40-6b89-4ef0-a7fa-8fb40876c894	\N	{}
a9c6af74-b5dd-43c5-ae8d-981617e3ddd8	Private	d2857e1b-0108-4039-b0ad-be26295b4ef2/a34fdc1a-8ef8-453f-9295-80c9e2b5f1db.jpg	\N	2026-06-25 03:44:02.61787+00	2026-06-25 03:44:02.61787+00	2026-06-25 03:44:02.61787+00	{"eTag": "\\"4c24b1088b24cc71023a1cc56c2d74ba\\"", "size": 583688, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T03:44:03.000Z", "contentLength": 583688, "httpStatusCode": 200}	d8bcfa97-5ebe-405d-86d1-e0cce1ecc8ac	\N	{}
d4f257af-7493-40aa-af88-a7b8aaccb5d2	Private	d2857e1b-0108-4039-b0ad-be26295b4ef2/07e9f768-046f-43ae-9030-e47d049617bc.png	\N	2026-06-25 03:44:24.972137+00	2026-06-25 03:44:24.972137+00	2026-06-25 03:44:24.972137+00	{"eTag": "\\"b0ebefec575b456efb5881e8efcd2ff3\\"", "size": 139410, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T03:44:25.000Z", "contentLength": 139410, "httpStatusCode": 200}	72e6cc75-e05c-4593-88fa-c4b24584c7cc	\N	{}
a53d320c-ac49-4f23-996e-04354d48ae8b	Private	aab446b5-5f5f-4f15-8628-67f1d8ee0ffa/fa2b1f97-ba26-4e18-9d36-3411daa7cab2.png	\N	2026-06-30 05:41:27.811261+00	2026-06-30 05:41:27.811261+00	2026-06-30 05:41:27.811261+00	{"eTag": "\\"d216e72df6d2b8db9384eb344800a98b\\"", "size": 209247, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T05:41:28.000Z", "contentLength": 209247, "httpStatusCode": 200}	92625df0-dee8-44b0-9637-fb8311308892	\N	{}
b5467a26-b3aa-4c6d-a154-dc3f184cc316	Private	d2857e1b-0108-4039-b0ad-be26295b4ef2/f0548084-3833-471c-8b0e-1d55b69278c2.docx	\N	2026-06-25 03:44:41.790236+00	2026-06-25 03:44:41.790236+00	2026-06-25 03:44:41.790236+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T03:44:42.000Z", "contentLength": 511383, "httpStatusCode": 200}	98368ad4-5027-460f-95fa-317b3d073d4f	\N	{}
13942b92-de60-4903-9938-d65909788de8	Private	8aec3299-7f6e-4ea7-89ef-f2d31450355a/16266f94-8626-41b1-a1df-cd858e0420b9.png	\N	2026-06-25 04:19:21.055178+00	2026-06-25 04:19:21.055178+00	2026-06-25 04:19:21.055178+00	{"eTag": "\\"b0ebefec575b456efb5881e8efcd2ff3\\"", "size": 139410, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T04:19:22.000Z", "contentLength": 139410, "httpStatusCode": 200}	deb7afbd-76e6-45fc-9578-d9b28efaf064	\N	{}
6a9b43bf-1ad6-4734-ae66-123741c36266	Private	aab446b5-5f5f-4f15-8628-67f1d8ee0ffa/7e058be1-d590-4b34-85bd-079aa9238bbc.png	\N	2026-06-30 05:41:28.771247+00	2026-06-30 05:41:28.771247+00	2026-06-30 05:41:28.771247+00	{"eTag": "\\"fb015b17658c0dba9ef00433ee8705ec\\"", "size": 153025, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T05:41:29.000Z", "contentLength": 153025, "httpStatusCode": 200}	7c34eb0c-19b4-4dea-b12f-65b29b1ad4ad	\N	{}
cb770c86-13ce-4ea8-9907-f4556d8d46b3	Private	8aec3299-7f6e-4ea7-89ef-f2d31450355a/10426a12-d6c8-459d-9fc4-b76531e4d9c7.png	\N	2026-06-25 04:19:22.286457+00	2026-06-25 04:19:22.286457+00	2026-06-25 04:19:22.286457+00	{"eTag": "\\"52ca44b133383e235d2d91e7858e830c\\"", "size": 428, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T04:19:23.000Z", "contentLength": 428, "httpStatusCode": 200}	9d372fbb-d06f-4dc1-82ef-8e435b4ab96a	\N	{}
4d0660af-0b76-4a30-9589-8e18899a850c	Private	8aec3299-7f6e-4ea7-89ef-f2d31450355a/c5b714e9-d10a-478a-a968-6dc53a923814.png	\N	2026-06-25 04:19:37.299779+00	2026-06-25 04:19:37.299779+00	2026-06-25 04:19:37.299779+00	{"eTag": "\\"b0ebefec575b456efb5881e8efcd2ff3\\"", "size": 139410, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T04:19:38.000Z", "contentLength": 139410, "httpStatusCode": 200}	a44382b5-0bb2-46a8-a0c9-e610cb71495b	\N	{}
526a7529-45a0-4246-999d-267e68b5a130	Private	aab446b5-5f5f-4f15-8628-67f1d8ee0ffa/1496b8ce-ffc0-40c2-8f05-1f0b00e2f389.png	\N	2026-06-30 05:42:00.591634+00	2026-06-30 05:42:00.591634+00	2026-06-30 05:42:00.591634+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T05:42:01.000Z", "contentLength": 210372, "httpStatusCode": 200}	1a5c2a66-4031-49bd-a50e-b9e7b330d15f	\N	{}
b44246c7-83cb-4092-adfe-3d4e8d75064b	Private	8aec3299-7f6e-4ea7-89ef-f2d31450355a/87c0d078-47e7-4c08-9644-38fd502caabb.docx	\N	2026-06-25 04:19:53.169572+00	2026-06-25 04:19:53.169572+00	2026-06-25 04:19:53.169572+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T04:19:54.000Z", "contentLength": 511383, "httpStatusCode": 200}	66449783-79c6-4a1d-9a88-913691d38809	\N	{}
28a54fe4-8ec9-47ec-a8bb-d43ce79c4233	Private	b9c6ea66-ca14-461c-a204-7e040b092211/1f0520e1-0219-4d32-bfab-36d53c931be9.png	\N	2026-06-25 04:32:58.451547+00	2026-06-25 04:32:58.451547+00	2026-06-25 04:32:58.451547+00	{"eTag": "\\"b0ebefec575b456efb5881e8efcd2ff3\\"", "size": 139410, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T04:32:59.000Z", "contentLength": 139410, "httpStatusCode": 200}	bc57ea5d-4371-4c89-9b15-e0663efd75f5	\N	{}
53857f55-06a9-4185-8f45-0b562894a8c4	Private	b9c6ea66-ca14-461c-a204-7e040b092211/3d427ba4-16d9-4b30-b13d-4fe7fe4e5b0f.png	\N	2026-06-25 04:32:59.365816+00	2026-06-25 04:32:59.365816+00	2026-06-25 04:32:59.365816+00	{"eTag": "\\"52ca44b133383e235d2d91e7858e830c\\"", "size": 428, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T04:33:00.000Z", "contentLength": 428, "httpStatusCode": 200}	3f7df70a-4660-4f17-af87-475a3aab95f0	\N	{}
13ef2572-0fae-422c-bf38-7f516470465b	Private	b9c6ea66-ca14-461c-a204-7e040b092211/9191c3ee-07b0-4a64-a257-027435208a38.png	\N	2026-06-25 04:33:22.314252+00	2026-06-25 04:33:22.314252+00	2026-06-25 04:33:22.314252+00	{"eTag": "\\"b0ebefec575b456efb5881e8efcd2ff3\\"", "size": 139410, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T04:33:23.000Z", "contentLength": 139410, "httpStatusCode": 200}	a5a24b3b-54aa-4f0d-969d-db088ee78e60	\N	{}
524d7ae4-14da-4c7d-9958-d04701807a5e	Private	b9c6ea66-ca14-461c-a204-7e040b092211/0ba8f672-0bb9-4771-9fea-b4a9af49f575.docx	\N	2026-06-25 04:33:38.397338+00	2026-06-25 04:33:38.397338+00	2026-06-25 04:33:38.397338+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T04:33:39.000Z", "contentLength": 511383, "httpStatusCode": 200}	2ff3276d-9bb5-4fe5-b7d9-a59b39b891b7	\N	{}
f091dd1a-f955-410b-b4de-8015d08bd79c	Private	aab446b5-5f5f-4f15-8628-67f1d8ee0ffa/76a00326-e477-4cb3-9b1a-94321381d162.docx	\N	2026-06-30 05:42:21.539349+00	2026-06-30 05:42:21.539349+00	2026-06-30 05:42:21.539349+00	{"eTag": "\\"c95e5cd7cd5574f0ddf09a86b44c8779\\"", "size": 3934274, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T05:42:22.000Z", "contentLength": 3934274, "httpStatusCode": 200}	2b5806f0-5c01-4a8d-b514-e36b74890be8	\N	{}
cec71296-fee0-4350-bdaf-6ef2c0c153d6	Private	b9c6ea66-ca14-461c-a204-7e040b092211/ecbcf0ea-1578-4499-8107-72dafed18ee2.docx	\N	2026-06-25 04:33:44.014255+00	2026-06-25 04:33:44.014255+00	2026-06-25 04:33:44.014255+00	{"eTag": "\\"c95e5cd7cd5574f0ddf09a86b44c8779\\"", "size": 3934274, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T04:33:44.000Z", "contentLength": 3934274, "httpStatusCode": 200}	5f69a836-9c76-4d0d-a962-1d4ade8c3244	\N	{}
d60b6711-1237-4968-aff2-01000751609e	Private	college-docs/d6a0b908-89c5-4b9f-a8ff-933ea2d386d2/offer-letters/c67158e2-335a-4b52-8145-5bc40e0289f6.png	\N	2026-06-30 10:53:09.341694+00	2026-06-30 10:53:09.341694+00	2026-06-30 10:53:09.341694+00	{"eTag": "\\"fb015b17658c0dba9ef00433ee8705ec\\"", "size": 153025, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T10:53:10.000Z", "contentLength": 153025, "httpStatusCode": 200}	491f2968-432e-4e37-a049-d25317a1ca0d	\N	{}
13baef5c-8b2f-4a1c-85de-3a64190907d8	Private	a0eaec54-3fe6-4de4-aa88-5ce533d9cb96/eea37c3c-8be3-4b3c-967f-65ae6488e012.png	\N	2026-06-29 07:21:04.660465+00	2026-06-29 07:21:04.660465+00	2026-06-29 07:21:04.660465+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T07:21:05.000Z", "contentLength": 210372, "httpStatusCode": 200}	d10ad991-22a0-465a-a2e6-574596c09953	\N	{}
2ec965e8-03b3-4077-8183-1c2112674280	Private	6671611c-7de7-4b30-abc0-9b3bb7e7bd23/07cb3278-2e5d-412d-b044-f42261578983.png	\N	2026-07-01 12:10:23.01129+00	2026-07-01 12:10:23.01129+00	2026-07-01 12:10:23.01129+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-01T12:10:23.000Z", "contentLength": 210372, "httpStatusCode": 200}	b64fd625-0aaf-4e01-914e-11897ae9b765	\N	{}
c3fadc5e-f835-4235-b97d-6997298c387c	Private	a0eaec54-3fe6-4de4-aa88-5ce533d9cb96/27764dca-4c9b-4fcb-9fdf-770791da6b1c.png	\N	2026-06-29 07:21:05.886444+00	2026-06-29 07:21:05.886444+00	2026-06-29 07:21:05.886444+00	{"eTag": "\\"9fed9bcdb4392d3c120b3a58ed061247\\"", "size": 929649, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T07:21:06.000Z", "contentLength": 929649, "httpStatusCode": 200}	78918fe4-b8d9-4d56-a5fe-ff00b72bfb36	\N	{}
c5f842e5-7fca-4f8c-b42f-ef29e2863a74	Private	a0eaec54-3fe6-4de4-aa88-5ce533d9cb96/97bf55ea-97f3-4555-bbb9-f31e27eb2913.png	\N	2026-06-29 07:21:57.253536+00	2026-06-29 07:21:57.253536+00	2026-06-29 07:21:57.253536+00	{"eTag": "\\"d216e72df6d2b8db9384eb344800a98b\\"", "size": 209247, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T07:21:58.000Z", "contentLength": 209247, "httpStatusCode": 200}	84839801-ecaf-4669-bf28-2b2bc71bd964	\N	{}
aba7619e-303f-42ef-b53e-c223757ab49f	Private	a0eaec54-3fe6-4de4-aa88-5ce533d9cb96/ac68d94b-d848-4726-bdc5-7c846dd5fbc8.docx	\N	2026-06-29 07:22:12.905028+00	2026-06-29 07:22:12.905028+00	2026-06-29 07:22:12.905028+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T07:22:13.000Z", "contentLength": 511383, "httpStatusCode": 200}	1fd48e44-934c-4d32-ab24-e32f2eab0378	\N	{}
f3d842e6-204b-479d-85f0-783c439fe445	Private	c1206571-3d7c-4713-a547-2e974bfe278d/c62763bc-8203-457a-bf3a-00c1b7b09503.png	\N	2026-06-29 07:47:04.509897+00	2026-06-29 07:47:04.509897+00	2026-06-29 07:47:04.509897+00	{"eTag": "\\"9fed9bcdb4392d3c120b3a58ed061247\\"", "size": 929649, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T07:47:05.000Z", "contentLength": 929649, "httpStatusCode": 200}	d1c52588-5c18-403f-954d-ec75ac070baa	\N	{}
5e746b97-687c-4d7b-bf4f-340538400ce3	Private	c1206571-3d7c-4713-a547-2e974bfe278d/f275ac76-d83f-40ae-8fc1-9facecd62ee4.png	\N	2026-06-29 07:47:08.254854+00	2026-06-29 07:47:08.254854+00	2026-06-29 07:47:08.254854+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T07:47:09.000Z", "contentLength": 210372, "httpStatusCode": 200}	a8406825-965b-4c5e-8977-5022868550e3	\N	{}
6ca0f96e-b784-4ad9-b8d0-bc6996f16d06	Private	c1206571-3d7c-4713-a547-2e974bfe278d/f258f251-3f4e-416a-88ed-0be2966a07f5.png	\N	2026-06-29 07:47:22.921432+00	2026-06-29 07:47:22.921432+00	2026-06-29 07:47:22.921432+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T07:47:23.000Z", "contentLength": 210372, "httpStatusCode": 200}	0fb0d875-4c7c-4dc0-86d0-04d1c61ca487	\N	{}
dc07df30-3eb9-480a-8fdf-9ab3a8b78a2b	Private	college-docs/aab446b5-5f5f-4f15-8628-67f1d8ee0ffa/offer-letters/5e4a9cf6-3a28-412e-a2a6-87adb4bdf915.jpeg	\N	2026-06-30 06:39:59.867548+00	2026-06-30 06:39:59.867548+00	2026-06-30 06:39:59.867548+00	{"eTag": "\\"95faf4a9b102bc0953460b78b7320e5b\\"", "size": 114930, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T06:40:00.000Z", "contentLength": 114930, "httpStatusCode": 200}	1bcbcdca-a4d7-45dc-a425-7068b25f86a1	\N	{}
ee6def73-a534-48ab-8c57-5808ca55f1fa	Private	c1206571-3d7c-4713-a547-2e974bfe278d/ee5e9a35-c332-4531-8543-62eac683781d.docx	\N	2026-06-29 07:47:41.293377+00	2026-06-29 07:47:41.293377+00	2026-06-29 07:47:41.293377+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T07:47:42.000Z", "contentLength": 511383, "httpStatusCode": 200}	0d4b1257-5510-40b5-904b-046ed7af1e04	\N	{}
5333329a-b8a2-4e52-bcaa-84025ebabb7b	Private	8d4086aa-72f6-4ff5-bc54-ccc8dcafc9e1/6ad38a84-8420-454c-ba04-cdd1986c4636.png	\N	2026-06-29 09:16:24.841885+00	2026-06-29 09:16:24.841885+00	2026-06-29 09:16:24.841885+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T09:16:25.000Z", "contentLength": 210372, "httpStatusCode": 200}	090753ac-d5d0-467d-ae7e-0e6d8af5e423	\N	{}
31490d0e-b711-462d-bae9-14525be66f01	Private	college-docs/aab446b5-5f5f-4f15-8628-67f1d8ee0ffa/enrollment-docs/4698bd98-d4d0-4bf6-9066-e4ba8cd18670.png	\N	2026-06-30 06:40:01.0805+00	2026-06-30 06:40:01.0805+00	2026-06-30 06:40:01.0805+00	{"eTag": "\\"9fed9bcdb4392d3c120b3a58ed061247\\"", "size": 929649, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T06:40:02.000Z", "contentLength": 929649, "httpStatusCode": 200}	d8250b82-e8e3-4a35-a985-b6738f337afd	\N	{}
ccf09b73-4981-4778-8834-c136c1755f07	Private	8d4086aa-72f6-4ff5-bc54-ccc8dcafc9e1/3f79da6e-c146-4139-bedf-7e047d3e5780.png	\N	2026-06-29 09:16:26.12993+00	2026-06-29 09:16:26.12993+00	2026-06-29 09:16:26.12993+00	{"eTag": "\\"9fed9bcdb4392d3c120b3a58ed061247\\"", "size": 929649, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T09:16:27.000Z", "contentLength": 929649, "httpStatusCode": 200}	6790bc6e-a627-4175-a236-917858f01e04	\N	{}
d29dd5c5-bb3b-4a3a-bf69-8824d85e5987	Private	8d4086aa-72f6-4ff5-bc54-ccc8dcafc9e1/fabcaf64-2948-4a2c-833a-0faa6429f983.png	\N	2026-06-29 09:16:41.758652+00	2026-06-29 09:16:41.758652+00	2026-06-29 09:16:41.758652+00	{"eTag": "\\"fb015b17658c0dba9ef00433ee8705ec\\"", "size": 153025, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T09:16:42.000Z", "contentLength": 153025, "httpStatusCode": 200}	09292da4-bc09-44b7-be93-048547427065	\N	{}
c06702a5-6d61-4113-96d6-ff57aadebb10	Private	college-docs/e2fbbf22-8f75-42a4-9ff0-31fe933e8af9/offer-letters/25a6c3ea-c93e-48e4-bf6a-2ca49c93770b.docx	\N	2026-07-01 05:12:57.865908+00	2026-07-01 05:12:57.865908+00	2026-07-01 05:12:57.865908+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-01T05:12:58.000Z", "contentLength": 511383, "httpStatusCode": 200}	12e24c7b-1594-4194-af3a-eb3379578864	\N	{}
df5c43ce-aa00-461d-9688-55e1de43c8bf	Private	8d4086aa-72f6-4ff5-bc54-ccc8dcafc9e1/7ad9e29b-a824-4714-b463-f2ae68e95641.docx	\N	2026-06-29 09:17:00.340194+00	2026-06-29 09:17:00.340194+00	2026-06-29 09:17:00.340194+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T09:17:01.000Z", "contentLength": 511383, "httpStatusCode": 200}	ce3c553a-f07c-452b-ab26-0826bb2a412a	\N	{}
2b923a93-44a8-4297-a6d0-591a53db7dbb	Private	17bc9cf7-f269-4253-8253-76e30abc7fce/78d865e4-83b9-4156-b513-c5f44f1f7994.png	\N	2026-06-29 09:38:04.877361+00	2026-06-29 09:38:04.877361+00	2026-06-29 09:38:04.877361+00	{"eTag": "\\"9fed9bcdb4392d3c120b3a58ed061247\\"", "size": 929649, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T09:38:05.000Z", "contentLength": 929649, "httpStatusCode": 200}	c5528fb5-8198-4f49-88d3-dfe22d2e9085	\N	{}
6eb262aa-7847-4af9-a6f1-3df429281e67	Private	17bc9cf7-f269-4253-8253-76e30abc7fce/00cad28d-3778-41ae-9d4b-42e3dc650350.png	\N	2026-06-29 09:38:05.284869+00	2026-06-29 09:38:05.284869+00	2026-06-29 09:38:05.284869+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T09:38:06.000Z", "contentLength": 210372, "httpStatusCode": 200}	f70663d4-33a5-4aba-bfbf-52cc21cca01a	\N	{}
14b87c43-8814-4671-9da8-b23ad0e95fbe	Private	17bc9cf7-f269-4253-8253-76e30abc7fce/3a240173-7352-4669-bfdb-45a87c1d4bb7.png	\N	2026-06-29 09:38:19.242442+00	2026-06-29 09:38:19.242442+00	2026-06-29 09:38:19.242442+00	{"eTag": "\\"d216e72df6d2b8db9384eb344800a98b\\"", "size": 209247, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T09:38:20.000Z", "contentLength": 209247, "httpStatusCode": 200}	7e8358f6-f59a-48d0-99c5-e917534d9242	\N	{}
b40d5475-8ba6-4341-a1f5-5f499d6940d3	Private	17bc9cf7-f269-4253-8253-76e30abc7fce/517b3fe2-fe48-4e16-be27-2ed37560c56b.docx	\N	2026-06-29 09:38:33.865809+00	2026-06-29 09:38:33.865809+00	2026-06-29 09:38:33.865809+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T09:38:34.000Z", "contentLength": 511383, "httpStatusCode": 200}	4b4988e1-122c-42e2-9b0d-7bece9d1462e	\N	{}
f6cb1220-2251-478a-921b-46b971734450	Private	e2fbbf22-8f75-42a4-9ff0-31fe933e8af9/cde3fcd2-1691-459f-b356-34066e9d042b.png	\N	2026-06-30 10:14:37.622737+00	2026-06-30 10:14:37.622737+00	2026-06-30 10:14:37.622737+00	{"eTag": "\\"9fed9bcdb4392d3c120b3a58ed061247\\"", "size": 929649, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T10:14:38.000Z", "contentLength": 929649, "httpStatusCode": 200}	358bea88-52c0-4bf6-9d8c-cb5e50e08836	\N	{}
e2ab592f-818d-4bf9-868f-ac13bf7dadc0	Private	parent-docs/17bc9cf7-f269-4253-8253-76e30abc7fce/salary-sheets/a12b229e-c410-482f-8c27-5a54f8abb2fc.png	\N	2026-06-29 11:34:26.93878+00	2026-06-29 11:34:26.93878+00	2026-06-29 11:34:26.93878+00	{"eTag": "\\"fb015b17658c0dba9ef00433ee8705ec\\"", "size": 153025, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T11:34:27.000Z", "contentLength": 153025, "httpStatusCode": 200}	107f6a15-b50b-4da6-b1cf-ccd8165aafb5	\N	{}
5eb15e38-eda8-43ac-a29e-b7eb8ff93305	Private	e2fbbf22-8f75-42a4-9ff0-31fe933e8af9/bec2c7be-57ba-4bc5-a1d5-a63947e1cffc.png	\N	2026-06-30 10:14:38.828947+00	2026-06-30 10:14:38.828947+00	2026-06-30 10:14:38.828947+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T10:14:39.000Z", "contentLength": 210372, "httpStatusCode": 200}	98a04474-c207-49b1-9850-05e963a7b1e7	\N	{}
103032ef-7837-4509-ad98-f5a2dac22336	Private	e2fbbf22-8f75-42a4-9ff0-31fe933e8af9/22c8184c-f878-4b86-bbaa-a8952acf02f7.png	\N	2026-06-30 10:15:17.4995+00	2026-06-30 10:15:17.4995+00	2026-06-30 10:15:17.4995+00	{"eTag": "\\"9fed9bcdb4392d3c120b3a58ed061247\\"", "size": 929649, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T10:15:18.000Z", "contentLength": 929649, "httpStatusCode": 200}	55fd3cf2-bb41-4864-be5f-dc67787cef54	\N	{}
9d297113-a8f4-4d09-95c2-3f7aabb5a452	Private	d6a0b908-89c5-4b9f-a8ff-933ea2d386d2/f2e11bfd-9439-4039-aa4a-125170842591.png	\N	2026-06-30 05:09:25.176225+00	2026-06-30 05:09:25.176225+00	2026-06-30 05:09:25.176225+00	{"eTag": "\\"9fed9bcdb4392d3c120b3a58ed061247\\"", "size": 929649, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T05:09:26.000Z", "contentLength": 929649, "httpStatusCode": 200}	c966521e-61e8-4761-9e78-e322ef0d345c	\N	{}
7fea8f46-889c-453d-86c8-7b7078e5954b	Private	e2fbbf22-8f75-42a4-9ff0-31fe933e8af9/fdedbc30-401a-4dad-840e-5b697b110439.docx	\N	2026-06-30 10:15:36.814201+00	2026-06-30 10:15:36.814201+00	2026-06-30 10:15:36.814201+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T10:15:37.000Z", "contentLength": 511383, "httpStatusCode": 200}	ab900a18-840a-4bfb-80b8-2c87885a8e48	\N	{}
8f960cc5-b818-4379-aca9-67a3b636a9be	Private	d6a0b908-89c5-4b9f-a8ff-933ea2d386d2/47265e19-4e48-4445-824a-7cb838ca7cbf.png	\N	2026-06-30 05:09:26.058245+00	2026-06-30 05:09:26.058245+00	2026-06-30 05:09:26.058245+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-30T05:09:27.000Z", "contentLength": 210372, "httpStatusCode": 200}	0d0f1cea-c55c-418c-89d8-ae4b244052e5	\N	{}
01705bdf-02c1-4158-8221-56e9fe4909b1	Private	college-docs/e2fbbf22-8f75-42a4-9ff0-31fe933e8af9/enrollment-docs/d9271780-e6a5-4996-8883-06d94e642da9.docx	\N	2026-07-01 05:13:06.836313+00	2026-07-01 05:13:06.836313+00	2026-07-01 05:13:06.836313+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-01T05:13:07.000Z", "contentLength": 511383, "httpStatusCode": 200}	07b1b979-92dc-4cfd-81bd-ebba519935db	\N	{}
85b9391d-bd06-4505-9178-62da213fe650	Private	6671611c-7de7-4b30-abc0-9b3bb7e7bd23/b2e7d1d0-58a6-4ae7-a5e9-f63f56614935.png	\N	2026-07-01 12:10:24.040328+00	2026-07-01 12:10:24.040328+00	2026-07-01 12:10:24.040328+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-01T12:10:24.000Z", "contentLength": 210372, "httpStatusCode": 200}	7a582841-e702-41e0-9d74-069efe02f094	\N	{}
63fe80ea-2810-476a-b070-b4ef643a6864	Private	6671611c-7de7-4b30-abc0-9b3bb7e7bd23/c6b8ca0c-f04c-46f8-8a6c-4fc2c5356191.png	\N	2026-07-01 12:10:43.244232+00	2026-07-01 12:10:43.244232+00	2026-07-01 12:10:43.244232+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-01T12:10:44.000Z", "contentLength": 210372, "httpStatusCode": 200}	64ef4fc1-7bb6-47c3-95ae-05d07e05637e	\N	{}
57f659d2-ba65-4d06-8ac5-f8e8bea8776e	Private	6671611c-7de7-4b30-abc0-9b3bb7e7bd23/99e2a936-8d92-4618-9c89-d40a3164902e.docx	\N	2026-07-01 12:11:02.152087+00	2026-07-01 12:11:02.152087+00	2026-07-01 12:11:02.152087+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-01T12:11:03.000Z", "contentLength": 511383, "httpStatusCode": 200}	16cdb1cb-958c-430b-b4ed-af829af08b1b	\N	{}
6dff57e7-71ae-4140-abd7-5c746bbc78a5	Private	3fa45b9f-5693-4630-8929-e5d535d4dd20/8aad1fb1-a9ab-4d2a-a62c-7b49b9995623.png	\N	2026-07-02 07:53:13.913501+00	2026-07-02 07:53:13.913501+00	2026-07-02 07:53:13.913501+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T07:53:14.000Z", "contentLength": 210372, "httpStatusCode": 200}	48d22515-9278-4f7f-a6b0-594f86c80366	\N	{}
90145048-a99a-454d-afe6-759aa455bb7c	Private	3fa45b9f-5693-4630-8929-e5d535d4dd20/ea08c26e-1f12-4301-9e0c-e8053aa8b381.png	\N	2026-07-02 07:53:20.486886+00	2026-07-02 07:53:20.486886+00	2026-07-02 07:53:20.486886+00	{"eTag": "\\"9fed9bcdb4392d3c120b3a58ed061247\\"", "size": 929649, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T07:53:21.000Z", "contentLength": 929649, "httpStatusCode": 200}	5ea065b0-5166-4bac-b5d2-16251b348210	\N	{}
d9e7fd69-d0fd-4b79-8c48-254908332e5a	Private	3fa45b9f-5693-4630-8929-e5d535d4dd20/983ed9f2-4873-4948-b987-97139b7e031f.png	\N	2026-07-02 07:53:51.039342+00	2026-07-02 07:53:51.039342+00	2026-07-02 07:53:51.039342+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T07:53:51.000Z", "contentLength": 210372, "httpStatusCode": 200}	b9538638-a464-4949-b9b3-c1d8b517ea8a	\N	{}
4d04c8a5-52a7-4914-aa24-2e78555611c4	Private	3fa45b9f-5693-4630-8929-e5d535d4dd20/10472219-4c66-49ba-9285-1a26442cf560.docx	\N	2026-07-02 07:54:13.81522+00	2026-07-02 07:54:13.81522+00	2026-07-02 07:54:13.81522+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T07:54:14.000Z", "contentLength": 511383, "httpStatusCode": 200}	565d156e-0b15-4876-a02b-e03afbfac8f9	\N	{}
fafa277e-6e28-439b-a78e-96e7a0e6d1ac	Private	parent-docs/3fa45b9f-5693-4630-8929-e5d535d4dd20/salary-sheets/dee011c2-e662-49d6-8597-2cb043fe43b8.docx	\N	2026-07-02 08:04:55.23016+00	2026-07-02 08:04:55.23016+00	2026-07-02 08:04:55.23016+00	{"eTag": "\\"0393caee1eaf14866bda027c398d7946\\"", "size": 48798, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T08:04:56.000Z", "contentLength": 48798, "httpStatusCode": 200}	4f6ce183-eda1-47f1-a299-0d63aace3393	\N	{}
e261fe58-a8b2-4c10-845b-a70a79ba60f4	Private	b9d0b50e-850c-484a-8805-dabd9370a483/f1d7030c-821d-4b21-940e-fac0877fc771.png	\N	2026-07-02 09:38:27.614193+00	2026-07-02 09:38:27.614193+00	2026-07-02 09:38:27.614193+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T09:38:28.000Z", "contentLength": 210372, "httpStatusCode": 200}	7e815cb0-b100-47b7-99b1-941db7f51dfd	\N	{}
40eb77a6-21b7-461c-813b-06bbc123188d	Private	b9d0b50e-850c-484a-8805-dabd9370a483/99daeeab-f798-4b31-883a-db6b27ae43d0.png	\N	2026-07-02 09:38:32.615624+00	2026-07-02 09:38:32.615624+00	2026-07-02 09:38:32.615624+00	{"eTag": "\\"fb015b17658c0dba9ef00433ee8705ec\\"", "size": 153025, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T09:38:33.000Z", "contentLength": 153025, "httpStatusCode": 200}	542e7a2e-7065-4492-b882-15fd26156ec8	\N	{}
6db19972-7819-4f28-bf8c-a73bebc90097	Private	b9d0b50e-850c-484a-8805-dabd9370a483/722e57d3-572e-4969-8a87-5894c1003a04.png	\N	2026-07-02 09:38:33.757013+00	2026-07-02 09:38:33.757013+00	2026-07-02 09:38:33.757013+00	{"eTag": "\\"9fed9bcdb4392d3c120b3a58ed061247\\"", "size": 929649, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T09:38:34.000Z", "contentLength": 929649, "httpStatusCode": 200}	f8b18a23-2465-4cbd-88ed-4e775e6438eb	\N	{}
e1341d54-f5f6-4a25-a236-86a714b19431	Private	b9d0b50e-850c-484a-8805-dabd9370a483/e3ccef17-8aa4-4062-81f1-6ee433711da7.docx	\N	2026-07-02 09:38:53.514144+00	2026-07-02 09:38:53.514144+00	2026-07-02 09:38:53.514144+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T09:38:54.000Z", "contentLength": 511383, "httpStatusCode": 200}	7f5b9920-314c-47fc-b9df-8690a7a82fe9	\N	{}
ae943344-1958-4e20-ab61-9f48d7bcf06e	Private	0a6016dd-4bb5-498c-bfe1-4d197307257d/b7849f60-7f74-44d3-8f5c-aa8062240173.png	\N	2026-07-02 10:32:42.475925+00	2026-07-02 10:32:42.475925+00	2026-07-02 10:32:42.475925+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T10:32:43.000Z", "contentLength": 210372, "httpStatusCode": 200}	b6946155-515b-49c2-af88-3723f0cb51b2	\N	{}
5e5bc3af-0cc7-4bae-887e-cf8a8281fc01	Private	0a6016dd-4bb5-498c-bfe1-4d197307257d/64b0a0a4-51d9-4944-bf6c-1df88ea69c48.png	\N	2026-07-02 10:32:48.824521+00	2026-07-02 10:32:48.824521+00	2026-07-02 10:32:48.824521+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T10:32:49.000Z", "contentLength": 210372, "httpStatusCode": 200}	97d21f72-ff3a-46c6-9801-c821b490799c	\N	{}
1240d44a-857f-4c3d-b902-99ff85d3d002	Private	0a6016dd-4bb5-498c-bfe1-4d197307257d/c971ddf3-149e-4831-bd26-33430cdd6a73.png	\N	2026-07-02 10:32:50.302938+00	2026-07-02 10:32:50.302938+00	2026-07-02 10:32:50.302938+00	{"eTag": "\\"9fed9bcdb4392d3c120b3a58ed061247\\"", "size": 929649, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T10:32:51.000Z", "contentLength": 929649, "httpStatusCode": 200}	c9b220e4-eedf-4471-b559-0778b0e25509	\N	{}
b274bb2e-f0f5-4503-b3c9-447bc994f2ff	Private	0a6016dd-4bb5-498c-bfe1-4d197307257d/99aef199-5238-494b-ac34-d68c1cd9d1b9.docx	\N	2026-07-02 10:33:00.361589+00	2026-07-02 10:33:00.361589+00	2026-07-02 10:33:00.361589+00	{"eTag": "\\"0393caee1eaf14866bda027c398d7946\\"", "size": 48798, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T10:33:01.000Z", "contentLength": 48798, "httpStatusCode": 200}	c528beaf-33ab-4c62-b023-d5402e54b8fc	\N	{}
0bf7bc60-0ba2-417b-9a0f-00e86abb9256	Private	college-docs/0a6016dd-4bb5-498c-bfe1-4d197307257d/offer-letters/154f6292-5165-4579-a500-c9717b1bbdec.docx	\N	2026-07-02 10:34:09.928869+00	2026-07-02 10:34:09.928869+00	2026-07-02 10:34:09.928869+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T10:34:10.000Z", "contentLength": 511383, "httpStatusCode": 200}	e903fde1-7be8-4bb6-87c1-b7b6baa3524f	\N	{}
9fd581b0-b057-45b7-accc-fee1d3567df1	Private	college-docs/0a6016dd-4bb5-498c-bfe1-4d197307257d/enrollment-docs/4aff159a-50cc-4d96-91cf-ed79fc130287.docx	\N	2026-07-02 10:34:27.547471+00	2026-07-02 10:34:27.547471+00	2026-07-02 10:34:27.547471+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T10:34:28.000Z", "contentLength": 511383, "httpStatusCode": 200}	aa501783-0ec2-4d43-9b32-2d74cd2ebc13	\N	{}
4e568278-d690-4dc4-80d6-34228f502b5f	Private	parent-docs/0a6016dd-4bb5-498c-bfe1-4d197307257d/salary-sheets/6def940c-fad9-43a6-8344-8ccc27818331.docx	\N	2026-07-02 10:34:51.488749+00	2026-07-02 10:34:51.488749+00	2026-07-02 10:34:51.488749+00	{"eTag": "\\"0393caee1eaf14866bda027c398d7946\\"", "size": 48798, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T10:34:52.000Z", "contentLength": 48798, "httpStatusCode": 200}	32e705d4-e563-4195-82d5-3efe35043802	\N	{}
8669907a-fdee-4387-8670-5eb86cdc63b9	Private	8002ace3-d738-414e-a097-39dc9904e9be/0c1b3ce6-e95f-4a95-97fe-a98a7b3744b0.png	\N	2026-07-02 11:38:41.845666+00	2026-07-02 11:38:41.845666+00	2026-07-02 11:38:41.845666+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T11:38:42.000Z", "contentLength": 210372, "httpStatusCode": 200}	ca4c2da8-70cb-402f-9259-7add8a803f8e	\N	{}
fab9f6d4-d608-42a3-abf4-dcb05f8a9773	Private	8002ace3-d738-414e-a097-39dc9904e9be/c4e93302-9d5e-4c73-9ab1-2cb353abc52b.png	\N	2026-07-02 11:38:45.393013+00	2026-07-02 11:38:45.393013+00	2026-07-02 11:38:45.393013+00	{"eTag": "\\"9fed9bcdb4392d3c120b3a58ed061247\\"", "size": 929649, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T11:38:46.000Z", "contentLength": 929649, "httpStatusCode": 200}	1fc0a443-5e7e-4ee2-982f-56a3aeae1e94	\N	{}
20bc6505-2761-4de2-9f18-f32e5ad62541	Private	8002ace3-d738-414e-a097-39dc9904e9be/03438d01-f376-430a-bc69-2f7b658140cd.png	\N	2026-07-02 11:38:50.061232+00	2026-07-02 11:38:50.061232+00	2026-07-02 11:38:50.061232+00	{"eTag": "\\"087dde809fc278a4a1a68ab3962b914e\\"", "size": 210372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T11:38:51.000Z", "contentLength": 210372, "httpStatusCode": 200}	cd6527e7-09cc-42c4-95c2-fae65cbf68dd	\N	{}
58b36714-4365-48ef-a97f-a4fef33fc3cf	Private	8002ace3-d738-414e-a097-39dc9904e9be/15cb5681-c67b-4e52-98ef-7f42fd9e4b7a.docx	\N	2026-07-02 11:39:11.540363+00	2026-07-02 11:39:11.540363+00	2026-07-02 11:39:11.540363+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T11:39:12.000Z", "contentLength": 511383, "httpStatusCode": 200}	6e9b9521-d9b1-409c-bfec-c1109d5dc301	\N	{}
b206f5f4-a68f-470b-aa46-00bbd731616c	Private	parent-docs/8002ace3-d738-414e-a097-39dc9904e9be/salary-sheets/ecfeb246-42ae-4674-a6bb-c66001ae8770.docx	\N	2026-07-02 11:41:46.391973+00	2026-07-02 11:41:46.391973+00	2026-07-02 11:41:46.391973+00	{"eTag": "\\"0393caee1eaf14866bda027c398d7946\\"", "size": 48798, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T11:41:47.000Z", "contentLength": 48798, "httpStatusCode": 200}	2650e6ec-464d-4f7b-90ea-d6f3dccc9108	\N	{}
d9573b2c-376a-4fe1-8b40-ffe7eedd4ec6	Private	college-docs/8002ace3-d738-414e-a097-39dc9904e9be/offer-letters/8f355fd8-783b-4b42-97c0-3ed869fdba7e.docx	\N	2026-07-02 11:42:19.100405+00	2026-07-02 11:42:19.100405+00	2026-07-02 11:42:19.100405+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T11:42:20.000Z", "contentLength": 511383, "httpStatusCode": 200}	4446fbcf-b684-4852-a926-3203d1deaf4d	\N	{}
29385b5a-0384-4709-bc1e-b957717adc81	Private	college-docs/8002ace3-d738-414e-a097-39dc9904e9be/enrollment-docs/c7adbea2-0cc4-406c-ad24-2f3663d25703.docx	\N	2026-07-02 11:42:21.247409+00	2026-07-02 11:42:21.247409+00	2026-07-02 11:42:21.247409+00	{"eTag": "\\"a94d5e9e98ebb1f9f5c6db68b992492c\\"", "size": 511383, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T11:42:22.000Z", "contentLength": 511383, "httpStatusCode": 200}	a4899aed-e48f-46b3-ae76-7a5e65f68060	\N	{}
21c287b2-4ee7-4de3-99d2-2bae9ceb4413	Private	7c34b546-c77f-4364-b30f-0401e6d673f4/2c6282ef-2e20-4074-99d1-aa048a069928.png	\N	2026-07-03 02:05:00.418033+00	2026-07-03 02:05:00.418033+00	2026-07-03 02:05:00.418033+00	{"eTag": "\\"57490d696410b7bc3b152744ddb805cf\\"", "size": 409484, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-03T02:05:01.000Z", "contentLength": 409484, "httpStatusCode": 200}	3e3f5b2d-4572-4f49-81cf-050b784f46bb	\N	{}
fec99a61-075d-445f-8922-0c9ab0685e38	Private	7c34b546-c77f-4364-b30f-0401e6d673f4/47fd1404-0760-4ed9-a9ad-0135e08ca8da.png	\N	2026-07-03 02:05:08.498267+00	2026-07-03 02:05:08.498267+00	2026-07-03 02:05:08.498267+00	{"eTag": "\\"57490d696410b7bc3b152744ddb805cf\\"", "size": 409484, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-03T02:05:09.000Z", "contentLength": 409484, "httpStatusCode": 200}	9c114f79-9780-406b-9691-7f23ca30a72f	\N	{}
5c8be42a-23ed-49e8-af89-0a0ef2368de7	Private	7c34b546-c77f-4364-b30f-0401e6d673f4/2fc2482c-6beb-43af-a44b-f9d36c49126c.png	\N	2026-07-03 02:05:11.645989+00	2026-07-03 02:05:11.645989+00	2026-07-03 02:05:11.645989+00	{"eTag": "\\"589d4bcb654cc691af95a03246f25ada\\"", "size": 247755, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-03T02:05:12.000Z", "contentLength": 247755, "httpStatusCode": 200}	a14832b2-eade-427b-b5ba-9bc29bebe466	\N	{}
4f53ba13-9308-4a48-a3fd-2f05fdceea1d	Private	7c34b546-c77f-4364-b30f-0401e6d673f4/13438782-15e6-407b-9d48-82bcb0280077.docx	\N	2026-07-03 02:05:32.582182+00	2026-07-03 02:05:32.582182+00	2026-07-03 02:05:32.582182+00	{"eTag": "\\"b6100cfbafe09bcaa95c43443e115ff8\\"", "size": 41178, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-03T02:05:33.000Z", "contentLength": 41178, "httpStatusCode": 200}	3da1fca9-779c-4781-8ec1-5478c6f23b81	\N	{}
53f3b01a-19e3-4e6a-a86c-95137975f905	Private	7c34b546-c77f-4364-b30f-0401e6d673f4/d3c1cc77-1eb9-44d0-8e4d-b0da89198340.docx	\N	2026-07-03 02:05:37.535206+00	2026-07-03 02:05:37.535206+00	2026-07-03 02:05:37.535206+00	{"eTag": "\\"b6100cfbafe09bcaa95c43443e115ff8\\"", "size": 41178, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-03T02:05:38.000Z", "contentLength": 41178, "httpStatusCode": 200}	6e2bc8e7-34a0-4244-93c1-cfa0e26ea929	\N	{}
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: FamilyMember FamilyMember_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FamilyMember"
    ADD CONSTRAINT "FamilyMember_pkey" PRIMARY KEY (id);


--
-- Name: Insurance Insurance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Insurance"
    ADD CONSTRAINT "Insurance_pkey" PRIMARY KEY (id);


--
-- Name: PersonalGuarantee PersonalGuarantee_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PersonalGuarantee"
    ADD CONSTRAINT "PersonalGuarantee_pkey" PRIMARY KEY (id);


--
-- Name: RepaymentCapacity RepaymentCapacity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RepaymentCapacity"
    ADD CONSTRAINT "RepaymentCapacity_pkey" PRIMARY KEY (id);


--
-- Name: Security Security_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Security"
    ADD CONSTRAINT "Security_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: agreements agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_pkey PRIMARY KEY (id);


--
-- Name: application_links application_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_links
    ADD CONSTRAINT application_links_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: college_verifications college_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_verifications
    ADD CONSTRAINT college_verifications_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: enrollment_certificates enrollment_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollment_certificates
    ADD CONSTRAINT enrollment_certificates_pkey PRIMARY KEY (id);


--
-- Name: loan_applications loan_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT loan_applications_pkey PRIMARY KEY (id);


--
-- Name: loan_information loan_information_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_information
    ADD CONSTRAINT loan_information_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: offer_letters offer_letters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offer_letters
    ADD CONSTRAINT offer_letters_pkey PRIMARY KEY (id);


--
-- Name: parent_profiles parent_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_profiles
    ADD CONSTRAINT parent_profiles_pkey PRIMARY KEY (id);


--
-- Name: parent_verifications parent_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_verifications
    ADD CONSTRAINT parent_verifications_pkey PRIMARY KEY (id);


--
-- Name: study_information study_information_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.study_information
    ADD CONSTRAINT study_information_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: FamilyMember_applicationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FamilyMember_applicationId_key" ON public."FamilyMember" USING btree ("applicationId");


--
-- Name: Insurance_applicationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Insurance_applicationId_key" ON public."Insurance" USING btree ("applicationId");


--
-- Name: PersonalGuarantee_applicationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PersonalGuarantee_applicationId_key" ON public."PersonalGuarantee" USING btree ("applicationId");


--
-- Name: RepaymentCapacity_applicationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RepaymentCapacity_applicationId_key" ON public."RepaymentCapacity" USING btree ("applicationId");


--
-- Name: Security_applicationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Security_applicationId_key" ON public."Security" USING btree ("applicationId");


--
-- Name: agreements_createdByEmail_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "agreements_createdByEmail_idx" ON public.agreements USING btree ("createdByEmail");


--
-- Name: application_links_applicationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "application_links_applicationId_idx" ON public.application_links USING btree ("applicationId");


--
-- Name: application_links_recipientEmail_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "application_links_recipientEmail_idx" ON public.application_links USING btree ("recipientEmail");


--
-- Name: application_links_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX application_links_token_idx ON public.application_links USING btree (token);


--
-- Name: application_links_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX application_links_token_key ON public.application_links USING btree (token);


--
-- Name: audit_logs_applicationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_applicationId_idx" ON public.audit_logs USING btree ("applicationId");


--
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- Name: college_verifications_applicationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "college_verifications_applicationId_key" ON public.college_verifications USING btree ("applicationId");


--
-- Name: documents_applicationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "documents_applicationId_idx" ON public.documents USING btree ("applicationId");


--
-- Name: enrollment_certificates_createdByEmail_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "enrollment_certificates_createdByEmail_idx" ON public.enrollment_certificates USING btree ("createdByEmail");


--
-- Name: loan_applications_applicationNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "loan_applications_applicationNumber_key" ON public.loan_applications USING btree ("applicationNumber");


--
-- Name: loan_applications_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loan_applications_status_idx ON public.loan_applications USING btree (status);


--
-- Name: loan_applications_submittedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "loan_applications_submittedAt_idx" ON public.loan_applications USING btree ("submittedAt");


--
-- Name: loan_applications_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "loan_applications_userId_idx" ON public.loan_applications USING btree ("userId");


--
-- Name: loan_information_applicationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "loan_information_applicationId_key" ON public.loan_information USING btree ("applicationId");


--
-- Name: notifications_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_userId_idx" ON public.notifications USING btree ("userId");


--
-- Name: offer_letters_createdByEmail_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "offer_letters_createdByEmail_idx" ON public.offer_letters USING btree ("createdByEmail");


--
-- Name: parent_profiles_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "parent_profiles_userId_key" ON public.parent_profiles USING btree ("userId");


--
-- Name: parent_verifications_applicationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "parent_verifications_applicationId_key" ON public.parent_verifications USING btree ("applicationId");


--
-- Name: study_information_applicationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "study_information_applicationId_key" ON public.study_information USING btree ("applicationId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: FamilyMember FamilyMember_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FamilyMember"
    ADD CONSTRAINT "FamilyMember_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Insurance Insurance_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Insurance"
    ADD CONSTRAINT "Insurance_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PersonalGuarantee PersonalGuarantee_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PersonalGuarantee"
    ADD CONSTRAINT "PersonalGuarantee_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RepaymentCapacity RepaymentCapacity_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RepaymentCapacity"
    ADD CONSTRAINT "RepaymentCapacity_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Security Security_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Security"
    ADD CONSTRAINT "Security_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: application_links application_links_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_links
    ADD CONSTRAINT "application_links_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: college_verifications college_verifications_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_verifications
    ADD CONSTRAINT "college_verifications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: loan_applications loan_applications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT "loan_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: loan_information loan_information_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_information
    ADD CONSTRAINT "loan_information_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: parent_profiles parent_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_profiles
    ADD CONSTRAINT "parent_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: parent_verifications parent_verifications_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_verifications
    ADD CONSTRAINT "parent_verifications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: study_information study_information_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.study_information
    ADD CONSTRAINT "study_information_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT USAGE ON SCHEMA storage TO anon;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT USAGE ON SCHEMA storage TO authenticated;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT USAGE ON SCHEMA storage TO service_role;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT USAGE ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT USAGE ON SCHEMA storage TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;
SET SESSION AUTHORIZATION postgres;
GRANT USAGE ON SCHEMA vault TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION send_binary(payload bytea, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION wal2json_escape_identifier(name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO postgres;
GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE custom_oauth_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.custom_oauth_providers TO postgres;
GRANT ALL ON TABLE auth.custom_oauth_providers TO dashboard_user;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.flow_state TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.identities TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.instances TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.saml_providers TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.sessions TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.sso_domains TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.sso_providers TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.users TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE webauthn_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_challenges TO postgres;
GRANT ALL ON TABLE auth.webauthn_challenges TO dashboard_user;


--
-- Name: TABLE webauthn_credentials; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_credentials TO postgres;
GRANT ALL ON TABLE auth.webauthn_credentials TO dashboard_user;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.buckets TO service_role;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.buckets TO authenticated;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.buckets TO anon;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.objects TO service_role;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.objects TO authenticated;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.objects TO anon;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict OpqnCGxn2VPXZBYOg9xuzOGZlZYHi09aRjB9OKY768KffOVQTrfYQi8SItaTDXO

