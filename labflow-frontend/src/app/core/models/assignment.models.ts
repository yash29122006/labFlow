export interface AssignmentRequest {
  title: string;
  description: string;
  instructions: string;
  isOpen: boolean;
  subjectIds?: number[];
  dueDate?: string;
  quizTimeLimitMinutes?: number;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  instructions: string;
  isOpen: boolean;
  dueDate?: string;
  quizTimeLimitMinutes?: number;
  subjectId?: number;
  subjectCode?: string;
  subjectTitle?: string;
}
