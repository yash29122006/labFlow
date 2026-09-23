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
import { Assignment } from '../../../core/models/assignment.models';
import { Submission } from '../../../core/models/submission.models';
import { Evaluation } from '../../../core/models/evaluation.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

interface FacultySubmissionRow {
  submission: Submission;
  studentDisplay: string;
  assignmentTitle: string;
  submittedOn: string;
  isEvaluated: boolean;
  isPublished: boolean;
}

@Component({
  selector: 'app-faculty-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonLoaderComponent],
  template: `
    <div class="space-y-8">
      <!-- Welcome Header (Screen 7) -->
      <div class="space-y-1">
        <h1 class="text-2xl sm:text-3xl font-bold text-[#0B1F44]">
          Welcome, {{ authService.currentUser()?.name || 'Faculty Member' }}!
        </h1>
        <p class="text-xs sm:text-sm text-[#64748B]">
          Manage your subjects, quizzes and evaluate submissions.
        </p>
      </div>

      <!-- Stat Cards Grid (4 in a row) -->
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

      <!-- Recent Submissions Table Card -->
      <div class="bg-white rounded-xl border border-[#E5EAF2] shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-[#E5EAF2] flex items-center justify-between">
          <h2 class="text-base font-bold text-[#0B1F44]">Recent Submissions</h2>
          <a routerLink="/faculty/submissions" class="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
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
            📥
          </div>
          <div class="text-sm font-bold text-[#0B1F44]">No student submissions yet</div>
          <p class="text-xs text-[#64748B]">When students submit solutions for your assignments, they will appear here.</p>
        </div>

        <!-- Table View (Screen 7) -->
        <div *ngIf="!loading && !error && recentRows.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold text-[11px] uppercase tracking-wider">
                <th class="py-3.5 px-4 w-12 text-center">#</th>
                <th class="py-3.5 px-4">Student</th>
                <th class="py-3.5 px-4">Assignment</th>
                <th class="py-3.5 px-4">Submitted On</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                <th class="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let row of recentRows; let idx = index" class="hover:bg-[#F8FAFC] transition-colors">
                <td class="py-3.5 px-4 text-center font-mono text-[#94A3B8]">{{ idx + 1 }}</td>
                <td class="py-3.5 px-4 font-semibold text-[#0B1F44]">
                  {{ row.studentDisplay }}
                </td>
                <td class="py-3.5 px-4 text-[#475569]">
                  {{ row.assignmentTitle }}
                </td>
                <td class="py-3.5 px-4 font-mono text-[#64748B]">{{ row.submittedOn }}</td>
                <td class="py-3.5 px-4 text-center">
                  <span *ngIf="!row.isEvaluated" class="badge badge-pending">
                    Pending
                  </span>
                  <span *ngIf="row.isEvaluated" class="inline-flex items-center gap-1.5">
                    <span class="badge badge-evaluated">Evaluated</span>
                    <span *ngIf="row.isPublished" class="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                      Published
                    </span>
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <a [routerLink]="['/faculty/submissions', row.submission.id, 'evaluate']" class="btn btn-primary btn-sm">
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
export class FacultyDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private subjectService = inject(SubjectService);
  private assignmentService = inject(AssignmentService);
  private submissionService = inject(SubmissionService);
  private evaluationService = inject(EvaluationService);
  private quizService = inject(QuizService);

  loading = true;
  error: string | null = null;

  stats = {
    subjects: 0,
    assignments: 0,
    quizzes: 0,
    submissions: 0
  };

  recentRows: FacultySubmissionRow[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      subjects: this.subjectService.getMySubjects().pipe(catchError(() => of([]))),
      assignments: this.assignmentService.getAllAssignments().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ subjects, assignments }) => {
        this.stats.subjects = subjects.length;
        this.stats.assignments = assignments.length;

        if (assignments.length === 0) {
          this.stats.quizzes = 0;
          this.stats.submissions = 0;
          this.recentRows = [];
          this.loading = false;
          return;
        }

        // Fetch submissions & evaluations for all assignments in parallel
        const subRequests = assignments.map(a =>
          this.submissionService.getSubmissionsByAssignment(a.id).pipe(catchError(() => of([])))
        );
        const evalRequests = assignments.map(a =>
          this.evaluationService.getEvaluationsByAssignment(a.id).pipe(catchError(() => of([])))
        );
        const quizRequests = assignments.map(a =>
          this.quizService.getQuizzesForAssignment(a.id).pipe(catchError(() => of([])))
        );

        forkJoin({
          allSubs: forkJoin(subRequests),
          allEvals: forkJoin(evalRequests),
          allQuizzes: forkJoin(quizRequests)
        }).subscribe({
          next: ({ allSubs, allEvals, allQuizzes }) => {
            this.stats.quizzes = allQuizzes.filter(qs => qs.length > 0).length;

            const flatSubs: Submission[] = allSubs.flat();
            const flatEvals: Evaluation[] = allEvals.flat();

            this.stats.submissions = flatSubs.length;

            const evalMap = new Map<number, Evaluation>();
            flatEvals.forEach(e => evalMap.set(e.submissionId, e));

            const assignMap = new Map<number, Assignment>();
            assignments.forEach(a => assignMap.set(a.id, a));

            // Sort submissions descending (latest first)
            const sortedSubs = [...flatSubs].sort((a, b) => {
              if (a.submittedAt && b.submittedAt) {
                return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
              }
              return b.id - a.id;
            });

            this.recentRows = sortedSubs.slice(0, 5).map(sub => {
              const a = assignMap.get(sub.assignmentId);
              const ev = evalMap.get(sub.id);

              const studentDisplay = sub.studentName
                ? `${sub.studentName} (${sub.studentUid || sub.studentId})`
                : `Student #${sub.studentId}`;

              const submittedOn = sub.submittedAt
                ? sub.submittedAt.split('T')[0]
                : '—';

              return {
                submission: sub,
                studentDisplay,
                assignmentTitle: sub.assignmentTitle || a?.title || `Assignment #${sub.assignmentId}`,
                submittedOn,
                isEvaluated: !!ev,
                isPublished: ev ? !!ev.published : false
              };
            });

            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.error = 'Failed to load submissions and evaluations.';
          }
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load faculty dashboard.';
      }
    });
  }
}
