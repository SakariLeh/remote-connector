import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth-service';
import { DashboardStateService } from '../dashboard-state.service';
import { DASHBOARD_TEXT } from '../dashboard-text';
import type { Conversation, NotificationItem } from '../types';
import { MessagesButtonComponent } from './messages-button';
import { NotificationsButtonComponent } from './notifications-button';
import { RoleSwitcherComponent } from './role-switcher';
import { SearchBarComponent } from './search-bar';
import { ThemeToggleComponent } from './theme-toggle';
import { LogoComponent } from './logo';
import { UserMenuComponent } from './user-menu';

type OpenPopover = 'notifications' | 'messages' | 'user' | null;

@Component({
  selector: 'app-dashboard-header',
  imports: [
    LogoComponent,
    RoleSwitcherComponent,
    SearchBarComponent,
    ThemeToggleComponent,
    NotificationsButtonComponent,
    MessagesButtonComponent,
    UserMenuComponent,
  ],
  standalone: true,
  template: `
    <header class="dashboard-header">
      <div class="dashboard-header-inner">
        <app-dashboard-logo />
        <app-role-switcher />
        <app-dashboard-search (search)="search($event)" />
        <div class="header-actions">
          <app-theme-toggle />
          <app-notifications-button
            [items]="notifications()"
            [hasUnread]="hasUnreadNotifications"
            [open]="openPopover() === 'notifications'"
            [toggle]="toggleNotifications"
          />
          <app-messages-button
            [conversations]="conversations()"
            [unreadCount]="unreadMessages"
            [open]="openPopover() === 'messages'"
            [toggle]="toggleMessages"
          />
          <span class="header-divider" aria-hidden="true"></span>
          <app-user-menu
            [user]="state.user()"
            [open]="openPopover() === 'user'"
            [toggle]="toggleUser"
            [logout]="logout"
          />
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected readonly state = inject(DashboardStateService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  protected readonly notifications = signal<NotificationItem[]>([]);
  protected readonly conversations = signal<Conversation[]>([]);
  protected readonly openPopover = signal<OpenPopover>(null);
  protected readonly text = DASHBOARD_TEXT;

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.openPopover.set(null));
  }

  get hasUnreadNotifications(): boolean {
    return this.notifications().some((notification) => !notification.isRead);
  }

  get unreadMessages(): number {
    return this.conversations().reduce((sum, conversation) => sum + conversation.unreadCount, 0);
  }

  setData(notifications: NotificationItem[], conversations: Conversation[]): void {
    this.notifications.set(notifications);
    this.conversations.set(conversations);
  }

  readonly toggleNotifications = (): void => this.togglePopover('notifications');
  readonly toggleMessages = (): void => this.togglePopover('messages');
  readonly toggleUser = (): void => this.togglePopover('user');
  readonly logout = (): void => this.auth.logout();

  search(query: string): void {
    console.log(this.text.searchResults, query);
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    const active = this.openPopover();
    if (!active || !(event.target instanceof Element)) {
      return;
    }
    if (!event.target.closest(`[data-popover-root="${active}"]`)) {
      this.openPopover.set(null);
    }
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    const active = this.openPopover();
    if (!active) {
      return;
    }
    this.openPopover.set(null);
    document.getElementById(`${active}-trigger`)?.focus();
  }

  private togglePopover(popover: Exclude<OpenPopover, null>): void {
    this.openPopover.update((active) => (active === popover ? null : popover));
  }
}
