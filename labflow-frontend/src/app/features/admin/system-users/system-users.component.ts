import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from '../../../core/services/admin.service';
import { UserResponse } from '../../../core/models/auth.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { DEPARTMENTS } from '../../../core/config/departments';

@Component({
  selector: 'app-system-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonLoaderComponent],
  template: `
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#0B1F44]">System Users Directory</h1>
          <p class="text-xs text-[#64748B] mt-0.5">Comprehensive audit directory of all registered student and faculty user credentials</p>
        </div>
      </div>

      <!-- Underline Filter Tabs: All Users | Faculty | Students -->
      <div class="flex border-b border-[#E5EAF2] text-sm font-semibold">
        <button
          type="button"
          (click)="selectedTab = 'ALL'; currentPage = 1"
          [class.text-blue-600]="selectedTab === 'ALL'"
          [class.border-b-2]="selectedTab === 'ALL'"
          [class.border-blue-600]="selectedTab === 'ALL'"
          class="px-5 py-3 hover:text-blue-600 transition-colors">
          All Users ({{ allUsers.length }})
        </button>
        <button
          type="button"
          (click)="selectedTab = 'FACULTY'; currentPage = 1"
          [class.text-blue-600]="selectedTab === 'FACULTY'"
          [class.border-b-2]="selectedTab === 'FACULTY'"
          [class.border-blue-600]="selectedTab === 'FACULTY'"
          class="px-5 py-3 hover:text-blue-600 transition-colors">
          Faculty Instructors ({{ facultyList.length }})
        </button>
        <button
          type="button"
          (click)="selectedTab = 'STUDENT'; currentPage = 1"
          [class.text-blue-600]="selectedTab === 'STUDENT'"
          [class.border-b-2]="selectedTab === 'STUDENT'"
          [class.border-blue-600]="selectedTab === 'STUDENT'"
          class="px-5 py-3 hover:text-blue-600 transition-colors">
          Students ({{ studentList.length }})
        </button>
      </div>

      <!-- Filters Row -->
      <div class="card p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        <div class="relative w-full md:w-80">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="currentPage = 1"
            placeholder="Search by name, email, or UID..."
            class="form-input text-xs pl-8 pr-3 py-2"
          />
          <svg class="w-4 h-4 text-[#94A3B8] absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto">
          <select
            [(ngModel)]="selectedDepartment"
            (change)="currentPage = 1"
            class="form-select text-xs w-48">
            <option value="">All Departments</option>
            <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="card p-6">
        <app-skeleton-loader [rows]="6"></app-skeleton-loader>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredUsers.length === 0" class="card p-12 text-center">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl mb-3">
          👥
        </div>
        <h3 class="text-sm font-bold text-[#0B1F44]">No Users Found</h3>
        <p class="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
          No system users match the current search filters.
        </p>
      </div>

      <!-- Users Table Card -->
      <div *ngIf="!loading && filteredUsers.length > 0" class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4">Identifier / UID</th>
                <th class="py-3 px-4">Name</th>
                <th class="py-3 px-4">Role</th>
                <th class="py-3 px-4">Email Address</th>
                <th class="py-3 px-4">Department</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let u of paginatedUsers" class="hover:bg-[#F8FAFC]/80 transition-colors">
                <!-- UID -->
                <td class="py-3.5 px-4 font-mono font-bold text-blue-600">
                  {{ u.uid || 'ID #' + u.id }}
                </td>

                <!-- Name -->
                <td class="py-3.5 px-4 font-bold text-[#0B1F44]">
                  {{ u.name }}
                </td>

                <!-- Role -->
                <td class="py-3.5 px-4">
                  <span
                    class="badge"
                    [ngClass]="u.role === 'FACULTY' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-blue-50 text-blue-700 border-blue-200'">
                    {{ u.role }}
                  </span>
                </td>

                <!-- Email -->
                <td class="py-3.5 px-4 font-mono text-[#64748B]">
                  {{ u.email }}
                </td>

                <!-- Department -->
                <td class="py-3.5 px-4 text-[#0B1F44]">
                  {{ u.department || 'General' }}
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4 text-center">
                  <span
                    class="badge"
                    [ngClass]="u.active !== false ? 'badge-evaluated' : 'badge-not-started'">
                    {{ u.active !== false ? 'ACTIVE' : 'INACTIVE' }}
                  </span>
                </td>

                <!-- Action -->
                <td class="py-3.5 px-4 text-right">
                  <a
                    [routerLink]="u.role === 'FACULTY' ? '/admin/faculty' : '/admin/students'"
                    class="btn btn-outline btn-sm text-[11px] text-blue-600 border-blue-200 hover:bg-blue-50">
                    Manage &rarr;
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages > 1" class="p-4 border-t border-[#E5EAF2] flex items-center justify-between text-xs text-[#64748B]">
          <div>
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredUsers.length) }} of {{ filteredUsers.length }} users
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
export class SystemUsersComponent implements OnInit {
  private adminService = inject(AdminService);

  facultyList: UserResponse[] = [];
  studentList: UserResponse[] = [];
  allUsers: UserResponse[] = [];
  loading = true;

  selectedTab: 'ALL' | 'FACULTY' | 'STUDENT' = 'ALL';
  searchQuery = '';
  selectedDepartment = '';

  departments = DEPARTMENTS;

  currentPage = 1;
  pageSize = 10;
  Math = Math;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      faculty: this.adminService.getAllFaculty().pipe(catchError(() => of([]))),
      students: this.adminService.getAllStudents().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ faculty, students }) => {
        this.facultyList = faculty;
        this.studentList = students;
        this.allUsers = [...faculty, ...students];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredUsers(): UserResponse[] {
    let pool = this.allUsers;
    if (this.selectedTab === 'FACULTY') pool = this.facultyList;
    if (this.selectedTab === 'STUDENT') pool = this.studentList;

    return pool.filter(u => {
      if (this.selectedDepartment && u.department !== this.selectedDepartment) {
        return false;
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        const nameMatch = u.name?.toLowerCase().includes(q);
        const uidMatch = u.uid?.toLowerCase().includes(q);
        const emailMatch = u.email?.toLowerCase().includes(q);
        if (!nameMatch && !uidMatch && !emailMatch) return false;
      }
      return true;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
  }

  get paginatedUsers(): UserResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }
}
