import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Role, StudentRegisterRequest, UserResponse } from '../models/auth.models';

const TOKEN_KEY = 'labflow_token';
const ROLE_KEY = 'labflow_role';
const USER_KEY = 'labflow_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  token = signal<string | null>(this.getStoredToken());
  role = signal<Role | null>(this.getStoredRole());
  currentUser = signal<UserResponse | null>(this.getStoredUser());

  isAuthenticated = computed(() => !!this.token());
  isAdmin = computed(() => this.role() === 'ADMIN');
  isFaculty = computed(() => this.role() === 'FACULTY');
  isStudent = computed(() => this.role() === 'STUDENT');

  /**
   * Called once from AppComponent (NOT from the constructor: the HTTP interceptor injects
   * AuthService, so an HTTP call during construction causes a circular dependency).
   */
  restoreSession(): void {
    if (!this.token()) return;
    if (this.isTokenExpired()) {
      this.clearSessionSilently();
      return;
    }
    this.fetchMe().subscribe({
      error: (err) => {
        if (err?.status === 401 || err?.status === 403) {
          this.clearSessionSilently();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  /** Client-side JWT expiry check (backend answers 403 for expired tokens, not 401). */
  isTokenExpired(): boolean {
    const t = this.token();
    if (!t) return true;
    try {
      const payload = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.exp ? payload.exp * 1000 < Date.now() : false;
    } catch {
      return true;
    }
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private getStoredRole(): Role | null {
    return (localStorage.getItem(ROLE_KEY) as Role) || null;
  }

  private getStoredUser(): UserResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, req).pipe(
      tap(res => {
        this.setSession(res.token, res.role, res.user);
      })
    );
  }

  registerStudent(req: StudentRegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiBaseUrl}/auth/register/student`, req);
  }

  fetchMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${environment.apiBaseUrl}/auth/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.role.set(user.role);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(ROLE_KEY, user.role);
      })
    );
  }

  setSession(token: string, role: Role, user: UserResponse): void {
    this.token.set(token);
    this.role.set(role);
    this.currentUser.set(user);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  logout(): void {
    this.clearSessionSilently();
    this.router.navigate(['/login']);
  }

  clearSessionSilently(): void {
    this.token.set(null);
    this.role.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
  }

  navigateRoleHome(): void {
    const r = this.role();
    if (r === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else if (r === 'FACULTY') {
      this.router.navigate(['/faculty']);
    } else if (r === 'STUDENT') {
      this.router.navigate(['/student']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
