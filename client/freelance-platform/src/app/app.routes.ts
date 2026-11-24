import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AuthComponent } from './components/auth-component/auth-component';
import { HomeComponent } from './components/home-component/home-component';
import { ProfileComponent } from './components/profile-component/profile-component';
import { TaskComponent } from './task-component/task-component';
import { WorkCategoryComponent } from './work-category-component/work-category-component';
import { AuthService } from './services/auth-service';
import { UserDashboardComponent } from './components/dashboard/user-dashboard';

const requireUser: CanActivateFn = () =>
  inject(AuthService).user() ? true : inject(Router).createUrlTree(['/auth']);

const requirePasswordChangeHandled: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.user()?.requires_password_change) {
    return router.createUrlTree(['/profile']);
  }
  return true;
};

const requireGuest: CanActivateFn = () =>
  inject(AuthService).user() ? inject(Router).createUrlTree(['/profile']) : true;


const rootRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.user()) {
    return router.createUrlTree(['/landing']);
  }
  return auth.user()?.requires_password_change
    ? router.createUrlTree(['/profile'])
    : router.createUrlTree(['/dashboard']);
}

export const routes: Routes = [
  { path: '', canActivate: [rootRedirectGuard], children: []},
  { path: 'landing', component: HomeComponent },
  { path: 'dashboard', component: UserDashboardComponent, canActivate: [requireUser, requirePasswordChangeHandled] },
  { path: 'works/:id', component: WorkCategoryComponent },
  { path: 'tasks/:id', component: TaskComponent },
  { path: 'auth', component: AuthComponent, canActivate: [requireGuest] },
  { path: 'profile', component: ProfileComponent, canActivate: [requireUser] },
  { path: '**', redirectTo: '' },
];
