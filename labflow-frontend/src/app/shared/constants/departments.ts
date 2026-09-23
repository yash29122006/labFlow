/**
 * LabFlow Department & Academic Configuration
 * IMPORTANT: The department strings defined here must match the `department` string
 * assigned to Subjects (comparison is case-insensitive). If a student registers with a
 * department that has no matching subjects, no subjects or assignments will be visible.
 */
export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering'
] as const;

export type Department = (typeof DEPARTMENTS)[number] | string;

export const ACADEMIC_YEARS = [1, 2, 3, 4] as const;
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
