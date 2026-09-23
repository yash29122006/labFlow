import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AssignmentService } from '../../../core/services/assignment.service';
import { SubjectService } from '../../../core/services/subject.service';
import { ToastService } from '../../../core/services/toast.service';
import { Assignment, AssignmentRequest } from '../../../core/models/assignment.models';
import { Subject } from '../../../core/models/subject.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-faculty-assignments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SkeletonLoaderComponent, ConfirmModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Header with + New Assignment Button -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#0B1F44]">Assignments</h1>
          <p class="text-xs text-[#64748B]">Create and manage lab assignments for your assigned subjects.</p>
        </div>

        <button (click)="openCreateModal()" class="btn btn-primary text-xs font-semibold px-4 shadow-sm flex items-center gap-1.5">
          <span>+</span>
          <span>New Assignment</span>
        </button>
      </div>

      <!-- Assignments Table Card -->
      <div class="bg-white rounded-xl border border-[#E5EAF2] shadow-sm overflow-hidden">
        <!-- Loading State -->
        <div *ngIf="loading" class="p-6">
          <app-skeleton-loader [rows]="5"></app-skeleton-loader>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && error" class="p-6 text-center text-xs text-red-600">
          {{ error }}
          <button (click)="loadData()" class="btn btn-outline btn-sm ml-3">Retry</button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && assignments.length === 0" class="p-12 text-center space-y-2">
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl">
            📋
          </div>
          <div class="text-sm font-bold text-[#0B1F44]">No assignments created yet</div>
          <p class="text-xs text-[#64748B]">Click "+ New Assignment" to create your first programming assignment.</p>
        </div>

        <!-- Table View -->
        <div *ngIf="!loading && !error && assignments.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold text-[11px] uppercase tracking-wider">
                <th class="py-3.5 px-4 w-12 text-center">#</th>
                <th class="py-3.5 px-4">Title</th>
                <th class="py-3.5 px-4">Due Date</th>
                <th class="py-3.5 px-4 text-center">Quiz Limit</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let a of assignments; let idx = index" class="hover:bg-[#F8FAFC] transition-colors">
                <td class="py-3.5 px-4 text-center font-mono text-[#94A3B8]">{{ idx + 1 }}</td>
                <td class="py-3.5 px-4 font-semibold text-[#0B1F44]">
                  <div>{{ a.title }}</div>
                  <div *ngIf="a.description" class="text-[11px] text-[#64748B] font-normal truncate max-w-xs">
                    {{ a.description }}
                  </div>
                </td>
                <td class="py-3.5 px-4 font-mono text-[#64748B]">{{ a.dueDate || '—' }}</td>
                <td class="py-3.5 px-4 text-center font-mono text-[#64748B]">
                  {{ a.quizTimeLimitMinutes ? a.quizTimeLimitMinutes + ' mins' : '30 mins' }}
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span class="badge" [ngClass]="a.isOpen ? 'badge-open' : 'badge-closed'">
                    {{ a.isOpen ? 'Open' : 'Closed' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <a
                      [routerLink]="['/faculty/assignments', a.id]"
                      class="btn btn-outline btn-sm text-[11px]">
                      Grade
                    </a>
                    <button
                      (click)="toggleOpenClose(a)"
                      class="btn btn-outline btn-sm text-[11px]">
                      {{ a.isOpen ? 'Close' : 'Open' }}
                    </button>
                    <button
                      (click)="openEditModal(a)"
                      class="btn btn-outline btn-sm text-[11px]">
                      Edit
                    </button>
                    <button
                      (click)="promptDelete(a)"
                      class="btn btn-danger btn-sm text-[11px]">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create / Edit Assignment Modal -->
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div (click)="isModalOpen = false" class="fixed inset-0 bg-[#0B1F44]/60 backdrop-blur-xs"></div>

        <div class="relative w-full max-w-lg bg-white rounded-2xl border border-[#E5EAF2] shadow-2xl p-6 sm:p-8 space-y-6 z-10 max-h-[90vh] overflow-y-auto animate-fade-in">
          <div class="flex items-start justify-between border-b border-[#E5EAF2] pb-4">
            <h3 class="text-lg font-bold text-[#0B1F44]">
              {{ editingAssignmentId ? 'Edit Assignment' : 'Create New Assignment' }}
            </h3>
            <button (click)="isModalOpen = false" class="text-[#94A3B8] hover:text-[#0B1F44] text-xl font-bold">&times;</button>
          </div>

          <form [formGroup]="assignmentForm" (ngSubmit)="saveAssignment()" class="space-y-4">
            <div>
              <label for="title" class="form-label">Title *</label>
              <input
                id="title"
                type="text"
                formControlName="title"
                placeholder="e.g. Lab 1: Binary Search Tree Implementation"
                class="form-input"
              />
            </div>

            <div>
              <label for="description" class="form-label">Description *</label>
              <input
                id="description"
                type="text"
                formControlName="description"
                placeholder="Short summary of the lab task..."
                class="form-input"
              />
            </div>

            <div>
              <label for="instructions" class="form-label">Instructions & Problem Statement *</label>
              <textarea
                id="instructions"
                rows="4"
                formControlName="instructions"
                placeholder="Detailed instructions, input/output specifications, constraints..."
                class="form-textarea font-mono text-xs"
              ></textarea>
            </div>

            <!-- Subject Multi-select (only on create; subject links are kept on edit) -->
            <div *ngIf="!editingAssignmentId">
              <label class="form-label">Assign to Subject(s) *</label>
              <div class="max-h-32 overflow-y-auto p-3 rounded-lg border border-[#E5EAF2] bg-[#F8FAFC] space-y-1.5 text-xs">
                <label *ngFor="let s of subjects" class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    [checked]="isSubjectSelected(s.id)"
                    (change)="toggleSubjectSelection(s.id)"
                    class="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span class="font-bold text-[#0B1F44]">{{ s.code }}</span> - {{ s.name }} (Sem {{ s.semester }})
                </label>
              </div>
            </div>

            <!-- Due Date & Quiz Time Limit -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="dueDate" class="form-label">Due Date (Optional)</label>
                <input
                  id="dueDate"
                  type="date"
                  formControlName="dueDate"
                  class="form-input text-xs font-mono"
                />
              </div>

              <div>
                <label for="quizTimeLimit" class="form-label">Quiz Limit (Mins)</label>
                <input
                  id="quizTimeLimit"
                  type="number"
                  min="5"
                  formControlName="quizTimeLimitMinutes"
                  placeholder="30"
                  class="form-input text-xs font-mono"
                />
              </div>
            </div>

            <!-- Open Now Switch -->
            <div class="flex items-center gap-2 pt-2">
              <input
                id="isOpen"
                type="checkbox"
                formControlName="isOpen"
                class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <label for="isOpen" class="text-xs font-semibold text-[#0B1F44] cursor-pointer">
                Open for student submissions immediately
              </label>
            </div>

            <div class="pt-4 border-t border-[#E5EAF2] flex justify-end gap-2">
              <button type="button" (click)="isModalOpen = false" class="btn btn-outline btn-sm">Cancel</button>
              <button type="submit" [disabled]="assignmentForm.invalid || isSaving" class="btn btn-primary btn-sm px-5">
                <span *ngIf="isSaving" class="animate-spin mr-1">↻</span>
                <span>{{ editingAssignmentId ? 'Update' : 'Create' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isConfirmDeleteOpen"
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? All attached submissions, evaluations, and quizzes will also be deleted."
        confirmLabel="Delete Assignment"
        (confirm)="deleteAssignment()"
        (cancel)="isConfirmDeleteOpen = false">
      </app-confirm-modal>
    </div>
  `
})
export class FacultyAssignmentsComponent implements OnInit {
  private assignmentService = inject(AssignmentService);
  private subjectService = inject(SubjectService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  assignments: Assignment[] = [];
  subjects: Subject[] = [];
  selectedSubjectIds: number[] = [];

  loading = true;
  error: string | null = null;
  isModalOpen = false;
  isSaving = false;
  editingAssignmentId: number | null = null;

  isConfirmDeleteOpen = false;
  assignmentToDelete: Assignment | null = null;

  assignmentForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    instructions: ['', [Validators.required]],
    isOpen: [true],
    dueDate: [''],
    quizTimeLimitMinutes: [30]
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      assignments: this.assignmentService.getAllAssignments().pipe(catchError(() => of([]))),
      subjects: this.subjectService.getMySubjects().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ assignments, subjects }) => {
        this.assignments = assignments;
        this.subjects = subjects;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load assignments.';
      }
    });
  }

  openCreateModal(): void {
    this.editingAssignmentId = null;
    this.selectedSubjectIds = this.subjects.length > 0 ? [this.subjects[0].id] : [];
    this.assignmentForm.reset({
      title: '',
      description: '',
      instructions: '',
      isOpen: true,
      dueDate: '',
      quizTimeLimitMinutes: 30
    });
    this.isModalOpen = true;
  }

  openEditModal(a: Assignment): void {
    this.editingAssignmentId = a.id;
    this.selectedSubjectIds = [];
    this.assignmentForm.patchValue({
      title: a.title,
      description: a.description,
      instructions: a.instructions,
      isOpen: a.isOpen,
      dueDate: a.dueDate || '',
      quizTimeLimitMinutes: a.quizTimeLimitMinutes || 30
    });
    this.isModalOpen = true;
  }

  isSubjectSelected(id: number): boolean {
    return this.selectedSubjectIds.includes(id);
  }

  toggleSubjectSelection(id: number): void {
    if (this.selectedSubjectIds.includes(id)) {
      this.selectedSubjectIds = this.selectedSubjectIds.filter(sId => sId !== id);
    } else {
      this.selectedSubjectIds.push(id);
    }
  }

  saveAssignment(): void {
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    if (this.selectedSubjectIds.length === 0 && !this.editingAssignmentId) {
      this.toastService.warning('Please select at least one subject for this assignment.');
      return;
    }

    this.isSaving = true;

    const req: AssignmentRequest = {
      title: this.assignmentForm.value.title,
      description: this.assignmentForm.value.description,
      instructions: this.assignmentForm.value.instructions,
      isOpen: !!this.assignmentForm.value.isOpen,
      subjectIds: this.selectedSubjectIds.length > 0 ? this.selectedSubjectIds : undefined,
      dueDate: this.assignmentForm.value.dueDate || undefined,
      quizTimeLimitMinutes: this.assignmentForm.value.quizTimeLimitMinutes ? Number(this.assignmentForm.value.quizTimeLimitMinutes) : undefined
    };

    if (this.editingAssignmentId) {
      this.assignmentService.updateAssignment(this.editingAssignmentId, req).subscribe({
        next: () => {
          this.isSaving = false;
          this.isModalOpen = false;
          this.toastService.success('Assignment updated successfully!', 'Saved');
          this.loadData();
        },
        error: (err) => {
          this.isSaving = false;
          this.toastService.error(err.error?.message || 'Failed to update assignment.', 'Error');
        }
      });
    } else {
      this.assignmentService.createAssignment(req).subscribe({
        next: () => {
          this.isSaving = false;
          this.isModalOpen = false;
          this.toastService.success('Assignment created successfully!', 'Created');
          this.loadData();
        },
        error: (err) => {
          this.isSaving = false;
          this.toastService.error(err.error?.message || 'Failed to create assignment.', 'Error');
        }
      });
    }
  }

  toggleOpenClose(a: Assignment): void {
    const action$ = a.isOpen
      ? this.assignmentService.closeAssignment(a.id)
      : this.assignmentService.openAssignment(a.id);

    action$.subscribe({
      next: (updated) => {
        a.isOpen = updated.isOpen;
        this.toastService.success(`Assignment marked as ${updated.isOpen ? 'Open' : 'Closed'}.`);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to toggle status.');
      }
    });
  }

  promptDelete(a: Assignment): void {
    this.assignmentToDelete = a;
    this.isConfirmDeleteOpen = true;
  }

  deleteAssignment(): void {
    if (!this.assignmentToDelete) return;
    const id = this.assignmentToDelete.id;
    this.isConfirmDeleteOpen = false;

    this.assignmentService.deleteAssignment(id).subscribe({
      next: () => {
        this.assignments = this.assignments.filter(a => a.id !== id);
        this.toastService.success('Assignment deleted successfully.');
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to delete assignment.');
      }
    });
  }
}
