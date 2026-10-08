import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth-component/auth-component';
import { ProfileComponent } from './components/profile-component/profile-component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'profile', component: ProfileComponent },
];
