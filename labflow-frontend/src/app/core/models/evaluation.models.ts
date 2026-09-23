export interface EvaluationRequest {
  submissionId: number;
  correctness: number;   // 0–50
  quality: number;       // 0–30
  explanation: number;   // 0–20
  feedback?: string;
  published?: boolean;
}

export interface EvaluationResponse {
  id: number;
  submissionId: number;
  assignmentId: number;
  correctness: number;
  quality: number;
  explanation: number;
  totalMarks: number;    // = correctness + quality + explanation
  feedback?: string;
  published: boolean;
}

export interface EvaluationWithAssignmentTitle extends EvaluationResponse {
  assignmentTitle?: string;
  assignmentDescription?: string;
}

export type Evaluation = EvaluationResponse;
