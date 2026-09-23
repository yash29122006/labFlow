import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EvaluationRequest, EvaluationResponse } from '../models/evaluation.models';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/evaluations`;

  saveEvaluation(req: EvaluationRequest): Observable<EvaluationResponse> {
    return this.http.post<EvaluationResponse>(this.baseUrl, req);
  }

  createOrUpdateEvaluation(req: EvaluationRequest): Observable<EvaluationResponse> {
    return this.saveEvaluation(req);
  }

  getEvaluationBySubmission(submissionId: number): Observable<EvaluationResponse> {
    return this.http.get<EvaluationResponse>(`${this.baseUrl}/submission/${submissionId}`);
  }

  getEvaluationsByAssignment(assignmentId: number): Observable<EvaluationResponse[]> {
    return this.http.get<EvaluationResponse[]>(`${this.baseUrl}/assignment/${assignmentId}`);
  }

  publishEvaluation(evaluationId: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/${evaluationId}/publish`, {});
  }

  getMyEvaluations(): Observable<EvaluationResponse[]> {
    return this.http.get<EvaluationResponse[]>(`${this.baseUrl}/my`);
  }
}
