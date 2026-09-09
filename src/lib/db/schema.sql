-- ExamSetu (examsetu.in) Complete Database Schema
-- Production PostgreSQL Schema with Multi-Tier Education Ecosystem

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'verifier', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE org_type AS ENUM ('national_testing', 'board', 'commission', 'recruitment', 'university', 'scholarship_body', 'defence');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE event_type AS ENUM ('registration', 'correction_window', 'admit_card', 'exam', 'answer_key', 'result', 'counselling', 'admission');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('upcoming', 'open', 'closing_soon', 'closed', 'completed', 'unannounced', 'delayed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE update_type AS ENUM ('date_extended', 'admit_card_out', 'result_declared', 'syllabus_updated', 'pattern_changed', 'new_cycle', 'correction_opened', 'general');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE opp_type AS ENUM ('scholarship', 'internship', 'job', 'fellowship', 'olympiad', 'competition', 'apprenticeship', 'certification', 'govt_scheme', 'entrance_opp');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE opp_status AS ENUM ('upcoming', 'open', 'closing_soon', 'closed', 'announced');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE source_type AS ENUM ('official_api', 'official_feed', 'official_html', 'official_pdf');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE source_health AS ENUM ('healthy', 'layout_changed', 'failed', 'degraded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'merged', 'edited');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tracker_status AS ENUM ('interested', 'will_apply', 'applied', 'admit_card_received', 'exam_completed', 'result_available');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. States & UTs of India
CREATE TABLE IF NOT EXISTS states (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'state',
    capital VARCHAR(100)
);

-- 2. Categories
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL
);

-- 3. Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. User Profiles (Personalization)
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_level VARCHAR(50),
    board VARCHAR(100),
    state VARCHAR(100),
    stream VARCHAR(100),
    subjects JSONB DEFAULT '[]'::jsonb,
    target_exams JSONB DEFAULT '[]'::jsonb,
    career_interests JSONB DEFAULT '[]'::jsonb,
    phone_number VARCHAR(20),
    notification_preferences JSONB DEFAULT '{"email": true, "in_app": true, "web_push": true, "deadline_reminders": true, "admit_card_alerts": true, "result_alerts": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Organizations (Official Conducting Bodies)
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    official_domain VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    logo_url TEXT,
    state_id TEXT REFERENCES states(id) ON DELETE SET NULL,
    org_type org_type NOT NULL DEFAULT 'national_testing',
    official_portal_url TEXT NOT NULL,
    helpline_number VARCHAR(100),
    contact_email VARCHAR(150),
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Exams
CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug VARCHAR(150) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    short_title VARCHAR(100) NOT NULL,
    conducting_org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    state_id TEXT REFERENCES states(id) ON DELETE SET NULL,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    level VARCHAR(50) NOT NULL DEFAULT 'National',
    stream_eligibility JSONB NOT NULL DEFAULT '["Any"]'::jsonb,
    min_age INTEGER,
    max_age INTEGER,
    age_relaxation JSONB DEFAULT '{}'::jsonb,
    eligibility_criteria TEXT NOT NULL,
    exam_frequency VARCHAR(100) NOT NULL DEFAULT 'Once a year',
    official_website_url TEXT NOT NULL,
    registration_url TEXT,
    syllabus_url TEXT,
    exam_pattern JSONB DEFAULT '{}'::jsonb,
    important_documents JSONB DEFAULT '[]'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    overview_article TEXT,
    selection_process TEXT,
    career_scope TEXT,
    preparation_tips TEXT,
    cutoffs_info TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Exam Events (Event-Based Timeline System)
CREATE TABLE IF NOT EXISTS exam_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    cycle_year INTEGER NOT NULL,
    event_type event_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_extended BOOLEAN NOT NULL DEFAULT FALSE,
    previous_end_date DATE,
    status event_status NOT NULL DEFAULT 'upcoming',
    official_source_url TEXT NOT NULL,
    notification_doc_url TEXT,
    notes TEXT,
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_exam_event_cycle UNIQUE (exam_id, cycle_year, event_type)
);

