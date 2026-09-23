import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ToastService } from '../../../core/services/toast.service';
import { Assignment } from '../../../core/models/assignment.models';
import { EvaluationResponse } from '../../../core/models/evaluation.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-faculty-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonLoaderComponent, ConfirmModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#0B1F44]">Evaluations & Scorecards</h1>
          <p class="text-xs text-[#64748B] mt-0.5">Manage grading rubrics, review draft scorecards, and publish results to students</p>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="card p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        <!-- Assignment Selector -->
        <div class="w-full md:w-80">
          <label for="evalAssignmentSelect" class="sr-only">Filter by Assignment</label>
          <select
            id="evalAssignmentSelect"
            [(ngModel)]="selectedAssignmentId"
            (change)="onFilterChange()"
            class="form-select text-xs font-semibold">
            <option [value]="0">All Lab Assignments</option>
            <option *ngFor="let a of assignments" [value]="a.id">
              {{ a.title }} ({{ a.subjectCode || 'Sub #' + a.subjectId }})
            </option>
          </select>
        </div>

        <!-- Publish Status Filter -->
        <div class="flex items-center gap-3 w-full md:w-auto">
          <select
            [(ngModel)]="selectedPublishStatus"
            (change)="onFilterChange()"
            class="form-select text-xs w-44">
            <option value="ALL">All Publication States</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="DRAFT">Drafts (Unpublished)</option>
          </select>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div *ngIf="loading" class="card p-6">
        <app-skeleton-loader [rows]="5"></app-skeleton-loader>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredEvaluations.length === 0" class="card p-12 text-center">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl mb-3">
          📊
        </div>
        <h3 class="text-sm font-bold text-[#0B1F44]">No Evaluations Found</h3>
        <p class="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
          No evaluations have been created for the selected filters yet.
        </p>
      </div>

      <!-- Evaluations Table Card -->
      <div *ngIf="!loading && filteredEvaluations.length > 0" class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4">Evaluation ID</th>
                <th class="py-3 px-4">Assignment</th>
                <th class="py-3 px-4 text-center">Correctness (50)</th>
                <th class="py-3 px-4 text-center">Quality (30)</th>
                <th class="py-3 px-4 text-center">Explanation (20)</th>
                <th class="py-3 px-4 text-center">Total Score (100)</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let ev of paginatedEvaluations" class="hover:bg-[#F8FAFC]/80 transition-colors">
                <!-- Evaluation ID / Sub ID -->
                <td class="py-3.5 px-4 font-mono font-bold text-[#0B1F44]">
                  #{{ ev.id }}
                  <span class="block text-[10px] font-normal text-[#64748B]">Sub #{{ ev.submissionId }}</span>
                </td>

                <!-- Assignment -->
                <td class="py-3.5 px-4 max-w-[200px] truncate">
                  <div class="font-medium text-[#0B1F44] truncate">{{ getAssignmentTitle(ev.assignmentId) }}</div>
                </td>

                <!-- Correctness -->
                <td class="py-3.5 px-4 text-center font-mono font-semibold text-[#0B1F44]">
                  {{ ev.correctness }}/50
                </td>

                <!-- Quality -->
                <td class="py-3.5 px-4 text-center font-mono font-semibold text-[#0B1F44]">
                  {{ ev.quality }}/30
                </td>

                <!-- Explanation -->
                <td class="py-3.5 px-4 text-center font-mono font-semibold text-[#0B1F44]">
                  {{ ev.explanation }}/20
                </td>

                <!-- Total Score -->
                <td class="py-3.5 px-4 text-center font-mono font-extrabold text-blue-600 text-sm">
                  {{ ev.totalMarks }}/100
                </td>

                <!-- Published Badge -->
                <td class="py-3.5 px-4">
                  <span
                    class="badge"
                    [ngClass]="ev.published ? 'badge-evaluated' : 'badge-pending'">
                    {{ ev.published ? '✓ PUBLISHED' : 'DRAFT' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right space-x-2">
                  <button
                    *ngIf="!ev.published"
                    (click)="promptPublish(ev)"
                    class="btn btn-outline btn-sm text-[11px] text-green-700 hover:bg-green-50 border-green-300">
                    Publish Result
                  </button>
                  <a
                    [routerLink]="['/faculty/submissions', ev.submissionId, 'evaluate']"
                    class="btn btn-outline btn-sm text-[11px] text-blue-600 hover:bg-blue-50 border-blue-200">
                    Edit Rubric
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages > 1" class="p-4 border-t border-[#E5EAF2] flex items-center justify-between text-xs text-[#64748B]">
          <div>
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredEvaluations.length) }} of {{ filteredEvaluations.length }} evaluations
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

      <!-- Publish Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isConfirmPublishOpen"
        title="Publish Evaluation Scorecard"
        message="Are you sure you want to publish this evaluation scorecard? The student will immediately see their scores in My Results."
        confirmLabel="Yes, Publish"
        (confirm)="confirmPublish()"
        (cancel)="isConfirmPublishOpen = false">
      </app-confirm-modal>
    </div>
  `
})
export class FacultyEvaluationsComponent implements OnInit {
  private assignmentService = inject(AssignmentService);
  private evaluationService = inject(EvaluationService);
  private toastService = inject(ToastService);

  assignments: Assignment[] = [];
  allEvaluations: EvaluationResponse[] = [];
  selectedAssignmentId = 0;
  selectedPublishStatus = 'ALL';
  loading = true;

  currentPage = 1;
  pageSize = 10;
  Math = Math;

  isConfirmPublishOpen = false;
  selectedEvaluationToPublish: EvaluationResponse | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.assignmentService.getAllAssignments().subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        if (assignments.length > 0) {
          const evalRequests = assignments.map(a =>
            this.evaluationService.getEvaluationsByAssignment(a.id).pipe(catchError(() => of([])))
          );
          forkJoin(evalRequests).subscribe({
            next: (results) => {
              this.allEvaluations = results.flat();
              this.loading = false;
            },
            error: () => {
              this.loading = false;
            }
          });
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  getAssignmentTitle(assignmentId: number): string {
    const a = this.assignments.find(x => x.id === assignmentId);
    return a ? a.title : `Assignment #${assignmentId}`;
  }

  get filteredEvaluations(): EvaluationResponse[] {
    return this.allEvaluations.filter(ev => {
      if (this.selectedAssignmentId && this.selectedAssignmentId !== 0) {
        if (ev.assignmentId !== Number(this.selectedAssignmentId)) return false;
      }
      if (this.selectedPublishStatus === 'PUBLISHED') {
        if (!ev.published) return false;
      } else if (this.selectedPublishStatus === 'DRAFT') {
        if (ev.published) return false;
      }
      return true;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEvaluations.length / this.pageSize) || 1;
  }

  get paginatedEvaluations(): EvaluationResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEvaluations.slice(start, start + this.pageSize);
  }

  promptPublish(ev: EvaluationResponse): void {
    this.selectedEvaluationToPublish = ev;
    this.isConfirmPublishOpen = true;
  }

  confirmPublish(): void {
    if (!this.selectedEvaluationToPublish) return;
    const evId = this.selectedEvaluationToPublish.id;
    this.isConfirmPublishOpen = false;

    this.evaluationService.publishEvaluation(evId).subscribe({
      next: () => {
        if (this.selectedEvaluationToPublish) {
          this.selectedEvaluationToPublish.published = true;
        }
        this.toastService.success('Scorecard published to student successfully!', 'Published');
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to publish scorecard.', 'Error');
      }
    });
  }
}
