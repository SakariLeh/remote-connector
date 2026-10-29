import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Conversation } from '../types';
import { DropdownComponent } from '../ui/dropdown';
import { DASHBOARD_TEXT } from '../dashboard-text';

@Component({
  selector: 'app-messages-button',
  imports: [DropdownComponent, RouterLink],
  standalone: true,
  template: `
    <div class="header-popover" data-popover-root="messages">
      <button
        class="icon-button popover-trigger"
        id="messages-trigger"
        type="button"
        [attr.aria-label]="text.messages.label"
        aria-haspopup="true"
        [attr.aria-expanded]="open()"
        aria-controls="messages-panel"
        (click)="toggle()()"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
        </svg>
        @if (unreadCount() > 0) {
          <span class="message-count">{{ unreadCount() > 99 ? '99+' : unreadCount() }}</span>
        }
      </button>
      <app-dashboard-dropdown [open]="open()" panelId="messages-panel">
        <h2 class="dropdown-heading">{{ text.messages.label }}</h2>
        @if (conversations().length) {
          <ul class="conversation-list">
            @for (conversation of conversations(); track conversation.id) {
              <li>
                <strong>{{ conversation.peerName }}</strong>
                <span>{{ conversation.lastMessage }}</span>
                <time>{{ conversation.updatedAt }}</time>
                @if (conversation.unreadCount > 0) {
                  <span class="conversation-unread">{{ conversation.unreadCount }}</span>
                }
              </li>
            }
          </ul>
          <a class="dropdown-link" routerLink="/dashboard" (click)="toggle()()">{{ text.messages.all }}</a>
        } @else {
          <p class="dropdown-empty">{{ text.messages.empty }}</p>
        }
      </app-dashboard-dropdown>
    </div>
  `,
})
export class MessagesButtonComponent {
  readonly conversations = input<Conversation[]>([]);
  readonly unreadCount = input(0);
  readonly open = input(false);
  readonly toggle = input.required<() => void>();
  protected readonly text = DASHBOARD_TEXT;
}
