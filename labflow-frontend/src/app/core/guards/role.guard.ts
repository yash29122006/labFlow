import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/auth.models';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userRole = authService.role();
    if (!userRole) {
      return router.createUrlTree(['/login']);
    }

    if (allowedRoles.includes(userRole)) {
      return true;
    }

    // Redirect to their own dashboard
    if (userRole === 'ADMIN') {
      return router.createUrlTree(['/admin/dashboard']);
    } else if (userRole === 'FACULTY') {
      return router.createUrlTree(['/faculty/dashboard']);
    } else if (userRole === 'STUDENT') {
      return router.createUrlTree(['/student/dashboard']);
    }

    return router.createUrlTree(['/login']);
  };
};
