import { Component, inject, signal, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HeaderComponent } from './header/header';
import { CustomerOrdersComponent } from './customer-orders/customer-orders';
import { ExecutorBoardComponent } from './executor-board/executor-board';
import { DASHBOARD_TEXT } from './dashboard-text';
import { AuthService } from '../../services/auth-service';
import { DashboardStateService } from '../../services/dashboard-state-service';
import { MessagesService } from '../../services/messages-service';
import { NotificationsService } from '../../services/notifications-service';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-user-dashboard',
  imports: [HeaderComponent, CustomerOrdersComponent, ExecutorBoardComponent],
  standalone: true,
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboardComponent {
  private readonly users = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly messagesService = inject(MessagesService);
  protected readonly state = inject(DashboardStateService);
  protected readonly error = signal<string | null>(null);
  private readonly dashboardHeader = viewChild.required(HeaderComponent);

  async ngOnInit(): Promise<void> {
    try {
      const [user, notifications, conversations] = await Promise.all([
        firstValueFrom(this.users.getCurrentUser()),
        firstValueFrom(this.notificationsService.getNotifications()),
        firstValueFrom(this.messagesService.getConversations()),
      ]);
      this.state.user.set(user);
      this.auth.applyUser(user);
      this.dashboardHeader().setData(notifications, conversations);
    } catch (error) {
      console.error('Unable to load dashboard data.', error);
      this.error.set(DASHBOARD_TEXT.errors.load);
    }
  }
}
