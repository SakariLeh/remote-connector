import { Component, inject } from '@angular/core';
import { DashboardStateService } from '../../../services/dashboard-state-service';
import { DASHBOARD_TEXT } from '../dashboard-text';
import type { UserRole } from '../types';

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  template: `
    <div class="role-switcher" role="tablist" [attr.aria-label]="text.roleSelection">
      <button
        #executorTab
        type="button"
        role="tab"
        id="executor-tab"
        [attr.aria-selected]="state.role() === 'executor'"
        [attr.tabindex]="state.role() === 'executor' ? 0 : -1"
        [class.role-active]="state.role() === 'executor'"
        (click)="select('executor')"
        (keydown)="onArrow($event, 'executor')"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
        </svg>
        <span>{{ text.roles.executor }}</span>
      </button>
      <button
        #customerTab
        type="button"
        role="tab"
        id="customer-tab"
        [attr.aria-selected]="state.role() === 'customer'"
        [attr.tabindex]="state.role() === 'customer' ? 0 : -1"
        [class.role-active]="state.role() === 'customer'"
        (click)="select('customer')"
        (keydown)="onArrow($event, 'customer')"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
        </svg>
        <span>{{ text.roles.customer }}</span>
      </button>
    </div>
  `,
})
export class RoleSwitcherComponent {
  protected readonly state = inject(DashboardStateService);
  protected readonly text = DASHBOARD_TEXT;

  select(role: UserRole): void {
    this.state.setRole(role);
  }

  onArrow(event: KeyboardEvent, role: UserRole): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    const nextRole = role === 'executor' ? 'customer' : 'executor';
    this.select(nextRole);
    document.getElementById(`${nextRole}-tab`)?.focus();
  }
}
