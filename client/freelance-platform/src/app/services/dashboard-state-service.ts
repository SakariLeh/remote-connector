import { Injectable, signal } from '@angular/core';
import type { User, UserRole } from '../components/dashboard/types';

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  readonly role = signal<UserRole>('executor');
  readonly user = signal<User | null>(null);
  readonly catalogSearch = signal('');

  setRole(role: UserRole): void {
    this.role.set(role);
  }

  setCatalogSearch(query: string): void {
    this.catalogSearch.set(query.trim());
  }
}
