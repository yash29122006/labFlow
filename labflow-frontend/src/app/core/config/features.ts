export interface FeatureFlags {
  dueDates: boolean;
  quizTimeLimit: boolean;
  submissionMeta: boolean;
  studentsAdmin: boolean;
  facultyStudents: boolean;
  friendlyErrors: boolean;
}

export const features: FeatureFlags = {
  dueDates: true,
  quizTimeLimit: true,
  submissionMeta: true,
  studentsAdmin: true,
  facultyStudents: true,
  friendlyErrors: true,
};
