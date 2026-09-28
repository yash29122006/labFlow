LabFlow Assignment UI update

Changed:
- Assignment model now uses nested details: aim, theory, learningOutcomes, courseOutcomes, conclusion.
- Faculty assignment form replaces Instructions and Due Date with the five academic detail fields.
- Faculty assignment table no longer shows Due Date.
- Student Assignment Workspace displays sections in final order: AIM, THEORY, CODE, LEARNING OUTCOMES, COURSE OUTCOMES, CONCLUSION.
- Student dashboard and assignment list no longer display Due Date.
- Admin subject-assignment view displays structured lab details instead of Instructions/Due Date.
- Faculty grading view displays structured lab details instead of generic Instructions.
- Removed the unused dueDates feature flag.

Backend expectation:
POST/PUT /api/assignments accepts:
{
  "title": "...",
  "description": "...",
  "isOpen": true,
  "quizTimeLimitMinutes": 30,
  "subjectIds": [1],
  "details": {
    "aim": "...",
    "theory": "...",
    "learningOutcomes": "...",
    "courseOutcomes": "...",
    "conclusion": "..."
  }
}
