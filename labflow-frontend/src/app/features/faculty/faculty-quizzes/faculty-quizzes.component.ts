import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ToastService } from '../../../core/services/toast.service';
import { Quiz, QuizRequest, QuizType } from '../../../core/models/quiz.models';
import { Assignment } from '../../../core/models/assignment.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-faculty-quizzes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SkeletonLoaderComponent, ConfirmModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#0B1F44]">Manage Quizzes</h1>
          <p class="text-xs text-[#64748B]">Author MCQ and descriptive questions for your lab assignments.</p>
        </div>

        <button
          *ngIf="selectedAssignmentId"
          (click)="openAddModal()"
          class="btn btn-primary text-xs font-semibold px-4 shadow-sm flex items-center gap-1.5">
          <span>+</span>
          <span>Add Question</span>
        </button>
      </div>

      <!-- Assignment Selector Card -->
      <div class="bg-white rounded-xl border border-[#E5EAF2] p-5 shadow-sm space-y-3">
        <label for="assignmentSelect" class="form-label text-xs font-bold text-[#0B1F44] uppercase tracking-wider font-mono">
          Select Assignment:
        </label>
        <select
          id="assignmentSelect"
          [(ngModel)]="selectedAssignmentId"
          (ngModelChange)="onAssignmentSelect($event)"
          class="form-select text-xs font-semibold bg-[#F8FAFC]">
          <option [ngValue]="null">-- Choose an Assignment --</option>
          <option *ngFor="let a of assignments" [ngValue]="a.id">
            {{ a.title }} ({{ a.isOpen ? 'Open' : 'Closed' }})
          </option>
        </select>
      </div>

      <!-- Questions List Card -->
      <div *ngIf="selectedAssignmentId" class="bg-white rounded-xl border border-[#E5EAF2] shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-[#E5EAF2] flex items-center justify-between">
          <h2 class="text-base font-bold text-[#0B1F44]">
            Questionnaire ({{ questions.length }} Questions)
          </h2>
          <span class="text-xs font-mono text-[#64748B]">Total Marks: {{ totalMarks }}</span>
        </div>

        <!-- Loading -->
        <div *ngIf="loadingQuestions" class="p-6">
          <app-skeleton-loader [rows]="4"></app-skeleton-loader>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loadingQuestions && questions.length === 0" class="p-12 text-center space-y-2">
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl">
            ❓
          </div>
          <div class="text-sm font-bold text-[#0B1F44]">No questions added yet</div>
          <p class="text-xs text-[#64748B]">Click "+ Add Question" to attach quiz questions to this assignment.</p>
        </div>

        <!-- Questions Table -->
        <div *ngIf="!loadingQuestions && questions.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold text-[11px] uppercase tracking-wider">
                <th class="py-3.5 px-4 w-12 text-center">#</th>
                <th class="py-3.5 px-4">Question</th>
                <th class="py-3.5 px-4">Type</th>
                <th class="py-3.5 px-4 text-center">Correct Answer</th>
                <th class="py-3.5 px-4 text-center">Marks</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let q of questions; let idx = index" class="hover:bg-[#F8FAFC] transition-colors">
                <td class="py-3.5 px-4 text-center font-mono text-[#94A3B8]">{{ idx + 1 }}</td>
                <td class="py-3.5 px-4 font-semibold text-[#0B1F44]">
                  <div>{{ q.question }}</div>
                  <div *ngIf="q.type === 'MCQ'" class="text-[11px] text-[#64748B] font-normal mt-1 space-x-2">
                    <span><strong>A:</strong> {{ q.optionA }}</span>
                    <span><strong>B:</strong> {{ q.optionB }}</span>
                    <span *ngIf="q.optionC"><strong>C:</strong> {{ q.optionC }}</span>
                    <span *ngIf="q.optionD"><strong>D:</strong> {{ q.optionD }}</span>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <span class="badge bg-stone-light text-ink font-semibold">{{ q.type }}</span>
                </td>
                <td class="py-3.5 px-4 text-center font-mono font-bold text-green-700">
                  {{ q.correctAnswer ? 'Option ' + q.correctAnswer : '—' }}
                </td>
                <td class="py-3.5 px-4 text-center font-mono text-[#475569]">{{ q.marks }}</td>
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button (click)="openEditModal(q)" class="btn btn-outline btn-sm text-[11px]">Edit</button>
                    <button (click)="promptDelete(q)" class="btn btn-danger btn-sm text-[11px]">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Question Modal -->
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div (click)="isModalOpen = false" class="fixed inset-0 bg-[#0B1F44]/60 backdrop-blur-xs"></div>

        <div class="relative w-full max-w-lg bg-white rounded-2xl border border-[#E5EAF2] shadow-2xl p-6 sm:p-8 space-y-6 z-10 max-h-[90vh] overflow-y-auto animate-fade-in">
          <div class="flex items-start justify-between border-b border-[#E5EAF2] pb-4">
            <h3 class="text-lg font-bold text-[#0B1F44]">
              {{ editingQuestionId ? 'Edit Quiz Question' : 'Add Quiz Question' }}
            </h3>
            <button (click)="isModalOpen = false" class="text-[#94A3B8] hover:text-[#0B1F44] text-xl font-bold">&times;</button>
          </div>

          <form [formGroup]="quizForm" (ngSubmit)="saveQuestion()" class="space-y-4">
            <div>
              <label for="question" class="form-label">Question Text *</label>
              <textarea
                id="question"
                rows="3"
                formControlName="question"
                placeholder="Enter the quiz question..."
                class="form-textarea text-xs"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="type" class="form-label">Question Type *</label>
                <select id="type" formControlName="type" class="form-select text-xs">
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="DESCRIPTIVE">Descriptive / Viva</option>
                </select>
              </div>

              <div>
                <label for="marks" class="form-label">Marks (Min 1) *</label>
                <input id="marks" type="number" min="1" formControlName="marks" class="form-input text-xs font-mono" />
              </div>
            </div>

            <!-- MCQ Specific Fields -->
            <div *ngIf="quizForm.get('type')?.value === 'MCQ'" class="space-y-3 p-4 bg-[#F8FAFC] rounded-xl border border-[#E5EAF2]">
              <div class="text-xs font-bold text-[#0B1F44]">MCQ Options:</div>

              <div>
                <label for="optionA" class="form-label text-[11px]">Option A *</label>
                <input id="optionA" type="text" formControlName="optionA" class="form-input text-xs" />
              </div>

              <div>
                <label for="optionB" class="form-label text-[11px]">Option B *</label>
                <input id="optionB" type="text" formControlName="optionB" class="form-input text-xs" />
              </div>

              <div>
                <label for="optionC" class="form-label text-[11px]">Option C *</label>
                <input id="optionC" type="text" formControlName="optionC" class="form-input text-xs" />
              </div>

              <div>
                <label for="optionD" class="form-label text-[11px]">Option D *</label>
                <input id="optionD" type="text" formControlName="optionD" class="form-input text-xs" />
              </div>

              <div>
                <label for="correctAnswer" class="form-label text-[11px] text-green-700">Correct Answer *</label>
                <select id="correctAnswer" formControlName="correctAnswer" class="form-select text-xs font-bold">
                  <option value="">-- Select Correct Option --</option>
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
            </div>

            <div class="pt-4 border-t border-[#E5EAF2] flex justify-end gap-2">
              <button type="button" (click)="isModalOpen = false" class="btn btn-outline btn-sm">Cancel</button>
              <button type="submit" [disabled]="quizForm.invalid || isSaving" class="btn btn-primary btn-sm px-5">
                <span *ngIf="isSaving" class="animate-spin mr-1">↻</span>
                <span>{{ editingQuestionId ? 'Update' : 'Save Question' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isConfirmDeleteOpen"
        title="Delete Question"
        message="Are you sure you want to delete this question from the assignment quiz?"
        confirmLabel="Delete"
        (confirm)="deleteQuestion()"
        (cancel)="isConfirmDeleteOpen = false">
      </app-confirm-modal>
    </div>
  `
})
export class FacultyQuizzesComponent implements OnInit {
  private quizService = inject(QuizService);
  private assignmentService = inject(AssignmentService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  assignments: Assignment[] = [];
  selectedAssignmentId: number | null = null;
  questions: Quiz[] = [];

  loadingQuestions = false;
  isModalOpen = false;
  isSaving = false;
  editingQuestionId: number | null = null;

  isConfirmDeleteOpen = false;
  questionToDelete: Quiz | null = null;

  quizForm: FormGroup = this.fb.group({
    question: ['', [Validators.required]],
    type: ['MCQ', [Validators.required]],
    marks: [5, [Validators.required, Validators.min(1)]],
    optionA: [''],
    optionB: [''],
    optionC: [''],
    optionD: [''],
    correctAnswer: ['']
  });

  get totalMarks(): number {
    return this.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  }

  ngOnInit(): void {
    this.loadAssignments();
  }

  loadAssignments(): void {
    this.assignmentService.getAllAssignments().subscribe({
      next: (res) => {
        this.assignments = res;
        if (res.length > 0) {
          this.selectedAssignmentId = res[0].id;
          this.loadQuestions(this.selectedAssignmentId);
        }
      }
    });
  }

  onAssignmentSelect(assignmentId: number | null): void {
    if (assignmentId) {
      this.loadQuestions(assignmentId);
    } else {
      this.questions = [];
    }
  }

  loadQuestions(assignmentId: number): void {
    this.loadingQuestions = true;
    this.quizService.getQuizzesForAssignment(assignmentId).subscribe({
      next: (qs) => {
        this.questions = qs;
        this.loadingQuestions = false;
      },
      error: () => {
        this.loadingQuestions = false;
        this.questions = [];
      }
    });
  }

  openAddModal(): void {
    this.editingQuestionId = null;
    this.quizForm.reset({
      question: '',
      type: 'MCQ',
      marks: 5,
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A'
    });
    this.isModalOpen = true;
  }

  openEditModal(q: Quiz): void {
    this.editingQuestionId = q.id;
    this.quizForm.patchValue({
      question: q.question,
      type: q.type,
      marks: q.marks,
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      correctAnswer: q.correctAnswer || ''
    });
    this.isModalOpen = true;
  }

  saveQuestion(): void {
    if (this.quizForm.invalid || !this.selectedAssignmentId) return;

    const v = this.quizForm.value;
    if (v.type === 'MCQ') {
      const missing = ['optionA', 'optionB', 'optionC', 'optionD'].some(k => !String(v[k] ?? '').trim());
      if (missing || !v.correctAnswer) {
        this.toastService.warning('An MCQ needs all four options and a correct answer.');
        return;
      }
    }

    this.isSaving = true;

    const req: QuizRequest = {
      assignmentId: this.selectedAssignmentId,
      question: this.quizForm.value.question,
      type: this.quizForm.value.type as QuizType,
      marks: Number(this.quizForm.value.marks),
      optionA: this.quizForm.value.optionA || undefined,
      optionB: this.quizForm.value.optionB || undefined,
      optionC: this.quizForm.value.optionC || undefined,
      optionD: this.quizForm.value.optionD || undefined,
      correctAnswer: this.quizForm.value.correctAnswer || undefined
    };

    if (this.editingQuestionId) {
      this.quizService.updateQuiz(this.editingQuestionId, req).subscribe({
        next: () => {
          this.isSaving = false;
          this.isModalOpen = false;
          this.toastService.success('Question updated successfully!');
          if (this.selectedAssignmentId) this.loadQuestions(this.selectedAssignmentId);
        },
        error: (err) => {
          this.isSaving = false;
          this.toastService.error(err.error?.message || 'Failed to update question.');
        }
      });
    } else {
      this.quizService.createQuiz(req).subscribe({
        next: () => {
          this.isSaving = false;
          this.isModalOpen = false;
          this.toastService.success('Question created successfully!');
          if (this.selectedAssignmentId) this.loadQuestions(this.selectedAssignmentId);
        },
        error: (err) => {
          this.isSaving = false;
          this.toastService.error(err.error?.message || 'Failed to create question.');
        }
      });
    }
  }

  promptDelete(q: Quiz): void {
    this.questionToDelete = q;
    this.isConfirmDeleteOpen = true;
  }

  deleteQuestion(): void {
    if (!this.questionToDelete) return;
    const id = this.questionToDelete.id;
    this.isConfirmDeleteOpen = false;

    this.quizService.deleteQuiz(id).subscribe({
      next: () => {
        this.questions = this.questions.filter(q => q.id !== id);
        this.toastService.success('Question removed.');
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to delete question.');
      }
    });
  }
}
