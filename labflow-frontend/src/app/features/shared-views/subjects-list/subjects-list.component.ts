import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SubjectService } from '../../../core/services/subject.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subject } from '../../../core/models/subject.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { SEMESTERS } from '../../../shared/constants/departments';

@Component({
  selector: 'app-subjects-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonLoaderComponent],
  template: `
    <div class="space-y-6">
      <!-- Header with Title & Filter Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#0B1F44]">Subjects</h1>
          <p class="text-xs text-[#64748B]">Browse all available curriculum subjects for your program.</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Semester Filter Dropdown -->
          <select
            [(ngModel)]="selectedSemester"
            class="form-select text-xs py-1.5 px-3 h-9 w-36 bg-white border-[#E5EAF2] rounded-lg">
            <option value="">All Semesters</option>
            <option *ngFor="let sem of semesters" [value]="sem">Semester {{ sem }}</option>
          </select>

          <!-- Search Input -->
          <div class="relative w-full sm:w-56">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search subjects..."
              class="form-input text-xs py-1.5 pl-8 h-9 rounded-lg"
            />
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-xs">🔍</span>
          </div>
        </div>
      </div>

      <!-- Subjects Table Card -->
      <div class="bg-white rounded-xl border border-[#E5EAF2] shadow-sm overflow-hidden">
        <!-- Loading State -->
        <div *ngIf="loading" class="p-6">
          <app-skeleton-loader [rows]="5"></app-skeleton-loader>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && error" class="p-6 text-center text-xs text-red-600">
          {{ error }}
          <button (click)="loadSubjects()" class="btn btn-outline btn-sm ml-3">Retry</button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && filteredSubjects.length === 0" class="p-12 text-center space-y-2">
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl">
            📚
          </div>
          <div class="text-sm font-bold text-[#0B1F44]">No subjects found</div>
          <p class="text-xs text-[#64748B]">
            {{ searchQuery || selectedSemester ? 'No subjects match your search and filter criteria.' : 'No subjects have been registered for your department.' }}
          </p>
        </div>

        <!-- Table View -->
        <div *ngIf="!loading && !error && filteredSubjects.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold text-[11px] uppercase tracking-wider">
                <th class="py-3.5 px-4 w-12 text-center">#</th>
                <th class="py-3.5 px-4">Subject Code</th>
                <th class="py-3.5 px-4">Subject Name</th>
                <th class="py-3.5 px-4">Department</th>
                <th class="py-3.5 px-4 text-center">Year</th>
                <th class="py-3.5 px-4 text-center">Semester</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let s of filteredSubjects; let idx = index" class="hover:bg-[#F8FAFC] transition-colors">
                <td class="py-3.5 px-4 text-center font-mono text-[#94A3B8]">{{ idx + 1 }}</td>
                <td class="py-3.5 px-4">
                  <span class="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {{ s.code }}
                  </span>
                </td>
                <td class="py-3.5 px-4 font-semibold text-[#0B1F44]">
                  <a *ngIf="authService.isStudent()" [routerLink]="['/student/subjects', s.id]" class="hover:text-blue-600 hover:underline">{{ s.name }}</a>
                  <span *ngIf="!authService.isStudent()">{{ s.name }}</span>
                </td>
                <td class="py-3.5 px-4 text-[#475569]">{{ s.department }}</td>
                <td class="py-3.5 px-4 text-center font-mono text-[#64748B]">{{ s.academicYear }}</td>
                <td class="py-3.5 px-4 text-center font-mono text-[#64748B]">{{ s.semester }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SubjectsListComponent implements OnInit {
  private subjectService = inject(SubjectService);
  authService = inject(AuthService);

  subjects: Subject[] = [];
  semesters = SEMESTERS;
  selectedSemester = '';
  searchQuery = '';
  loading = true;
  error: string | null = null;

  get filteredSubjects(): Subject[] {
    return this.subjects.filter(s => {
      const matchesSearch = !this.searchQuery ||
        s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesSem = !this.selectedSemester || s.semester.toString() === this.selectedSemester.toString();
      return matchesSearch && matchesSem;
    });
  }

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.loading = true;
    this.error = null;

    this.subjectService.getMySubjects().subscribe({
      next: (res) => {
        this.subjects = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load subjects. Please try again.';
      }
    });
  }
}
