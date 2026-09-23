import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { features } from '../../core/config/features';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastContainerComponent],
  template: `
    <div class="min-h-screen bg-[#F5F7FB] flex font-sans text-[#0B1F44]">
      <!-- Desktop Dark Sidebar (approx 220px, #0B1F44) -->
      <aside class="hidden lg:flex w-[230px] bg-[#0B1F44] flex-col shrink-0 text-white min-h-screen sticky top-0 h-screen z-30 shadow-md">
        <!-- Logo -->
        <div class="h-16 px-6 flex items-center gap-2.5 border-b border-[#1A3160]/60 shrink-0">
          <svg class="w-6 h-6 text-[#60A5FA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/>
            <path d="M8.5 2h7"/>
            <path d="M7 16h10"/>
          </svg>
          <span class="font-bold text-lg tracking-tight text-white">LabFlow</span>
        </div>

        <!-- Navigation items per role -->
        <div class="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <ng-container *ngTemplateOutlet="navLinks"></ng-container>
        </div>

        <!-- Sidebar footer status -->
        <div class="p-4 border-t border-[#1A3160]/60 bg-[#071530] text-[11px] text-[#94A3B8]">
          <div class="font-medium text-white/90 truncate">{{ authService.currentUser()?.name || authService.currentUser()?.uid }}</div>
          <div class="text-[10px] text-[#64748B] uppercase tracking-wider font-mono">{{ authService.role() }} PORTAL</div>
        </div>
      </aside>

      <!-- Mobile Off-Canvas Drawer (<1024px) -->
      <div *ngIf="isMobileMenuOpen" class="fixed inset-0 z-50 lg:hidden flex">
        <!-- Backdrop -->
        <div (click)="isMobileMenuOpen = false" class="fixed inset-0 bg-[#0B1F44]/60 backdrop-blur-sm transition-opacity"></div>

        <!-- Drawer Body -->
        <div class="relative w-[240px] bg-[#0B1F44] flex flex-col z-10 shadow-2xl h-full text-white">
          <div class="h-16 px-5 flex items-center justify-between border-b border-[#1A3160]">
            <div class="flex items-center gap-2">
              <svg class="w-6 h-6 text-[#60A5FA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/>
                <path d="M8.5 2h7"/>
                <path d="M7 16h10"/>
              </svg>
              <span class="font-bold text-lg text-white">LabFlow</span>
            </div>
            <button (click)="isMobileMenuOpen = false" class="p-1 rounded text-[#94A3B8] hover:text-white text-lg">&times;</button>
          </div>
          <div class="flex-1 px-3 py-4 overflow-y-auto space-y-1">
            <ng-container *ngTemplateOutlet="navLinks"></ng-container>
          </div>
        </div>
      </div>

      <!-- Shared Nav Links Template -->
      <ng-template #navLinks>
        <!-- STUDENT NAVIGATION -->
        <ng-container *ngIf="authService.isStudent()">
          <a routerLink="/student/dashboard" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="/student/subjects" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            <span>Subjects</span>
          </a>
          <a routerLink="/student/assignments" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            <span>Assignments</span>
          </a>
          <a routerLink="/student/quizzes" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Quizzes</span>
          </a>
          <a routerLink="/student/submissions" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
            <span>My Submissions</span>
          </a>
          <a routerLink="/student/results" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <span>My Results</span>
          </a>
        </ng-container>

        <!-- FACULTY NAVIGATION -->
        <ng-container *ngIf="authService.isFaculty()">
          <a routerLink="/faculty/dashboard" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="/faculty/subjects" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            <span>Subjects</span>
          </a>
          <a routerLink="/faculty/assignments" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            <span>Assignments</span>
          </a>
          <a routerLink="/faculty/quizzes" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Quizzes</span>
          </a>
          <a routerLink="/faculty/submissions" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
            <span>Submissions</span>
          </a>
          <a routerLink="/faculty/evaluations" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            <span>Evaluations</span>
          </a>
          <a *ngIf="flags.facultyStudents" routerLink="/faculty/students" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span>My Students</span>
          </a>
        </ng-container>

        <!-- ADMIN NAVIGATION -->
        <ng-container *ngIf="authService.isAdmin()">
          <a routerLink="/admin/dashboard" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="/admin/subjects" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            <span>Manage Subjects</span>
          </a>
          <a routerLink="/admin/faculty" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <span>Manage Faculty</span>
          </a>
          <a *ngIf="flags.studentsAdmin" routerLink="/admin/students" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span>Manage Students</span>
          </a>
          <a routerLink="/admin/users" (click)="isMobileMenuOpen = false" routerLinkActive="active-nav" class="nav-item">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span>System Users</span>
          </a>
        </ng-container>
      </ng-template>

      <!-- Main Layout Right Column -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Topbar (56px, white, bottom border) -->
        <header class="h-14 bg-white border-b border-[#E5EAF2] px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <div class="flex items-center gap-3">
            <!-- Mobile Hamburger -->
            <button
              (click)="isMobileMenuOpen = true"
              class="lg:hidden p-2 rounded-lg text-[#475569] hover:bg-[#F1F5F9] focus:outline-none"
              aria-label="Open navigation menu">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span class="text-xs font-semibold text-[#64748B] hidden sm:inline">
              Academic Year 2026–2027
            </span>
          </div>

          <!-- User Identity Dropdown -->
          <div class="relative">
            <button
              (click)="isProfileMenuOpen = !isProfileMenuOpen"
              class="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-[#F1F5F9] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <!-- Avatar -->
              <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {{ getUserInitials(authService.currentUser()?.name || authService.currentUser()?.uid || 'User') }}
              </div>
              <!-- Role Badge -->
              <span class="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF1FF] text-blue-700 border border-blue-200 capitalize">
                {{ authService.role()?.toLowerCase() || 'Role' }}
              </span>
              <svg class="w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>

            <!-- Dropdown Menu -->
            <div
              *ngIf="isProfileMenuOpen"
              (click)="isProfileMenuOpen = false"
              class="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#E5EAF2] shadow-xl py-2 z-50 animate-fade-in">
              <div class="px-4 py-2 border-b border-[#E5EAF2]">
                <div class="text-sm font-bold text-[#0B1F44] truncate">{{ authService.currentUser()?.name || authService.currentUser()?.uid }}</div>
                <div class="text-xs text-[#64748B] truncate">{{ authService.currentUser()?.email || authService.currentUser()?.uid }}</div>
                <div class="mt-1.5 text-[11px] font-mono text-blue-600 font-semibold uppercase">{{ authService.role() }}</div>
              </div>
              <button
                (click)="logout()"
                class="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Main Content (24–32px padding, max-width ~1200px) -->
        <main class="flex-1 p-6 md:p-8 max-w-[1280px] w-full mx-auto overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Toast Container -->
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 14px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 500;
      color: #94A3B8;
      transition: all 150ms ease;
    }
    .nav-item:hover {
      background-color: #12295A;
      color: #FFFFFF;
    }
    .active-nav {
      background-color: #1E4DB7 !important;
      color: #FFFFFF !important;
      font-weight: 600;
    }
  `]
})
export class AppShellComponent {
  authService = inject(AuthService);
  flags = features;
  isMobileMenuOpen = false;
  isProfileMenuOpen = false;

  getUserInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