-- 8. Exam Updates (Audit Trail of Official Announcements)
CREATE TABLE IF NOT EXISTS exam_updates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    event_id TEXT REFERENCES exam_events(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    update_type update_type NOT NULL DEFAULT 'general',
    official_source_url TEXT NOT NULL,
    official_doc_ref TEXT,
    is_breaking BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Opportunities (Scholarships, Internships, Jobs, Fellowships)
CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug VARCHAR(150) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    opp_type opp_type NOT NULL DEFAULT 'scholarship',
    description TEXT NOT NULL,
    eligibility TEXT NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    min_age INTEGER,
    max_age INTEGER,
    state_id TEXT REFERENCES states(id) ON DELETE SET NULL,
    location VARCHAR(255) DEFAULT 'All India',
    stream JSONB DEFAULT '["Any"]'::jsonb,
    application_start DATE,
    application_deadline DATE,
    is_deadline_extended BOOLEAN NOT NULL DEFAULT FALSE,
    previous_deadline DATE,
    benefits TEXT NOT NULL,
    financial_aid_amount VARCHAR(150),
    vacancies_count INTEGER,
    salary_range VARCHAR(200),
    stipend_amount VARCHAR(150),
    department VARCHAR(255),
    role_designation VARCHAR(255),
    application_process TEXT NOT NULL,
    official_source_url TEXT NOT NULL,
    official_portal_link TEXT,
    documents_required JSONB DEFAULT '[]'::jsonb,
    status opp_status NOT NULL DEFAULT 'open',
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Official Source Registry
CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    official_domain VARCHAR(255) NOT NULL,
    base_url TEXT NOT NULL,
    source_type source_type NOT NULL DEFAULT 'official_html',
    adapter_name VARCHAR(100) NOT NULL,
    check_interval_minutes INTEGER NOT NULL DEFAULT 60,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    health_status source_health NOT NULL DEFAULT 'healthy',
    last_successful_fetch TIMESTAMPTZ,
    last_failed_fetch TIMESTAMPTZ,
    failure_count INTEGER NOT NULL DEFAULT 0,
    response_time_ms INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Source Fetch Logs
CREATE TABLE IF NOT EXISTS source_fetch_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    page_url TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    content_changed BOOLEAN NOT NULL DEFAULT FALSE,
    items_detected INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Review Queue (AI Extraction & Human Verification)
CREATE TABLE IF NOT EXISTS review_queue (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    document_title VARCHAR(255) NOT NULL,
    target_entity_type VARCHAR(50) NOT NULL,
    target_entity_id TEXT,
    extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    proposed_changes JSONB NOT NULL DEFAULT '{}'::jsonb,
    diff_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_confidence NUMERIC(4, 2) NOT NULL DEFAULT 0.85,
    ai_reasoning TEXT,
    review_status review_status NOT NULL DEFAULT 'pending',
    reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Student Application Tracker (Private)
CREATE TABLE IF NOT EXISTS application_tracker (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL,
    target_id TEXT NOT NULL,
    status tracker_status NOT NULL DEFAULT 'interested',
    application_number TEXT,
    roll_number TEXT,
    exam_date DATE,
    exam_center TEXT,
    private_notes TEXT,
    documents_checklist JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_application UNIQUE (user_id, target_type, target_id)
);

-- 14. Saved Items (Bookmarks)
CREATE TABLE IF NOT EXISTS saved_exams (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_saved_exam UNIQUE (user_id, exam_id)
);

CREATE TABLE IF NOT EXISTS saved_opportunities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_saved_opp UNIQUE (user_id, opportunity_id)
);

-- 15. Real-Time Student Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'exam_alert',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Daily GK & Current Affairs
CREATE TABLE IF NOT EXISTS daily_gk_capsules (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    category TEXT NOT NULL,
    published_date DATE NOT NULL,
    key_takeaways JSONB DEFAULT '[]'::jsonb,
    relevant_exams JSONB DEFAULT '[]'::jsonb,
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Secondary & Higher Secondary Education Boards
CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    board_type TEXT NOT NULL,
    state_name TEXT,
    official_website TEXT NOT NULL,
    official_domain TEXT NOT NULL,
    classes_covered JSONB DEFAULT '["10th", "12th"]'::jsonb,
    grading_system TEXT,
    supplementary_exam_name TEXT,
    revaluation_process_info TEXT,
    pattern_summary TEXT,
    practical_exam_info TEXT,
    helpline_number TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    last_verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Multi-Tier Counselling Authorities
CREATE TABLE IF NOT EXISTS counselling_authorities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    stream TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    conducting_body TEXT NOT NULL,
    official_website TEXT NOT NULL,
    official_domain TEXT NOT NULL,
    description TEXT NOT NULL,
    helpline_number TEXT,
    contact_email TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    last_verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Counselling Processes & Multi-Round Portals
CREATE TABLE IF NOT EXISTS counselling_processes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    authority_id TEXT NOT NULL,
    cycle_year INTEGER NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    official_portal_url TEXT NOT NULL,
    notification_url TEXT,
    process_overview TEXT NOT NULL,
    eligibility_summary TEXT NOT NULL,
    reservation_summary TEXT,
    rounds_structure JSONB DEFAULT '[]'::jsonb,
    step_by_step_process JSONB DEFAULT '[]'::jsonb,
    required_documents JSONB DEFAULT '[]'::jsonb,
    seat_matrix_info TEXT,
    fees_info TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming',
    last_verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Colleges & Higher Education Institutions
CREATE TABLE IF NOT EXISTS institutions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    institution_type TEXT NOT NULL,
    state_name TEXT NOT NULL,
    city TEXT NOT NULL,
    official_website TEXT NOT NULL,
    affiliation TEXT,
    recognized_by TEXT,
    accepted_exams JSONB DEFAULT '[]'::jsonb,
    counselling_authorities JSONB DEFAULT '[]'::jsonb,
    courses_offered JSONB DEFAULT '[]'::jsonb,
    campus_overview TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    last_verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Higher Education Courses & Degree Taxonomy
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    degree_level TEXT NOT NULL,
    stream TEXT NOT NULL,
    duration_years TEXT NOT NULL,
    eligibility_summary TEXT NOT NULL,
    stream_prerequisites JSONB DEFAULT '[]'::jsonb,
    lateral_entry_available BOOLEAN DEFAULT FALSE,
    regulatory_body TEXT NOT NULL,
    accepted_entrance_exams JSONB DEFAULT '[]'::jsonb,
    counselling_routes JSONB DEFAULT '[]'::jsonb,
    career_scope TEXT NOT NULL,
    top_specializations JSONB DEFAULT '[]'::jsonb,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    last_verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Student Progression & Career Pathways
CREATE TABLE IF NOT EXISTS student_pathways (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    stage_from TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    flow_stages JSONB DEFAULT '[]'::jsonb,
    entrance_exams JSONB DEFAULT '[]'::jsonb,
    counselling_systems JSONB DEFAULT '[]'::jsonb,
    courses_accessible JSONB DEFAULT '[]'::jsonb,
    institutions_types JSONB DEFAULT '[]'::jsonb,
    career_outcomes JSONB DEFAULT '[]'::jsonb,
    govt_exam_eligibility JSONB DEFAULT '[]'::jsonb,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    last_verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. Study Materials & Official Question Papers
CREATE TABLE IF NOT EXISTS study_materials (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    exam_id TEXT REFERENCES exams(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    year INTEGER,
    file_url TEXT NOT NULL,
    file_size_kb INTEGER,
    is_official BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exams_category ON exams(category_id);
CREATE INDEX IF NOT EXISTS idx_exams_org ON exams(conducting_org_id);
CREATE INDEX IF NOT EXISTS idx_exams_slug ON exams(slug);
CREATE INDEX IF NOT EXISTS idx_exams_is_active ON exams(is_active);

CREATE INDEX IF NOT EXISTS idx_events_exam_id ON exam_events(exam_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON exam_events(status);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON exam_events(end_date);

CREATE INDEX IF NOT EXISTS idx_updates_exam_id ON exam_updates(exam_id);
CREATE INDEX IF NOT EXISTS idx_updates_published_at ON exam_updates(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_opps_type ON opportunities(opp_type);
CREATE INDEX IF NOT EXISTS idx_opps_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opps_deadline ON opportunities(application_deadline);
CREATE INDEX IF NOT EXISTS idx_opps_slug ON opportunities(slug);

CREATE INDEX IF NOT EXISTS idx_sources_health ON sources(health_status);
CREATE INDEX IF NOT EXISTS idx_review_queue_status ON review_queue(review_status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_tracker_user ON application_tracker(user_id);
CREATE INDEX IF NOT EXISTS idx_boards_slug ON boards(slug);
CREATE INDEX IF NOT EXISTS idx_counselling_slug ON counselling_authorities(slug);
CREATE INDEX IF NOT EXISTS idx_counselling_proc_slug ON counselling_processes(slug);
CREATE INDEX IF NOT EXISTS idx_institutions_slug ON institutions(slug);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_pathways_slug ON student_pathways(slug);
CREATE INDEX IF NOT EXISTS idx_gk_date ON daily_gk_capsules(published_date DESC);

-- GIN Trigram Indexes
CREATE INDEX IF NOT EXISTS idx_exams_title_trgm ON exams USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_opps_title_trgm ON opportunities USING gin (title gin_trgm_ops);

-- Triggers for FTS Vector Updates
CREATE OR REPLACE FUNCTION update_exam_fts() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.short_title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.eligibility_criteria, '')), 'B');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_exam_fts ON exams;
CREATE TRIGGER trg_exam_fts BEFORE INSERT OR UPDATE ON exams
FOR EACH ROW EXECUTE FUNCTION update_exam_fts();

CREATE OR REPLACE FUNCTION update_opp_fts() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.qualification, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_opp_fts ON opportunities;
CREATE TRIGGER trg_opp_fts BEFORE INSERT OR UPDATE ON opportunities
FOR EACH ROW EXECUTE FUNCTION update_opp_fts();
