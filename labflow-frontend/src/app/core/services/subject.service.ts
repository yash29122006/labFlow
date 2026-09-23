import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Subject, SubjectRequest } from '../models/subject.models';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/subjects`;

  getAllSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(this.baseUrl);
  }

  getMySubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/my`);
  }

  getSubjectById(id: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.baseUrl}/${id}`);
  }

  createSubject(req: SubjectRequest): Observable<Subject> {
    return this.http.post<Subject>(this.baseUrl, req);
  }

  updateSubject(id: number, req: SubjectRequest): Observable<Subject> {
    return this.http.put<Subject>(`${this.baseUrl}/${id}`, req);
  }

  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
