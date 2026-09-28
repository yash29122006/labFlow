import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AssignmentService } from '../../../core/services/assignment.service';
import { SubmissionService } from '../../../core/services/submission.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { QuizService } from '../../../core/services/quiz.service';
import { ToastService } from '../../../core/services/toast.service';
import { Assignment } from '../../../core/models/assignment.models';
import { Submission } from '../../../core/models/submission.models';
import { EvaluationRequest, EvaluationResponse } from '../../../core/models/evaluation.models';
import { Quiz, QuizRequest, QuizType } from '../../../core/models/quiz.models';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { getErrorMessage } from '../../../core/utils/error-handler.util';

@Component({
  selector: 'app-assignment-grading',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ConfirmModalComponent, SkeletonLoaderComponent],
  template: `
    <div class="space-y-5">
      <!-- Breadcrumb Navigation & Assignment Header -->
      <div>
        <nav class="flex items-center gap-2 text-xs text-stone mb-2 font-mono" aria-label="Breadcrumb">
          <a routerLink="/faculty/assignments" class="hover:text-pine hover:underline">Assignments</a>
          <span>/</span>
          <span class="text-ink font-semibold">Assignment #{{ assignmentId }}</span>
          @if (assignment?.title) {
            <span>/</span>
            <span class="text-stone truncate max-w-xs">{{ assignment?.title }}</span>
          }
        </nav>

        <div class="bg-white border border-stone-border rounded-lg p-5 shadow-xs">
          <div class="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-base font-bold text-ink tracking-tight">{{ assignment?.title || 'Loading Assignment...' }}</h1>
                @if (assignment) {
                  <span 
                    class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                    [ngClass]="assignment.isOpen ? 'badge-open' : 'badge-closed'"
                  >
                    {{ assignment.isOpen ? 'OPEN' : 'CLOSED' }}
                  </span>
                }
              </div>
              <p class="text-xs text-stone">{{ assignment?.description }}</p>
            </div>

            <!-- Tab Switcher -->
            <div class="flex items-center bg-paper-sidebar p-1 rounded-md border border-stone-border shrink-0 text-xs">
              <button 
                type="button"
                (click)="activeTab = 'grading'"
                [ngClass]="activeTab === 'grading' ? 'bg-white text-pine font-semibold shadow-xs' : 'text-stone hover:text-ink'"
                class="px-3 py-1.5 rounded transition-all"
              >
                Submissions & Grading ({{ submissions.length }})
              </button>
              <button 
                type="button"
                (click)="activeTab = 'quizzes'"
                [ngClass]="activeTab === 'quizzes' ? 'bg-white text-pine font-semibold shadow-xs' : 'text-stone hover:text-ink'"
                class="px-3 py-1.5 rounded transition-all"
              >
                Quiz Questions ({{ quizzes.length }})
              </button>
            </div>
          </div>

          @if (assignment?.details) {
            <div class="mt-3 p-3 rounded-md bg-paper border border-stone-border space-y-2">
              <div class="text-[10px] uppercase tracking-wider font-semibold text-stone">Assignment Lab Details</div>
              <div class="text-[11px] leading-relaxed text-ink whitespace-pre-wrap"><strong>1. AIM:</strong> {{ assignment?.details?.aim }}</div>
              <div class="text-[11px] leading-relaxed text-ink whitespace-pre-wrap"><strong>2. THEORY:</strong> {{ assignment?.details?.theory }}</div>
              <div class="text-[11px] leading-relaxed text-ink whitespace-pre-wrap"><strong>4. LEARNING OUTCOMES:</strong> {{ assignment?.details?.learningOutcomes }}</div>
              <div class="text-[11px] leading-relaxed text-ink whitespace-pre-wrap"><strong>5. COURSE OUTCOMES:</strong> {{ assignment?.details?.courseOutcomes }}</div>
              <div class="text-[11px] leading-relaxed text-ink whitespace-pre-wrap"><strong>6. CONCLUSION:</strong> {{ assignment?.details?.conclusion }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Loading State Skeleton -->
      @if (loading) {
        <app-skeleton-loader [rows]="4"></app-skeleton-loader>
      }

      <!-- Error State -->
      @else if (loadError) {
        <div class="bg-brick-light border border-brick/30 text-brick-dark rounded-lg p-4 text-xs flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span>⚠</span>
            <span>{{ loadError }}</span>
          </div>
          <button (click)="loadAllData()" class="btn-secondary text-[11px]">Retry</button>
        </div>
      }

      <!-- TAB 1: SUBMISSIONS & GRADING -->
      @else if (activeTab === 'grading') {
        @if (submissions.length === 0) {
          <div class="bg-white border border-stone-border rounded-lg p-10 text-center">
            <div class="text-2xl mb-2">📥</div>
            <h3 class="text-sm font-semibold text-ink">No submissions yet</h3>
            <p class="text-xs text-stone mt-1 max-w-sm mx-auto">
              Students have not turned in code for this assignment yet. Check back once students submit their work.
            </p>
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <!-- Left Submissions List Column -->
            <div class="lg:col-span-4 space-y-3">
              <!-- Filter Submissions Toolbar -->
              <div class="bg-white border border-stone-border rounded-lg p-2.5 shadow-xs space-y-2">
                <input 
                  type="text" 
                  [(ngModel)]="submissionSearch" 
                  placeholder="Filter by name / UID..."
                  class="form-input text-xs"
                />
                <select 
                  [(ngModel)]="submissionStatusFilter" 
                  class="form-input text-xs"
                >
                  <option value="ALL">All Submissions ({{ submissions.length }})</option>
                  <option value="UNGRADED">Ungraded Only</option>
                  <option value="DRAFT">Draft Saved</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              <!-- Submissions Scroll Area -->
              <div class="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                @for (sub of filteredSubmissions; track sub.id) {
                  @let evalItem = getEvaluationForSubmission(sub.id);
                  <div 
                    (click)="selectSubmission(sub)"
                    class="bg-white border rounded-lg p-3 cursor-pointer transition-all duration-150 hover:border-pine shadow-xs select-none"
                    [ngClass]="{
                      'border-pine ring-2 ring-pine/30 bg-paper/40': selectedSubmission?.id === sub.id,
                      'border-stone-border': selectedSubmission?.id !== sub.id,
                      'status-bar-published': evalItem?.published,
                      'status-bar-draft': evalItem && !evalItem.published,
                      'status-bar-closed': !evalItem
                    }"
                  >
                    <div class="flex items-start justify-between">
                      <div>
                        <div class="font-mono text-xs font-bold text-ink">
                          {{ sub.studentName || ('Student #' + sub.studentId) }}
                        </div>
                        <div class="text-[11px] text-stone mt-0.5 font-mono">
                          Submission #{{ sub.id }}
                        </div>
                      </div>

                      <!-- Status Badge -->
                      <div>
                        @if (evalItem?.published) {
                          <span class="badge-published text-[10px]">
                            PUBLISHED ({{ evalItem?.totalMarks }}/100)
                          </span>
                        } @else if (evalItem) {
                          <span class="badge-draft text-[10px]">
                            DRAFT ({{ evalItem?.totalMarks }}/100)
                          </span>
                        } @else {
                          <span class="badge-closed text-[10px]">
                            UNGRADED
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Right Submission Code & Interactive Scorecard Panel -->
            <div class="lg:col-span-8">
              @if (selectedSubmission) {
                @let currentEval = getEvaluationForSubmission(selectedSubmission.id);
                <div class="bg-white border border-stone-border rounded-lg shadow-sm overflow-hidden">
                  <!-- Panel Header -->
                  <div class="p-4 bg-paper-sidebar/60 border-b border-stone-border flex items-center justify-between">
                    <div>
                      <h2 class="text-sm font-bold text-ink font-mono">
                        Grading Submission for {{ selectedSubmission.studentName || ('Student #' + selectedSubmission.studentId) }}
                      </h2>
                      <span class="text-[11px] text-stone">Submission Record #{{ selectedSubmission.id }}</span>
                    </div>

                    @if (currentEval) {
                      <div class="flex items-center gap-2">
                        <span 
                          class="text-xs font-semibold px-2 py-0.5 rounded"
                          [ngClass]="currentEval.published ? 'badge-published' : 'badge-draft'"
                        >
                          {{ currentEval.published ? '✓ Result Published' : '✎ Draft Saved' }}
                        </span>
                        @if (!currentEval.published) {
                          <button 
                            type="button" 
                            (click)="publishStandalone(currentEval.id)"
                            [disabled]="isGrading"
                            class="btn-success py-1 px-2.5 text-[11px]"
                            title="Publish draft result to student"
                          >
                            @if (isGrading) { <span class="animate-spin mr-1">↻</span> }
                            Publish Result
                          </button>
                        }
                      </div>
                    }
                  </div>

                  <div class="p-5 space-y-5">
                    <!-- Monospace Code Viewer -->
                    <div>
                      <div class="flex items-center justify-between mb-1.5">
                        <span class="text-xs font-semibold text-ink font-mono">Submitted Source Code</span>
                        <button 
                          type="button" 
                          (click)="copyCode(selectedSubmission.code)"
                          class="text-[11px] text-pine hover:underline font-mono"
                        >
                          Copy Code
                        </button>
                      </div>
                      <div class="code-editor max-h-72 overflow-y-auto whitespace-pre-wrap text-xs select-text">
                        {{ selectedSubmission.code || '// No code content submitted' }}
                      </div>
                    </div>

                    <!-- Grading Form with Dynamic Score Gauge -->
                    <form [formGroup]="gradeForm" class="space-y-4 pt-4 border-t border-stone-light">
                      <!-- Total Score Gauge Bar -->
                      <div class="p-4 rounded-lg bg-paper border border-stone-border space-y-2">
                        <div class="flex items-center justify-between">
                          <h3 class="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                            Live Score Gauge
                          </h3>
                          <div class="flex items-center gap-2">
                            <span class="text-xs font-mono font-bold" [ngClass]="getScoreColorClass()">
                              {{ liveTotalMarks }} / 100
                            </span>
                            <span class="text-[11px] font-semibold text-stone">({{ getScoreLabel() }})</span>
                          </div>
                        </div>

                        <!-- Progress Bar Fill -->
                        <div class="w-full bg-stone-light/80 rounded-full h-2.5 overflow-hidden">
                          <div 
                            class="h-2.5 rounded-full transition-all duration-200"
                            [ngClass]="getScoreBarClass()"
                            [style.width.%]="liveTotalMarks"
                          ></div>
                        </div>
                      </div>

                      <!-- 3 Evaluation Criteria with Dual Slider + Number Input -->
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- Correctness: 0 - 50 -->
                        <div class="bg-paper p-3.5 rounded-lg border border-stone-border space-y-2">
                          <div class="flex items-center justify-between">
                            <label class="form-label text-xs mb-0">
                              Correctness
                            </label>
                            <span class="text-xs font-mono font-bold text-ink">{{ gradeForm.get('correctness')?.value }} / 50</span>
                          </div>
                          
                          <input 
                            type="range" 
                            min="0" 
                            max="50" 
                            formControlName="correctness"
                            class="w-full accent-pine cursor-pointer"
                          />

                          <input 
                            type="number" 
                            min="0" 
                            max="50" 
                            formControlName="correctness" 
                            class="form-input font-mono font-bold text-xs"
                          />
                          <p class="form-hint">Algorithms, logic & test cases</p>
                        </div>

                        <!-- Quality: 0 - 30 -->
                        <div class="bg-paper p-3.5 rounded-lg border border-stone-border space-y-2">
                          <div class="flex items-center justify-between">
                            <label class="form-label text-xs mb-0">
                              Code Quality
                            </label>
                            <span class="text-xs font-mono font-bold text-ink">{{ gradeForm.get('quality')?.value }} / 30</span>
                          </div>
                          
                          <input 
                            type="range" 
                            min="0" 
                            max="30" 
                            formControlName="quality"
                            class="w-full accent-pine cursor-pointer"
                          />

                          <input 
                            type="number" 
                            min="0" 
                            max="30" 
                            formControlName="quality" 
                            class="form-input font-mono font-bold text-xs"
                          />
                          <p class="form-hint">Structure, naming, clean code</p>
                        </div>

                        <!-- Explanation: 0 - 20 -->
                        <div class="bg-paper p-3.5 rounded-lg border border-stone-border space-y-2">
                          <div class="flex items-center justify-between">
                            <label class="form-label text-xs mb-0">
                              Explanation
                            </label>
                            <span class="text-xs font-mono font-bold text-ink">{{ gradeForm.get('explanation')?.value }} / 20</span>
                          </div>
                          
                          <input 
                            type="range" 
                            min="0" 
                            max="20" 
                            formControlName="explanation"
                            class="w-full accent-pine cursor-pointer"
                          />

                          <input 
                            type="number" 
                            min="0" 
                            max="20" 
                            formControlName="explanation" 
                            class="form-input font-mono font-bold text-xs"
                          />
                          <p class="form-hint">Comments & approach clarity</p>
                        </div>
                      </div>

                      <!-- Feedback Textarea -->
                      <div>
                        <label class="form-label">
                          Faculty Feedback & Notes <span class="text-stone font-normal">(Optional)</span>
                        </label>
                        <textarea 
                          rows="3" 
                          formControlName="feedback"
                          placeholder="Provide constructive feedback, suggestions for optimization, or explanation of marks deducted..."
                          class="form-input text-xs"
                        ></textarea>
                      </div>

                      <!-- Action Buttons -->
                      <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-light">
                        <button 
                          type="button" 
                          (click)="saveGrade(false)"
                          [disabled]="gradeForm.invalid || isGrading"
                          class="btn-secondary"
                        >
                          @if (isGrading && !savingAndPublishing) {
                            <span class="animate-spin mr-1">↻</span> Saving...
                          } @else {
                            Save Grade (Draft)
                          }
                        </button>

                        <button 
                          type="button" 
                          (click)="saveGrade(true)"
                          [disabled]="gradeForm.invalid || isGrading"
                          class="btn-success"
                        >
                          @if (isGrading && savingAndPublishing) {
                            <span class="animate-spin mr-1">↻</span> Publishing...
                          } @else {
                            Save & Publish Result
                          }
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              } @else {
                <div class="bg-white border border-dashed border-stone-border rounded-lg p-12 text-center text-stone text-xs">
                  Select a student submission from the left list to inspect code and submit evaluation grades.
                </div>
              }
            </div>
          </div>
        }
      }

      <!-- TAB 2: QUIZ QUESTIONS MANAGEMENT -->
      @else if (activeTab === 'quizzes') {
        <div class="space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-stone-border">
            <div>
              <h2 class="text-sm font-bold text-ink">Assignment Quiz Question Bank</h2>
              <p class="text-xs text-stone mt-0.5">Author MCQ and descriptive questions attached to this lab assignment</p>
            </div>
            <button (click)="openCreateQuizModal()" class="btn-primary">
              + Add Quiz Question
            </button>
          </div>

          @if (quizzes.length === 0) {
            <div class="bg-white border border-stone-border rounded-lg p-8 text-center">
              <div class="text-2xl mb-2">❓</div>
              <h3 class="text-sm font-semibold text-ink">No quiz questions attached</h3>
              <p class="text-xs text-stone mt-1 max-w-sm mx-auto">
                Attach multiple-choice or descriptive questions for students to answer along with their code submission.
              </p>
              <div class="mt-4">
                <button (click)="openCreateQuizModal()" class="btn-primary">
                  + Add First Question
                </button>
              </div>
            </div>
          } @else {
            <div class="space-y-3">
              @for (q of quizzes; track q.id; let idx = $index) {
                <div class="bg-white border border-stone-border rounded-lg p-4 shadow-xs">
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-2 flex-1">
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-xs font-bold text-pine">Q{{ idx + 1 }}.</span>
                        <span class="badge bg-stone-light text-ink font-semibold">{{ q.type }}</span>
                        <span class="text-xs font-mono font-medium text-stone">{{ q.marks }} mark{{ q.marks > 1 ? 's' : '' }}</span>
                      </div>
                      
                      <p class="text-xs font-medium text-ink">{{ q.question }}</p>

                      <!-- MCQ Options display -->
                      @if (q.type === 'MCQ') {
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                          <div 
                            class="p-2 rounded border"
                            [ngClass]="q.correctAnswer === 'A' ? 'bg-moss-light border-moss/40 font-semibold text-moss-dark' : 'bg-paper border-stone-light text-ink'"
                          >
                            <span class="font-mono mr-1.5 font-bold">A.</span> {{ q.optionA }}
                          </div>
                          <div 
                            class="p-2 rounded border"
                            [ngClass]="q.correctAnswer === 'B' ? 'bg-moss-light border-moss/40 font-semibold text-moss-dark' : 'bg-paper border-stone-light text-ink'"
                          >
                            <span class="font-mono mr-1.5 font-bold">B.</span> {{ q.optionB }}
                          </div>
                          <div 
                            class="p-2 rounded border"
                            [ngClass]="q.correctAnswer === 'C' ? 'bg-moss-light border-moss/40 font-semibold text-moss-dark' : 'bg-paper border-stone-light text-ink'"
                          >
                            <span class="font-mono mr-1.5 font-bold">C.</span> {{ q.optionC }}
                          </div>
                          <div 
                            class="p-2 rounded border"
                            [ngClass]="q.correctAnswer === 'D' ? 'bg-moss-light border-moss/40 font-semibold text-moss-dark' : 'bg-paper border-stone-light text-ink'"
                          >
                            <span class="font-mono mr-1.5 font-bold">D.</span> {{ q.optionD }}
                          </div>
                        </div>
                      }
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-1.5 shrink-0">
                      <button 
                        (click)="openEditQuizModal(q)" 
                        class="btn-secondary py-1 px-2 text-[11px]"
                      >
                        Edit
                      </button>
                      <button 
                        (click)="confirmDeleteQuiz(q)" 
                        class="btn-danger-outline py-1 px-2 text-[11px]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Create / Edit Quiz Modal -->
      @if (isQuizModalOpen) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div class="bg-white rounded-lg border border-stone-border shadow-xl max-w-lg w-full p-5 my-8">
            <div class="flex items-center justify-between pb-3 border-b border-stone-light mb-4">
              <h3 class="text-sm font-semibold text-ink">
                {{ editingQuiz ? 'Edit Quiz Question' : 'Add Quiz Question' }}
              </h3>
              <button (click)="closeQuizModal()" class="text-stone hover:text-ink text-lg">&times;</button>
            </div>

            @if (quizFormError) {
              <div class="mb-4 p-2.5 rounded bg-brick-light border border-brick/30 text-brick-dark text-xs">
                {{ quizFormError }}
              </div>
            }

            <form [formGroup]="quizForm" (ngSubmit)="submitQuizForm()" class="space-y-3.5">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="form-label">Question Type <span class="text-brick">*</span></label>
                  <select formControlName="type" class="form-input font-medium">
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="DESCRIPTIVE">Descriptive / Text</option>
                  </select>
                </div>

                <div>
                  <label class="form-label">Marks <span class="text-brick">*</span></label>
                  <input 
                    type="number" 
                    min="1" 
                    formControlName="marks" 
                    class="form-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label class="form-label">Question Prompt <span class="text-brick">*</span></label>
                <textarea 
                  rows="3" 
                  formControlName="question"
                  placeholder="Enter question statement..."
                  class="form-input text-xs"
                ></textarea>
              </div>

              <!-- MCQ Specific Options -->
              @if (quizForm.get('type')?.value === 'MCQ') {
                <div class="space-y-2.5 pt-2 border-t border-stone-light">
                  <div class="text-xs font-semibold text-ink">MCQ Options</div>

                  <div>
                    <label class="form-label text-[11px]">Option A <span class="text-brick">*</span></label>
                    <input type="text" formControlName="optionA" placeholder="Option A text" class="form-input" />
                  </div>

                  <div>
                    <label class="form-label text-[11px]">Option B <span class="text-brick">*</span></label>
                    <input type="text" formControlName="optionB" placeholder="Option B text" class="form-input" />
                  </div>

                  <div>
                    <label class="form-label text-[11px]">Option C <span class="text-brick">*</span></label>
                    <input type="text" formControlName="optionC" placeholder="Option C text" class="form-input" />
                  </div>

                  <div>
                    <label class="form-label text-[11px]">Option D <span class="text-brick">*</span></label>
                    <input type="text" formControlName="optionD" placeholder="Option D text" class="form-input" />
                  </div>

                  <div>
                    <label class="form-label text-[11px]">Correct Answer <span class="text-brick">*</span></label>
                    <select formControlName="correctAnswer" class="form-input font-mono">
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                </div>
              }

              <div class="mt-5 pt-3 border-t border-stone-light flex justify-end gap-2">
                <button type="button" (click)="closeQuizModal()" class="btn-secondary">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  [disabled]="quizForm.invalid || isSubmittingQuiz"
                  class="btn-primary"
                >
                  @if (isSubmittingQuiz) {
                    <span class="animate-spin mr-1">↻</span> Saving...
                  } @else {
                    {{ editingQuiz ? 'Update Question' : 'Add Question' }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Quiz Confirm Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteQuizModalOpen"
        title="Delete Quiz Question"
        message="Are you sure you want to delete this question? Student quiz responses may also be impacted."
        confirmText="Delete Question"
        [isDanger]="true"
        [loading]="isDeletingQuiz"
        (confirm)="deleteQuiz()"
        (cancel)="isDeleteQuizModalOpen = false"
      ></app-confirm-modal>
    </div>
  `
})
export class AssignmentGradingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private assignmentService = inject(AssignmentService);
  private submissionService = inject(SubmissionService);
  private evaluationService = inject(EvaluationService);
  private quizService = inject(QuizService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  @Input() id?: string;

  assignmentId = 0;
  assignment: Assignment | null = null;
  submissions: Submission[] = [];
  evaluations: EvaluationResponse[] = [];
  quizzes: Quiz[] = [];

  submissionSearch = '';
  submissionStatusFilter: 'ALL' | 'UNGRADED' | 'DRAFT' | 'PUBLISHED' = 'ALL';

  activeTab: 'grading' | 'quizzes' = 'grading';
  loading = true;
  loadError: string | null = null;

  selectedSubmission: Submission | null = null;
  isGrading = false;
  savingAndPublishing = false;

  isQuizModalOpen = false;
  isSubmittingQuiz = false;
  quizFormError: string | null = null;
  editingQuiz: Quiz | null = null;

  isDeleteQuizModalOpen = false;
  isDeletingQuiz = false;
  quizToDelete: Quiz | null = null;

  gradeForm: FormGroup = this.fb.group({
    correctness: [40, [Validators.required, Validators.min(0), Validators.max(50)]],
    quality: [25, [Validators.required, Validators.min(0), Validators.max(30)]],
    explanation: [15, [Validators.required, Validators.min(0), Validators.max(20)]],
    feedback: ['']
  });

  quizForm: FormGroup = this.fb.group({
    type: ['MCQ', [Validators.required]],
    marks: [5, [Validators.required, Validators.min(1)]],
    question: ['', [Validators.required]],
    optionA: [''],
    optionB: [''],
    optionC: [''],
    optionD: [''],
    correctAnswer: ['A']
  });

  get liveTotalMarks(): number {
    const c = Number(this.gradeForm.get('correctness')?.value) || 0;
    const q = Number(this.gradeForm.get('quality')?.value) || 0;
    const e = Number(this.gradeForm.get('explanation')?.value) || 0;
    return c + q + e;
  }

  get filteredSubmissions(): Submission[] {
    return this.submissions.filter(sub => {
      if (this.submissionSearch) {
        const query = this.submissionSearch.toLowerCase().trim();
        const studentLabel = `${sub.studentName || ''} ${sub.studentUid || ''} student #${sub.studentId}`.toLowerCase();
        const subId = String(sub.id);
        if (!studentLabel.includes(query) && !subId.includes(query)) return false;
      }

      const evalItem = this.getEvaluationForSubmission(sub.id);
      if (this.submissionStatusFilter === 'UNGRADED' && evalItem) return false;
      if (this.submissionStatusFilter === 'DRAFT' && (!evalItem || evalItem.published)) return false;
      if (this.submissionStatusFilter === 'PUBLISHED' && (!evalItem || !evalItem.published)) return false;

      return true;
    });
  }

  getScoreBarClass(): string {
    const score = this.liveTotalMarks;
    if (score >= 75) return 'bg-moss';
    if (score >= 40) return 'bg-amber';
    return 'bg-brick';
  }

  getScoreColorClass(): string {
    const score = this.liveTotalMarks;
    if (score >= 75) return 'text-moss-dark';
    if (score >= 40) return 'text-amber-dark';
    return 'text-brick-dark';
  }

  getScoreLabel(): string {
    const score = this.liveTotalMarks;
    if (score >= 85) return 'Distinction / Excellent';
    if (score >= 70) return 'Proficient';
    if (score >= 40) return 'Passing';
    return 'Needs Improvement';
  }

  ngOnInit(): void {
    const rawId = this.id || this.route.snapshot.paramMap.get('id');
    this.assignmentId = Number(rawId);
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;
    this.loadError = null;

    forkJoin({
      assignment: this.assignmentService.getAssignmentById(this.assignmentId),
      submissions: this.submissionService.getSubmissionsByAssignment(this.assignmentId),
      evaluations: this.evaluationService.getEvaluationsByAssignment(this.assignmentId),
      quizzes: this.quizService.getQuizzesByAssignment(this.assignmentId)
    }).subscribe({
      next: (res) => {
        this.assignment = res.assignment;
        this.submissions = res.submissions;
        this.evaluations = res.evaluations;
        this.quizzes = res.quizzes;
        this.loading = false;

        if (this.submissions.length > 0 && !this.selectedSubmission) {
          this.selectSubmission(this.submissions[0]);
        }
      },
      error: (err) => {
        this.loading = false;
        this.loadError = getErrorMessage(err, "Failed to load assignment data.");
      }
    });
  }

  getEvaluationForSubmission(submissionId: number): EvaluationResponse | undefined {
    return this.evaluations.find(e => e.submissionId === submissionId);
  }

  selectSubmission(sub: Submission): void {
    this.selectedSubmission = sub;
    const existingEval = this.getEvaluationForSubmission(sub.id);
    if (existingEval) {
      this.gradeForm.patchValue({
        correctness: existingEval.correctness,
        quality: existingEval.quality,
        explanation: existingEval.explanation,
        feedback: existingEval.feedback || ''
      });
    } else {
      this.gradeForm.patchValue({
        correctness: 40,
        quality: 25,
        explanation: 15,
        feedback: ''
      });
    }
  }

  copyCode(code: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      this.toastService.info('Code copied to clipboard.', 'Copied');
    }
  }

  private upsertEvaluation(ev: EvaluationResponse): void {
    const idx = this.evaluations.findIndex(e => e.submissionId === ev.submissionId);
    if (idx >= 0) {
      this.evaluations[idx] = ev;
    } else {
      this.evaluations.push(ev);
    }
  }

  saveGrade(publish: boolean): void {
    if (!this.selectedSubmission || this.gradeForm.invalid) return;

    this.isGrading = true;
    this.savingAndPublishing = publish;

    const req: EvaluationRequest = {
      submissionId: this.selectedSubmission.id,
      correctness: Number(this.gradeForm.value.correctness),
      quality: Number(this.gradeForm.value.quality),
      explanation: Number(this.gradeForm.value.explanation),
      feedback: this.gradeForm.value.feedback
    };

    this.evaluationService.saveEvaluation(req).subscribe({
      next: (savedEval) => {
        if (!publish) {
          this.isGrading = false;
          this.savingAndPublishing = false;
          this.upsertEvaluation(savedEval);
          this.toastService.success('Grade saved as draft');
          return;
        }

        // The backend ignores a "published" flag on save; publishing is a separate call.
        this.evaluationService.publishEvaluation(savedEval.id).subscribe({
          next: () => {
            this.isGrading = false;
            this.savingAndPublishing = false;
            this.upsertEvaluation({ ...savedEval, published: true });
            this.toastService.success('Result published');
          },
          error: (err) => {
            this.isGrading = false;
            this.savingAndPublishing = false;
            this.upsertEvaluation(savedEval);
            this.toastService.error(getErrorMessage(err, "Grade saved, but it couldn't be published."), 'Publish Failed');
          }
        });
      },
      error: (err) => {
        this.isGrading = false;
        this.savingAndPublishing = false;
        this.toastService.error(
          getErrorMessage(err, "Couldn't save evaluation. Please check score ranges (0–50, 0–30, 0–20)."),
          'Grading Error'
        );
      }
    });
  }

  publishStandalone(evaluationId: number): void {
    this.isGrading = true;
    this.evaluationService.publishEvaluation(evaluationId).subscribe({
      next: (res) => {
        this.isGrading = false;
        const evalItem = this.evaluations.find(e => e.id === evaluationId);
        if (evalItem) {
          evalItem.published = true;
        }
        this.toastService.success(res.message || 'Result published');
      },
      error: (err) => {
        this.isGrading = false;
        this.toastService.error(getErrorMessage(err, "Couldn't publish result."), 'Publish Failed');
      }
    });
  }

  openCreateQuizModal(): void {
    this.editingQuiz = null;
    this.quizForm.reset({
      type: 'MCQ',
      marks: 5,
      correctAnswer: 'A'
    });
    this.quizFormError = null;
    this.isQuizModalOpen = true;
  }

  openEditQuizModal(q: Quiz): void {
    this.editingQuiz = q;
    this.quizForm.patchValue({
      type: q.type,
      marks: q.marks,
      question: q.question,
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      correctAnswer: q.correctAnswer || 'A'
    });
    this.quizFormError = null;
    this.isQuizModalOpen = true;
  }

  closeQuizModal(): void {
    this.isQuizModalOpen = false;
    this.editingQuiz = null;
  }

  submitQuizForm(): void {
    if (this.quizForm.invalid) return;

    const qv = this.quizForm.value;
    if (qv.type === 'MCQ' && ['optionA', 'optionB', 'optionC', 'optionD'].some(k => !String(qv[k] ?? '').trim())) {
      this.quizFormError = 'An MCQ needs all four options.';
      return;
    }

    this.isSubmittingQuiz = true;
    this.quizFormError = null;

    const req: QuizRequest = {
      assignmentId: this.assignmentId,
      question: this.quizForm.value.question,
      type: this.quizForm.value.type as QuizType,
      marks: Number(this.quizForm.value.marks),
      optionA: this.quizForm.value.optionA,
      optionB: this.quizForm.value.optionB,
      optionC: this.quizForm.value.optionC,
      optionD: this.quizForm.value.optionD,
      correctAnswer: this.quizForm.value.correctAnswer
    };

    if (this.editingQuiz) {
      this.quizService.updateQuiz(this.editingQuiz.id, req).subscribe({
        next: () => {
          this.isSubmittingQuiz = false;
          this.isQuizModalOpen = false;
          this.toastService.success('Quiz question updated.');
          this.refreshQuizzes();
        },
        error: (err) => {
          this.isSubmittingQuiz = false;
          this.quizFormError = getErrorMessage(err, "Couldn't update quiz question.");
        }
      });
    } else {
      this.quizService.createQuiz(req).subscribe({
        next: () => {
          this.isSubmittingQuiz = false;
          this.isQuizModalOpen = false;
          this.toastService.success('Quiz question added.');
          this.refreshQuizzes();
        },
        error: (err) => {
          this.isSubmittingQuiz = false;
          this.quizFormError = getErrorMessage(err, "Couldn't add quiz question.");
        }
      });
    }
  }

  confirmDeleteQuiz(q: Quiz): void {
    this.quizToDelete = q;
    this.isDeleteQuizModalOpen = true;
  }

  deleteQuiz(): void {
    if (!this.quizToDelete) return;

    this.isDeletingQuiz = true;
    this.quizService.deleteQuiz(this.quizToDelete.id).subscribe({
      next: () => {
        this.isDeletingQuiz = false;
        this.isDeleteQuizModalOpen = false;
        this.toastService.success('Quiz question deleted.');
        this.refreshQuizzes();
      },
      error: (err) => {
        this.isDeletingQuiz = false;
        this.toastService.error(getErrorMessage(err, "Couldn't delete question."), 'Delete Failed');
      }
    });
  }

  private refreshQuizzes(): void {
    this.quizService.getQuizzesByAssignment(this.assignmentId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
      }
    });
  }
}
