import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#F5F7FB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div class="inline-flex items-center gap-2 mb-4">
          <svg class="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.5 2h7"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 16h10"/>
          </svg>
          <span class="text-2xl font-bold tracking-tight text-[#0B1F44]">LabFlow</span>
        </div>
        <h2 class="text-xl font-bold text-[#0B1F44]">Password Reset Guidance</h2>
        <p class="mt-1 text-xs text-[#64748B]">Instructions for resetting university lab access credentials</p>
      </div>

      <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="card p-8 space-y-5">
          <div class="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800 space-y-2">
            <div class="font-bold flex items-center gap-1.5">
              <span>ℹ</span> Institutional Credential Policy
            </div>
            <p>
              To ensure academic integrity, LabFlow accounts are managed directly by departmental administrators and course coordinators.
            </p>
          </div>

          <div class="space-y-3 text-xs text-[#0B1F44]">
            <div class="font-semibold text-sm">How to reset your password:</div>
            <ol class="list-decimal list-inside space-y-2 text-[#64748B] pl-1">
              <li>Contact your assigned lab instructor or course faculty.</li>
              <li>Provide your official student UID / Roll number and college email.</li>
              <li>The department administrator will generate a temporary login key for your account.</li>
            </ol>
          </div>

          <div class="pt-4 border-t border-[#E5EAF2]">
            <a routerLink="/login" class="btn btn-primary w-full text-center text-xs font-semibold py-2.5">
              ← Return to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {}
