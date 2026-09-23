import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from '../../../core/services/admin.service';
import { SubjectService } from '../../../core/services/subject.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserResponse } from '../../../core/models/auth.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonLoaderComponent],
  template: `
    <div class="space-y-6">
      <!-- Welcome Header Banner -->
      <div class="bg-white rounded-2xl border border-[#E5EAF2] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-[#0B1F44]">Admin Control Center</h1>
            <span class="badge badge-evaluated">SUPERUSER</span>
          </div>
          <p class="text-xs text-[#64748B] mt-1">
            System administration, user access provisioning, department curriculum, and lab oversight
          </p>
        </div>

        <!-- Quick Action Shortcuts -->
        <div class="flex flex-wrap items-center gap-2">
          <a routerLink="/admin/faculty" class="btn btn-outline btn-sm font-semibold text-blue-600 border-blue-200 hover:bg-blue-50">
            + Add Faculty
          </a>
          <a routerLink="/admin/subjects" class="btn btn-outline btn-sm font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50">
            + Add Subject
          </a>
          <a routerLink="/admin/students" class="btn btn-primary btn-sm font-semibold shadow-sm">
            + Add Student
          </a>
        </div>
      </div>

      <!-- 4 Stat Metric Cards (Screen 8) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Active Subjects -->
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Active Subjects</span>
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              📚
            </div>
          </div>
          <div class="stat-value mt-2">
            @if (loading) { <span class="animate-pulse text-gray-300">--</span> } @else { {{ subjectCount }} }
          </div>
          <div class="mt-2 text-[11px] text-[#64748B] flex items-center justify-between">
            <span>Configured courses</span>
            <a routerLink="/admin/subjects" class="text-blue-600 font-semibold hover:underline">Manage &rarr;</a>
          </div>
        </div>

        <!-- Card 2: Faculty Accounts -->
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Faculty Accounts</span>
            <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              👥
            </div>
          </div>
          <div class="stat-value mt-2">
            @if (loading) { <span class="animate-pulse text-gray-300">--</span> } @else { {{ facultyCount }} }
          </div>
          <div class="mt-2 text-[11px] text-[#64748B] flex items-center justify-between">
            <span>Department instructors</span>
            <a routerLink="/admin/faculty" class="text-indigo-600 font-semibold hover:underline">Manage &rarr;</a>
          </div>
        </div>

        <!-- Card 3: Registered Students -->
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Registered Students</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              🎓
            </div>
          </div>
          <div class="stat-value mt-2">
            @if (loading) { <span class="animate-pulse text-gray-300">--</span> } @else { {{ studentCount }} }
          </div>
          <div class="mt-2 text-[11px] text-[#64748B] flex items-center justify-between">
            <span>Enrolled learners</span>
            <a routerLink="/admin/students" class="text-emerald-600 font-semibold hover:underline">Manage &rarr;</a>
          </div>
        </div>

        <!-- Card 4: Total Lab Assignments -->
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Total Assignments</span>
            <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
              📝
            </div>
          </div>
          <div class="stat-value mt-2">
            @if (loading) { <span class="animate-pulse text-gray-300">--</span> } @else { {{ assignmentCount }} }
          </div>
          <div class="mt-2 text-[11px] text-[#64748B] flex items-center justify-between">
            <span>Curriculum problems</span>
            <a routerLink="/admin/subjects" class="text-purple-600 font-semibold hover:underline">Browse &rarr;</a>
          </div>
        </div>
      </div>

      <!-- Recent Users Table (Screen 8) -->
      <div class="card overflow-hidden">
        <div class="p-4 border-b border-[#E5EAF2] flex items-center justify-between bg-white">
          <div>
            <h2 class="text-sm font-bold text-[#0B1F44]">Recent System Users</h2>
            <p class="text-[11px] text-[#64748B] mt-0.5">Newly provisioned student and faculty accounts</p>
          </div>
          <a routerLink="/admin/users" class="btn btn-outline btn-sm text-[11px] font-semibold text-blue-600 border-blue-200 hover:bg-blue-50">
            View All Users &rarr;
          </a>
        </div>

        <!-- Loading skeleton -->
        <div *ngIf="loading" class="p-6">
          <app-skeleton-loader [rows]="4"></app-skeleton-loader>
        </div>

        <!-- Users Table -->
        <div *ngIf="!loading" class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4">User</th>
                <th class="py-3 px-4">Role</th>
                <th class="py-3 px-4">Identifier / Email</th>
                <th class="py-3 px-4">Department</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5EAF2]">
              <tr *ngFor="let user of recentUsers" class="hover:bg-[#F8FAFC]/80 transition-colors">
                <!-- User Name -->
                <td class="py-3.5 px-4">
                  <div class="font-bold text-[#0B1F44]">{{ user.name }}</div>
                  <div *ngIf="user.uid" class="text-[10px] font-mono text-[#64748B]">UID: {{ user.uid }}</div>
                </td>

                <!-- Role Pill -->
                <td class="py-3.5 px-4">
                  <span
                    class="badge"
                    [ngClass]="user.role === 'FACULTY' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-blue-50 text-blue-700 border-blue-200'">
                    {{ user.role }}
                  </span>
                </td>

                <!-- Email -->
                <td class="py-3.5 px-4 font-mono text-[#64748B]">
                  {{ user.email }}
                </td>

                <!-- Department -->
                <td class="py-3.5 px-4 text-[#0B1F44]">
                  {{ user.department || 'Computer Science' }}
                </td>

                <!-- Status Badge -->
                <td class="py-3.5 px-4 text-center">
                  <span
                    class="badge"
                    [ngClass]="user.active !== false ? 'badge-evaluated' : 'badge-not-started'">
                    {{ user.active !== false ? 'ACTIVE' : 'INACTIVE' }}
                  </span>
                </td>

                <!-- Action Link -->
                <td class="py-3.5 px-4 text-right">
                  <a
                    [routerLink]="user.role === 'FACULTY' ? '/admin/faculty' : '/admin/students'"
                    class="text-blue-600 font-semibold hover:underline text-[11px]">
                    Manage &rarr;
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
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private subjectService = inject(SubjectService);
  private assignmentService = inject(AssignmentService);
  authService = inject(AuthService);

  loading = true;
  facultyCount = 0;
  studentCount = 0;
  subjectCount = 0;
  assignmentCount = 0;
  recentUsers: UserResponse[] = [];

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    forkJoin({
      faculty: this.adminService.getAllFaculty().pipe(catchError(() => of([]))),
      students: this.adminService.getAllStudents().pipe(catchError(() => of([]))),
      subjects: this.subjectService.getAllSubjects().pipe(catchError(() => of([]))),
      assignments: this.assignmentService.getAllAssignments().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ faculty, students, subjects, assignments }) => {
        this.facultyCount = faculty.length;
        this.studentCount = students.length;
        this.subjectCount = subjects.length;
        this.assignmentCount = assignments.length;

        // Combine latest faculty & students for recent users table
        const combined = [...faculty, ...students];
        this.recentUsers = combined.slice(0, 8);

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
