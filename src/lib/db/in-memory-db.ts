import { newDb, IMemoryDb, DataType } from 'pg-mem';
import crypto from 'crypto';

let memoryDbInstance: any = null;
let memoryPoolInstance: any = null;

function uuid() {
  return crypto.randomUUID();
}

export function createInMemoryDatabase() {
  if (memoryPoolInstance) {
    return { db: memoryDbInstance, pool: memoryPoolInstance };
  }

  const db: IMemoryDb = newDb({ autoCreateForeignKeyIndices: true });

  db.public.registerFunction({
    name: 'uuid_generate_v4',
    implementation: () => crypto.randomUUID(),
  });
  db.public.registerFunction({
    name: 'gen_random_uuid',
    implementation: () => crypto.randomUUID(),
  });
  db.public.registerFunction({
    name: 'replace',
    args: [DataType.text, DataType.text, DataType.text],
    returns: DataType.text,
    implementation: (str: string, search: string, replacement: string) => {
      if (!str) return '';
      return str.split(search).join(replacement);
    },
  });
  for (let n = 2; n <= 30; n += 2) {
    db.public.registerFunction({
      name: 'json_build_object',
      args: new Array(n).fill(DataType.text),
      returns: DataType.json,
      implementation: (...args: any[]) => {
        const obj: any = {};
        for (let i = 0; i < args.length; i += 2) {
          if (i + 1 < args.length) {
            obj[args[i]] = args[i + 1];
          }
        }
        return obj;
      },
    });
  }
  db.public.registerFunction({
    name: 'similarity',
    args: [DataType.text, DataType.text],
    returns: DataType.float,
    implementation: (a: string, b: string) => {
      if (!a || !b) return 0;
      if (a.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(a.toLowerCase())) return 0.8;
      return 0;
    },
  });
  db.public.registerFunction({
    name: 'to_tsvector',
    implementation: (lang: string, text: string) => text || '',
  });
  db.public.registerFunction({
    name: 'setweight',
    implementation: (vec: any, weight: string) => vec || '',
  });

  // Create full schema tables
  db.public.none(`
    CREATE TABLE IF NOT EXISTS states (
      id text PRIMARY KEY,
      code text UNIQUE NOT NULL,
      name text UNIQUE NOT NULL,
      type text NOT NULL DEFAULT 'state',
      capital text
    );

    CREATE TABLE IF NOT EXISTS categories (
      id text PRIMARY KEY,
      name text NOT NULL,
      slug text UNIQUE NOT NULL,
      description text,
      icon text,
      parent_id text
    );

    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      email text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      full_name text NOT NULL,
      role text NOT NULL DEFAULT 'student',
      avatar_url text,
      email_verified boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id text PRIMARY KEY,
      user_id text UNIQUE NOT NULL,
      class_level text,
      board text,
      state text,
      stream text,
      subjects jsonb DEFAULT '[]'::jsonb,
      target_exams jsonb DEFAULT '[]'::jsonb,
      career_interests jsonb DEFAULT '[]'::jsonb,
      phone_number text,
      notification_preferences jsonb DEFAULT '{"email": true, "in_app": true, "web_push": true}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS organizations (
      id text PRIMARY KEY,
      name text NOT NULL,
      short_name text NOT NULL,
      slug text UNIQUE NOT NULL,
      official_domain text NOT NULL,
      description text NOT NULL,
      logo_url text,
      state_id text,
      org_type text NOT NULL DEFAULT 'national_testing',
      official_portal_url text NOT NULL,
      helpline_number text,
      contact_email text,
      is_verified boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS exams (
      id text PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      title text NOT NULL,
      short_title text NOT NULL,
      conducting_org_id text NOT NULL,
      state_id text,
      category_id text NOT NULL,
      level text NOT NULL DEFAULT 'National',
      stream_eligibility jsonb NOT NULL DEFAULT '["Any"]'::jsonb,
      min_age integer,
      max_age integer,
      age_relaxation text,
      eligibility_criteria text NOT NULL,
      exam_frequency text NOT NULL DEFAULT 'Once a year',
      official_website_url text NOT NULL,
      registration_url text,
      syllabus_url text,
      exam_pattern jsonb DEFAULT '{}'::jsonb,
      important_documents jsonb DEFAULT '[]'::jsonb,
      faqs jsonb DEFAULT '[]'::jsonb,
      overview_article text,
      selection_process text,
      career_scope text,
      preparation_tips text,
      cutoffs_info text,
      is_active boolean NOT NULL DEFAULT true,
      is_featured boolean NOT NULL DEFAULT false,
      last_verified_at timestamptz NOT NULL DEFAULT NOW(),
      search_vector text,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS exam_events (
      id text PRIMARY KEY,
      exam_id text NOT NULL,
      cycle_year integer NOT NULL,
      event_type text NOT NULL,
      title text NOT NULL,
      start_date date,
      end_date date,
      is_extended boolean NOT NULL DEFAULT false,
      previous_end_date date,
      status text NOT NULL DEFAULT 'upcoming',
      official_source_url text NOT NULL,
      notification_doc_url text,
      notes text,
      last_verified_at timestamptz NOT NULL DEFAULT NOW(),
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS exam_updates (
      id text PRIMARY KEY,
      exam_id text NOT NULL,
      event_id text,
      title text NOT NULL,
      summary text NOT NULL,
      old_value text,
      new_value text,
      update_type text NOT NULL DEFAULT 'general',
      official_source_url text NOT NULL,
      official_doc_ref text,
      is_breaking boolean NOT NULL DEFAULT false,
      verified_by_user_id text,
      published_at timestamptz NOT NULL DEFAULT NOW(),
      created_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id text PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      title text NOT NULL,
      org_id text NOT NULL,
      opp_type text NOT NULL DEFAULT 'scholarship',
      description text NOT NULL,
      eligibility text NOT NULL,
      qualification text NOT NULL,
      min_age integer,
      max_age integer,
      state_id text,
      location text DEFAULT 'All India',
      stream jsonb DEFAULT '["Any"]'::jsonb,
      application_start date,
      application_deadline date,
      is_deadline_extended boolean NOT NULL DEFAULT false,
      previous_deadline date,
      benefits text NOT NULL,
      financial_aid_amount text,
      vacancies_count integer,
      salary_range text,
      stipend_amount text,
      department text,
      role_designation text,
      application_process text NOT NULL,
      official_source_url text NOT NULL,
      official_portal_link text,
      documents_required jsonb DEFAULT '[]'::jsonb,
      status text NOT NULL DEFAULT 'open',
      last_verified_at timestamptz NOT NULL DEFAULT NOW(),
      is_featured boolean NOT NULL DEFAULT false,
      search_vector text,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sources (
      id text PRIMARY KEY,
      name text NOT NULL,
      org_id text NOT NULL,
      official_domain text NOT NULL,
      base_url text NOT NULL,
      source_type text NOT NULL DEFAULT 'official_html',
      adapter_name text NOT NULL,
      check_interval_minutes integer NOT NULL DEFAULT 60,
      is_enabled boolean NOT NULL DEFAULT true,
      health_status text NOT NULL DEFAULT 'healthy',
      last_successful_fetch timestamptz,
      last_failed_fetch timestamptz,
      failure_count integer NOT NULL DEFAULT 0,
      response_time_ms integer DEFAULT 0,
      error_message text,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS source_fetch_logs (
      id text PRIMARY KEY,
      source_id text NOT NULL,
      page_url text NOT NULL,
      status_code integer NOT NULL,
      response_time_ms integer NOT NULL,
      content_changed boolean NOT NULL DEFAULT false,
      items_detected integer NOT NULL DEFAULT 0,
      error_message text,
      fetched_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS review_queue (
      id text PRIMARY KEY,
      source_id text NOT NULL,
      document_url text NOT NULL,
      document_title text NOT NULL,
      target_entity_type text NOT NULL,
      target_entity_id text,
      extracted_data jsonb NOT NULL DEFAULT '{}'::jsonb,
      proposed_changes jsonb NOT NULL DEFAULT '{}'::jsonb,
      diff_summary jsonb NOT NULL DEFAULT '[]'::jsonb,
      ai_confidence numeric(4, 2) NOT NULL DEFAULT 0.85,
      ai_reasoning text,
      review_status text NOT NULL DEFAULT 'pending',
      reviewed_by text,
      review_notes text,
      reviewed_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS application_tracker (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      target_type text NOT NULL,
      target_id text NOT NULL,
      status text NOT NULL DEFAULT 'interested',
      application_number text,
      roll_number text,
      exam_date date,
      exam_center text,
      private_notes text,
      documents_checklist jsonb DEFAULT '[]'::jsonb,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS saved_exams (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      exam_id text NOT NULL,
      notes text,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS saved_opportunities (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      opportunity_id text NOT NULL,
      notes text,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      title text NOT NULL,
      message text NOT NULL,
      link text NOT NULL,
      type text NOT NULL DEFAULT 'exam_alert',
      is_read boolean NOT NULL DEFAULT false,
      metadata jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id text PRIMARY KEY,
      user_id text,
      action text NOT NULL,
      entity_type text NOT NULL,
      entity_id text NOT NULL,
      old_state jsonb,
      new_state jsonb,
      ip_address text,
      user_agent text,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS daily_gk_capsules (
      id text PRIMARY KEY,
      title text NOT NULL,
      summary text NOT NULL,
      category text NOT NULL,
      published_date date NOT NULL,
      key_takeaways jsonb DEFAULT '[]'::jsonb,
      relevant_exams jsonb DEFAULT '[]'::jsonb,
      source_name text NOT NULL,
      source_url text NOT NULL,
      created_at timestamptz DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS boards (
      id text PRIMARY KEY,
      name text NOT NULL,
      short_name text NOT NULL,
      slug text UNIQUE NOT NULL,
      board_type text NOT NULL,
      state_name text,
      official_website text NOT NULL,
      official_domain text NOT NULL,
      classes_covered jsonb DEFAULT '["10th", "12th"]'::jsonb,
      grading_system text,
      supplementary_exam_name text,
      revaluation_process_info text,
      pattern_summary text,
      practical_exam_info text,
      helpline_number text,
      is_verified boolean NOT NULL DEFAULT true,
      last_verified_at timestamptz DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS counselling_authorities (
      id text PRIMARY KEY,
      name text NOT NULL,
      short_name text NOT NULL,
      slug text UNIQUE NOT NULL,
      stream text NOT NULL,
      jurisdiction text NOT NULL,
      conducting_body text NOT NULL,
      official_website text NOT NULL,
      official_domain text NOT NULL,
      description text NOT NULL,
      helpline_number text,
      contact_email text,
      is_verified boolean NOT NULL DEFAULT true,
      last_verified_at timestamptz DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS counselling_processes (
      id text PRIMARY KEY,
      authority_id text NOT NULL,
      cycle_year integer NOT NULL,
      title text NOT NULL,
      slug text UNIQUE NOT NULL,
      official_portal_url text NOT NULL,
      notification_url text,
      process_overview text NOT NULL,
      eligibility_summary text NOT NULL,
      reservation_summary text,
      rounds_structure jsonb DEFAULT '[]'::jsonb,
      step_by_step_process jsonb DEFAULT '[]'::jsonb,
      required_documents jsonb DEFAULT '[]'::jsonb,
      seat_matrix_info text,
      fees_info text,
      status text NOT NULL DEFAULT 'upcoming',
      last_verified_at timestamptz DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS institutions (
      id text PRIMARY KEY,
      name text NOT NULL,
      short_name text NOT NULL,
      slug text UNIQUE NOT NULL,
      institution_type text NOT NULL,
      state_name text NOT NULL,
      city text NOT NULL,
      official_website text NOT NULL,
      affiliation text,
      recognized_by text,
      accepted_exams jsonb DEFAULT '[]'::jsonb,
      counselling_authorities jsonb DEFAULT '[]'::jsonb,
      courses_offered jsonb DEFAULT '[]'::jsonb,
      campus_overview text,
      is_verified boolean NOT NULL DEFAULT true,
      last_verified_at timestamptz DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS courses (
      id text PRIMARY KEY,
      name text NOT NULL,
      short_name text NOT NULL,
      slug text UNIQUE NOT NULL,
      degree_level text NOT NULL,
      stream text NOT NULL,
      duration_years text NOT NULL,
      eligibility_summary text NOT NULL,
      stream_prerequisites jsonb DEFAULT '[]'::jsonb,
      lateral_entry_available boolean DEFAULT false,
      regulatory_body text NOT NULL,
      accepted_entrance_exams jsonb DEFAULT '[]'::jsonb,
      counselling_routes jsonb DEFAULT '[]'::jsonb,
      career_scope text NOT NULL,
      top_specializations jsonb DEFAULT '[]'::jsonb,
      is_verified boolean NOT NULL DEFAULT true,
      last_verified_at timestamptz DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS student_pathways (
      id text PRIMARY KEY,
      title text NOT NULL,
      slug text UNIQUE NOT NULL,
      stage_from text NOT NULL,
      category text NOT NULL,
      summary text NOT NULL,
      flow_stages jsonb DEFAULT '[]'::jsonb,
      entrance_exams jsonb DEFAULT '[]'::jsonb,
      counselling_systems jsonb DEFAULT '[]'::jsonb,
      courses_accessible jsonb DEFAULT '[]'::jsonb,
      institutions_types jsonb DEFAULT '[]'::jsonb,
      career_outcomes jsonb DEFAULT '[]'::jsonb,
      govt_exam_eligibility jsonb DEFAULT '[]'::jsonb,
      is_verified boolean NOT NULL DEFAULT true,
      last_verified_at timestamptz DEFAULT NOW()
    );
  `);

  const pg = db.adapters.createPg();
  const pool = new pg.Pool();

  memoryDbInstance = db;
  memoryPoolInstance = pool;

  return { db, pool };
}
