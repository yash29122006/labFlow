import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { UserResponse } from '../../../core/models/auth.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { DEPARTMENTS, SEMESTERS } from '../../../core/config/departments';

@Component({
  selector: 'app-faculty-students',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonLoaderComponent],
  template: `
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#0B1F44]">My Enrolled Students</h1>
          <p class="text-xs text-[#64748B] mt-0.5">Students enrolled in lab courses and subjects assigned to your faculty profile</p>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="card p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        <!-- Search Input -->
        <div class="relative w-full md:w-80">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by student name, UID, or email..."
            class="form-input text-xs pl-8 pr-3 py-2"
          />
          <svg class="w-4 h-4 text-[#94A3B8] absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <!-- Filter Selects -->
        <div class="flex items-center gap-3 w-full md:w-auto">
          <!-- Department Filter -->
          <select
            [(ngModel)]="selectedDepartment"
            (change)="currentPage = 1"
            class="form-select text-xs w-48">
            <option value="">All Departments</option>
            <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
          </select>

          <!-- Semester Filter -->
          <select
            [(ngModel)]="selectedSemester"
            (change)="currentPage = 1"
            class="form-select text-xs w-36">
            <option [value]="0">All Semesters</option>
            <option *ngFor="let s of semesters" [value]="s">Semester {{ s }}</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="card p-6">
        <app-skeleton-loader [rows]="5"></app-skeleton-loader>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredStudents.length === 0" class="card p-12 text-center">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl mb-3">
          👥
        </div>
        <h3 class="text-sm font-bold text-[#0B1F44]">No Students Found</h3>
        <p class="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
          {{ searchQuery ? 'No students match your filter criteria.' : 'No students are currently enrolled in your assigned subjects.' }}
        </p>
      </div>

      <!-- Student Table Card -->
      <div *ngIf="!loading && filteredStudents.length > 0" class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4">UID</th>
                <th class="py-3 px-4">Student Name</th>
                <th class="py-3 px-4">Email</th>
                <th class="py-3 px-4">Department</th>
                <th class="py-3 px-4 text-center">Year</th>
                <th class="py-3 px-4 text-center">Semester</th>
                <th class="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let st of paginatedStudents" class="hover:bg-[#F8FAFC]/80 transition-colors">
                <!-- UID -->
                <td class="py-3.5 px-4 font-mono font-bold text-blue-600">
                  {{ st.uid || 'N/A' }}
                </td>

                <!-- Name -->
                <td class="py-3.5 px-4 font-bold text-[#0B1F44]">
                  {{ st.name }}
                </td>

                <!-- Email -->
                <td class="py-3.5 px-4 font-mono text-[#64748B]">
                  {{ st.email }}
                </td>

                <!-- Department -->
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                    {{ st.department || 'General' }}
                  </span>
                </td>

                <!-- Year -->
                <td class="py-3.5 px-4 text-center font-mono font-semibold text-[#0B1F44]">
                  {{ st.academicYear || st.year || '-' }}
                </td>

                <!-- Semester -->
                <td class="py-3.5 px-4 text-center font-mono font-semibold text-[#0B1F44]">
                  {{ st.semester ? 'Sem ' + st.semester : '-' }}
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4 text-right">
                  <span
                    class="badge"
                    [ngClass]="st.active !== false ? 'badge-evaluated' : 'badge-not-started'">
                    {{ st.active !== false ? 'ACTIVE' : 'INACTIVE' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages > 1" class="p-4 border-t border-[#E5EAF2] flex items-center justify-between text-xs text-[#64748B]">
          <div>
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredStudents.length) }} of {{ filteredStudents.length }} students
          </div>
          <div class="flex items-center gap-1.5">
            <button
              (click)="currentPage = currentPage - 1"
              [disabled]="currentPage === 1"
              class="btn btn-outline btn-sm px-2.5 py-1 disabled:opacity-40">
              Prev
            </button>
            <span class="px-2 font-mono font-bold text-[#0B1F44]">{{ currentPage }} / {{ totalPages }}</span>
            <button
              (click)="currentPage = currentPage + 1"
              [disabled]="currentPage === totalPages"
              class="btn btn-outline btn-sm px-2.5 py-1 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FacultyStudentsComponent implements OnInit {
  private adminService = inject(AdminService);

  students: UserResponse[] = [];
  loading = true;
  searchQuery = '';
  selectedDepartment = '';
  selectedSemester = 0;

  departments = DEPARTMENTS;
  semesters = SEMESTERS;

  currentPage = 1;
  pageSize = 10;
  Math = Math;

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.adminService.getFacultyStudents().subscribe({
      next: (students) => {
        this.students = students;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredStudents(): UserResponse[] {
    return this.students.filter(s => {
      if (this.selectedDepartment && s.department !== this.selectedDepartment) {
        return false;
      }
      if (this.selectedSemester && Number(this.selectedSemester) !== 0) {
        if (s.semester !== Number(this.selectedSemester)) return false;
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        const nameMatch = s.name?.toLowerCase().includes(q);
        const uidMatch = s.uid?.toLowerCase().includes(q);
        const emailMatch = s.email?.toLowerCase().includes(q);
        if (!nameMatch && !uidMatch && !emailMatch) return false;
      }
      return true;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredStudents.length / this.pageSize) || 1;
  }

  get paginatedStudents(): UserResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredStudents.slice(start, start + this.pageSize);
  }
}
