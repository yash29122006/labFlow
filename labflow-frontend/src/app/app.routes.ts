import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AppShellComponent } from './layout/app-shell/app-shell.component';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/public/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'login/:role',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/public/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./features/public/error-pages/error-pages.component').then(m => m.ForbiddenComponent)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./features/public/error-pages/error-pages.component').then(m => m.NotFoundComponent)
  },

  // Authenticated application shell
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      // ADMIN ROUTES
      {
        path: 'admin',
        redirectTo: 'admin/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'admin/dashboard',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'admin/faculty',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/admin/faculty-management/faculty-management.component').then(m => m.FacultyManagementComponent)
      },
      {
        path: 'admin/subjects',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/admin/subject-management/subject-management.component').then(m => m.SubjectManagementComponent)
      },
      {
        path: 'admin/subjects/:id/assignments',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/admin/assignment-management/assignment-management.component').then(m => m.AdminAssignmentManagementComponent)
      },
      {
        path: 'admin/students',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/admin/manage-students/manage-students.component').then(m => m.ManageStudentsComponent)
      },
      {
        path: 'admin/users',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/admin/system-users/system-users.component').then(m => m.SystemUsersComponent)
      },

      // FACULTY ROUTES
      {
        path: 'faculty',
        redirectTo: 'faculty/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'faculty/dashboard',
        canActivate: [roleGuard(['FACULTY'])],
        loadComponent: () => import('./features/faculty/faculty-dashboard/faculty-dashboard.component').then(m => m.FacultyDashboardComponent)
      },
      {
        path: 'faculty/subjects',
        canActivate: [roleGuard(['FACULTY'])],
        loadComponent: () => import('./features/shared-views/subjects-list/subjects-list.component').then(m => m.SubjectsListComponent)
      },
      {
        path: 'faculty/assignments',
        canActivate: [roleGuard(['FACULTY'])],
        loadComponent: () => import('./features/faculty/faculty-assignments/faculty-assignments.component').then(m => m.FacultyAssignmentsComponent)
      },
      {
        path: 'faculty/assignments/:id',
        canActivate: [roleGuard(['FACULTY'])],
        loadComponent: () => import('./features/faculty/assignment-grading/assignment-grading.component').then(m => m.AssignmentGradingComponent)
      },
      {
        path: 'faculty/quizzes',
        canActivate: [roleGuard(['FACULTY'])],
        loadComponent: () => import('./features/faculty/faculty-quizzes/faculty-quizzes.component').then(m => m.FacultyQuizzesComponent)
      },
      {
        path: 'faculty/submissions',
        canActivate: [roleGuard(['FACULTY'])],
        loadComponent: () => import('./features/faculty/faculty-submissions/faculty-submissions.component').then(m => m.FacultySubmissionsComponent)
      },
      {
        path: 'faculty/submissions/:submissionId/evaluate',
        canActivate: [roleGuard(['FACULTY'])],
        loadComponent: () => import('./features/faculty/evaluate-submission/evaluate-submission.component').then(m => m.EvaluateSubmissionComponent)
      },
      {
        path: 'faculty/evaluations',
        canActivate: [roleGuard(['FACULTY'])],
        loadComponent: () => import('./features/faculty/faculty-evaluations/faculty-evaluations.component').then(m => m.FacultyEvaluationsComponent)
      },
      {
        path: 'faculty/students',
        canActivate: [roleGuard(['FACULTY'])],
        loadComponent: () => import('./features/faculty/faculty-students/faculty-students.component').then(m => m.FacultyStudentsComponent)
      },

      // STUDENT ROUTES
      {
        path: 'student',
        redirectTo: 'student/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'student/dashboard',
        canActivate: [roleGuard(['STUDENT'])],
        loadComponent: () => import('./features/student/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent)
      },
      {
        path: 'student/subjects',
        canActivate: [roleGuard(['STUDENT'])],
        loadComponent: () => import('./features/shared-views/subjects-list/subjects-list.component').then(m => m.SubjectsListComponent)
      },
      {
        path: 'student/subjects/:subjectId',
        canActivate: [roleGuard(['STUDENT'])],
        loadComponent: () => import('./features/student/subject-detail/subject-detail.component').then(m => m.StudentSubjectDetailComponent)
      },
      {
        path: 'student/assignments',
        canActivate: [roleGuard(['STUDENT'])],
        loadComponent: () => import('./features/student/assignments-list/assignments-list.component').then(m => m.StudentAssignmentsListComponent)
      },
      {
        path: 'student/assignments/:id',
        canActivate: [roleGuard(['STUDENT'])],
        loadComponent: () => import('./features/student/assignment-workspace/assignment-workspace.component').then(m => m.AssignmentWorkspaceComponent)
      },
      {
        path: 'student/quizzes',
        canActivate: [roleGuard(['STUDENT'])],
        loadComponent: () => import('./features/student/quizzes-list/quizzes-list.component').then(m => m.StudentQuizzesListComponent)
      },
      {
        path: 'student/quizzes/:id/attempt',
        canActivate: [roleGuard(['STUDENT'])],
        loadComponent: () => import('./features/student/quiz-attempt/quiz-attempt.component').then(m => m.QuizAttemptComponent)
      },
      {
        path: 'student/submissions',
        canActivate: [roleGuard(['STUDENT'])],
        loadComponent: () => import('./features/student/submissions-list/submissions-list.component').then(m => m.StudentSubmissionsListComponent)
      },
      {
        path: 'student/results',
        canActivate: [roleGuard(['STUDENT'])],
        loadComponent: () => import('./features/student/student-results/student-results.component').then(m => m.StudentResultsComponent)
      }
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'not-found'
  }
];
