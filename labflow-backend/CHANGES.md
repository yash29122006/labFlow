# CHANGES — what I added and fixed

This is the team's merged project (Person 1+2+3) plus my Person 4 work, plus
two bug fixes I found while integrating. `target/` (build output) was
stripped out — you'll regenerate it on first build.

## New: Person 4 — Faculty Evaluation + Results

6 new files, nothing existing overwritten:
- `entity/Evaluation.java`
- `repository/EvaluationRepository.java`
- `dto/EvaluationRequest.java`
- `dto/EvaluationResponse.java`
- `service/EvaluationService.java`
- `controller/EvaluationController.java`

Endpoints:

| Method | Endpoint | Who | What |
|---|---|---|---|
| POST | `/api/evaluations` | Faculty | Grade (or re-grade) a submission |
| GET | `/api/evaluations/submission/{submissionId}` | Faculty | View one evaluation |
| GET | `/api/evaluations/assignment/{assignmentId}` | Faculty | List evaluations for an assignment |
| PATCH | `/api/evaluations/{id}/publish` | Faculty | Publish a result |
| GET | `/api/evaluations/my` | Student | Own published results only |

`correctness` (0–50), `quality` (0–30), `explanation` (0–20) are validated
server-side; `total_marks` is always computed on the backend. Grading the
same `submissionId` twice updates the existing row (unique constraint on
`submission_id`) instead of duplicating it.

**You must run `evaluations_table.sql` in Supabase before starting the app**
— `ddl-auto=validate` means Hibernate checks the schema but never creates it.

## Fixed: submissions were completely broken

`SubmissionController`'s `POST /api/submissions` and `GET /api/submissions/my`
used `@RequestAttribute("userId")`, but nothing in the project ever set that
attribute — every call would have 400'd. Fixed in
`security/JwtAuthenticationFilter.java`: it now looks up the caller's numeric
database id (via `StudentRepository`/`FacultyRepository`, matching the uid/
facultyId already in the JWT) and sets it as the `userId` request attribute.
No changes needed to `SubmissionController` itself.

## Fixed: quiz submission had no endpoint

`QuizResponseService.submitResponse(...)` was fully written but never called
from anywhere — there was no `POST /api/quizzes/assignment/{assignmentId}/submit`
route, so students had no way to answer a quiz. Added:
- `QuizResponseService.submitAssignmentQuiz(...)` — bulk-submits a list of
  answers, checks the assignment is open (same rule `SubmissionService`
  already uses for code), and checks each quiz actually belongs to that
  assignment.
- The route itself in `QuizController`, following the same
  `Authentication` → `StudentRepository.findByUid` pattern already used in
  `AuthController`/`SubjectController`.

## What I verified vs. couldn't

I don't have Maven or network access in my sandbox, so I couldn't run a real
`mvn compile`. What I did do: extracted the dependency jars already bundled
in `target/person3-0.0.1-SNAPSHOT.jar` (proof the team built this
successfully before) and manually traced every method/field I call back to
where it's defined in the existing entities/repositories, to catch typos or
signature mismatches. I could not catch things only a real compiler or a
running app would catch (annotation-processing issues, Spring bean wiring
at startup, actual DB behavior). **Run `mvn clean compile` yourself as the
first step below** — that's the real check.

## Known gaps I did NOT fix (flagging only)

- **No role-based authorization inside most endpoints.** Beyond `/api/admin/**`
  and subject/assignment writes, `SecurityConfig` only requires "any
  authenticated user" — a STUDENT token can technically call faculty-only
  endpoints like `POST /api/evaluations` or `POST /api/quizzes`. This is
  true of the whole app, not something specific to my part. Fine for a class
  demo, worth tightening with `@PreAuthorize` before anything more serious.
- **Code execution ignores `isOpen`.** The spec says a closed assignment
  should block code execution, but `POST /api/code/execute` has no
  `assignmentId` in its request at all, so there's nothing to check against.
  Fixing this means changing the request contract, which touches the
  frontend too — I left it alone since I can't see the frontend code from
  here.
- **`application.properties` has a live Supabase password committed in
  plain text.** Rotate it and move it to an env var / `.gitignore`'d file
  before this goes on GitHub.
