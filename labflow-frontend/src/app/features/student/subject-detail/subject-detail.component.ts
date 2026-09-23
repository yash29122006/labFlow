import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SubjectService } from '../../../core/services/subject.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { SubmissionService } from '../../../core/services/submission.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { Subject } from '../../../core/models/subject.models';
import { Assignment } from '../../../core/models/assignment.models';
import { Submission } from '../../../core/models/submission.models';
import { EvaluationResponse } from '../../../core/models/evaluation.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { getErrorMessage } from '../../../core/utils/error-handler.util';

@Component({
  selector: 'app-student-subject-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonLoaderComponent],
  template: `
    <div class="space-y-5">
      <!-- Breadcrumb Navigation & Subject Header -->
      <div>
        <nav class="flex items-center gap-2 text-xs text-stone mb-2 font-mono" aria-label="Breadcrumb">
          <a routerLink="/student/subjects" class="hover:text-pine hover:underline">My Subjects</a>
          <span>/</span>
          <span class="text-ink font-semibold">{{ subject?.code || 'Subject #' + subjectId }}</span>
          @if (subject?.name) {
            <span>/</span>
            <span class="text-stone truncate max-w-xs">{{ subject?.name }}</span>
          }
        </nav>

        <div class="bg-white border border-stone-border rounded-lg p-5 shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-bold text-pine bg-paper px-2 py-0.5 rounded border border-stone-border">
                  {{ subject?.code }}
                </span>
                <h1 class="text-base font-bold text-ink tracking-tight">{{ subject?.name || 'Subject' }}</h1>
              </div>
              <p class="text-xs text-stone mt-1">
                Department: {{ subject?.department }} &bull; Year {{ subject?.academicYear }} &bull; Semester {{ subject?.semester }}
              </p>
            </div>

            <div class="text-xs font-mono text-stone">
              {{ assignments.length }} Lab Assignment{{ assignments.length === 1 ? '' : 's' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="bg-white border border-stone-border rounded-lg p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="relative w-full sm:w-72">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search lab assignments..."
            class="form-input pl-8 text-xs"
          />
          <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone text-xs">🔍</span>
          @if (searchQuery) {
            <button 
              type="button" 
              (click)="searchQuery = ''" 
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone hover:text-ink text-xs font-bold"
            >
              &times;
            </button>
          }
        </div>

        <div class="flex items-center gap-2 self-end sm:self-center">
          <select [(ngModel)]="statusFilter" class="form-input py-1 text-xs w-auto">
            <option value="ALL">All Assignments ({{ assignments.length }})</option>
            <option value="OPEN">Open for Submission</option>
            <option value="SUBMITTED">My Submitted</option>
            <option value="GRADED">Graded & Published</option>
          </select>
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
          <button (click)="loadData()" class="btn-secondary text-[11px]">Retry</button>
        </div>
      }

      <!-- Empty State -->
      @else if (assignments.length === 0) {
        <div class="bg-white border border-stone-border rounded-lg p-8 text-center">
          <div class="text-2xl mb-2">📝</div>
          <h3 class="text-sm font-semibold text-ink">No assignments yet</h3>
          <p class="text-xs text-stone mt-1 max-w-sm mx-auto">
            Your faculty hasn't opened any assignments for this subject yet.
          </p>
        </div>
      }

      <!-- Filtered Empty State -->
      @else if (filteredAssignments.length === 0) {
        <div class="bg-white border border-stone-border rounded-lg p-8 text-center text-xs text-stone">
          No assignments matching "<span class="font-semibold text-ink">{{ searchQuery }}</span>".
          <div class="mt-3">
            <button (click)="searchQuery = ''; statusFilter = 'ALL'" class="btn-secondary text-[11px]">Clear Filters</button>
          </div>
        </div>
      }

      <!-- Dense Assignments List -->
      @else {
        <div class="space-y-3">
          @for (assignment of filteredAssignments; track assignment.id) {
            @let sub = getSubmissionForAssignment(assignment.id);
            @let evalResult = getEvaluationForAssignment(assignment.id);

            <div 
              class="bg-white border border-stone-border rounded-lg p-4 transition-all duration-150 shadow-xs hover:border-pine/60"
              [ngClass]="{
                'status-bar-published': evalResult?.published,
                'status-bar-draft': sub && !evalResult?.published,
                'status-bar-open': !sub && assignment.isOpen,
                'status-bar-closed': !sub && !assignment.isOpen
              }"
            >
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div class="space-y-1 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="text-sm font-semibold text-ink">{{ assignment.title }}</h3>
                    
                    <!-- Status Badges -->
                    <span 
                      class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                      [ngClass]="assignment.isOpen ? 'badge-open' : 'badge-closed'"
                    >
                      {{ assignment.isOpen ? 'OPEN' : 'CLOSED' }}
                    </span>

                    @if (evalResult?.published) {
                      <span class="badge-published text-[10px]">
                        GRADED: {{ evalResult?.totalMarks }}/100
                      </span>
                    } @else if (sub) {
                      <span class="badge-draft text-[10px]">
                        SUBMITTED (Awaiting Grade)
                      </span>
                    }
                  </div>

                  <p class="text-xs text-stone line-clamp-2">{{ assignment.description }}</p>
                </div>

                <div class="shrink-0">
                  <a 
                    [routerLink]="['/student/assignments', assignment.id]" 
                    class="btn-primary py-1.5 px-3 text-xs"
                  >
                    @if (evalResult?.published) {
                      View Results &rarr;
                    } @else if (sub) {
                      View Submitted Code &rarr;
                    } @else if (assignment.isOpen) {
                      Open Workspace & Code &rarr;
                    } @else {
                      View Closed Assignment &rarr;
                    }
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class StudentSubjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private subjectService = inject(SubjectService);
  private assignmentService = inject(AssignmentService);
  private submissionService = inject(SubmissionService);
  private evaluationService = inject(EvaluationService);

  @Input() subjectId?: string;

  numSubjectId = 0;
  subject: Subject | null = null;
  assignments: Assignment[] = [];
  mySubmissions: Submission[] = [];
  myEvaluations: EvaluationResponse[] = [];

  searchQuery = '';
  statusFilter: 'ALL' | 'OPEN' | 'SUBMITTED' | 'GRADED' = 'ALL';

  loading = true;
  loadError: string | null = null;

  get filteredAssignments(): Assignment[] {
    return this.assignments.filter(a => {
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim();
        const matchesTitle = a.title && a.title.toLowerCase().includes(q);
        const matchesDesc = a.description && a.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      const sub = this.getSubmissionForAssignment(a.id);
      const evalItem = this.getEvaluationForAssignment(a.id);

      if (this.statusFilter === 'OPEN' && (!a.isOpen || sub)) return false;
      if (this.statusFilter === 'SUBMITTED' && !sub) return false;
      if (this.statusFilter === 'GRADED' && (!evalItem || !evalItem.published)) return false;

      return true;
    });
  }

  ngOnInit(): void {
    const rawId = this.subjectId || this.route.snapshot.paramMap.get('subjectId');
    this.numSubjectId = Number(rawId);
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.loadError = null;

    forkJoin({
      subject: this.subjectService.getSubjectById(this.numSubjectId),
      assignments: this.assignmentService.getAssignmentsBySubject(this.numSubjectId),
      submissions: this.submissionService.getMySubmissions(),
      evaluations: this.evaluationService.getMyEvaluations()
    }).subscribe({
      next: (res) => {
        this.subject = res.subject;
        this.assignments = res.assignments;
        this.mySubmissions = res.submissions;
        this.myEvaluations = res.evaluations;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.loadError = getErrorMessage(err, "Failed to load subject assignments.");
      }
    });
  }

  getSubmissionForAssignment(assignmentId: number): Submission | undefined {
    return this.mySubmissions.find(s => s.assignmentId === assignmentId);
  }

  getEvaluationForAssignment(assignmentId: number): EvaluationResponse | undefined {
    return this.myEvaluations.find(e => e.assignmentId === assignmentId);
  }
}
