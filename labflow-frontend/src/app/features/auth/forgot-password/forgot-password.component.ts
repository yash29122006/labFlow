import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#F5F7FB] flex flex-col justify-center items-center p-4">
      <div class="w-full max-w-[420px] bg-white rounded-2xl border border-[#E5EAF2] shadow-xl p-8 text-center space-y-6">
        <div class="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl">
          🔒
        </div>

        <div class="space-y-2">
          <h1 class="text-xl font-bold text-[#0B1F44]">Password Reset Information</h1>
          <p class="text-xs text-[#64748B] leading-relaxed">
            For institutional security, password resets are managed directly by your system administrator.
          </p>
        </div>

        <div class="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5EAF2] text-left text-xs text-[#475569] space-y-2">
          <div class="font-semibold text-[#0B1F44] flex items-center gap-1.5">
            <span>ℹ️</span> How to reset your credentials:
          </div>
          <p>Please contact your department's Lab Administrator or Faculty Coordinator with your <strong>UID</strong> or <strong>Faculty ID</strong>.</p>
          <p class="text-[11px] text-[#94A3B8]">Administrators can securely update student passwords via the Manage Students portal.</p>
        </div>

        <div class="pt-2">
          <a routerLink="/login/student" class="btn btn-primary w-full py-2.5 text-xs font-semibold">
            Return to Login
          </a>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {}
