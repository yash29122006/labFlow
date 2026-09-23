-- ==========================================================
-- LabFlow Migration: 001_phase6_additions.sql
-- Run in Supabase / PostgreSQL Query Editor before starting backend
-- ==========================================================

-- B2: Assignment Due Date & Quiz Time Limit
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS due_date DATE NULL;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS quiz_time_limit_minutes INT NULL;

-- B3: Submission Metadata (timestamp and language)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS language VARCHAR(30) NULL;

-- B4: Active flag for Students and Faculty
ALTER TABLE students ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
