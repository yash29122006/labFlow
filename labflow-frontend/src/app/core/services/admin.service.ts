import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FacultyRequest, StudentRegisterRequest, UserResponse } from '../models/auth.models';
import { Subject } from '../models/subject.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

  // Faculty Management
  getAllFaculty(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiBase}/admin/faculty`);
  }

  createFaculty(req: FacultyRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiBase}/admin/faculty`, req);
  }

  deleteFaculty(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/admin/faculty/${id}`);
  }

  updateFacultyStatus(id: number, active: boolean): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiBase}/admin/faculty/${id}/status`, { active });
  }

  getFacultySubjects(facultyId: number): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiBase}/admin/faculty/${facultyId}/subjects`);
  }

  assignSubjectToFaculty(facultyId: number, subjectId: number): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/admin/faculty/${facultyId}/subjects/${subjectId}`, {});
  }

  removeSubjectFromFaculty(facultyId: number, subjectId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/admin/faculty/${facultyId}/subjects/${subjectId}`);
  }

  // Student Management (B4)
  getAllStudents(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiBase}/admin/students`);
  }

  createStudent(req: StudentRegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiBase}/admin/students`, req);
  }

  updateStudent(id: number, req: StudentRegisterRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiBase}/admin/students/${id}`, req);
  }

  updateStudentStatus(id: number, active: boolean): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiBase}/admin/students/${id}/status`, { active });
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/admin/students/${id}`);
  }

  // Faculty My Students (B5)
  getFacultyStudents(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiBase}/faculty/students`);
  }

  // Dashboard Summary (B6)
  getDashboardSummary(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.apiBase}/dashboard/summary`);
  }
}
