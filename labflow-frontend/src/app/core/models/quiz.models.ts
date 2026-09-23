export type QuizType = 'MCQ' | 'DESCRIPTIVE';

export interface QuizRequest {
  assignmentId: number;
  question: string;
  type: QuizType;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  marks: number;
}

export interface Quiz {
  id: number;
  assignmentId: number;
  question: string;
  type: QuizType;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  marks: number;
}

export interface QuizResponseRequest {
  quizId: number;
  answer: string;
}

export interface QuizResponse {
  id: number;
  quizId: number;
  studentId: number;
  answer: string;
}

export interface QuizAnswerSubmission {
  quizId: number;
  answer: string;
}
