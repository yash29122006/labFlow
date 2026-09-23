import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AssignmentService } from '../../../core/services/assignment.service';
import { SubmissionService } from '../../../core/services/submission.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { Assignment } from '../../../core/models/assignment.models';
import { Submission } from '../../../core/models/submission.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-faculty-submissions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonLoaderComponent],
  template: `
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#0B1F44]">Student Submissions</h1>
          <p class="text-xs text-[#64748B] mt-0.5">Review, inspect, and evaluate student code submissions across your lab courses</p>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="card p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        <!-- Assignment Selector -->
        <div class="w-full md:w-80">
          <label for="assignmentSelect" class="sr-only">Filter by Assignment</label>
          <select
            id="assignmentSelect"
            [(ngModel)]="selectedAssignmentId"
            (change)="onAssignmentChange()"
            class="form-select text-xs font-semibold">
            <option [value]="0">All Lab Assignments</option>
            <option *ngFor="let a of assignments" [value]="a.id">
              {{ a.title }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto">
          <!-- Search Input -->
          <div class="relative w-full md:w-64">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search student name / UID..."
              class="form-input text-xs pl-8 pr-3 py-2"
            />
            <svg class="w-4 h-4 text-[#94A3B8] absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>

          <!-- Status Filter -->
          <select
            [(ngModel)]="selectedStatus"
            class="form-select text-xs w-36">
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Evaluation</option>
            <option value="EVALUATED">Evaluated</option>
          </select>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div *ngIf="loading" class="card p-6">
        <app-skeleton-loader [rows]="5"></app-skeleton-loader>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredSubmissions.length === 0" class="card p-12 text-center">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl mb-3">
          📋
        </div>
        <h3 class="text-sm font-bold text-[#0B1F44]">No Submissions Found</h3>
        <p class="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
          {{ searchQuery ? 'No submissions match your search query.' : 'There are no student submissions for the selected assignment yet.' }}
        </p>
      </div>

      <!-- Submissions Table Card -->
      <div *ngIf="!loading && filteredSubmissions.length > 0" class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4">Student</th>
                <th class="py-3 px-4">Assignment</th>
                <th class="py-3 px-4">Submitted At</th>
                <th class="py-3 px-4">Language</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Score</th>
                <th class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let s of paginatedSubmissions" class="hover:bg-[#F8FAFC]/80 transition-colors">
                <!-- Student Name & UID -->
                <td class="py-3.5 px-4">
                  <div class="font-bold text-[#0B1F44]">{{ s.studentName || 'Student #' + s.studentId }}</div>
                  <div *ngIf="s.studentUid" class="text-[11px] font-mono text-[#64748B]">{{ s.studentUid }}</div>
                </td>

                <!-- Assignment Title -->
                <td class="py-3.5 px-4 max-w-[200px] truncate">
                  <div class="font-medium text-[#0B1F44] truncate">{{ s.assignmentTitle || getAssignmentTitle(s.assignmentId) }}</div>
                  <div class="text-[10px] text-[#64748B]">ID #{{ s.assignmentId }}</div>
                </td>

                <!-- Submitted Date -->
                <td class="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">
                  {{ s.submittedAt ? (s.submittedAt | date:'mediumDate') : 'Submitted' }}
                </td>

                <!-- Language -->
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-gray-100 text-gray-700">
                    {{ s.language || 'JAVA' }}
                  </span>
                </td>

                <!-- Status Badge -->
                <td class="py-3.5 px-4">
                  <span
                    class="badge"
                    [ngClass]="isEvaluated(s) ? 'badge-evaluated' : 'badge-pending'">
                    {{ isEvaluated(s) ? 'EVALUATED' : 'PENDING' }}
                  </span>
                </td>

                <!-- Score -->
                <td class="py-3.5 px-4 font-mono font-bold">
                  <span *ngIf="scoreOf(s) !== null" class="text-blue-600">
                    {{ scoreOf(s) }}/100
                  </span>
                  <span *ngIf="scoreOf(s) === null" class="text-[#94A3B8]">
                    --
                  </span>
                </td>

                <!-- Action Button -->
                <td class="py-3.5 px-4 text-right">
                  <a
                    [routerLink]="['/faculty/submissions', s.id, 'evaluate']"
                    class="btn btn-outline btn-sm font-semibold text-blue-600 hover:bg-blue-50 border-blue-200">
                    {{ isEvaluated(s) ? 'View Evaluation' : 'Evaluate →' }}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div *ngIf="totalPages > 1" class="p-4 border-t border-[#E5EAF2] flex items-center justify-between text-xs text-[#64748B]">
          <div>
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredSubmissions.length) }} of {{ filteredSubmissions.length }} submissions
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
    </div>
  `
})
export class FacultySubmissionsComponent implements OnInit {
  private assignmentService = inject(AssignmentService);
  private submissionService = inject(SubmissionService);
  private evaluationService = inject(EvaluationService);

  assignments: Assignment[] = [];
  allSubmissions: Submission[] = [];
  private scoreMap = new Map<number, number>();
  selectedAssignmentId = 0;
  searchQuery = '';
  selectedStatus = 'ALL';
  loading = true;

  currentPage = 1;
  pageSize = 10;
  Math = Math;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.assignmentService.getAllAssignments().subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        if (assignments.length === 0) {
          this.loading = false;
          return;
        }
        forkJoin({
          subs: forkJoin(assignments.map(a =>
            this.submissionService.getSubmissionsByAssignment(a.id).pipe(catchError(() => of([]))))),
          evals: forkJoin(assignments.map(a =>
            this.evaluationService.getEvaluationsByAssignment(a.id).pipe(catchError(() => of([])))))
        }).subscribe({
          next: ({ subs, evals }) => {
            this.allSubmissions = subs.flat();
            evals.flat().forEach(e => this.scoreMap.set(e.submissionId, e.totalMarks));
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /** Backend statuses are PENDING / EVALUATED / PUBLISHED; both of the last two mean "graded". */
  isEvaluated(s: Submission): boolean {
    return s.evaluationStatus === 'EVALUATED' || s.evaluationStatus === 'PUBLISHED' || this.scoreMap.has(s.id);
  }

  scoreOf(s: Submission): number | null {
    const v = this.scoreMap.get(s.id);
    return v === undefined ? null : v;
  }

  onAssignmentChange(): void {
    this.currentPage = 1;
  }

  getAssignmentTitle(assignmentId: number): string {
    const a = this.assignments.find(x => x.id === assignmentId);
    return a ? a.title : `Assignment #${assignmentId}`;
  }

  get filteredSubmissions(): Submission[] {
    return this.allSubmissions.filter(s => {
      if (this.selectedAssignmentId && this.selectedAssignmentId !== 0) {
        if (s.assignmentId !== Number(this.selectedAssignmentId)) return false;
      }
      if (this.selectedStatus === 'PENDING') {
        if (this.isEvaluated(s)) return false;
      } else if (this.selectedStatus === 'EVALUATED') {
        if (!this.isEvaluated(s)) return false;
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        const nameMatch = s.studentName?.toLowerCase().includes(q);
        const uidMatch = s.studentUid?.toLowerCase().includes(q);
        const titleMatch = s.assignmentTitle?.toLowerCase().includes(q);
        if (!nameMatch && !uidMatch && !titleMatch) return false;
      }
      return true;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSubmissions.length / this.pageSize) || 1;
  }

  get paginatedSubmissions(): Submission[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSubmissions.slice(start, start + this.pageSize);
  }
}
