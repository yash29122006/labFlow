import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Assignment, AssignmentRequest } from '../models/assignment.models';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/assignments`;

  getAllAssignments(): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(this.baseUrl);
  }

  getAssignmentsBySubject(subjectId: number): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.baseUrl}/subject/${subjectId}`);
  }

  getAssignmentById(id: number): Observable<Assignment> {
    return this.http.get<Assignment>(`${this.baseUrl}/${id}`);
  }

  createAssignment(req: AssignmentRequest): Observable<Assignment> {
    return this.http.post<Assignment>(this.baseUrl, req);
  }

  updateAssignment(id: number, req: Partial<AssignmentRequest>): Observable<Assignment> {
    return this.http.put<Assignment>(`${this.baseUrl}/${id}`, req);
  }

  openAssignment(id: number): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.baseUrl}/${id}/open`, {});
  }

  closeAssignment(id: number): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.baseUrl}/${id}/close`, {});
  }

  deleteAssignment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
