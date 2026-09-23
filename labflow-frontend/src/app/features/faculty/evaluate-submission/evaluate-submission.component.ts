import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SubmissionService } from '../../../core/services/submission.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ToastService } from '../../../core/services/toast.service';
import { Submission } from '../../../core/models/submission.models';
import { Evaluation, EvaluationRequest } from '../../../core/models/evaluation.models';
import { Assignment } from '../../../core/models/assignment.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { CodeEditorComponent } from '../../../shared/components/code-editor/code-editor.component';

@Component({
  selector: 'app-evaluate-submission',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SkeletonLoaderComponent, ConfirmModalComponent, CodeEditorComponent],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      <!-- Loading State -->
      <div *ngIf="loading" class="bg-white rounded-xl border border-[#E5EAF2] p-8">
        <app-skeleton-loader [rows]="6"></app-skeleton-loader>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading && error" class="bg-white rounded-xl border border-red-200 p-8 text-center space-y-4">
        <div class="text-3xl text-red-500">⚠️</div>
        <div class="text-sm font-bold text-[#0B1F44]">{{ error }}</div>
        <a routerLink="/faculty/dashboard" class="btn btn-outline btn-sm">Back to Dashboard</a>
      </div>

      <!-- Main Evaluation Screen (Screen 15) -->
      <div *ngIf="!loading && !error && submission" class="space-y-6">
        <!-- Header Banner -->
        <div class="bg-white rounded-2xl border border-[#E5EAF2] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-[#0B1F44]">Evaluate Submission</h1>
            <p class="text-xs text-[#64748B] mt-0.5">
              Student: <span class="font-semibold text-[#0B1F44]">{{ submission.studentName || 'Student #' + submission.studentId }}</span>
              <span *ngIf="submission.studentUid" class="font-mono text-gray-500"> ({{ submission.studentUid }})</span> |
              Assignment: <span class="font-semibold text-[#0B1F44]">{{ submission.assignmentTitle || assignment?.title || 'Assignment #' + submission.assignmentId }}</span>
            </p>
          </div>

          <!-- Evaluation Status Pill -->
          <div class="flex items-center gap-2">
            <span
              *ngIf="evaluation"
              class="badge"
              [ngClass]="evaluation.published ? 'badge-evaluated' : 'badge-pending'">
              {{ evaluation.published ? '✓ PUBLISHED TO STUDENT' : 'DRAFT EVALUATION' }}
            </span>
            <span *ngIf="!evaluation" class="badge badge-not-started">
              NOT EVALUATED
            </span>
          </div>
        </div>

        <!-- Underline Tabs: Code Solution | Evaluation -->
        <div class="flex border-b border-[#E5EAF2] text-sm font-semibold">
          <button
            type="button"
            (click)="activeTab = 'CODE'"
            [class.text-blue-600]="activeTab === 'CODE'"
            [class.border-b-2]="activeTab === 'CODE'"
            [class.border-blue-600]="activeTab === 'CODE'"
            class="px-5 py-3 hover:text-blue-600 transition-colors">
            Code Solution
          </button>
          <button
            type="button"
            (click)="activeTab = 'EVAL'"
            [class.text-blue-600]="activeTab === 'EVAL'"
            [class.border-b-2]="activeTab === 'EVAL'"
            [class.border-blue-600]="activeTab === 'EVAL'"
            class="px-5 py-3 hover:text-blue-600 transition-colors flex items-center gap-2">
            <span>Evaluation & Grading</span>
            <span *ngIf="evaluation" class="w-2 h-2 rounded-full bg-green-500"></span>
          </button>
        </div>

        <!-- Tab 1: Code Solution (Read-Only) -->
        <div *ngIf="activeTab === 'CODE'" class="space-y-4">
          <div class="flex items-center justify-between text-xs text-[#64748B]">
            <span class="font-semibold text-[#0B1F44]">Language: {{ submission.language || 'Java' | uppercase }}</span>
            <span *ngIf="submission.submittedAt" class="font-mono">Submitted: {{ submission.submittedAt }}</span>
          </div>

          <app-code-editor
            [readOnly]="true"
            [languageName]="submission.language"
            [ngModel]="submission.code"
          ></app-code-editor>

          <div class="flex justify-end pt-2">
            <button (click)="activeTab = 'EVAL'" class="btn btn-primary text-xs font-semibold px-6">
              Continue to Evaluation →
            </button>
          </div>
        </div>

        <!-- Tab 2: Evaluation Form -->
        <div *ngIf="activeTab === 'EVAL'" class="bg-white rounded-2xl border border-[#E5EAF2] p-6 sm:p-8 shadow-sm space-y-6">
          <div *ngIf="evaluation && evaluation.published" class="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span>✓</span>
              <span>This evaluation scorecard has been published and is visible to the student.</span>
            </div>
            <span class="font-bold font-mono">Score: {{ evaluation.totalMarks }}/100</span>
          </div>

          <form [formGroup]="evalForm" (ngSubmit)="saveEvaluation()" class="space-y-6">
            <!-- Score Inputs Grid (Correctness, Quality, Explanation) -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <!-- Correctness (0-50) -->
              <div>
                <label for="correctness" class="form-label text-xs">
                  Correctness <span class="text-gray-400 font-normal">(0–50)</span>
                </label>
                <input
                  id="correctness"
                  type="number"
                  min="0"
                  max="50"
                  formControlName="correctness"
                  class="form-input font-mono text-base font-bold"
                  [class.border-red-500]="isFieldInvalid('correctness')"
                />
                <p *ngIf="isFieldInvalid('correctness')" class="form-error">Enter value between 0 and 50.</p>
              </div>

              <!-- Quality (0-30) -->
              <div>
                <label for="quality" class="form-label text-xs">
                  Code Quality <span class="text-gray-400 font-normal">(0–30)</span>
                </label>
                <input
                  id="quality"
                  type="number"
                  min="0"
                  max="30"
                  formControlName="quality"
                  class="form-input font-mono text-base font-bold"
                  [class.border-red-500]="isFieldInvalid('quality')"
                />
                <p *ngIf="isFieldInvalid('quality')" class="form-error">Enter value between 0 and 30.</p>
              </div>

              <!-- Explanation (0-20) -->
              <div>
                <label for="explanation" class="form-label text-xs">
                  Explanation / Viva <span class="text-gray-400 font-normal">(0–20)</span>
                </label>
                <input
                  id="explanation"
                  type="number"
                  min="0"
                  max="20"
                  formControlName="explanation"
                  class="form-input font-mono text-base font-bold"
                  [class.border-red-500]="isFieldInvalid('explanation')"
                />
                <p *ngIf="isFieldInvalid('explanation')" class="form-error">Enter value between 0 and 20.</p>
              </div>
            </div>

            <!-- Live Computed Total Card -->
            <div class="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5EAF2] flex items-center justify-between">
              <span class="text-xs font-bold text-[#0B1F44] uppercase tracking-wider font-mono">Computed Total Score</span>
              <div class="text-2xl font-extrabold font-mono text-blue-600">
                {{ liveTotalScore }} <span class="text-sm text-[#64748B]">/ 100</span>
              </div>
            </div>

            <!-- Feedback Textarea -->
            <div>
              <label for="feedback" class="form-label text-xs">Faculty Feedback & Guidance (Optional)</label>
              <textarea
                id="feedback"
                rows="4"
                formControlName="feedback"
                placeholder="Provide constructive feedback, praise, or areas of improvement..."
                class="form-textarea text-xs"
              ></textarea>
            </div>

            <!-- Actions Row: Save Evaluation & Publish to Student -->
            <div class="pt-4 border-t border-[#E5EAF2] flex flex-wrap items-center justify-between gap-3">
              <button
                type="submit"
                [disabled]="evalForm.invalid || isSaving"
                class="btn btn-primary text-xs font-semibold px-6 shadow-sm">
                <span *ngIf="isSaving" class="animate-spin mr-1.5">↻</span>
                <span>{{ evaluation ? 'Update Evaluation Scorecard' : 'Save Evaluation' }}</span>
              </button>

              <!-- Publish Button (Visible if evaluation exists) -->
              <button
                *ngIf="evaluation && !evaluation.published"
                type="button"
                (click)="promptPublish()"
                [disabled]="isPublishing"
                class="btn btn-outline text-xs font-semibold text-green-700 hover:bg-green-50 border-green-300">
                <span *ngIf="isPublishing" class="animate-spin mr-1.5">↻</span>
                <span>Publish Result to Student</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Publish Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isConfirmPublishOpen"
        title="Publish Result to Student"
        message="Are you sure you want to publish this evaluation? The student will immediately see their scores and feedback in My Results."
        confirmLabel="Yes, Publish Result"
        (confirm)="publishEvaluation()"
        (cancel)="isConfirmPublishOpen = false">
      </app-confirm-modal>
    </div>
  `
})
export class EvaluateSubmissionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private submissionService = inject(SubmissionService);
  private evaluationService = inject(EvaluationService);
  private assignmentService = inject(AssignmentService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  submissionId = 0;
  submission: Submission | null = null;
  assignment: Assignment | null = null;
  evaluation: Evaluation | null = null;

  activeTab: 'CODE' | 'EVAL' = 'CODE';
  loading = true;
  error: string | null = null;
  isSaving = false;
  isPublishing = false;
  isConfirmPublishOpen = false;

  evalForm: FormGroup = this.fb.group({
    correctness: [40, [Validators.required, Validators.min(0), Validators.max(50)]],
    quality: [25, [Validators.required, Validators.min(0), Validators.max(30)]],
    explanation: [15, [Validators.required, Validators.min(0), Validators.max(20)]],
    feedback: ['']
  });

  get liveTotalScore(): number {
    const c = Number(this.evalForm.get('correctness')?.value) || 0;
    const q = Number(this.evalForm.get('quality')?.value) || 0;
    const e = Number(this.evalForm.get('explanation')?.value) || 0;
    return c + q + e;
  }

  ngOnInit(): void {
    this.submissionId = Number(this.route.snapshot.paramMap.get('submissionId'));
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    this.submissionService.getSubmissionById(this.submissionId).subscribe({
      next: (sub) => {
        this.submission = sub;

        forkJoin({
          assignment: this.assignmentService.getAssignmentById(sub.assignmentId).pipe(catchError(() => of(null))),
          evaluation: this.evaluationService.getEvaluationBySubmission(sub.id).pipe(catchError(() => of(null)))
        }).subscribe({
          next: ({ assignment, evaluation }) => {
            this.assignment = assignment;
            this.evaluation = evaluation;
            if (evaluation) {
              this.evalForm.patchValue({
                correctness: evaluation.correctness,
                quality: evaluation.quality,
                explanation: evaluation.explanation,
                feedback: evaluation.feedback || ''
              });
            }
            this.loading = false;
          }
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'Submission not found or you do not have permission to evaluate it.';
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const c = this.evalForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  saveEvaluation(): void {
    if (this.evalForm.invalid) {
      this.evalForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const payload: EvaluationRequest = {
      submissionId: this.submissionId,
      correctness: Number(this.evalForm.value.correctness),
      quality: Number(this.evalForm.value.quality),
      explanation: Number(this.evalForm.value.explanation),
      feedback: this.evalForm.value.feedback
    };

    this.evaluationService.createOrUpdateEvaluation(payload).subscribe({
      next: (ev) => {
        this.isSaving = false;
        this.evaluation = ev;
        this.toastService.success('Evaluation saved successfully!', 'Saved');
      },
      error: (err) => {
        this.isSaving = false;
        this.toastService.error(err.error?.message || 'Failed to save evaluation.', 'Error');
      }
    });
  }

  promptPublish(): void {
    this.isConfirmPublishOpen = true;
  }

  publishEvaluation(): void {
    if (!this.evaluation) return;
    this.isConfirmPublishOpen = false;
    this.isPublishing = true;

    this.evaluationService.publishEvaluation(this.evaluation.id).subscribe({
      next: () => {
        this.isPublishing = false;
        if (this.evaluation) {
          this.evaluation.published = true;
        }
        this.toastService.success('Evaluation scorecard published to student!', 'Published');
      },
      error: (err) => {
        this.isPublishing = false;
        this.toastService.error(err.error?.message || 'Failed to publish scorecard.', 'Error');
      }
    });
  }
}
