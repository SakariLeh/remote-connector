import { Component, input } from '@angular/core';
import type { NotificationItem } from '../types';
import { DropdownComponent } from '../ui/dropdown';
import { DASHBOARD_TEXT } from '../dashboard-text';

@Component({
  selector: 'app-notifications-button',
  imports: [DropdownComponent],
  standalone: true,
  template: `
    <div class="header-popover" data-popover-root="notifications">
      <button
        class="icon-button popover-trigger"
        id="notifications-trigger"
        type="button"
        [attr.aria-label]="text.notifications.label"
        aria-haspopup="true"
        [attr.aria-expanded]="open()"
        aria-controls="notifications-panel"
        (click)="toggle()()"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
        @if (hasUnread()) { <span class="notification-dot"></span> }
      </button>
      <app-dashboard-dropdown [open]="open()" panelId="notifications-panel">
        <h2 class="dropdown-heading">{{ text.notifications.label }}</h2>
        @if (items().length) {
          <ul class="notification-list">
            @for (item of items(); track item.id) {
              <li [class.notification-unread]="!item.isRead">
                <strong>{{ item.title }}</strong>
                <span>{{ item.text }}</span>
                <time>{{ item.createdAt }}</time>
              </li>
            }
          </ul>
        } @else {
          <p class="dropdown-empty">{{ text.notifications.empty }}</p>
        }
      </app-dashboard-dropdown>
    </div>
  `,
})
export class NotificationsButtonComponent {
  readonly items = input<NotificationItem[]>([]);
  readonly open = input(false);
  readonly hasUnread = input(false);
  readonly toggle = input.required<() => void>();
  protected readonly text = DASHBOARD_TEXT;
}
