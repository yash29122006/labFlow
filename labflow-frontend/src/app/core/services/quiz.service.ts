import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Quiz, QuizRequest, QuizResponse, QuizResponseRequest } from '../models/quiz.models';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/quizzes`;

  getQuizzesByAssignment(assignmentId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.baseUrl}/assignment/${assignmentId}`);
  }

  getQuizzesForAssignment(assignmentId: number): Observable<Quiz[]> {
    return this.getQuizzesByAssignment(assignmentId);
  }

  createQuiz(req: QuizRequest): Observable<Quiz> {
    return this.http.post<Quiz>(this.baseUrl, req);
  }

  updateQuiz(id: number, req: QuizRequest): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.baseUrl}/${id}`, req);
  }

  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  submitQuizAnswers(assignmentId: number, answers: QuizResponseRequest[]): Observable<QuizResponse[]> {
    return this.http.post<QuizResponse[]>(`${this.baseUrl}/assignment/${assignmentId}/submit`, answers);
  }
}
