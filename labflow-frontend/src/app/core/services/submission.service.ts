import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Submission, SubmissionRequest } from '../models/submission.models';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/submissions`;

  submitCode(req: SubmissionRequest): Observable<Submission> {
    return this.http.post<Submission>(this.baseUrl, req);
  }

  getMySubmissions(): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.baseUrl}/my`);
  }

  getSubmissionById(id: number): Observable<Submission> {
    return this.http.get<Submission>(`${this.baseUrl}/${id}`);
  }

  getSubmissionsByAssignment(assignmentId: number): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.baseUrl}/assignment/${assignmentId}`);
  }
}
