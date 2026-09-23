export interface SubmissionRequest {
  assignmentId: number;
  code: string;
  language?: string;
}

export interface Submission {
  id: number;
  studentId: number;
  assignmentId: number;
  code: string;
  submittedAt?: string;
  language?: string;
  assignmentTitle?: string;
  studentName?: string;
  studentUid?: string;
  evaluationStatus?: 'PENDING' | 'EVALUATED' | 'PUBLISHED' | string;
  evaluationScore?: number;
}

export interface CodeExecutionRequest {
  languageId: number;
  sourceCode: string;
  stdin?: string;
}

export interface Judge0Result {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | null;
  memory?: number | null;
  token?: string | null;
  status?: { id: number; description: string };
  [key: string]: unknown;
}
