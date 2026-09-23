import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { DEPARTMENTS, ACADEMIC_YEARS, SEMESTERS } from '../../../shared/constants/departments';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#F5F7FB] flex flex-col justify-center items-center p-4">
      <!-- Registration Card (max-width 520px, 12px radius, soft shadow) -->
      <div class="w-full max-w-[520px] bg-white rounded-2xl border border-[#E5EAF2] shadow-xl p-8 space-y-6">
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
          <h1 class="text-xl font-bold text-[#0B1F44]">Student Registration</h1>
          <p class="text-xs text-[#64748B]">Create your student account to access lab assignments and quizzes</p>
        </div>

        <!-- Error Alert -->
        <div *ngIf="errorMessage" class="p-3 rounded-lg bg-[#FDECEC] border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fade-in">
          <svg class="w-4 h-4 shrink-0 mt-0.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Row 1: UID & Name -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="uid" class="form-label">Student UID</label>
              <input
                id="uid"
                type="text"
                formControlName="uid"
                placeholder="e.g. 21BCS045"
                class="form-input font-mono uppercase"
                [class.border-red-500]="isFieldInvalid('uid')"
              />
              <p *ngIf="isFieldInvalid('uid')" class="form-error">Student UID is required.</p>
            </div>

            <div>
              <label for="name" class="form-label">Full Name</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                placeholder="e.g. Rahul Sharma"
                class="form-input"
                [class.border-red-500]="isFieldInvalid('name')"
              />
              <p *ngIf="isFieldInvalid('name')" class="form-error">Full name is required.</p>
            </div>
          </div>

          <!-- Row 2: Department & Email -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="department" class="form-label">Department</label>
              <select
                id="department"
                formControlName="department"
                class="form-select"
                [class.border-red-500]="isFieldInvalid('department')">
                <option *ngFor="let dept of departments" [value]="dept">{{ dept }}</option>
              </select>
              <p *ngIf="isFieldInvalid('department')" class="form-error">Department is required.</p>
            </div>

            <div>
              <label for="email" class="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="student@univ.edu"
                class="form-input"
                [class.border-red-500]="isFieldInvalid('email')"
              />
              <p *ngIf="isFieldInvalid('email')" class="form-error">Valid email is required.</p>
            </div>
          </div>

          <!-- Row 3: Year & Semester -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="academicYear" class="form-label">Academic Year</label>
              <select
                id="academicYear"
                formControlName="academicYear"
                class="form-select font-mono"
                [class.border-red-500]="isFieldInvalid('academicYear')">
                <option *ngFor="let yr of academicYears" [value]="yr">Year {{ yr }}</option>
              </select>
            </div>

            <div>
              <label for="semester" class="form-label">Semester</label>
              <select
                id="semester"
                formControlName="semester"
                class="form-select font-mono"
                [class.border-red-500]="isFieldInvalid('semester')">
                <option *ngFor="let sem of semesters" [value]="sem">Semester {{ sem }}</option>
              </select>
            </div>
          </div>

          <!-- Row 4: Roll Number & Batch -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="rollNumber" class="form-label">Roll Number</label>
              <input
                id="rollNumber"
                type="number"
                min="1"
                formControlName="rollNumber"
                placeholder="101"
                class="form-input font-mono"
                [class.border-red-500]="isFieldInvalid('rollNumber')"
              />
              <p *ngIf="isFieldInvalid('rollNumber')" class="form-error">Roll number required.</p>
            </div>

            <div>
              <label for="batch" class="form-label">Batch</label>
              <input
                id="batch"
                type="text"
                formControlName="batch"
                placeholder="A1"
                class="form-input"
                [class.border-red-500]="isFieldInvalid('batch')"
              />
              <p *ngIf="isFieldInvalid('batch')" class="form-error">Batch required.</p>
            </div>
          </div>

          <!-- Row 5: Password -->
          <div>
            <label for="password" class="form-label">Password</label>
            <div class="relative">
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="At least 6 characters"
                class="form-input pr-10"
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
            <p *ngIf="isFieldInvalid('password')" class="form-error">Password must be at least 6 characters.</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="registerForm.invalid || loading"
            class="btn btn-primary w-full py-2.5 text-sm font-semibold shadow-sm">
            <span *ngIf="loading" class="animate-spin mr-2">↻</span>
            <span>Register</span>
          </button>
        </form>

        <!-- Footer link to Login -->
        <div class="pt-4 border-t border-[#E5EAF2] text-center text-xs text-[#64748B]">
          Already have an account?
          <a routerLink="/login/student" class="text-blue-600 font-bold hover:underline ml-1">
            Login
          </a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  departments = DEPARTMENTS;
  academicYears = ACADEMIC_YEARS;
  semesters = SEMESTERS;

  showPassword = false;
  loading = false;
  errorMessage: string | null = null;

  registerForm: FormGroup = this.fb.group({
    uid: ['', [Validators.required]],
    name: ['', [Validators.required]],
    department: [DEPARTMENTS[0], [Validators.required]],
    academicYear: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
    semester: [1, [Validators.required, Validators.min(1), Validators.max(8)]],
    rollNumber: [101, [Validators.required, Validators.min(1)]],
    batch: ['A1', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const payload = {
      ...this.registerForm.value,
      academicYear: Number(this.registerForm.value.academicYear),
      semester: Number(this.registerForm.value.semester),
      rollNumber: Number(this.registerForm.value.rollNumber)
    };

    this.authService.registerStudent(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.toastService.success(res.message || 'Registration successful! Please sign in.', 'Account Created');
        this.router.navigate(['/login/student']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. UID or email may already be in use.';
        this.toastService.error(this.errorMessage || 'Registration failed.', 'Registration Failed');
      }
    });
  }
}
