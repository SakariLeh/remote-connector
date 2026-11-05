import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DASHBOARD_TEXT } from '../dashboard-text';

@Component({
  selector: 'app-dashboard-logo',
  imports: [RouterLink],
  standalone: true,
  template: `
    <a class="dashboard-brand" routerLink="/dashboard" [attr.aria-label]="text.logoLabel">
      <span class="dashboard-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M13.2 2.8 5.7 13h5.1l-.5 8.2L18.3 11h-5.2l.1-8.2Z" fill="currentColor" />
        </svg>
      </span>
      <span class="dashboard-brand-name">{{ text.logo }}</span>
    </a>
  `,
})
export class LogoComponent {
  protected readonly text = DASHBOARD_TEXT;
}
