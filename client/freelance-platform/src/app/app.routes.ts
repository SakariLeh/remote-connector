import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AuthComponent } from './components/auth-component/auth-component';
import { HomeComponent } from './home-component/home-component';
import { ProfileComponent } from './components/profile-component/profile-component';
import { WorkCategoryComponent } from './work-category-component/work-category-component';
import { AuthService } from './services/auth-service';
import { UserDashboardComponent } from './dashboard/user-dashboard';

const requireUser: CanActivateFn = () =>
  inject(AuthService).user() ? true : inject(Router).createUrlTree(['/auth']);

const requireGuest: CanActivateFn = () =>
  inject(AuthService).user() ? inject(Router).createUrlTree(['/profile']) : true;

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: UserDashboardComponent, canActivate: [requireUser] },
  { path: 'works/:slug', component: WorkCategoryComponent },
  { path: 'auth', component: AuthComponent, canActivate: [requireGuest] },
  { path: 'profile', component: ProfileComponent, canActivate: [requireUser] },
];
