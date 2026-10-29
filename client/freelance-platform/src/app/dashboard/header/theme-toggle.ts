import { Component, inject } from '@angular/core';
import { DASHBOARD_TEXT } from '../dashboard-text';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      class="icon-button theme-toggle"
      type="button"
      [attr.aria-label]="theme.theme() === 'dark' ? text.theme.light : text.theme.dark"
      (click)="theme.toggle()"
    >
      @if (theme.theme() === 'dark') {
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
      } @else {
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />
        </svg>
      }
    </button>
  `,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly text = DASHBOARD_TEXT;
}
