import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AssignmentService } from '../../../core/services/assignment.service';
import { SubjectService } from '../../../core/services/subject.service';
import { Assignment } from '../../../core/models/assignment.models';
import { Subject } from '../../../core/models/subject.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { getErrorMessage } from '../../../core/utils/error-handler.util';

/**
 * Read-only admin view of the assignments linked to a subject.
 * The backend only lets FACULTY create / edit / delete / open / close assignments
 * (admin has no faculty id), so those actions live on the faculty pages.
 */
@Component({
  selector: 'app-admin-assignment-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonLoaderComponent],
  template: `
    <div class="space-y-5">
      <div>
        <nav class="flex items-center gap-2 text-xs text-[#64748B] mb-2 font-mono" aria-label="Breadcrumb">
          <a routerLink="/admin/subjects" class="hover:text-blue-600 hover:underline">Subjects</a>
          <span>/</span>
          <span class="text-[#0B1F44] font-semibold">{{ subject?.code || 'Subject #' + numSubjectId }}</span>
          <span>/</span>
          <span>Assignments</span>
        </nav>

        <div class="pb-4 border-b border-[#E5EAF2]">
          <h1 class="text-lg font-bold text-[#0B1F44] tracking-tight">
            {{ subject ? subject.name + ' (' + subject.code + ')' : 'Subject Assignments' }}
          </h1>
          <p class="text-xs text-[#64748B] mt-0.5" *ngIf="subject">
            Department: {{ subject.department }} &bull; Year {{ subject.academicYear }} &bull; Semester {{ subject.semester }}
          </p>
        </div>
      </div>

      <div class="p-3 rounded-lg bg-[#EAF1FF] border border-blue-200 text-xs text-blue-800">
        Assignments are created and managed by the faculty assigned to this subject. This view is read-only.
      </div>

      <div class="card p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Search assignments by title..."
          class="form-input text-xs w-full md:w-72"
        />
        <div class="flex items-center gap-3 w-full md:w-auto">
          <select [(ngModel)]="statusFilter" class="form-select text-xs w-auto">
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open Only</option>
            <option value="CLOSED">Closed Only</option>
          </select>
          <span class="text-xs font-mono text-[#64748B]">
            Count: <span class="font-bold text-[#0B1F44]">{{ filteredAssignments.length }}</span>
          </span>
        </div>
      </div>

      @if (loading) {
        <app-skeleton-loader [rows]="5"></app-skeleton-loader>
      } @else if (loadError) {
        <div class="bg-[#FDECEC] border border-red-200 text-red-700 rounded-lg p-4 text-xs flex items-center justify-between">
          <span>⚠ {{ loadError }}</span>
          <button (click)="loadData()" class="btn btn-outline btn-sm">Retry</button>
        </div>
      } @else if (assignments.length === 0) {
        <div class="card p-10 text-center">
          <div class="text-2xl mb-2">📝</div>
          <h3 class="text-sm font-semibold text-[#0B1F44]">No assignments for this subject yet</h3>
          <p class="text-xs text-[#64748B] mt-1">Faculty can create assignments from their Assignments page.</p>
        </div>
      } @else if (filteredAssignments.length === 0) {
        <div class="card p-8 text-center text-xs text-[#64748B]">No assignments match your filters.</div>
      } @else {
        <div class="space-y-3">
          @for (a of filteredAssignments; track a.id) {
            <div class="card p-4" [ngClass]="a.isOpen ? 'status-bar-open' : 'status-bar-closed'">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-semibold text-[#0B1F44]">{{ a.title }}</h3>
                <span class="badge" [ngClass]="a.isOpen ? 'badge-open' : 'badge-closed'">{{ a.isOpen ? 'OPEN' : 'CLOSED' }}</span>
                <span class="text-[11px] font-mono text-[#64748B]">#{{ a.id }}</span>
              </div>
              <p class="text-xs text-[#64748B] mt-1 line-clamp-2">{{ a.description }}</p>
              <details *ngIf="a.details" class="mt-2 text-xs">
                <summary class="text-blue-600 font-medium cursor-pointer select-none">View Lab Details</summary>
                <div class="mt-2 space-y-2 text-[11px]">
                  <div><strong>1. AIM:</strong> {{ a.details?.aim }}</div>
                  <div><strong>2. THEORY:</strong> {{ a.details?.theory }}</div>
                  <div><strong>4. LEARNING OUTCOMES:</strong> {{ a.details?.learningOutcomes }}</div>
                  <div><strong>5. COURSE OUTCOMES:</strong> {{ a.details?.courseOutcomes }}</div>
                  <div><strong>6. CONCLUSION:</strong> {{ a.details?.conclusion }}</div>
                </div>
              </details>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AdminAssignmentManagementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private assignmentService = inject(AssignmentService);
  private subjectService = inject(SubjectService);

  @Input() id?: string;

  numSubjectId = 0;
  subject: Subject | null = null;
  assignments: Assignment[] = [];

  loading = true;
  loadError: string | null = null;

  searchQuery = '';
  statusFilter: 'ALL' | 'OPEN' | 'CLOSED' = 'ALL';

  get filteredAssignments(): Assignment[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.assignments.filter(a => {
      if (q && !(a.title || '').toLowerCase().includes(q) && !(a.description || '').toLowerCase().includes(q)) return false;
      if (this.statusFilter === 'OPEN' && !a.isOpen) return false;
      if (this.statusFilter === 'CLOSED' && a.isOpen) return false;
      return true;
    });
  }

  ngOnInit(): void {
    this.numSubjectId = Number(this.id || this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.loadError = null;

    forkJoin({
      subject: this.subjectService.getSubjectById(this.numSubjectId),
      assignments: this.assignmentService.getAssignmentsBySubject(this.numSubjectId)
    }).subscribe({
      next: (res) => {
        this.subject = res.subject;
        this.assignments = res.assignments;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.loadError = getErrorMessage(err, 'Failed to load subject assignments.');
      }
    });
  }
}
