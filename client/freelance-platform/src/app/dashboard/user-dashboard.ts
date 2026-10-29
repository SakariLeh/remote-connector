import { Component, inject, signal, viewChild } from '@angular/core';
import { HeaderComponent } from './header/header';
import { DASHBOARD_TEXT } from './dashboard-text';
import { DashboardStateService } from './dashboard-state.service';
import { MessagesService } from './services/messages.service';
import { NotificationsService } from './services/notifications.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-user-dashboard',
  imports: [HeaderComponent],
  standalone: true,
  template: `
    <div class="user-dashboard">
      <app-dashboard-header #dashboardHeader />
      @if (error()) {
        <p class="dashboard-error" role="alert">{{ error() }}</p>
      }
      <div class="dashboard-body">
        <aside class="dashboard-sidebar-slot" aria-hidden="true"></aside>
        <main class="dashboard-main">
          <p>{{ text.dashboard.content }}</p>
        </main>
      </div>
    </div>
  `,
  styleUrl: './user-dashboard.css',
})
export class UserDashboardComponent {
  private readonly users = inject(UserService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly messagesService = inject(MessagesService);
  private readonly state = inject(DashboardStateService);
  protected readonly text = DASHBOARD_TEXT;
  protected readonly error = signal<string | null>(null);
  private readonly dashboardHeader = viewChild.required(HeaderComponent);

  async ngOnInit(): Promise<void> {
    try {
      const [user, notifications, conversations] = await Promise.all([
        this.users.getCurrentUser(),
        this.notificationsService.getNotifications(),
        this.messagesService.getConversations(),
      ]);
      this.state.user.set(user);
      this.dashboardHeader().setData(notifications, conversations);
    } catch (error) {
      console.error('Unable to load dashboard data.', error);
      this.error.set(DASHBOARD_TEXT.errors.load);
    }
  }
}
