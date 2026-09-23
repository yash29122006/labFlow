import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl font-bold">
        404
      </div>
      <h1 class="text-2xl font-bold text-[#0B1F44]">Page Not Found</h1>
      <p class="text-sm text-[#64748B] max-w-md">
        The page you are looking for doesn't exist or may have moved.
      </p>
      <div class="pt-2">
        <button (click)="goHome()" class="btn btn-primary text-xs font-semibold px-6">
          Back to Dashboard
        </button>
      </div>
    </div>
  `
})
export class NotFoundComponent {
  private authService = inject(AuthService);

  goHome(): void {
    this.authService.navigateRoleHome();
  }
}

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div class="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-3xl font-bold">
        403
      </div>
      <h1 class="text-2xl font-bold text-[#0B1F44]">Access Restricted</h1>
      <p class="text-sm text-[#64748B] max-w-md">
        You don't have permission to view or manage this resource.
      </p>
      <div class="pt-2">
        <button (click)="goHome()" class="btn btn-primary text-xs font-semibold px-6">
          Back to Dashboard
        </button>
      </div>
    </div>
  `
})
export class ForbiddenComponent {
  private authService = inject(AuthService);

  goHome(): void {
    this.authService.navigateRoleHome();
  }
}
