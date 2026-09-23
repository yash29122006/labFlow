import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserResponse, StudentRegisterRequest } from '../../../core/models/auth.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { DEPARTMENTS, SEMESTERS } from '../../../core/config/departments';

@Component({
  selector: 'app-manage-students',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SkeletonLoaderComponent, ConfirmModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Header Banner (Screen 16) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#0B1F44]">Student Directory & Accounts</h1>
          <p class="text-xs text-[#64748B] mt-0.5">Manage enrolled student credentials, academic standing, and account activation</p>
        </div>

        <button
          (click)="openCreateModal()"
          class="btn btn-primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 shadow-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          <span>Add New Student</span>
        </button>
      </div>

      <!-- Filters Row -->
      <div class="card p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        <!-- Search Input -->
        <div class="relative w-full md:w-80">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search student name, UID, or email..."
            class="form-input text-xs pl-8 pr-3 py-2"
          />
          <svg class="w-4 h-4 text-[#94A3B8] absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <!-- Filter Selects -->
        <div class="flex items-center gap-3 w-full md:w-auto">
          <!-- Department Filter -->
          <select
            [(ngModel)]="selectedDepartment"
            (change)="currentPage = 1"
            class="form-select text-xs w-48">
            <option value="">All Departments</option>
            <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
          </select>

          <!-- Semester Filter -->
          <select
            [(ngModel)]="selectedSemester"
            (change)="currentPage = 1"
            class="form-select text-xs w-36">
            <option [value]="0">All Semesters</option>
            <option *ngFor="let s of semesters" [value]="s">Semester {{ s }}</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="card p-6">
        <app-skeleton-loader [rows]="6"></app-skeleton-loader>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredStudents.length === 0" class="card p-12 text-center">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl mb-3">
          🎓
        </div>
        <h3 class="text-sm font-bold text-[#0B1F44]">No Students Found</h3>
        <p class="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
          {{ searchQuery ? 'No students match your filter criteria.' : 'No student accounts are currently registered.' }}
        </p>
      </div>

      <!-- Students Table Card (Screen 16) -->
      <div *ngIf="!loading && filteredStudents.length > 0" class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4">UID</th>
                <th class="py-3 px-4">Student Name</th>
                <th class="py-3 px-4">Email Address</th>
                <th class="py-3 px-4">Department</th>
                <th class="py-3 px-4 text-center">Year</th>
                <th class="py-3 px-4 text-center">Semester</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let st of paginatedStudents" class="hover:bg-[#F8FAFC]/80 transition-colors">
                <!-- UID -->
                <td class="py-3.5 px-4 font-mono font-bold text-blue-600">
                  {{ st.uid || 'N/A' }}
                </td>

                <!-- Name -->
                <td class="py-3.5 px-4 font-bold text-[#0B1F44]">
                  {{ st.name }}
                </td>

                <!-- Email -->
                <td class="py-3.5 px-4 font-mono text-[#64748B]">
                  {{ st.email }}
                </td>

                <!-- Department -->
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                    {{ st.department || 'General' }}
                  </span>
                </td>

                <!-- Year -->
                <td class="py-3.5 px-4 text-center font-mono font-semibold text-[#0B1F44]">
                  {{ st.academicYear || st.year || '-' }}
                </td>

                <!-- Semester -->
                <td class="py-3.5 px-4 text-center font-mono font-semibold text-[#0B1F44]">
                  {{ st.semester ? 'Sem ' + st.semester : '-' }}
                </td>

                <!-- Status Badge & Toggle -->
                <td class="py-3.5 px-4 text-center">
                  <button
                    type="button"
                    (click)="toggleStatus(st)"
                    [title]="st.active !== false ? 'Click to deactivate' : 'Click to activate'"
                    class="badge transition-all hover:scale-105 cursor-pointer"
                    [ngClass]="st.active !== false ? 'badge-evaluated' : 'badge-not-started'">
                    {{ st.active !== false ? 'ACTIVE' : 'INACTIVE' }}
                  </button>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right space-x-1.5">
                  <button
                    (click)="openEditModal(st)"
                    class="btn btn-outline btn-sm text-[11px] text-blue-600 border-blue-200 hover:bg-blue-50">
                    Edit
                  </button>
                  <button
                    (click)="promptDelete(st)"
                    class="btn btn-outline btn-sm text-[11px] text-red-600 border-red-200 hover:bg-red-50">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages > 1" class="p-4 border-t border-[#E5EAF2] flex items-center justify-between text-xs text-[#64748B]">
          <div>
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredStudents.length) }} of {{ filteredStudents.length }} students
          </div>
          <div class="flex items-center gap-1.5">
            <button
              (click)="currentPage = currentPage - 1"
              [disabled]="currentPage === 1"
              class="btn btn-outline btn-sm px-2.5 py-1 disabled:opacity-40">
              Prev
            </button>
            <span class="px-2 font-mono font-bold text-[#0B1F44]">{{ currentPage }} / {{ totalPages }}</span>
            <button
              (click)="currentPage = currentPage + 1"
              [disabled]="currentPage === totalPages"
              class="btn btn-outline btn-sm px-2.5 py-1 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Add / Edit Student Modal -->
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F44]/50 backdrop-blur-xs">
        <div class="bg-white rounded-2xl border border-[#E5EAF2] shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-[#E5EAF2] flex items-center justify-between">
            <h3 class="text-base font-bold text-[#0B1F44]">
              {{ editingStudent ? 'Edit Student Account' : 'Register New Student' }}
            </h3>
            <button (click)="isModalOpen = false" class="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
          </div>

          <!-- Modal Body -->
          <form [formGroup]="studentForm" (ngSubmit)="saveStudent()" class="p-6 space-y-4 text-xs">
            <!-- Full Name -->
            <div>
              <label for="stName" class="form-label">Full Name *</label>
              <input
                id="stName"
                type="text"
                formControlName="name"
                placeholder="e.g. Jane Doe"
                class="form-input"
                [class.border-red-500]="isFieldInvalid('name')"
              />
              <p *ngIf="isFieldInvalid('name')" class="form-error">Name is required.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- UID -->
              <div>
                <label for="stUid" class="form-label">UID / Roll Number *</label>
                <input
                  id="stUid"
                  type="text"
                  formControlName="uid"
                  placeholder="e.g. 21CS001"
                  class="form-input font-mono uppercase"
                  [class.border-red-500]="isFieldInvalid('uid')"
                />
                <p *ngIf="isFieldInvalid('uid')" class="form-error">UID is required.</p>
              </div>

              <!-- Email -->
              <div>
                <label for="stEmail" class="form-label">Email Address *</label>
                <input
                  id="stEmail"
                  type="email"
                  formControlName="email"
                  placeholder="e.g. student@college.edu"
                  class="form-input"
                  [class.border-red-500]="isFieldInvalid('email')"
                />
                <p *ngIf="isFieldInvalid('email')" class="form-error">Valid email is required.</p>
              </div>
            </div>

            <!-- Password (Optional if editing) -->
            <div>
              <label for="stPassword" class="form-label">
                {{ editingStudent ? 'Password * (sets a new password)' : 'Account Password *' }}
              </label>
              <input
                id="stPassword"
                type="password"
                formControlName="password"
                placeholder="••••••••"
                class="form-input"
                [class.border-red-500]="isFieldInvalid('password')"
              />
              <p *ngIf="isFieldInvalid('password')" class="form-error">Password must be at least 6 characters.</p>
            </div>

            <!-- Department -->
            <div>
              <label for="stDept" class="form-label">Department *</label>
              <select
                id="stDept"
                formControlName="department"
                class="form-select">
                <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Year -->
              <div>
                <label for="stYear" class="form-label">Academic Year *</label>
                <select
                  id="stYear"
                  formControlName="year"
                  class="form-select">
                  <option [value]="1">Year 1</option>
                  <option [value]="2">Year 2</option>
                  <option [value]="3">Year 3</option>
                  <option [value]="4">Year 4</option>
                </select>
              </div>

              <!-- Semester -->
              <div>
                <label for="stSemester" class="form-label">Semester *</label>
                <select
                  id="stSemester"
                  formControlName="semester"
                  class="form-select">
                  <option *ngFor="let s of semesters" [value]="s">Semester {{ s }}</option>
                </select>
              </div>
            </div>

            <!-- Roll Number & Batch (required by the backend) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="stRoll" class="form-label">Roll Number *</label>
                <input id="stRoll" type="number" min="1" formControlName="rollNumber" placeholder="101" class="form-input font-mono" />
                <p *ngIf="isFieldInvalid('rollNumber')" class="form-error">Roll number is required.</p>
              </div>
              <div>
                <label for="stBatch" class="form-label">Batch *</label>
                <input id="stBatch" type="text" formControlName="batch" placeholder="A1" class="form-input" />
                <p *ngIf="isFieldInvalid('batch')" class="form-error">Batch is required.</p>
              </div>
            </div>
            <p *ngIf="editingStudent" class="text-[11px] text-[#64748B]">
              The server requires a password on every save. Entering one sets it as the student's new password.
            </p>

            <!-- Modal Footer -->
            <div class="pt-4 border-t border-[#E5EAF2] flex justify-end gap-2">
              <button
                type="button"
                (click)="isModalOpen = false"
                class="btn btn-outline text-xs">
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="studentForm.invalid || isSaving"
                class="btn btn-primary text-xs font-semibold px-5">
                <span *ngIf="isSaving" class="animate-spin mr-1">↻</span>
                <span>{{ editingStudent ? 'Update Student' : 'Create Student' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteConfirmOpen"
        title="Delete Student Account"
        [message]="'Are you sure you want to delete student account ' + (studentToDelete?.name || '') + ' (' + (studentToDelete?.uid || '') + ')? This action cannot be undone.'"
        confirmLabel="Yes, Delete Account"
        (confirm)="confirmDelete()"
        (cancel)="isDeleteConfirmOpen = false">
      </app-confirm-modal>
    </div>
  `
})
export class ManageStudentsComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  students: UserResponse[] = [];
  loading = true;
  searchQuery = '';
  selectedDepartment = '';
  selectedSemester = 0;

  departments = DEPARTMENTS;
  semesters = SEMESTERS;

  currentPage = 1;
  pageSize = 10;
  Math = Math;

  isModalOpen = false;
  editingStudent: UserResponse | null = null;
  isSaving = false;

  isDeleteConfirmOpen = false;
  studentToDelete: UserResponse | null = null;

  studentForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    uid: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]],
    department: [DEPARTMENTS[0], [Validators.required]],
    year: [1, [Validators.required]],
    semester: [1, [Validators.required]],
    rollNumber: [null, [Validators.required, Validators.min(1)]],
    batch: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.adminService.getAllStudents().subscribe({
      next: (students) => {
        this.students = students;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredStudents(): UserResponse[] {
    return this.students.filter(s => {
      if (this.selectedDepartment && s.department !== this.selectedDepartment) {
        return false;
      }
      if (this.selectedSemester && Number(this.selectedSemester) !== 0) {
        if (s.semester !== Number(this.selectedSemester)) return false;
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        const nameMatch = s.name?.toLowerCase().includes(q);
        const uidMatch = s.uid?.toLowerCase().includes(q);
        const emailMatch = s.email?.toLowerCase().includes(q);
        if (!nameMatch && !uidMatch && !emailMatch) return false;
      }
      return true;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredStudents.length / this.pageSize) || 1;
  }

  get paginatedStudents(): UserResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredStudents.slice(start, start + this.pageSize);
  }

  isFieldInvalid(field: string): boolean {
    const c = this.studentForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  openCreateModal(): void {
    this.editingStudent = null;
    this.studentForm.reset({
      name: '',
      uid: '',
      email: '',
      password: '',
      department: DEPARTMENTS[0],
      year: 1,
      semester: 1,
      rollNumber: null,
      batch: ''
    });
    this.studentForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.studentForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
  }

  openEditModal(st: UserResponse): void {
    this.editingStudent = st;
    this.studentForm.patchValue({
      name: st.name,
      uid: st.uid,
      email: st.email,
      password: '',
      department: st.department || DEPARTMENTS[0],
      year: st.academicYear || st.year || 1,
      semester: st.semester || 1,
      rollNumber: st.rollNumber ?? null,
      batch: st.batch || ''
    });
    // The backend validates a password (min 6) on every save, including edits.
    this.studentForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.studentForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
  }

  saveStudent(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const val = this.studentForm.value;

    const payload: StudentRegisterRequest = {
      name: val.name,
      uid: val.uid,
      email: val.email,
      password: val.password,
      department: val.department,
      academicYear: Number(val.year),
      year: Number(val.year),
      semester: Number(val.semester),
      rollNumber: Number(val.rollNumber),
      batch: String(val.batch).trim()
    };

    if (this.editingStudent) {
      this.adminService.updateStudent(this.editingStudent.id, payload).subscribe({
        next: (updated) => {
          this.isSaving = false;
          this.isModalOpen = false;
          const idx = this.students.findIndex(s => s.id === updated.id);
          if (idx !== -1) {
            this.students[idx] = updated;
          } else {
            this.loadStudents();
          }
          this.toastService.success('Student account updated successfully.', 'Updated');
        },
        error: (err) => {
          this.isSaving = false;
          this.toastService.error(err.error?.message || 'Failed to update student.', 'Error');
        }
      });
    } else {
      this.adminService.createStudent(payload).subscribe({
        next: (created) => {
          this.isSaving = false;
          this.isModalOpen = false;
          this.students.unshift(created);
          this.toastService.success('Student registered successfully.', 'Created');
        },
        error: (err) => {
          this.isSaving = false;
          this.toastService.error(err.error?.message || 'Failed to create student.', 'Error');
        }
      });
    }
  }

  toggleStatus(st: UserResponse): void {
    const newStatus = !(st.active !== false);
    this.adminService.updateStudentStatus(st.id, newStatus).subscribe({
      next: (res) => {
        st.active = res.active;
        this.toastService.success(`Student ${res.active ? 'activated' : 'deactivated'}.`, 'Status Updated');
      },
      error: () => {
        this.toastService.error('Failed to change student status.', 'Error');
      }
    });
  }

  promptDelete(st: UserResponse): void {
    this.studentToDelete = st;
    this.isDeleteConfirmOpen = true;
  }

  confirmDelete(): void {
    if (!this.studentToDelete) return;
    const id = this.studentToDelete.id;
    this.isDeleteConfirmOpen = false;

    this.adminService.deleteStudent(id).subscribe({
      next: () => {
        this.students = this.students.filter(s => s.id !== id);
        this.toastService.success('Student account deleted.', 'Deleted');
      },
      error: () => {
        this.toastService.error('Failed to delete student.', 'Error');
      }
    });
  }
}
