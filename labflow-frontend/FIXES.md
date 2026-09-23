# LabFlow frontend – fixes applied

Run the backend from `labflow-complete/` (top-level folder, the newer one) after running its SQL files in Supabase.
Frontend: `npm install && ng serve` (http://localhost:4200, API http://localhost:8080/api).

## Fixed
- Added `login/:role` route (landing, register, login tabs linked to routes that didn't exist); guards/interceptor now go to `/login`.
- AuthService no longer calls `/auth/me` in its constructor (circular dependency with the interceptor); moved to AppComponent.
- Expired tokens: backend returns 403, so expiry is now checked from the JWT and the user is logged out.
- Quiz attempt: route param `id`, only answered questions are sent (backend rejects blanks), invalid class binding replaced, double-submit guard.
- Admin students: added required Roll Number + Batch; password is sent on edit (backend validates it).
- Admin assignment page is now read-only (backend allows only FACULTY to write assignments).
- Faculty dashboard "View" link, submission status (PUBLISHED counts as graded), scores shown from evaluations.
- Legacy grading page: "Save & Publish" now really publishes; linked via a "Grade" button; MCQ validation on quiz forms.
- Student subjects are clickable; results keep titles when an assignment is later closed.
- Styles: defined missing classes (card, stat-card, btn-*, badge-*, animations...), restored legacy palette names, component CSS moved into a Tailwind layer, textarea height, favicon/public folder.
- ConfirmModal accepts `confirmLabel` / `cancelLabel`; code editor scroll sync and language from submission.
