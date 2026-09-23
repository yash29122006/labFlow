import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Role } from '../../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#F5F7FB] flex flex-col justify-center items-center p-4">
      <!-- Centred Card Layout (max-width 420px, 12px radius, soft shadow) -->
      <div class="w-full max-w-[420px] bg-white rounded-2xl border border-[#E5EAF2] shadow-xl p-8 space-y-6">
        <!-- Brand Logo & Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center gap-2 mb-1">
            <svg class="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/>
              <path d="M8.5 2h7"/>
              <path d="M7 16h10"/>
            </svg>
            <span class="text-2xl font-bold text-[#0B1F44]">LabFlow</span>
          </div>
          <h1 class="text-xl font-bold text-[#0B1F44]">{{ title }}</h1>
          <p class="text-xs text-[#64748B]">{{ subtitle }}</p>
        </div>

        <!-- Role Toggle Tabs (optional quick switch) -->
        <div class="flex rounded-lg bg-[#F1F5F9] p-1 text-xs font-semibold text-[#64748B]">
          <a
            routerLink="/login/student"
            [class.bg-white]="roleMode === 'STUDENT'"
            [class.text-blue-600]="roleMode === 'STUDENT'"
            [class.shadow-sm]="roleMode === 'STUDENT'"
            class="flex-1 text-center py-1.5 rounded-md transition-all">
            Student
          </a>
          <a
            routerLink="/login/faculty"
            [class.bg-white]="roleMode === 'FACULTY'"
            [class.text-blue-600]="roleMode === 'FACULTY'"
            [class.shadow-sm]="roleMode === 'FACULTY'"
            class="flex-1 text-center py-1.5 rounded-md transition-all">
            Faculty
          </a>
          <a
            routerLink="/login/admin"
            [class.bg-white]="roleMode === 'ADMIN'"
            [class.text-blue-600]="roleMode === 'ADMIN'"
            [class.shadow-sm]="roleMode === 'ADMIN'"
            class="flex-1 text-center py-1.5 rounded-md transition-all">
            Admin
          </a>
        </div>

        <!-- Error Alert -->
        <div *ngIf="errorMessage" class="p-3 rounded-lg bg-[#FDECEC] border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fade-in">
          <svg class="w-4 h-4 shrink-0 mt-0.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Identifier Input with Left Icon -->
          <div>
            <label for="identifier" class="form-label">{{ identifierLabel }}</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <!-- Student User Icon -->
                <svg *ngIf="roleMode === 'STUDENT'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <!-- Faculty Mail Icon -->
                <svg *ngIf="roleMode === 'FACULTY'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <!-- Admin Shield Icon -->
                <svg *ngIf="roleMode === 'ADMIN'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </span>
              <input
                id="identifier"
                type="text"
                formControlName="identifier"
                [placeholder]="identifierPlaceholder"
                class="form-input pl-10"
                [class.border-red-500]="isFieldInvalid('identifier')"
              />
            </div>
            <p *ngIf="isFieldInvalid('identifier')" class="form-error">This field is required.</p>
          </div>

          <!-- Password Input with Lock Icon and Eye Toggle -->
          <div>
            <label for="password" class="form-label">Password</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </span>
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="••••••••"
                class="form-input pl-10 pr-10"
                [class.border-red-500]="isFieldInvalid('password')"
              />
              <button
                type="button"
                (click)="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#0B1F44] focus:outline-none">
                <svg *ngIf="!showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg *ngIf="showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
                </svg>
              </button>
            </div>
            <p *ngIf="isFieldInvalid('password')" class="form-error">Password is required.</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="loginForm.invalid || loading"
            class="btn btn-primary w-full py-2.5 text-sm font-semibold shadow-sm">
            <span *ngIf="loading" class="animate-spin mr-2">↻</span>
            <span>Login</span>
          </button>

          <!-- Forgot Password Link -->
          <div class="text-center">
            <a routerLink="/forgot-password" class="text-xs font-semibold text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>
        </form>

        <!-- Footer Notice -->
        <div class="pt-4 border-t border-[#E5EAF2] text-center space-y-2">
          <div *ngIf="roleMode === 'STUDENT'" class="text-xs text-[#64748B]">
            New here?
            <a routerLink="/register" class="text-blue-600 font-bold hover:underline">
              Create an account
            </a>
          </div>
          <div class="text-[11px] text-[#94A3B8] leading-tight">
            Not a student? Faculty and Admin accounts are created by the administrator.
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  roleMode: Role = 'STUDENT';
  title = 'Student Login';
  subtitle = 'Access your student account';
  identifierLabel = 'UID or Email';
  identifierPlaceholder = 'e.g. 21BCS101 or student@univ.edu';

  loginForm: FormGroup = this.fb.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  loading = false;
  showPassword = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.route.url.subscribe(segments => {
      const path = segments.map(s => s.path).join('/');
      if (path.includes('faculty')) {
        this.setRoleMode('FACULTY');
      } else if (path.includes('admin')) {
        this.setRoleMode('ADMIN');
      } else {
        this.setRoleMode('STUDENT');
      }
    });
  }

  setRoleMode(role: Role): void {
    this.roleMode = role;
    this.errorMessage = null;

    if (role === 'ADMIN') {
      this.title = 'Admin Login';
      this.subtitle = 'Access your administrator account';
      this.identifierLabel = 'Admin ID';
      this.identifierPlaceholder = 'e.g. ADMIN001';
    } else if (role === 'FACULTY') {
      this.title = 'Faculty Login';
      this.subtitle = 'Access your faculty account';
      this.identifierLabel = 'Email or Faculty ID';
      this.identifierPlaceholder = 'e.g. FAC001 or faculty@univ.edu';
    } else {
      this.title = 'Student Login';
      this.subtitle = 'Access your student account';
      this.identifierLabel = 'UID or Email';
      this.identifierPlaceholder = 'e.g. 21BCS101 or student@univ.edu';
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.loading = false;

        // Role mismatch guard (§7.1 screens 2/3/4)
        if (res.role !== this.roleMode) {
          this.authService.clearSessionSilently();
          const targetPage = res.role.toLowerCase();
          this.errorMessage = `This is a ${res.role} account. Please use the ${res.role} login.`;
          this.toastService.error(this.errorMessage, 'Role Mismatch');
          return;
        }

        this.toastService.success(`Welcome, ${res.user.name || res.user.uid}!`, 'Signed In');
        this.authService.navigateRoleHome();
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 403 && err.error?.message?.includes('inactive')) {
          this.errorMessage = 'Your account is inactive. Please contact the administrator.';
        } else if (err.status === 401 || err.status === 400) {
          this.errorMessage = err.error?.message || 'Invalid credentials. Please verify your ID and password.';
        } else {
          this.errorMessage = err.error?.message || 'Unable to log in. Please try again.';
        }
        this.toastService.error(this.errorMessage || 'Invalid credentials.', 'Login Failed');
      }
    });
  }
}
