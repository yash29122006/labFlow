# LabFlow Backend Update

This version implements the finalized Faculty -> Subject access model.

## Required Supabase database change

Run `faculty_subjects_table.sql` once:

```sql
CREATE TABLE faculty_subjects (
    faculty_id BIGINT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (faculty_id, subject_id)
);
```

No other new table is required for this change.

## New admin APIs

- `POST /api/admin/faculty/{facultyId}/subjects/{subjectId}`
- `DELETE /api/admin/faculty/{facultyId}/subjects/{subjectId}`
- `GET /api/admin/faculty/{facultyId}/subjects`

These are ADMIN-only.

## Faculty subject access

- `GET /api/subjects/my` returns only subjects assigned to the logged-in faculty.
- Faculty assignment, quiz, submission and evaluation operations are checked against assigned subjects in the service layer.
- Faculty cannot access or modify another faculty's subject/assignment data by changing IDs in the URL/body.

## Assignment workflow

Faculty can create, update, delete, open and close assignments only for subjects assigned to them.

- `POST /api/assignments`
- `PUT /api/assignments/{id}`
- `DELETE /api/assignments/{id}`
- `POST /api/assignments/{id}/open`
- `POST /api/assignments/{id}/close`

Students receive only open assignments from subjects matching their department, academic year and semester.

## Quiz/security updates

- Faculty quiz management is restricted to assignments they can access.
- Students can submit quiz answers only for eligible, open assignments.
- Student quiz responses no longer receive `correctAnswer` in the quiz GET response.

## Submission/evaluation updates

- Students can submit code only to eligible, open assignments.
- Faculty can view submissions and evaluations only for assignments in their assigned subjects.
- Evaluation is always unpublished after create/re-evaluation; only the publish endpoint makes it visible to students.

## SecurityConfig

The Spring Boot 4 path patterns use `*` for one path segment and `**` only at the end of a pattern. The old invalid pattern `/api/quizzes/assignment/**/submit` is not used.
