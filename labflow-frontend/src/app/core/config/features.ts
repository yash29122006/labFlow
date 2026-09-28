export interface FeatureFlags {
  quizTimeLimit: boolean;
  submissionMeta: boolean;
  studentsAdmin: boolean;
  facultyStudents: boolean;
  friendlyErrors: boolean;
}

export const features: FeatureFlags = {
  quizTimeLimit: true,
  submissionMeta: true,
  studentsAdmin: true,
  facultyStudents: true,
  friendlyErrors: true,
};
