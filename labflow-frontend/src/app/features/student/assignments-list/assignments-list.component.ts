import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AssignmentService } from '../../../core/services/assignment.service';
import { SubjectService } from '../../../core/services/subject.service';
import { SubmissionService } from '../../../core/services/submission.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Assignment } from '../../../core/models/assignment.models';
import { Submission } from '../../../core/models/submission.models';
import { Evaluation } from '../../../core/models/evaluation.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

interface StudentAssignmentRow {
  assignment: Assignment;
  subjectName: string;
  dueDate: string;
  status: 'Evaluated' | 'Submitted' | 'Pending' | 'Not Started';
  statusClass: string;
}

@Component({
  selector: 'app-student-assignments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonLoaderComponent, PaginationComponent],
  template: `
    <div class="space-y-6">
      <!-- Header & Filter Toolbar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#0B1F44]">Assignments</h1>
          <p class="text-xs text-[#64748B]">View and submit your assignments for active lab subjects.</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Status Filter Tabs / Dropdown -->
          <select
            [(ngModel)]="selectedStatus"
            class="form-select text-xs py-1.5 px-3 h-9 w-36 bg-white border-[#E5EAF2] rounded-lg">
            <option value="">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="Pending">Pending</option>
            <option value="Submitted">Submitted</option>
            <option value="Evaluated">Evaluated</option>
          </select>

          <!-- Search Box -->
          <div class="relative w-full sm:w-56">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search assignments..."
              class="form-input text-xs py-1.5 pl-8 h-9 rounded-lg"
            />
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-xs">🔍</span>
          </div>
        </div>
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
          <button (click)="loadAssignments()" class="btn btn-outline btn-sm ml-3">Retry</button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && filteredRows.length === 0" class="p-12 text-center space-y-2">
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl">
            📝
          </div>
          <div class="text-sm font-bold text-[#0B1F44]">No assignments found</div>
          <p class="text-xs text-[#64748B]">
            {{ searchQuery || selectedStatus ? 'No assignments match the selected filters.' : 'There are currently no assignments available for your enrolled subjects.' }}
          </p>
        </div>

        <!-- Table View -->
        <div *ngIf="!loading && !error && filteredRows.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold text-[11px] uppercase tracking-wider">
                <th class="py-3.5 px-4 w-12 text-center">#</th>
                <th class="py-3.5 px-4">Title</th>
                <th class="py-3.5 px-4">Subject</th>
                <th class="py-3.5 px-4">Due Date</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                <th class="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let row of paginatedRows; let idx = index" class="hover:bg-[#F8FAFC] transition-colors">
                <td class="py-3.5 px-4 text-center font-mono text-[#94A3B8]">
                  {{ (currentPage - 1) * pageSize + idx + 1 }}
                </td>
                <td class="py-3.5 px-4 font-semibold text-[#0B1F44]">
                  <a [routerLink]="['/student/assignments', row.assignment.id]" class="hover:text-blue-600 transition-colors">
                    {{ row.assignment.title }}
                  </a>
                </td>
                <td class="py-3.5 px-4 text-[#475569]">{{ row.subjectName }}</td>
                <td class="py-3.5 px-4 font-mono text-[#64748B]">{{ row.dueDate }}</td>
                <td class="py-3.5 px-4 text-center">
                  <span class="badge" [ngClass]="row.statusClass">
                    {{ row.status }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <a [routerLink]="['/student/assignments', row.assignment.id]" class="btn btn-primary btn-sm">
                    View
                  </a>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination Footer -->
          <div *ngIf="filteredRows.length > pageSize" class="p-4 border-t border-[#E5EAF2]">
            <app-pagination
              [currentPage]="currentPage"
              [pageSize]="pageSize"
              [totalItems]="filteredRows.length"
              (pageChange)="currentPage = $event">
            </app-pagination>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentAssignmentsListComponent implements OnInit {
  private assignmentService = inject(AssignmentService);
  private subjectService = inject(SubjectService);
  private submissionService = inject(SubmissionService);
  private evaluationService = inject(EvaluationService);
  authService = inject(AuthService);

  allRows: StudentAssignmentRow[] = [];
  selectedStatus = '';
  searchQuery = '';
  currentPage = 1;
  pageSize = 10;
  loading = true;
  error: string | null = null;

  get filteredRows(): StudentAssignmentRow[] {
    return this.allRows.filter(r => {
      const matchesSearch = !this.searchQuery ||
        r.assignment.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        r.subjectName.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = !this.selectedStatus || r.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  get paginatedRows(): StudentAssignmentRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.loadAssignments();
  }

  loadAssignments(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      subjects: this.subjectService.getMySubjects().pipe(catchError(() => of([]))),
      assignments: this.assignmentService.getAllAssignments().pipe(catchError(() => of([]))),
      submissions: this.submissionService.getMySubmissions().pipe(catchError(() => of([]))),
      evaluations: this.evaluationService.getMyEvaluations().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ subjects, assignments, submissions, evaluations }) => {
        const subMap = new Map<number, Submission>();
        submissions.forEach(s => subMap.set(s.assignmentId, s));

        const evalMap = new Map<number, Evaluation>();
        evaluations.forEach(e => evalMap.set(e.assignmentId, e));

        const assignmentSubjectMap = new Map<number, string>();
        const subjectRequests = subjects.map(s =>
          this.assignmentService.getAssignmentsBySubject(s.id).pipe(catchError(() => of([])))
        );

        if (subjectRequests.length > 0) {
          forkJoin(subjectRequests).subscribe(results => {
            results.forEach((assignList, idx) => {
              const subj = subjects[idx];
              assignList.forEach(a => assignmentSubjectMap.set(a.id, subj.name));
            });
            this.buildRows(assignments, subMap, evalMap, assignmentSubjectMap);
          });
        } else {
          this.buildRows(assignments, subMap, evalMap, assignmentSubjectMap);
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load assignments. Please try again.';
      }
    });
  }

  private buildRows(
    assignments: Assignment[],
    subMap: Map<number, Submission>,
    evalMap: Map<number, Evaluation>,
    subjectMap: Map<number, string>
  ): void {
    const user = this.authService.currentUser();

    this.allRows = assignments.map(a => {
      const isEvaluated = evalMap.has(a.id);
      const isSubmitted = subMap.has(a.id);
      const draftKey = user ? `labflow_draft_${user.id}_${a.id}` : null;
      const hasDraft = draftKey ? !!localStorage.getItem(draftKey) : false;

      let status: 'Evaluated' | 'Submitted' | 'Pending' | 'Not Started' = 'Not Started';
      let statusClass = 'badge-not-started';

      if (isEvaluated) {
        status = 'Evaluated';
        statusClass = 'badge-evaluated';
      } else if (isSubmitted) {
        status = 'Submitted';
        statusClass = 'badge-submitted';
      } else if (hasDraft) {
        status = 'Pending';
        statusClass = 'badge-pending';
      }

      return {
        assignment: a,
        subjectName: subjectMap.get(a.id) || 'General Lab',
        dueDate: a.dueDate || '—',
        status,
        statusClass
      };
    });

    this.loading = false;
  }
}
