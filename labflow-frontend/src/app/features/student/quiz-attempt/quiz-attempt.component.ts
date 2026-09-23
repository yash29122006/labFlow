import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ToastService } from '../../../core/services/toast.service';
import { Quiz, QuizAnswerSubmission } from '../../../core/models/quiz.models';
import { Assignment } from '../../../core/models/assignment.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-quiz-attempt',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonLoaderComponent, ConfirmModalComponent],
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
        <a routerLink="/student/quizzes" class="btn btn-outline btn-sm">Return to Quizzes</a>
      </div>

      <!-- Submitted Success View (Screen after submit) -->
      <div *ngIf="submitted" class="bg-white rounded-2xl border border-[#E5EAF2] shadow-xl p-10 text-center space-y-5 animate-fade-in">
        <div class="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto text-3xl">
          ✓
        </div>
        <div class="space-y-1">
          <h2 class="text-2xl font-bold text-[#0B1F44]">Quiz Submitted Successfully!</h2>
          <p class="text-sm text-[#64748B]">
            Quiz submitted — {{ answeredCount }} of {{ questions.length }} answered.
          </p>
        </div>
        <div class="pt-4">
          <a routerLink="/student/quizzes" class="btn btn-primary text-xs font-semibold px-6">
            Back to Quizzes
          </a>
        </div>
      </div>

      <!-- Active Quiz Interface (Screen 12) -->
      <div *ngIf="!loading && !error && !submitted && questions.length > 0" class="space-y-6">
        <!-- Top Navigation Bar: Breadcrumb + Timer Chip -->
        <div class="bg-white rounded-xl border border-[#E5EAF2] px-6 py-4 flex items-center justify-between shadow-sm">
          <div class="text-xs font-semibold text-[#64748B] flex items-center gap-1.5">
            <a routerLink="/student/quizzes" class="hover:text-blue-600">Quizzes</a>
            <span>›</span>
            <span class="text-[#0B1F44] font-bold truncate max-w-xs sm:max-w-md">
              Quiz {{ assignmentId }} - {{ assignment?.title || 'Assignment' }}
            </span>
          </div>

          <!-- Timer Chip -->
          <div
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-colors"
            [ngClass]="timeLeft <= 60 ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-blue-50 text-blue-700 border border-blue-200'">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{{ formattedTime }}</span>
          </div>
        </div>

        <!-- Question Tracker Dots Palette -->
        <div class="bg-white rounded-xl border border-[#E5EAF2] p-4 flex flex-wrap items-center gap-2 shadow-sm">
          <span class="text-xs font-bold text-[#64748B] mr-2">Questions:</span>
          <button
            *ngFor="let q of questions; let i = index"
            type="button"
            (click)="currentIndex = i"
            [ngClass]="{
              'ring-2 ring-blue-600 ring-offset-1 font-bold': currentIndex === i,
              'bg-blue-600 text-white': isAnswered(q.id),
              'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]': !isAnswered(q.id)
            }"
            class="w-7 h-7 rounded-lg text-xs font-mono flex items-center justify-center transition-all">
            {{ i + 1 }}
          </button>
        </div>

        <!-- Question Body Card -->
        <div class="bg-white rounded-2xl border border-[#E5EAF2] shadow-sm p-6 sm:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-[#E5EAF2] pb-3">
            <span class="text-xs font-bold font-mono text-[#64748B] uppercase tracking-wider">
              Question {{ currentIndex + 1 }} of {{ questions.length }}
            </span>
            <span class="badge badge-closed text-[11px] font-mono">
              {{ currentQuestion.marks }} Marks
            </span>
          </div>

          <!-- Question Text -->
          <div class="text-base sm:text-lg font-bold text-[#0B1F44] leading-snug">
            {{ currentQuestion.question }}
          </div>

          <!-- MCQ Options (Radio Buttons) -->
          <div *ngIf="currentQuestion.type === 'MCQ'" class="space-y-3">
            <label
              *ngFor="let opt of getOptions(currentQuestion)"
              [ngClass]="answers[currentQuestion.id] === opt.key ? 'bg-[#EAF1FF] border-blue-500' : ''"
              class="flex items-center gap-3.5 p-4 rounded-xl border border-[#E5EAF2] hover:bg-[#F8FAFC] cursor-pointer transition-all">
              <input
                type="radio"
                [name]="'q_' + currentQuestion.id"
                [value]="opt.key"
                [ngModel]="answers[currentQuestion.id]"
                (ngModelChange)="onSelectAnswer(currentQuestion.id, opt.key)"
                class="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span class="w-6 h-6 rounded-md bg-[#F1F5F9] text-xs font-bold font-mono flex items-center justify-center text-[#475569] shrink-0"
                    [class.bg-blue-600]="answers[currentQuestion.id] === opt.key"
                    [class.text-white]="answers[currentQuestion.id] === opt.key">
                {{ opt.key }}
              </span>
              <span class="text-sm text-[#0B1F44]">{{ opt.text }}</span>
            </label>
          </div>

          <!-- Descriptive Textarea -->
          <div *ngIf="currentQuestion.type === 'DESCRIPTIVE'" class="space-y-2">
            <label class="form-label text-xs">Your Answer / Explanation:</label>
            <textarea
              [ngModel]="answers[currentQuestion.id]"
              (ngModelChange)="onSelectAnswer(currentQuestion.id, $event)"
              placeholder="Write your explanation or code solution..."
              rows="6"
              class="form-textarea w-full text-sm font-mono"
            ></textarea>
          </div>

          <!-- Bottom Actions (Previous, Next / Submit Quiz) -->
          <div class="pt-6 border-t border-[#E5EAF2] flex items-center justify-between">
            <button
              type="button"
              (click)="onPrevious()"
              [disabled]="currentIndex === 0"
              class="btn btn-outline text-xs font-semibold px-5">
              Previous
            </button>

            <button
              *ngIf="currentIndex < questions.length - 1"
              type="button"
              (click)="onNext()"
              class="btn btn-primary text-xs font-semibold px-6">
              Next
            </button>

            <button
              *ngIf="currentIndex === questions.length - 1"
              type="button"
              (click)="promptSubmit()"
              class="btn btn-primary text-xs font-semibold px-6 shadow-sm">
              Submit Quiz
            </button>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isConfirmOpen"
        title="Submit Quiz Attempt"
        [message]="confirmMessage"
        confirmLabel="Yes, Submit"
        cancelLabel="Continue Quiz"
        (confirm)="submitQuiz()"
        (cancel)="isConfirmOpen = false">
      </app-confirm-modal>
    </div>
  `
})
export class QuizAttemptComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quizService = inject(QuizService);
  private assignmentService = inject(AssignmentService);
  private toastService = inject(ToastService);

  assignmentId!: number;
  assignment: Assignment | null = null;
  questions: Quiz[] = [];
  currentIndex = 0;
  answers: Record<number, string> = {};

  loading = true;
  error: string | null = null;
  submitted = false;
  isConfirmOpen = false;
  isSubmitting = false;
  confirmMessage = '';

  timeLeft = 1800; // seconds
  private timerInterval: any = null;

  get currentQuestion(): Quiz {
    return this.questions[this.currentIndex];
  }

  get answeredCount(): number {
    return Object.values(this.answers).filter(a => a && a.trim().length > 0).length;
  }

  get formattedTime(): string {
    const hrs = Math.floor(this.timeLeft / 3600);
    const mins = Math.floor((this.timeLeft % 3600) / 60);
    const secs = this.timeLeft % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  ngOnInit(): void {
    this.assignmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadQuiz();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  loadQuiz(): void {
    this.loading = true;
    this.error = null;

    this.assignmentService.getAssignmentById(this.assignmentId).subscribe({
      next: (a) => {
        this.assignment = a;
        if (!a.isOpen) {
          this.loading = false;
          this.error = 'This quiz is closed.';
          return;
        }

        const durationMinutes = a.quizTimeLimitMinutes || 30;
        this.quizService.getQuizzesForAssignment(this.assignmentId).subscribe({
          next: (qs: Quiz[]) => {
            this.loading = false;
            if (qs.length === 0) {
              this.error = 'No questions available for this assignment quiz.';
              return;
            }
            this.questions = qs;
            this.initSession(durationMinutes);
          },
          error: () => {
            this.loading = false;
            this.error = 'Failed to load quiz questions. The assignment may be closed.';
          }
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'Assignment not found or you do not have access.';
      }
    });
  }

  private initSession(durationMinutes: number): void {
    const sessionKey = `labflow_quiz_${this.assignmentId}`;
    const saved = sessionStorage.getItem(sessionKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.answers = parsed.answers || {};
        this.timeLeft = parsed.timeLeft !== undefined ? parsed.timeLeft : durationMinutes * 60;
      } catch {
        this.timeLeft = durationMinutes * 60;
      }
    } else {
      this.timeLeft = durationMinutes * 60;
    }

    this.startTimer();
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.saveSession();
      } else {
        this.stopTimer();
        this.toastService.warning('Time limit reached! Submitting quiz automatically.', 'Time Expired');
        this.submitQuiz();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private saveSession(): void {
    const sessionKey = `labflow_quiz_${this.assignmentId}`;
    sessionStorage.setItem(sessionKey, JSON.stringify({
      answers: this.answers,
      timeLeft: this.timeLeft
    }));
  }

  getOptions(q: Quiz): { key: string; text: string }[] {
    const opts: { key: string; text: string }[] = [];
    if (q.optionA) opts.push({ key: 'A', text: q.optionA });
    if (q.optionB) opts.push({ key: 'B', text: q.optionB });
    if (q.optionC) opts.push({ key: 'C', text: q.optionC });
    if (q.optionD) opts.push({ key: 'D', text: q.optionD });
    return opts;
  }

  isAnswered(quizId: number): boolean {
    return !!(this.answers[quizId] && this.answers[quizId].trim().length > 0);
  }

  onSelectAnswer(quizId: number, ans: string): void {
    this.answers[quizId] = ans;
    this.saveSession();
  }

  onNext(): void {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
    }
  }

  onPrevious(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  promptSubmit(): void {
    const unanswered = this.questions.length - this.answeredCount;
    if (unanswered > 0) {
      this.confirmMessage = `You have ${unanswered} unanswered question(s). Are you sure you want to submit your quiz?`;
    } else {
      this.confirmMessage = `You have answered all ${this.questions.length} questions. Submit your attempt?`;
    }
    this.isConfirmOpen = true;
  }

  submitQuiz(): void {
    if (this.isSubmitting || this.submitted) return;
    this.isConfirmOpen = false;

    // The backend rejects blank answers, so only send the questions that were answered.
    const submissions: QuizAnswerSubmission[] = this.questions
      .filter(q => this.isAnswered(q.id))
      .map(q => ({ quizId: q.id, answer: this.answers[q.id].trim() }));

    if (submissions.length === 0) {
      if (this.timeLeft <= 0) {
        // Time is up and nothing was answered: nothing to send.
        this.stopTimer();
        this.submitted = true;
        sessionStorage.removeItem(`labflow_quiz_${this.assignmentId}`);
      } else {
        this.toastService.warning('Answer at least one question before submitting.', 'Nothing to Submit');
      }
      return;
    }

    this.stopTimer();
    this.isSubmitting = true;

    this.quizService.submitQuizAnswers(this.assignmentId, submissions).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitted = true;
        sessionStorage.removeItem(`labflow_quiz_${this.assignmentId}`);
        this.toastService.success('Quiz answers submitted successfully!', 'Quiz Completed');
      },
      error: (err) => {
        this.isSubmitting = false;
        if (this.timeLeft > 0) this.startTimer();
        this.toastService.error(err.error?.message || 'Failed to submit quiz. Please try again.', 'Error');
      }
    });
  }
}
