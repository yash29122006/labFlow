import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AssignmentService } from '../../../core/services/assignment.service';
import { SubjectService } from '../../../core/services/subject.service';
import { QuizService } from '../../../core/services/quiz.service';
import { Assignment } from '../../../core/models/assignment.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

interface QuizRow {
  assignmentId: number;
  title: string;
  subjectName: string;
  timeLimit: number;
  questionCount: number;
}

@Component({
  selector: 'app-student-quizzes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonLoaderComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-[#0B1F44]">Quizzes</h1>
        <p class="text-xs text-[#64748B]">Attempt quizzes for your subjects and evaluate your concept readiness.</p>
      </div>

      <!-- Quizzes Table Card (Screen 11) -->
      <div class="bg-white rounded-xl border border-[#E5EAF2] shadow-sm overflow-hidden">
        <!-- Loading State -->
        <div *ngIf="loading" class="p-6">
          <app-skeleton-loader [rows]="4"></app-skeleton-loader>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && error" class="p-6 text-center text-xs text-red-600">
          {{ error }}
          <button (click)="loadQuizzes()" class="btn btn-outline btn-sm ml-3">Retry</button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && quizRows.length === 0" class="p-12 text-center space-y-2">
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl">
            ⏱️
          </div>
          <div class="text-sm font-bold text-[#0B1F44]">No active quizzes available</div>
          <p class="text-xs text-[#64748B]">There are no quiz questionnaires attached to your current open assignments.</p>
        </div>

        <!-- Table View -->
        <div *ngIf="!loading && !error && quizRows.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold text-[11px] uppercase tracking-wider">
                <th class="py-3.5 px-4 w-12 text-center">#</th>
                <th class="py-3.5 px-4">Title</th>
                <th class="py-3.5 px-4">Subject</th>
                <th class="py-3.5 px-4 text-center">Time</th>
                <th class="py-3.5 px-4 text-center">Questions</th>
                <th class="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let q of quizRows; let idx = index" class="hover:bg-[#F8FAFC] transition-colors">
                <td class="py-3.5 px-4 text-center font-mono text-[#94A3B8]">{{ idx + 1 }}</td>
                <td class="py-3.5 px-4 font-semibold text-[#0B1F44]">
                  <a [routerLink]="['/student/quizzes', q.assignmentId, 'attempt']" class="hover:text-blue-600 transition-colors">
                    {{ q.title }}
                  </a>
                </td>
                <td class="py-3.5 px-4 text-[#475569]">{{ q.subjectName }}</td>
                <td class="py-3.5 px-4 text-center font-mono text-[#64748B]">
                  {{ q.timeLimit }} mins
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 font-mono">
                    {{ q.questionCount }} Qs
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <a [routerLink]="['/student/quizzes', q.assignmentId, 'attempt']" class="btn btn-primary btn-sm">
                    Start
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
export class StudentQuizzesListComponent implements OnInit {
  private assignmentService = inject(AssignmentService);
  private subjectService = inject(SubjectService);
  private quizService = inject(QuizService);

  quizRows: QuizRow[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      subjects: this.subjectService.getMySubjects().pipe(catchError(() => of([]))),
      assignments: this.assignmentService.getAllAssignments().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ subjects, assignments }) => {
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
            this.fetchQuestionCounts(assignments, assignmentSubjectMap);
          });
        } else {
          this.fetchQuestionCounts(assignments, assignmentSubjectMap);
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load quizzes. Please try again.';
      }
    });
  }

  private fetchQuestionCounts(assignments: Assignment[], subjectMap: Map<number, string>): void {
    if (assignments.length === 0) {
      this.quizRows = [];
      this.loading = false;
      return;
    }

    const quizRequests = assignments.map(a =>
      this.quizService.getQuizzesForAssignment(a.id).pipe(catchError(() => of([])))
    );

    forkJoin(quizRequests).subscribe(results => {
      const rows: QuizRow[] = [];
      results.forEach((questions, idx) => {
        if (questions.length > 0) {
          const a = assignments[idx];
          rows.push({
            assignmentId: a.id,
            title: a.title,
            subjectName: subjectMap.get(a.id) || 'General Lab',
            timeLimit: a.quizTimeLimitMinutes || 30,
            questionCount: questions.length
          });
        }
      });
      this.quizRows = rows;
      this.loading = false;
    });
  }
}
