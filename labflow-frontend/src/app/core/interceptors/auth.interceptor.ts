import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip auth header for public endpoints
  if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register/student')) {
    return next(req);
  }

  const token = authService.token();
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Spring returns 403 (not 401) for missing/expired tokens, so also check expiry locally.
      if (token && (error.status === 401 || (error.status === 403 && authService.isTokenExpired()))) {
        authService.clearSessionSilently();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
