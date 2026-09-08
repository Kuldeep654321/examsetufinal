-- Migration: Add rich article content, salary, vacancies, and student resource tables

-- Add extra columns to exams table
ALTER TABLE exams ADD COLUMN IF NOT EXISTS overview_article TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS selection_process JSONB DEFAULT '[]'::jsonb;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS career_scope TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS preparation_tips JSONB DEFAULT '{}'::jsonb;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS cutoffs_info JSONB DEFAULT '{}'::jsonb;

-- Add extra columns to opportunities table
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS vacancies_count VARCHAR(100);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS salary_range VARCHAR(200);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS stipend_amount VARCHAR(150);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS role_designation VARCHAR(255);

-- Create Study Materials / PYQs Table
CREATE TABLE IF NOT EXISTS study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- 'syllabus_pdf', 'pyq_paper', 'answer_key_pdf', 'model_paper'
    year INTEGER,
    file_url TEXT NOT NULL,
    file_size_kb INTEGER,
    is_official BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Daily GK / Current Affairs Capsules Table
CREATE TABLE IF NOT EXISTS daily_gk_capsules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'National', 'Economy', 'Science & Tech', 'Defence', 'Environment'
    relevant_exams JSONB DEFAULT '["UPSC", "SSC", "Banking", "State PSC"]'::jsonb,
    key_takeaways JSONB DEFAULT '[]'::jsonb,
    source_url TEXT,
    published_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_materials_exam ON study_materials(exam_id);
CREATE INDEX IF NOT EXISTS idx_gk_date ON daily_gk_capsules(published_date DESC);

