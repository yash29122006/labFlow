import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SubmissionService } from '../../../core/services/submission.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { Submission } from '../../../core/models/submission.models';
import { Assignment } from '../../../core/models/assignment.models';
import { Evaluation } from '../../../core/models/evaluation.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { CodeEditorComponent } from '../../../shared/components/code-editor/code-editor.component';

interface EnrichedSubmissionRow {
  submission: Submission;
  assignmentTitle: string;
  submittedAt: string;
  language: string;
  status: 'Evaluated' | 'Submitted';
  statusClass: string;
  evaluation?: Evaluation;
}

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-submissions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonLoaderComponent, CodeEditorComponent],
  template: `
    <div class="space-y-6">
      <!-- Header (Screen 14) -->
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-[#0B1F44]">My Submissions</h1>
        <p class="text-xs text-[#64748B]">View all your submitted solutions and evaluation feedback.</p>
      </div>

      <!-- Submissions Table Card -->
      <div class="bg-white rounded-xl border border-[#E5EAF2] shadow-sm overflow-hidden">
        <!-- Loading State -->
        <div *ngIf="loading" class="p-6">
          <app-skeleton-loader [rows]="4"></app-skeleton-loader>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && error" class="p-6 text-center text-xs text-red-600">
          {{ error }}
          <button (click)="loadSubmissions()" class="btn btn-outline btn-sm ml-3">Retry</button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && rows.length === 0" class="p-12 text-center space-y-2">
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl">
            💻
          </div>
          <div class="text-sm font-bold text-[#0B1F44]">No submissions yet</div>
          <p class="text-xs text-[#64748B]">You haven't submitted any assignment solutions yet.</p>
          <div class="pt-2">
            <a routerLink="/student/assignments" class="btn btn-primary btn-sm">Browse Assignments</a>
          </div>
        </div>

        <!-- Table View (Screen 14) -->
        <div *ngIf="!loading && !error && rows.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold text-[11px] uppercase tracking-wider">
                <th class="py-3.5 px-4 w-12 text-center">#</th>
                <th class="py-3.5 px-4">Assignment</th>
                <th class="py-3.5 px-4">Submitted On</th>
                <th class="py-3.5 px-4">Language</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                <th class="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let r of rows; let idx = index" class="hover:bg-[#F8FAFC] transition-colors">
                <td class="py-3.5 px-4 text-center font-mono text-[#94A3B8]">{{ idx + 1 }}</td>
                <td class="py-3.5 px-4 font-semibold text-[#0B1F44]">
                  {{ r.assignmentTitle }}
                </td>
                <td class="py-3.5 px-4 font-mono text-[#64748B]">{{ r.submittedAt }}</td>
                <td class="py-3.5 px-4">
                  <span class="font-mono text-xs uppercase font-semibold text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded">
                    {{ r.language }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span class="badge" [ngClass]="r.statusClass">
                    {{ r.status }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <button (click)="openViewModal(r)" class="btn btn-primary btn-sm">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- View Submission Modal -->
      <div *ngIf="selectedRow" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div (click)="selectedRow = null" class="fixed inset-0 bg-[#0B1F44]/60 backdrop-blur-xs"></div>

        <!-- Modal Body -->
        <div class="relative w-full max-w-3xl bg-white rounded-2xl border border-[#E5EAF2] shadow-2xl p-6 sm:p-8 space-y-6 z-10 max-h-[90vh] overflow-y-auto animate-fade-in">
          <div class="flex items-start justify-between border-b border-[#E5EAF2] pb-4">
            <div>
              <h3 class="text-lg font-bold text-[#0B1F44]">Submission Details</h3>
              <p class="text-xs text-[#64748B]">Assignment: {{ selectedRow.assignmentTitle }}</p>
            </div>
            <button (click)="selectedRow = null" class="text-[#94A3B8] hover:text-[#0B1F44] text-xl font-bold">&times;</button>
          </div>

          <!-- Evaluation Card (if evaluated) -->
          <div *ngIf="selectedRow.evaluation" class="bg-[#E8F7EE] border border-green-200 rounded-xl p-5 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-green-900 uppercase font-mono">Published Faculty Evaluation</span>
              <span class="font-mono font-bold text-base text-green-800">
                Score: {{ selectedRow.evaluation.totalMarks }} / 100
              </span>
            </div>
            <div class="grid grid-cols-3 gap-3 text-xs">
              <div class="bg-white/80 p-2.5 rounded-lg border border-green-100">
                <span class="text-gray-500">Correctness:</span>
                <div class="font-bold text-[#0B1F44]">{{ selectedRow.evaluation.correctness }} / 50</div>
              </div>
              <div class="bg-white/80 p-2.5 rounded-lg border border-green-100">
                <span class="text-gray-500">Code Quality:</span>
                <div class="font-bold text-[#0B1F44]">{{ selectedRow.evaluation.quality }} / 30</div>
              </div>
              <div class="bg-white/80 p-2.5 rounded-lg border border-green-100">
                <span class="text-gray-500">Explanation:</span>
                <div class="font-bold text-[#0B1F44]">{{ selectedRow.evaluation.explanation }} / 20</div>
              </div>
            </div>
            <div *ngIf="selectedRow.evaluation.feedback" class="text-xs text-[#0B1F44] bg-white/60 p-3 rounded-lg border border-green-100">
              <span class="font-semibold">Feedback: </span> {{ selectedRow.evaluation.feedback }}
            </div>
          </div>

          <!-- Submitted Code (Read-Only) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[#0B1F44]">Submitted Code ({{ selectedRow.language | uppercase }}):</span>
              <span class="text-[11px] text-[#64748B] font-mono">Submitted on: {{ selectedRow.submittedAt }}</span>
            </div>
            <app-code-editor
              [readOnly]="true"
              [languageName]="selectedRow.language"
              [ngModel]="selectedRow.submission.code"
            ></app-code-editor>
          </div>

          <div class="flex justify-end pt-2">
            <button (click)="selectedRow = null" class="btn btn-outline btn-sm px-5">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentSubmissionsListComponent implements OnInit {
  private submissionService = inject(SubmissionService);
  private assignmentService = inject(AssignmentService);
  private evaluationService = inject(EvaluationService);

  rows: EnrichedSubmissionRow[] = [];
  selectedRow: EnrichedSubmissionRow | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      submissions: this.submissionService.getMySubmissions().pipe(catchError(() => of([]))),
      assignments: this.assignmentService.getAllAssignments().pipe(catchError(() => of([]))),
      evaluations: this.evaluationService.getMyEvaluations().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ submissions, assignments, evaluations }) => {
        const assignMap = new Map<number, Assignment>();
        assignments.forEach(a => assignMap.set(a.id, a));

        const evalMap = new Map<number, Evaluation>();
        evaluations.forEach(e => evalMap.set(e.assignmentId, e));

        this.rows = submissions.map(sub => {
          const assign = assignMap.get(sub.assignmentId);
          const ev = evalMap.get(sub.assignmentId);
          const isEvaluated = !!ev;

          const dateStr = sub.submittedAt
            ? sub.submittedAt.split('T')[0]
            : '—';

          return {
            submission: sub,
            assignmentTitle: sub.assignmentTitle || assign?.title || `Assignment #${sub.assignmentId}`,
            submittedAt: dateStr,
            language: sub.language || 'Java',
            status: isEvaluated ? 'Evaluated' : 'Submitted',
            statusClass: isEvaluated ? 'badge-evaluated' : 'badge-submitted',
            evaluation: ev
          };
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load your submissions. Please try again.';
      }
    });
  }

  openViewModal(row: EnrichedSubmissionRow): void {
    this.selectedRow = row;
  }
}
