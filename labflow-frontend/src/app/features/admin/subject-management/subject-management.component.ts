import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SubjectService } from '../../../core/services/subject.service';
import { ToastService } from '../../../core/services/toast.service';
import { Subject } from '../../../core/models/subject.models';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { DEPARTMENTS, ACADEMIC_YEARS, SEMESTERS } from '../../../core/config/departments';

@Component({
  selector: 'app-subject-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ConfirmModalComponent, SkeletonLoaderComponent],
  template: `
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#0B1F44]">Subjects & Lab Curriculum</h1>
          <p class="text-xs text-[#64748B] mt-0.5">Manage departmental courses, academic levels, and linked lab assignments</p>
        </div>
        <button (click)="openCreateModal()" class="btn btn-primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 shadow-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          <span>Add New Subject</span>
        </button>
      </div>

      <!-- Filters Row -->
      <div class="card p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        <div class="relative w-full md:w-80">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="currentPage = 1"
            placeholder="Search code, title, or department..."
            class="form-input text-xs pl-8 pr-3 py-2"
          />
          <svg class="w-4 h-4 text-[#94A3B8] absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto">
          <!-- Year Filter -->
          <select 
            [(ngModel)]="selectedYearFilter" 
            (ngModelChange)="currentPage = 1"
            class="form-select text-xs w-36">
            <option [ngValue]="null">All Years</option>
            <option *ngFor="let yr of academicYears" [ngValue]="yr">Year {{ yr }}</option>
          </select>

          <!-- Semester Filter -->
          <select 
            [(ngModel)]="selectedSemFilter" 
            (ngModelChange)="currentPage = 1"
            class="form-select text-xs w-36">
            <option [ngValue]="null">All Semesters</option>
            <option *ngFor="let sem of semesters" [ngValue]="sem">Semester {{ sem }}</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="card p-6">
        <app-skeleton-loader [rows]="5"></app-skeleton-loader>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredSubjects.length === 0" class="card p-12 text-center">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl mb-3">
          📚
        </div>
        <h3 class="text-sm font-bold text-[#0B1F44]">No Subjects Found</h3>
        <p class="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
          {{ searchQuery ? 'No subjects match your search filters.' : 'No departmental subjects have been configured yet.' }}
        </p>
      </div>

      <!-- Subjects Table Card -->
      <div *ngIf="!loading && filteredSubjects.length > 0" class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4">Subject Code</th>
                <th class="py-3 px-4">Course Name</th>
                <th class="py-3 px-4">Department</th>
                <th class="py-3 px-4 text-center">Year / Semester</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let s of paginatedSubjects" class="hover:bg-[#F8FAFC]/80 transition-colors">
                <!-- Subject Code -->
                <td class="py-3.5 px-4 font-mono font-bold text-blue-600">
                  {{ s.code }}
                </td>

                <!-- Subject Title -->
                <td class="py-3.5 px-4 font-bold text-[#0B1F44]">
                  <a [routerLink]="['/admin/subjects', s.id, 'assignments']" class="hover:underline hover:text-blue-600">
                    {{ s.name }}
                  </a>
                </td>

                <!-- Department -->
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                    {{ s.department }}
                  </span>
                </td>

                <!-- Class Level -->
                <td class="py-3.5 px-4 text-center font-mono text-[#0B1F44]">
                  Year {{ s.academicYear }} &bull; Sem {{ s.semester }}
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right space-x-1.5">
                  <a
                    [routerLink]="['/admin/subjects', s.id, 'assignments']"
                    class="btn btn-outline btn-sm text-[11px] text-blue-600 border-blue-200 hover:bg-blue-50">
                    Assignments &rarr;
                  </a>
                  <button 
                    (click)="openEditModal(s)" 
                    class="btn btn-outline btn-sm text-[11px] text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    Edit
                  </button>
                  <button 
                    (click)="confirmDelete(s)" 
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
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredSubjects.length) }} of {{ filteredSubjects.length }} subjects
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

      <!-- Create / Edit Modal -->
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F44]/50 backdrop-blur-xs">
        <div class="bg-white rounded-2xl border border-[#E5EAF2] shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
          <div class="px-6 py-4 border-b border-[#E5EAF2] flex items-center justify-between">
            <h3 class="text-base font-bold text-[#0B1F44]">
              {{ editingSubject ? 'Edit Subject: ' + editingSubject.code : 'Add New Subject' }}
            </h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
          </div>

          <form [formGroup]="subjectForm" (ngSubmit)="submitSubjectForm()" class="p-6 space-y-4 text-xs">
            <div>
              <label for="subCode" class="form-label">Subject Code *</label>
              <input 
                id="subCode"
                type="text" 
                formControlName="code"
                placeholder="e.g. CS301"
                class="form-input font-mono uppercase"
              />
            </div>

            <div>
              <label for="subName" class="form-label">Subject / Lab Title *</label>
              <input 
                id="subName"
                type="text" 
                formControlName="name"
                placeholder="e.g. Data Structures & Algorithms Lab"
                class="form-input"
              />
            </div>

            <div>
              <label for="subDept" class="form-label">Department *</label>
              <select id="subDept" formControlName="department" class="form-select">
                <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="subYear" class="form-label">Academic Year *</label>
                <select id="subYear" formControlName="academicYear" class="form-select">
                  <option *ngFor="let yr of academicYears" [value]="yr">Year {{ yr }}</option>
                </select>
              </div>

              <div>
                <label for="subSem" class="form-label">Semester *</label>
                <select id="subSem" formControlName="semester" class="form-select">
                  <option *ngFor="let sem of semesters" [value]="sem">Semester {{ sem }}</option>
                </select>
              </div>
            </div>

            <div class="pt-4 border-t border-[#E5EAF2] flex justify-end gap-2">
              <button type="button" (click)="closeModal()" class="btn btn-outline text-xs">
                Cancel
              </button>
              <button 
                type="submit" 
                [disabled]="subjectForm.invalid || isSubmitting"
                class="btn btn-primary text-xs font-semibold px-5">
                <span *ngIf="isSubmitting" class="animate-spin mr-1">↻</span>
                {{ editingSubject ? 'Update Subject' : 'Create Subject' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen"
        title="Delete Subject"
        [message]="'Are you sure you want to delete ' + (subjectToDelete?.name || '') + ' (' + (subjectToDelete?.code || '') + ')? Linked lab assignments may also be affected.'"
        confirmLabel="Delete Subject"
        (confirm)="deleteSubject()"
        (cancel)="isDeleteModalOpen = false">
      </app-confirm-modal>
    </div>
  `
})
export class SubjectManagementComponent implements OnInit {
  private subjectService = inject(SubjectService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  departments = DEPARTMENTS;
  academicYears = ACADEMIC_YEARS;
  semesters = SEMESTERS;

  subjects: Subject[] = [];
  loading = true;

  searchQuery = '';
  selectedYearFilter: number | null = null;
  selectedSemFilter: number | null = null;
  currentPage = 1;
  pageSize = 10;
  Math = Math;

  isModalOpen = false;
  isSubmitting = false;
  editingSubject: Subject | null = null;

  isDeleteModalOpen = false;
  subjectToDelete: Subject | null = null;

  subjectForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    code: ['', [Validators.required]],
    department: [DEPARTMENTS[0], [Validators.required]],
    academicYear: [1, [Validators.required, Validators.min(1)]],
    semester: [1, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.loading = true;
    this.subjectService.getAllSubjects().subscribe({
      next: (res) => {
        this.subjects = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredSubjects(): Subject[] {
    return this.subjects.filter(s => {
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        const matchesName = s.name && s.name.toLowerCase().includes(q);
        const matchesCode = s.code && s.code.toLowerCase().includes(q);
        const matchesDept = s.department && s.department.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDept) return false;
      }

      if (this.selectedYearFilter !== null && s.academicYear !== Number(this.selectedYearFilter)) {
        return false;
      }

      if (this.selectedSemFilter !== null && s.semester !== Number(this.selectedSemFilter)) {
        return false;
      }

      return true;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSubjects.length / this.pageSize) || 1;
  }

  get paginatedSubjects(): Subject[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSubjects.slice(start, start + this.pageSize);
  }

  openCreateModal(): void {
    this.editingSubject = null;
    this.subjectForm.reset({
      name: '',
      code: '',
      department: DEPARTMENTS[0],
      academicYear: 1,
      semester: 1
    });
    this.isModalOpen = true;
  }

  openEditModal(subject: Subject): void {
    this.editingSubject = subject;
    this.subjectForm.patchValue({
      name: subject.name,
      code: subject.code,
      department: subject.department,
      academicYear: subject.academicYear,
      semester: subject.semester
    });
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingSubject = null;
  }

  submitSubjectForm(): void {
    if (this.subjectForm.invalid) return;

    this.isSubmitting = true;
    const payload = {
      ...this.subjectForm.value,
      academicYear: Number(this.subjectForm.value.academicYear),
      semester: Number(this.subjectForm.value.semester)
    };

    if (this.editingSubject) {
      this.subjectService.updateSubject(this.editingSubject.id, payload).subscribe({
        next: (updated) => {
          this.isSubmitting = false;
          this.isModalOpen = false;
          this.toastService.success(`Subject ${updated.code} updated.`, 'Updated');
          this.loadSubjects();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toastService.error(err.error?.message || "Couldn't update subject.", 'Error');
        }
      });
    } else {
      this.subjectService.createSubject(payload).subscribe({
        next: (created) => {
          this.isSubmitting = false;
          this.isModalOpen = false;
          this.toastService.success(`Subject ${created.code} created!`, 'Created');
          this.loadSubjects();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toastService.error(err.error?.message || "Couldn't create subject. Code must be unique.", 'Error');
        }
      });
    }
  }

  confirmDelete(subject: Subject): void {
    this.subjectToDelete = subject;
    this.isDeleteModalOpen = true;
  }

  deleteSubject(): void {
    if (!this.subjectToDelete) return;

    const id = this.subjectToDelete.id;
    this.isDeleteModalOpen = false;

    this.subjectService.deleteSubject(id).subscribe({
      next: () => {
        this.toastService.success(`Subject deleted.`, 'Deleted');
        this.loadSubjects();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || "Couldn't delete subject.", 'Error');
      }
    });
  }
}
