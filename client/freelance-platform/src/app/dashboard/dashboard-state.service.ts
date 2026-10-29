import { Injectable, signal } from '@angular/core';
import type { User, UserRole } from './types';

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  readonly role = signal<UserRole>('executor');
  readonly user = signal<User | null>(null);

  setRole(role: UserRole): void {
    this.role.set(role);
  }
}
