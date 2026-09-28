export interface AssignmentDetails {
  aim: string;
  theory: string;
  learningOutcomes: string;
  courseOutcomes: string;
  conclusion: string;
}

export interface AssignmentRequest {
  title: string;
  description: string;
  isOpen: boolean;
  subjectIds?: number[];
  quizTimeLimitMinutes?: number;
  details: AssignmentDetails;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  isOpen: boolean;
  quizTimeLimitMinutes?: number;
  subjectId?: number;
  subjectCode?: string;
  subjectTitle?: string;
  details?: AssignmentDetails;
}
