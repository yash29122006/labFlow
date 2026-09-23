import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { SubjectService } from '../../../core/services/subject.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserResponse } from '../../../core/models/auth.models';
import { Subject } from '../../../core/models/subject.models';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { DEPARTMENTS } from '../../../core/config/departments';

@Component({
  selector: 'app-faculty-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmModalComponent, SkeletonLoaderComponent],
  template: `
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#0B1F44]">Faculty Directory & Assignments</h1>
          <p class="text-xs text-[#64748B] mt-0.5">Manage department instructors, credential provisioning, and assigned lab courses</p>
        </div>
        <button (click)="openCreateModal()" class="btn btn-primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 shadow-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          <span>Add New Faculty</span>
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="card p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        <div class="relative w-full md:w-80">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="currentPage = 1"
            placeholder="Search faculty name, ID, or email..."
            class="form-input text-xs pl-8 pr-3 py-2"
          />
          <svg class="w-4 h-4 text-[#94A3B8] absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto">
          <select
            [(ngModel)]="selectedDepartment"
            (change)="currentPage = 1"
            class="form-select text-xs w-48">
            <option value="">All Departments</option>
            <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
          </select>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div *ngIf="loading" class="card p-6">
        <app-skeleton-loader [rows]="5"></app-skeleton-loader>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredFaculty.length === 0" class="card p-12 text-center">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl mb-3">
          👥
        </div>
        <h3 class="text-sm font-bold text-[#0B1F44]">No Faculty Found</h3>
        <p class="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
          {{ searchQuery ? 'No faculty accounts match your query.' : 'No faculty accounts have been registered yet.' }}
        </p>
      </div>

      <!-- Faculty List Table -->
      <div *ngIf="!loading && filteredFaculty.length > 0" class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4">Faculty ID</th>
                <th class="py-3 px-4">Instructor Name</th>
                <th class="py-3 px-4">Department</th>
                <th class="py-3 px-4">Email</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let f of paginatedFaculty" class="hover:bg-[#F8FAFC]/80 transition-colors">
                <!-- ID -->
                <td class="py-3.5 px-4 font-mono font-bold text-blue-600">
                  {{ f.uid || 'FAC' + f.id }}
                </td>

                <!-- Name -->
                <td class="py-3.5 px-4 font-bold text-[#0B1F44]">
                  {{ f.name }}
                </td>

                <!-- Department -->
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                    {{ f.department || 'General' }}
                  </span>
                </td>

                <!-- Email -->
                <td class="py-3.5 px-4 font-mono text-[#64748B]">
                  {{ f.email }}
                </td>

                <!-- Status Badge -->
                <td class="py-3.5 px-4 text-center">
                  <button
                    type="button"
                    (click)="toggleStatus(f)"
                    [title]="f.active !== false ? 'Click to deactivate' : 'Click to activate'"
                    class="badge transition-all hover:scale-105 cursor-pointer"
                    [ngClass]="f.active !== false ? 'badge-evaluated' : 'badge-not-started'">
                    {{ f.active !== false ? 'ACTIVE' : 'INACTIVE' }}
                  </button>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right space-x-1.5">
                  <button
                    (click)="openAssignDrawer(f)"
                    class="btn btn-outline btn-sm text-[11px] text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    Assign Subjects
                  </button>
                  <button
                    (click)="promptDelete(f)"
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
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredFaculty.length) }} of {{ filteredFaculty.length }} faculty
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

      <!-- Create Faculty Modal -->
      <div *ngIf="isCreateModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F44]/50 backdrop-blur-xs">
        <div class="bg-white rounded-2xl border border-[#E5EAF2] shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
          <div class="px-6 py-4 border-b border-[#E5EAF2] flex items-center justify-between">
            <h3 class="text-base font-bold text-[#0B1F44]">Add New Faculty Member</h3>
            <button (click)="isCreateModalOpen = false" class="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
          </div>

          <form [formGroup]="facultyForm" (ngSubmit)="submitCreateFaculty()" class="p-6 space-y-4 text-xs">
            <div>
              <label for="fFacultyId" class="form-label">Faculty ID *</label>
              <input 
                id="fFacultyId"
                type="text" 
                formControlName="facultyId"
                placeholder="e.g. FAC001"
                class="form-input font-mono uppercase"
              />
            </div>

            <div>
              <label for="fName" class="form-label">Full Name *</label>
              <input 
                id="fName"
                type="text" 
                formControlName="name"
                placeholder="e.g. Dr. Jane Smith"
                class="form-input"
              />
            </div>

            <div>
              <label for="fDept" class="form-label">Department *</label>
              <select id="fDept" formControlName="department" class="form-select">
                <option *ngFor="let dept of departments" [value]="dept">{{ dept }}</option>
              </select>
            </div>

            <div>
              <label for="fEmail" class="form-label">Email Address *</label>
              <input 
                id="fEmail"
                type="email" 
                formControlName="email"
                placeholder="e.g. jane.smith@college.edu"
                class="form-input"
              />
            </div>

            <div>
              <label for="fPass" class="form-label">Initial Password *</label>
              <input 
                id="fPass"
                type="password" 
                formControlName="password"
                placeholder="••••••••"
                class="form-input"
              />
            </div>

            <div class="pt-4 border-t border-[#E5EAF2] flex justify-end gap-2">
              <button type="button" (click)="isCreateModalOpen = false" class="btn btn-outline text-xs">
                Cancel
              </button>
              <button 
                type="submit" 
                [disabled]="facultyForm.invalid || isSubmitting"
                class="btn btn-primary text-xs font-semibold px-5">
                <span *ngIf="isSubmitting" class="animate-spin mr-1">↻</span>
                Create Faculty Account
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Assign Subjects Drawer / Modal -->
      <div *ngIf="isAssignDrawerOpen && activeFacultyForAssign" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F44]/50 backdrop-blur-xs">
        <div class="bg-white rounded-2xl border border-[#E5EAF2] shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
          <div class="px-6 py-4 border-b border-[#E5EAF2] flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-[#0B1F44]">Assign Subjects to Instructor</h3>
              <p class="text-xs text-[#64748B] mt-0.5">{{ activeFacultyForAssign.name }} ({{ activeFacultyForAssign.uid }})</p>
            </div>
            <button (click)="isAssignDrawerOpen = false" class="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
          </div>

          <div class="p-6 space-y-5 text-xs">
            <!-- Add Subject Control -->
            <div class="flex items-center gap-2">
              <select [(ngModel)]="selectedSubjectToAssign" class="form-select text-xs flex-1">
                <option [value]="0">Select a course to assign...</option>
                <option *ngFor="let s of availableSubjectsToAssign" [value]="s.id">
                  {{ s.code }} - {{ s.name }} (Year {{ s.academicYear }}/Sem {{ s.semester }})
                </option>
              </select>
              <button
                (click)="assignSubject()"
                [disabled]="!selectedSubjectToAssign || selectedSubjectToAssign === 0 || isAssigning"
                class="btn btn-primary text-xs font-semibold px-4">
                + Assign
              </button>
            </div>

            <!-- Currently Assigned Subjects List -->
            <div>
              <h4 class="font-bold text-[#0B1F44] mb-2 uppercase tracking-wider text-[11px]">Currently Assigned Courses ({{ facultyAssignedSubjects.length }})</h4>
              
              <div *ngIf="loadingAssignedSubjects" class="py-4">
                <app-skeleton-loader [rows]="3"></app-skeleton-loader>
              </div>

              <div *ngIf="!loadingAssignedSubjects && facultyAssignedSubjects.length === 0" class="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-gray-500 text-xs">
                No subjects assigned to this faculty member yet.
              </div>

              <div *ngIf="!loadingAssignedSubjects && facultyAssignedSubjects.length > 0" class="space-y-2 max-h-60 overflow-y-auto">
                <div *ngFor="let sub of facultyAssignedSubjects" class="p-3 bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl flex items-center justify-between">
                  <div>
                    <div class="font-bold text-[#0B1F44]">{{ sub.code }} - {{ sub.name }}</div>
                    <div class="text-[10px] text-[#64748B]">Dept: {{ sub.department }} | Sem: {{ sub.semester }}</div>
                  </div>
                  <button
                    (click)="removeSubject(sub.id)"
                    class="text-red-500 hover:text-red-700 font-semibold text-xs p-1">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="pt-4 border-t border-[#E5EAF2] flex justify-end">
              <button (click)="isAssignDrawerOpen = false" class="btn btn-outline text-xs">
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen"
        title="Delete Faculty Account"
        [message]="'Are you sure you want to delete faculty account ' + (facultyToDelete?.name || '') + ' (' + (facultyToDelete?.uid || '') + ')? This action cannot be undone.'"
        confirmLabel="Delete Account"
        (confirm)="deleteFaculty()"
        (cancel)="isDeleteModalOpen = false">
      </app-confirm-modal>
    </div>
  `
})
export class FacultyManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private subjectService = inject(SubjectService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  departments = DEPARTMENTS;
  facultyList: UserResponse[] = [];
  allSubjects: Subject[] = [];
  loading = true;

  searchQuery = '';
  selectedDepartment = '';
  currentPage = 1;
  pageSize = 10;
  Math = Math;

  isCreateModalOpen = false;
  isSubmitting = false;

  isDeleteModalOpen = false;
  facultyToDelete: UserResponse | null = null;

  // Assign Subjects State
  isAssignDrawerOpen = false;
  activeFacultyForAssign: UserResponse | null = null;
  facultyAssignedSubjects: Subject[] = [];
  loadingAssignedSubjects = false;
  selectedSubjectToAssign = 0;
  isAssigning = false;

  facultyForm: FormGroup = this.fb.group({
    facultyId: ['', [Validators.required]],
    name: ['', [Validators.required]],
    department: [DEPARTMENTS[0], [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['password123', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    this.loadFaculty();
    this.subjectService.getAllSubjects().subscribe({
      next: (subs) => this.allSubjects = subs,
      error: () => {}
    });
  }

  loadFaculty(): void {
    this.loading = true;
    this.adminService.getAllFaculty().subscribe({
      next: (res) => {
        this.facultyList = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredFaculty(): UserResponse[] {
    return this.facultyList.filter(f => {
      if (this.selectedDepartment && f.department !== this.selectedDepartment) {
        return false;
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        const nameMatch = f.name?.toLowerCase().includes(q);
        const uidMatch = f.uid?.toLowerCase().includes(q);
        const emailMatch = f.email?.toLowerCase().includes(q);
        if (!nameMatch && !uidMatch && !emailMatch) return false;
      }
      return true;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredFaculty.length / this.pageSize) || 1;
  }

  get paginatedFaculty(): UserResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredFaculty.slice(start, start + this.pageSize);
  }

  openCreateModal(): void {
    this.facultyForm.reset({
      department: DEPARTMENTS[0],
      password: 'password123'
    });
    this.isCreateModalOpen = true;
  }

  submitCreateFaculty(): void {
    if (this.facultyForm.invalid) {
      this.facultyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.adminService.createFaculty(this.facultyForm.value).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.isCreateModalOpen = false;
        this.facultyList.unshift(created);
        this.toastService.success(`Faculty ${created.name} (${created.uid}) registered successfully!`, 'Created');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.message || "Couldn't create faculty account.", 'Error');
      }
    });
  }

  toggleStatus(f: UserResponse): void {
    const newStatus = !(f.active !== false);
    this.adminService.updateFacultyStatus(f.id, newStatus).subscribe({
      next: (res) => {
        f.active = res.active;
        this.toastService.success(`Faculty account ${res.active ? 'activated' : 'deactivated'}.`, 'Status Updated');
      },
      error: () => {
        this.toastService.error('Failed to change faculty status.', 'Error');
      }
    });
  }

  promptDelete(f: UserResponse): void {
    this.facultyToDelete = f;
    this.isDeleteModalOpen = true;
  }

  deleteFaculty(): void {
    if (!this.facultyToDelete) return;
    const id = this.facultyToDelete.id;
    this.isDeleteModalOpen = false;

    this.adminService.deleteFaculty(id).subscribe({
      next: () => {
        this.facultyList = this.facultyList.filter(f => f.id !== id);
        this.toastService.success('Faculty account removed.', 'Deleted');
      },
      error: () => {
        this.toastService.error('Failed to delete faculty account.', 'Error');
      }
    });
  }

  // Assign Subjects
  openAssignDrawer(f: UserResponse): void {
    this.activeFacultyForAssign = f;
    this.selectedSubjectToAssign = 0;
    this.isAssignDrawerOpen = true;
    this.loadFacultyAssignedSubjects(f.id);
  }

  loadFacultyAssignedSubjects(facultyId: number): void {
    this.loadingAssignedSubjects = true;
    this.adminService.getFacultySubjects(facultyId).subscribe({
      next: (subs) => {
        this.facultyAssignedSubjects = subs;
        this.loadingAssignedSubjects = false;
      },
      error: () => {
        this.facultyAssignedSubjects = [];
        this.loadingAssignedSubjects = false;
      }
    });
  }

  get availableSubjectsToAssign(): Subject[] {
    const assignedIds = new Set(this.facultyAssignedSubjects.map(s => s.id));
    return this.allSubjects.filter(s => !assignedIds.has(s.id));
  }

  assignSubject(): void {
    if (!this.activeFacultyForAssign || !this.selectedSubjectToAssign || this.selectedSubjectToAssign === 0) return;

    this.isAssigning = true;
    const facultyId = this.activeFacultyForAssign.id;
    const subjectId = Number(this.selectedSubjectToAssign);

    this.adminService.assignSubjectToFaculty(facultyId, subjectId).subscribe({
      next: () => {
        this.isAssigning = false;
        this.selectedSubjectToAssign = 0;
        this.toastService.success('Subject assigned to faculty.', 'Assigned');
        this.loadFacultyAssignedSubjects(facultyId);
      },
      error: (err) => {
        this.isAssigning = false;
        this.toastService.error(err.error?.message || 'Failed to assign subject.', 'Error');
      }
    });
  }

  removeSubject(subjectId: number): void {
    if (!this.activeFacultyForAssign) return;
    const facultyId = this.activeFacultyForAssign.id;

    this.adminService.removeSubjectFromFaculty(facultyId, subjectId).subscribe({
      next: () => {
        this.toastService.success('Subject removed from faculty.', 'Removed');
        this.loadFacultyAssignedSubjects(facultyId);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to remove subject.', 'Error');
      }
    });
  }
}
