import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AssignmentService } from '../../../core/services/assignment.service';
import { SubmissionService } from '../../../core/services/submission.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { CodeService } from '../../../core/services/code.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Assignment } from '../../../core/models/assignment.models';
import { Submission, Judge0Result } from '../../../core/models/submission.models';
import { Evaluation } from '../../../core/models/evaluation.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { CodeEditorComponent, SUPPORTED_LANGUAGES, SupportedLanguage } from '../../../shared/components/code-editor/code-editor.component';

@Component({
  selector: 'app-assignment-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonLoaderComponent, ConfirmModalComponent, CodeEditorComponent],
  template: `
    <div class="space-y-6 max-w-5xl mx-auto">
      <!-- Top Title & Subtitle (Screen 13) -->
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-[#0B1F44]">Submit Assignment</h1>
        <p class="text-xs text-[#64748B]">Upload code solution or paste your code.</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="bg-white rounded-xl border border-[#E5EAF2] p-8">
        <app-skeleton-loader [rows]="6"></app-skeleton-loader>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading && loadError" class="bg-white rounded-xl border border-red-200 p-8 text-center space-y-4">
        <div class="text-3xl text-red-500">⚠️</div>
        <div class="text-sm font-bold text-[#0B1F44]">{{ loadError }}</div>
        <a routerLink="/student/assignments" class="btn btn-outline btn-sm">Back to Assignments</a>
      </div>

      <!-- Main Submit Card -->
      <div *ngIf="!loading && !loadError && assignment" class="space-y-6">
        <!-- Assignment Info Banner -->
        <div class="bg-white rounded-2xl border border-[#E5EAF2] p-6 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#E5EAF2] pb-4">
            <div>
              <div class="flex items-center gap-2.5 flex-wrap">
                <h2 class="text-lg font-bold text-[#0B1F44]">{{ assignment.title }}</h2>
                <span
                  class="badge text-[11px]"
                  [ngClass]="existingSubmission ? 'badge-submitted' : (assignment.isOpen ? 'badge-open' : 'badge-closed')">
                  {{ existingSubmission ? 'SUBMITTED' : (assignment.isOpen ? 'OPEN' : 'CLOSED') }}
                </span>
                <span *ngIf="publishedEvaluation" class="badge badge-evaluated text-[11px]">
                  EVALUATED ({{ publishedEvaluation.totalMarks }}/100)
                </span>
              </div>
            </div>

            <!-- Published Score Badge -->
            <div *ngIf="publishedEvaluation" class="bg-[#E8F7EE] border border-green-200 rounded-xl px-4 py-2 text-right">
              <div class="text-[10px] font-bold text-green-800 uppercase font-mono">Result Score</div>
              <div class="text-2xl font-extrabold text-green-700 font-mono">
                {{ publishedEvaluation.totalMarks }}<span class="text-xs text-green-600">/100</span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div *ngIf="assignment.description" class="text-xs text-[#475569] leading-relaxed">
            {{ assignment.description }}
          </div>

          <!-- Final Lab Details: Sections 1 and 2 -->
          <div class="space-y-4 pt-1">
            <section class="space-y-1.5">
              <h3 class="text-sm font-bold text-[#0B1F44]">1. AIM</h3>
              <div class="bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl p-4 text-xs text-[#334155] whitespace-pre-wrap leading-relaxed">{{ assignment.details?.aim || 'Aim has not been provided by faculty.' }}</div>
            </section>

            <section class="space-y-1.5">
              <h3 class="text-sm font-bold text-[#0B1F44]">2. THEORY</h3>
              <div class="bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl p-4 text-xs text-[#334155] whitespace-pre-wrap leading-relaxed">{{ assignment.details?.theory || 'Theory has not been provided by faculty.' }}</div>
            </section>
          </div>

        <!-- Code Editor Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-[#0B1F44]">3. CODE</h3>
            <span *ngIf="draftSavedMessage" class="text-[11px] text-green-600 font-medium animate-fade-in">
              ✓ {{ draftSavedMessage }}
            </span>
          </div>

          <!-- Shared Code Editor Component -->
          <app-code-editor
            [readOnly]="!!existingSubmission"
            [initialLanguageId]="selectedLanguage.id"
            [(ngModel)]="sourceCode"
            (languageChange)="onLanguageChange($event)"
          ></app-code-editor>

          <!-- Action Buttons Bar: Stdin Toggle + Run Code + Submit Solution -->
          <div class="bg-white rounded-xl border border-[#E5EAF2] p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="showStdin = !showStdin"
                class="btn btn-outline btn-sm text-xs">
                <span>Input (stdin) {{ showStdin ? '▲' : '▼' }}</span>
              </button>

              <!-- Secondary Run Code Button -->
              <button
                type="button"
                (click)="runCode()"
                [disabled]="isRunningCode || !sourceCode"
                class="btn btn-outline btn-sm text-xs font-semibold text-blue-600 hover:bg-blue-50 border-blue-200">
                <span *ngIf="isRunningCode" class="animate-spin mr-1.5">↻</span>
                <span *ngIf="!isRunningCode">▶</span>
                <span>Run Code</span>
              </button>
            </div>

            <!-- Submit Button (Primary Solid Blue) -->
            <button
              type="button"
              (click)="promptSubmit()"
              [disabled]="!canSubmit || isSubmitting"
              class="btn btn-primary px-7 text-xs font-semibold shadow-sm">
              <span *ngIf="isSubmitting" class="animate-spin mr-1.5">↻</span>
              <span *ngIf="existingSubmission">✓ Code Submitted</span>
              <span *ngIf="!existingSubmission">Submit Solution</span>
            </button>
          </div>

          <!-- Stdin Input Drawer -->
          <div *ngIf="showStdin" class="bg-white rounded-xl border border-[#E5EAF2] p-4 space-y-1.5 animate-fade-in">
            <label class="form-label text-xs">Standard Input (stdin):</label>
            <textarea
              [(ngModel)]="customStdin"
              rows="2"
              placeholder="Inputs passed to your program on execution..."
              class="form-textarea font-mono text-xs"
            ></textarea>
          </div>

          <!-- Test Runner Output Console -->
          <div *ngIf="executionResult || executionError" class="bg-[#0B1F44] text-white rounded-2xl p-5 font-mono text-xs space-y-3 shadow-lg">
            <div class="flex items-center justify-between border-b border-[#1A3160] pb-2.5">
              <div class="flex items-center gap-2">
                <span class="font-bold text-[#60A5FA]">OUTPUT CONSOLE</span>
                <span
                  *ngIf="executionResult?.status"
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  [ngClass]="executionResult?.status?.id === 3 ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'">
                  {{ executionResult?.status?.description }}
                </span>
              </div>
              <div class="text-[11px] text-[#94A3B8]" *ngIf="executionResult">
                Time: {{ executionResult.time || '0.00' }}s | Memory: {{ executionResult.memory || 0 }} KB
              </div>
            </div>

            <!-- Error Message if API error -->
            <div *ngIf="executionError" class="p-3 bg-red-900/40 border border-red-700/50 rounded-lg text-red-200">
              {{ executionError }}
            </div>

            <!-- Standard Output -->
            <div *ngIf="executionResult?.stdout">
              <div class="text-[10px] text-[#94A3B8] uppercase font-bold mb-1">Standard Output:</div>
              <pre class="bg-[#071530] p-3 rounded-lg border border-[#1A3160] text-emerald-300 whitespace-pre-wrap">{{ executionResult?.stdout }}</pre>
            </div>

            <!-- Standard Error -->
            <div *ngIf="executionResult?.stderr">
              <div class="text-[10px] text-red-300 uppercase font-bold mb-1">Standard Error:</div>
              <pre class="bg-[#071530] p-3 rounded-lg border border-red-500/30 text-rose-300 whitespace-pre-wrap">{{ executionResult?.stderr }}</pre>
            </div>

            <!-- Compile Output -->
            <div *ngIf="executionResult?.compile_output">
              <div class="text-[10px] text-amber-300 uppercase font-bold mb-1">Compilation Output:</div>
              <pre class="bg-[#071530] p-3 rounded-lg border border-amber-500/30 text-amber-300 whitespace-pre-wrap">{{ executionResult?.compile_output }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Final Lab Details: Sections 4, 5 and 6 -->
      <div *ngIf="!loading && !loadError && assignment" class="bg-white rounded-2xl border border-[#E5EAF2] p-6 shadow-sm space-y-5">
        <section class="space-y-1.5">
          <h3 class="text-sm font-bold text-[#0B1F44]">4. LEARNING OUTCOMES</h3>
          <div class="bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl p-4 text-xs text-[#334155] whitespace-pre-wrap leading-relaxed">{{ assignment.details?.learningOutcomes || 'Learning outcomes have not been provided by faculty.' }}</div>
        </section>

        <section class="space-y-1.5">
          <h3 class="text-sm font-bold text-[#0B1F44]">5. COURSE OUTCOMES</h3>
          <div class="bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl p-4 text-xs text-[#334155] whitespace-pre-wrap leading-relaxed">{{ assignment.details?.courseOutcomes || 'Course outcomes have not been provided by faculty.' }}</div>
        </section>

        <section class="space-y-1.5">
          <h3 class="text-sm font-bold text-[#0B1F44]">6. CONCLUSION</h3>
          <div class="bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl p-4 text-xs text-[#334155] whitespace-pre-wrap leading-relaxed">{{ assignment.details?.conclusion || 'Conclusion has not been provided by faculty.' }}</div>
        </section>
      </div>

      <!-- Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isConfirmOpen"
        title="Confirm Code Submission"
        message="Are you sure you want to submit this code solution? You can only submit once per assignment."
        confirmLabel="Yes, Submit Code"
        (confirm)="submitCode()"
        (cancel)="isConfirmOpen = false">
      </app-confirm-modal>
    </div>
  `
})
export class AssignmentWorkspaceComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private assignmentService = inject(AssignmentService);
  private submissionService = inject(SubmissionService);
  private evaluationService = inject(EvaluationService);
  private codeService = inject(CodeService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  assignmentId = 0;
  assignment: Assignment | null = null;
  existingSubmission: Submission | null = null;
  publishedEvaluation: Evaluation | null = null;

  languages = SUPPORTED_LANGUAGES;
  selectedLanguage: SupportedLanguage = SUPPORTED_LANGUAGES[0];
  sourceCode = this.selectedLanguage.defaultCode;
  customStdin = '';
  showStdin = false;

  loading = true;
  loadError: string | null = null;
  isRunningCode = false;
  isSubmitting = false;
  executionResult: Judge0Result | null = null;
  executionError: string | null = null;

  isConfirmOpen = false;
  draftSavedMessage: string | null = null;
  private autoSaveTimer: any = null;

  get canSubmit(): boolean {
    if (!this.assignment || !this.assignment.isOpen) return false;
    if (this.existingSubmission) return false;
    return !!(this.sourceCode && this.sourceCode.trim().length > 0);
  }

  ngOnInit(): void {
    this.assignmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
    this.startDraftAutoSave();
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
  }

  loadData(): void {
    this.loading = true;
    this.loadError = null;

    forkJoin({
      assignment: this.assignmentService.getAssignmentById(this.assignmentId),
      mySubmissions: this.submissionService.getMySubmissions().pipe(catchError(() => of([]))),
      myEvaluations: this.evaluationService.getMyEvaluations().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ assignment, mySubmissions, myEvaluations }) => {
        this.assignment = assignment;
        this.loading = false;

        const sub = mySubmissions.find(s => s.assignmentId === this.assignmentId);
        if (sub) {
          this.existingSubmission = sub;
          this.sourceCode = sub.code;
        } else {
          // Restore draft if available
          this.restoreDraft();
        }

        const ev = myEvaluations.find(e => e.assignmentId === this.assignmentId);
        if (ev) {
          this.publishedEvaluation = ev;
        }
      },
      error: (err) => {
        this.loading = false;
        this.loadError = err?.error?.message || 'Failed to load assignment workspace. You may not be enrolled in this subject or the assignment does not exist.';
      }
    });
  }

  onLanguageChange(lang: SupportedLanguage): void {
    this.selectedLanguage = lang;
  }

  private startDraftAutoSave(): void {
    this.autoSaveTimer = setInterval(() => {
      if (!this.existingSubmission && this.sourceCode && this.assignmentId) {
        const user = this.authService.currentUser();
        if (user) {
          const key = `labflow_draft_${user.id}_${this.assignmentId}`;
          localStorage.setItem(key, this.sourceCode);
          this.draftSavedMessage = 'Draft auto-saved';
          setTimeout(() => (this.draftSavedMessage = null), 2000);
        }
      }
    }, 5000);
  }

  private restoreDraft(): void {
    const user = this.authService.currentUser();
    if (user) {
      const key = `labflow_draft_${user.id}_${this.assignmentId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        this.sourceCode = saved;
      }
    }
  }

  runCode(): void {
    if (!this.sourceCode || !this.sourceCode.trim()) {
      this.toastService.warning('Please enter some code to run.');
      return;
    }

    this.isRunningCode = true;
    this.executionResult = null;
    this.executionError = null;

    this.codeService.executeCode({
      languageId: this.selectedLanguage.id,
      sourceCode: this.sourceCode,
      stdin: this.customStdin || undefined
    }).subscribe({
      next: (res) => {
        this.isRunningCode = false;
        this.executionResult = res;
      },
      error: (err) => {
        this.isRunningCode = false;
        this.executionError = err.error?.message || 'Code execution engine encountered an error. Please try again.';
      }
    });
  }

  promptSubmit(): void {
    if (!this.canSubmit) return;
    this.isConfirmOpen = true;
  }

  submitCode(): void {
    this.isConfirmOpen = false;
    this.isSubmitting = true;

    this.submissionService.submitCode({
      assignmentId: this.assignmentId,
      code: this.sourceCode,
      language: this.selectedLanguage.name.split(' ')[0].toLowerCase()
    }).subscribe({
      next: (sub) => {
        this.isSubmitting = false;
        this.existingSubmission = sub;
        const user = this.authService.currentUser();
        if (user) {
          localStorage.removeItem(`labflow_draft_${user.id}_${this.assignmentId}`);
        }
        this.toastService.success('Your code solution was submitted successfully!', 'Submitted');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(
          err.error?.message || 'Submission failed. You may have already submitted this assignment or it is closed.',
          'Submission Error'
        );
      }
    });
  }
}
