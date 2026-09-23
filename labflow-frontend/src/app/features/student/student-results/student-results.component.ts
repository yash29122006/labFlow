import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { SubmissionService } from '../../../core/services/submission.service';
import { Evaluation } from '../../../core/models/evaluation.models';
import { Assignment } from '../../../core/models/assignment.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

interface ResultRow {
  evaluation: Evaluation;
  assignmentTitle: string;
  assignmentDescription?: string;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-student-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonLoaderComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-[#0B1F44]">My Results</h1>
        <p class="text-xs text-[#64748B]">View published evaluation scorecards and faculty feedback.</p>
      </div>

      <!-- Results Table Card -->
      <div class="bg-white rounded-xl border border-[#E5EAF2] shadow-sm overflow-hidden">
        <!-- Loading State -->
        <div *ngIf="loading" class="p-6">
          <app-skeleton-loader [rows]="4"></app-skeleton-loader>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && error" class="p-6 text-center text-xs text-red-600">
          {{ error }}
          <button (click)="loadResults()" class="btn btn-outline btn-sm ml-3">Retry</button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && rows.length === 0" class="p-12 text-center space-y-2">
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl">
            📊
          </div>
          <div class="text-sm font-bold text-[#0B1F44]">No published results yet</div>
          <p class="text-xs text-[#64748B]">
            Once your faculty grades your code submissions and publishes your score, your marks breakdown will appear here.
          </p>
        </div>

        <!-- Table View -->
        <div *ngIf="!loading && !error && rows.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold text-[11px] uppercase tracking-wider">
                <th class="py-3.5 px-4 w-12 text-center">#</th>
                <th class="py-3.5 px-4">Assignment</th>
                <th class="py-3.5 px-4 text-center">Correctness</th>
                <th class="py-3.5 px-4 text-center">Quality</th>
                <th class="py-3.5 px-4 text-center">Explanation</th>
                <th class="py-3.5 px-4 text-center w-48">Total Score</th>
                <th class="py-3.5 px-4 text-right">Feedback</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <ng-container *ngFor="let r of rows; let idx = index">
                <tr class="hover:bg-[#F8FAFC] transition-colors">
                  <td class="py-3.5 px-4 text-center font-mono text-[#94A3B8]">{{ idx + 1 }}</td>
                  <td class="py-3.5 px-4">
                    <div class="font-semibold text-[#0B1F44]">{{ r.assignmentTitle }}</div>
                    <div *ngIf="r.assignmentDescription" class="text-[11px] text-[#64748B] truncate max-w-xs">
                      {{ r.assignmentDescription }}
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-center font-mono text-[#475569]">
                    {{ r.evaluation.correctness }} <span class="text-[10px] text-[#94A3B8]">/ 50</span>
                  </td>
                  <td class="py-3.5 px-4 text-center font-mono text-[#475569]">
                    {{ r.evaluation.quality }} <span class="text-[10px] text-[#94A3B8]">/ 30</span>
                  </td>
                  <td class="py-3.5 px-4 text-center font-mono text-[#475569]">
                    {{ r.evaluation.explanation }} <span class="text-[10px] text-[#94A3B8]">/ 20</span>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2 justify-center">
                      <div class="w-24 bg-[#E5EAF2] h-2 rounded-full overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-300"
                          [ngClass]="r.evaluation.totalMarks >= 75 ? 'bg-green-600' : (r.evaluation.totalMarks >= 40 ? 'bg-blue-600' : 'bg-red-500')"
                          [style.width.%]="r.evaluation.totalMarks">
                        </div>
                      </div>
                      <span class="font-mono font-bold text-xs text-[#0B1F44]">
                        {{ r.evaluation.totalMarks }}/100
                      </span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <button
                      *ngIf="r.evaluation.feedback"
                      type="button"
                      (click)="r.isExpanded = !r.isExpanded"
                      class="btn btn-outline btn-sm text-[11px]">
                      {{ r.isExpanded ? 'Hide' : 'View' }} Feedback
                    </button>
                    <span *ngIf="!r.evaluation.feedback" class="text-stone-muted text-[11px]">—</span>
                  </td>
                </tr>

                <!-- Expandable Feedback Row -->
                <tr *ngIf="r.isExpanded && r.evaluation.feedback" class="bg-[#F8FAFC]">
                  <td colspan="7" class="px-6 py-3 border-b border-[#E5EAF2]">
                    <div class="p-3 bg-white rounded-lg border border-[#E5EAF2] text-xs text-[#475569]">
                      <span class="font-bold text-[#0B1F44] mr-1">Faculty Feedback:</span>
                      <span class="italic">{{ r.evaluation.feedback }}</span>
                    </div>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class StudentResultsComponent implements OnInit {
  private evaluationService = inject(EvaluationService);
  private assignmentService = inject(AssignmentService);
  private submissionService = inject(SubmissionService);

  rows: ResultRow[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      evaluations: this.evaluationService.getMyEvaluations().pipe(catchError(() => of([]))),
      assignments: this.assignmentService.getAllAssignments().pipe(catchError(() => of([]))),
      submissions: this.submissionService.getMySubmissions().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ evaluations, assignments, submissions }) => {
        const titleMap = new Map<number, string>();
        submissions.forEach(sub => { if (sub.assignmentTitle) titleMap.set(sub.assignmentId, sub.assignmentTitle); });
        const assignMap = new Map<number, Assignment>();
        assignments.forEach(a => assignMap.set(a.id, a));

        this.rows = evaluations.map(e => {
          const a = assignMap.get(e.assignmentId);
          return {
            evaluation: e,
            assignmentTitle: a ? a.title : (titleMap.get(e.assignmentId) || `Assignment #${e.assignmentId}`),
            assignmentDescription: a ? a.description : undefined,
            isExpanded: false
          };
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load evaluation scorecards.';
      }
    });
  }
}
