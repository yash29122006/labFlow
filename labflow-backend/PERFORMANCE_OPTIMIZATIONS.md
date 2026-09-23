# LabFlow backend performance optimizations

This version is based on the uploaded `complete.zip` backend.

## Main changes

1. JWT requests no longer query `students`/`faculty` on every request.
   New student/faculty tokens carry the numeric database `userId`.
   The filter parses the JWT once and places the id in `request.userId`.
   Re-login after this update so the new claim is present.

2. Faculty assignment listing no longer does:
   `findAll()` -> for each assignment -> subject lookup -> faculty-subject lookup.
   It is now one set-based PostgreSQL query.

3. Student assignment listing is one SQL query using the student's academic context.

4. Assignment-by-subject listing is now one SQL query instead of loading link rows and then loading assignments.

5. Faculty assignment authorization uses one `EXISTS/NOT EXISTS` query instead of one query per linked subject.

6. Faculty subject listing is one join query.

7. Faculty student listing is one join query instead of loading all students and filtering them in Java.

8. Dashboard summary no longer loads all assignments and counts quizzes/submissions one assignment at a time. It uses SQL counts.

9. Quiz submission loads all requested quizzes in one query and existing student responses in one query, then uses Hibernate batching for writes.

10. Hibernate SQL console printing is disabled in normal operation because printing hundreds of SQL statements can itself slow local development.

11. Hibernate JDBC batching is enabled for bulk response writes.

12. PostgreSQL indexes were added for the foreign-key and academic-context lookup paths used by the optimized queries.

## Important

The backend ZIP does not contain the Angular frontend. Backend optimization removes N+1 SQL work inside each API request, but if the Angular page still makes one HTTP request per assignment, those HTTP requests must also be consolidated/cached in the frontend to eliminate the remaining request fan-out.

## Database migration

Run:

`migrations/002_performance_indexes.sql`

The existing `faculty_subjects` table is still required.

## JWT

Existing JWTs do not contain the new `userId` claim. Log out and log in again after starting this backend.
