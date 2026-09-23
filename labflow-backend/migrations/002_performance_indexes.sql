-- ==========================================================
-- LabFlow Performance Indexes
-- Safe to run once in Supabase / PostgreSQL.
-- All statements are idempotent.
-- ==========================================================

-- Authentication / lookup columns
CREATE INDEX IF NOT EXISTS idx_students_uid ON students(uid);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_faculty_faculty_id ON faculty(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_email ON faculty(email);

-- Student -> Subject matching
CREATE INDEX IF NOT EXISTS idx_students_academic_context
ON students (LOWER(department), academic_year, semester);

CREATE INDEX IF NOT EXISTS idx_subjects_academic_context
ON subjects (LOWER(department), academic_year, semester);

-- Faculty -> Subject access
-- PK(faculty_id, subject_id) already supports the first direction.
CREATE INDEX IF NOT EXISTS idx_faculty_subjects_subject_faculty
ON faculty_subjects(subject_id, faculty_id);

-- Subject <-> Assignment
-- Keep both directions because both are used by page queries.
CREATE INDEX IF NOT EXISTS idx_subject_assignments_assignment_subject
ON subject_assignments(assignment_id, subject_id);

-- Assignment filtering
CREATE INDEX IF NOT EXISTS idx_assignments_is_open
ON assignments(is_open);

-- Quizzes by assignment
CREATE INDEX IF NOT EXISTS idx_quizzes_assignment
ON quizzes(assignment_id);

-- Quiz responses
CREATE INDEX IF NOT EXISTS idx_quiz_responses_quiz_student
ON quiz_responses(quiz_id, student_id);

CREATE INDEX IF NOT EXISTS idx_quiz_responses_student
ON quiz_responses(student_id);

-- Submissions
CREATE INDEX IF NOT EXISTS idx_submissions_assignment
ON submissions(assignment_id);

CREATE INDEX IF NOT EXISTS idx_submissions_student
ON submissions(student_id);

CREATE INDEX IF NOT EXISTS idx_submissions_student_assignment
ON submissions(student_id, assignment_id);

-- Evaluations
CREATE INDEX IF NOT EXISTS idx_evaluations_submission
ON evaluations(submission_id);

ANALYZE;
