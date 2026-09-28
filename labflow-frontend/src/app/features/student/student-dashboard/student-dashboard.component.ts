import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { SubjectService } from '../../../core/services/subject.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { SubmissionService } from '../../../core/services/submission.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { QuizService } from '../../../core/services/quiz.service';
import { AdminService } from '../../../core/services/admin.service';
import { Assignment } from '../../../core/models/assignment.models';
import { Subject } from '../../../core/models/subject.models';
import { Submission } from '../../../core/models/submission.models';
import { Evaluation } from '../../../core/models/evaluation.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

interface StudentAssignmentRow {
  assignment: Assignment;
  subjectName: string;
  status: 'Evaluated' | 'Submitted' | 'Pending' | 'Not Started';
  statusClass: string;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonLoaderComponent],
  template: `
    <div class="space-y-8">
      <!-- Welcome Header -->
      <div class="space-y-1">
        <h1 class="text-2xl sm:text-3xl font-bold text-[#0B1F44]">
          Welcome, {{ authService.currentUser()?.name || 'Student' }}!
        </h1>
        <p class="text-xs sm:text-sm text-[#64748B]">
          UID: <span class="font-semibold text-[#0B1F44]">{{ authService.currentUser()?.uid }}</span> |
          Year: <span class="font-semibold text-[#0B1F44]">{{ authService.currentUser()?.academicYear }}</span> |
          Semester: <span class="font-semibold text-[#0B1F44]">{{ authService.currentUser()?.semester }}</span>
        </p>
      </div>

      <!-- Stat Cards Grid (4 in a row on desktop) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Subjects Card -->
        <div class="bg-white rounded-xl border border-[#E5EAF2] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div class="text-3xl font-extrabold text-[#0B1F44] tracking-tight">{{ stats.subjects }}</div>
          <div class="text-xs font-semibold text-[#64748B] mt-1">Subjects</div>
        </div>

        <!-- Assignments Card -->
        <div class="bg-white rounded-xl border border-[#E5EAF2] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div class="text-3xl font-extrabold text-[#0B1F44] tracking-tight">{{ stats.assignments }}</div>
          <div class="text-xs font-semibold text-[#64748B] mt-1">Assignments</div>
        </div>

        <!-- Quizzes Card -->
        <div class="bg-white rounded-xl border border-[#E5EAF2] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div class="text-3xl font-extrabold text-[#0B1F44] tracking-tight">{{ stats.quizzes }}</div>
          <div class="text-xs font-semibold text-[#64748B] mt-1">Quizzes</div>
        </div>

        <!-- Submissions Card -->
        <div class="bg-white rounded-xl border border-[#E5EAF2] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div class="text-3xl font-extrabold text-[#0B1F44] tracking-tight">{{ stats.submissions }}</div>
          <div class="text-xs font-semibold text-[#64748B] mt-1">Submissions</div>
        </div>
      </div>

      <!-- Recent Assignments Data Table Card -->
      <div class="bg-white rounded-xl border border-[#E5EAF2] shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-[#E5EAF2] flex items-center justify-between">
          <h2 class="text-base font-bold text-[#0B1F44]">Recent Assignments</h2>
          <a routerLink="/student/assignments" class="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>View All</span>
            <span>→</span>
          </a>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="p-6">
          <app-skeleton-loader [rows]="4"></app-skeleton-loader>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && error" class="p-6 text-center text-xs text-red-600">
          {{ error }}
          <button (click)="loadDashboardData()" class="btn btn-outline btn-sm ml-3">Retry</button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && recentRows.length === 0" class="p-12 text-center space-y-2">
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl">
            📝
          </div>
          <div class="text-sm font-bold text-[#0B1F44]">No assignments found</div>
          <p class="text-xs text-[#64748B]">There are currently no open assignments for your enrolled subjects.</p>
        </div>

        <!-- Table View -->
        <div *ngIf="!loading && !error && recentRows.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold text-[11px] uppercase tracking-wider">
                <th class="py-3 px-4 w-12 text-center">#</th>
                <th class="py-3 px-4">Title</th>
                <th class="py-3 px-4">Subject</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let row of recentRows; let idx = index" class="hover:bg-[#F8FAFC] transition-colors">
                <td class="py-3.5 px-4 text-center font-mono text-[#94A3B8]">{{ idx + 1 }}</td>
                <td class="py-3.5 px-4 font-semibold text-[#0B1F44]">
                  <a [routerLink]="['/student/assignments', row.assignment.id]" class="hover:text-blue-600 transition-colors">
                    {{ row.assignment.title }}
                  </a>
                </td>
                <td class="py-3.5 px-4 text-[#475569]">{{ row.subjectName }}</td>
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
        </div>
      </div>
    </div>
  `
})
export class StudentDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private subjectService = inject(SubjectService);
  private assignmentService = inject(AssignmentService);
  private submissionService = inject(SubmissionService);
  private evaluationService = inject(EvaluationService);
  private quizService = inject(QuizService);
  private adminService = inject(AdminService);

  loading = true;
  error: string | null = null;

  stats = {
    subjects: 0,
    assignments: 0,
    quizzes: 0,
    submissions: 0
  };

  recentRows: StudentAssignmentRow[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      subjects: this.subjectService.getMySubjects().pipe(catchError(() => of([]))),
      assignments: this.assignmentService.getAllAssignments().pipe(catchError(() => of([]))),
      submissions: this.submissionService.getMySubmissions().pipe(catchError(() => of([]))),
      evaluations: this.evaluationService.getMyEvaluations().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ subjects, assignments, submissions, evaluations }) => {
        this.stats.subjects = subjects.length;
        this.stats.assignments = assignments.length;
        this.stats.submissions = submissions.length;

        // Build subject map: fetch assignments for each subject to map assignmentId -> subjectName
        const assignmentSubjectMap = new Map<number, string>();
        const subjectRequests = subjects.map(s =>
          this.assignmentService.getAssignmentsBySubject(s.id).pipe(
            catchError(() => of([])),
            catchError(err => of([]))
          )
        );

        if (subjectRequests.length > 0) {
          forkJoin(subjectRequests).subscribe(results => {
            results.forEach((assignList, idx) => {
              const subj = subjects[idx];
              assignList.forEach(a => {
                assignmentSubjectMap.set(a.id, subj.name);
              });
            });
            this.buildTableRows(assignments, submissions, evaluations, assignmentSubjectMap);
          });
        } else {
          this.buildTableRows(assignments, submissions, evaluations, assignmentSubjectMap);
        }

        // Count quizzes (assignments with at least one question)
        if (assignments.length > 0) {
          const quizRequests = assignments.map(a =>
            this.quizService.getQuizzesForAssignment(a.id).pipe(catchError(() => of([])))
          );
          forkJoin(quizRequests).subscribe(quizLists => {
            this.stats.quizzes = quizLists.filter(q => q.length > 0).length;
          });
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load dashboard statistics. Please try again.';
      }
    });
  }

  private buildTableRows(
    assignments: Assignment[],
    submissions: Submission[],
    evaluations: Evaluation[],
    subjectMap: Map<number, string>
  ): void {
    const subMap = new Map<number, Submission>();
    submissions.forEach(s => subMap.set(s.assignmentId, s));

    const evalMap = new Map<number, Evaluation>();
    evaluations.forEach(e => evalMap.set(e.assignmentId, e));

    const rows: StudentAssignmentRow[] = assignments.slice(0, 5).map(a => {
      const isEvaluated = evalMap.has(a.id);
      const isSubmitted = subMap.has(a.id);

      // Check localStorage draft
      const user = this.authService.currentUser();
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
        status,
        statusClass
      };
    });

    this.recentRows = rows;
  }
}
