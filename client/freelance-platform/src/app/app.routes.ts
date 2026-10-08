import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AuthComponent } from './components/auth-component/auth-component';
import { ProfileComponent } from './components/profile-component/profile-component';
import { AuthService } from './services/auth-service';

const requireUser: CanActivateFn = () =>
  inject(AuthService).user() ? true : inject(Router).createUrlTree(['/auth']);

const requireGuest: CanActivateFn = () =>
  inject(AuthService).user() ? inject(Router).createUrlTree(['/profile']) : true;

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent, canActivate: [requireGuest] },
  { path: 'profile', component: ProfileComponent, canActivate: [requireUser] },
];
