import { Component, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { HeaderComponent } from './header/header';
import { DASHBOARD_TEXT } from './dashboard-text';
import { AuthService } from '../../services/auth-service';
import { DashboardStateService } from '../../services/dashboard-state-service';
import { MessagesService } from '../../services/messages-service';
import { NotificationsService } from '../../services/notifications-service';
import {
  ACTOR_STATUS_LABEL,
  TASK_STATUS_LABEL,
  Task,
  TaskAssignment,
  TaskService,
  TaskStatus,
} from '../../services/task-service';
import { UserService } from '../../services/user-service';
import type { UserRole } from './types';

@Component({
  selector: 'app-user-dashboard',
  imports: [HeaderComponent, RouterLink],
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
          @if (listsError()) {
            <p class="dashboard-error" role="alert">{{ listsError() }}</p>
          }
          @if (listsLoading()) {
            <p>Загрузка…</p>
          } @else if (state.role() === 'customer') {
            <h1>Мои заказы</h1>
            @if (published().length === 0) {
              <p>Вы ещё не публиковали заказы.</p>
            } @else {
              <ul class="task-list">
                @for (task of published(); track task.id) {
                  <li class="task-card">
                    <a [routerLink]="['/tasks', task.id]">{{ task.title }}</a>
                    <p>{{ task.price }} ₽ · {{ statusLabel[task.status] }}</p>
                    <div class="task-actions">
                      <button type="button" [disabled]="actionPending()" (click)="setStatus(task.id, 'in_progress')">
                        В работе
                      </button>
                      <button type="button" [disabled]="actionPending()" (click)="setStatus(task.id, 'completed')">
                        Выполнен
                      </button>
                    </div>
                    @for (row of assignmentsFor(task.id); track row.id) {
                      <div class="assignment">
                        <span>Исполнитель #{{ row.actor_id }} · {{ actorStatusLabel[row.actor_status] }}</span>
                        @if (row.actor_status === 1 && task.actor_id !== row.actor_id) {
                          <button
                            type="button"
                            [disabled]="actionPending()"
                            (click)="selectActor(task.id, row.actor_id)"
                          >
                            Выбрать
                          </button>
                        }
                      </div>
                    }
                  </li>
                }
              </ul>
            }
          } @else {
            <h1>Мои отклики</h1>
            @if (assignments().length === 0) {
              <p>Откликов пока нет.</p>
            } @else {
              <ul class="task-list">
                @for (row of assignments(); track row.id) {
                  <li class="task-card">
                    <a [routerLink]="['/tasks', row.task_id]">Заказ #{{ row.task_id }}</a>
                    <p>{{ actorStatusLabel[row.actor_status] }}</p>
                  </li>
                }
              </ul>
            }
            <h2>Свободные заказы</h2>
            @if (feed().length === 0) {
              <p>Свободных заказов нет.</p>
            } @else {
              <ul class="task-list">
                @for (task of feed(); track task.id) {
                  <li class="task-card">
                    <a [routerLink]="['/tasks', task.id]">{{ task.title }}</a>
                    <p>{{ task.task_category_name }} · {{ task.price }} ₽ · {{ statusLabel[task.status] }}</p>
                  </li>
                }
              </ul>
            }
          }
        </main>
      </div>
    </div>
  `,
  styleUrl: './user-dashboard.css',
})
export class UserDashboardComponent {
  private readonly users = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly tasksApi = inject(TaskService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly messagesService = inject(MessagesService);
  protected readonly state = inject(DashboardStateService);
  protected readonly statusLabel = TASK_STATUS_LABEL;
  protected readonly actorStatusLabel = ACTOR_STATUS_LABEL;
  protected readonly error = signal<string | null>(null);
  protected readonly published = signal<Task[]>([]);
  protected readonly assignments = signal<TaskAssignment[]>([]);
  protected readonly feed = signal<Task[]>([]);
  protected readonly listsLoading = signal(true);
  protected readonly listsError = signal<string | null>(null);
  protected readonly actionPending = signal(false);
  private readonly dashboardHeader = viewChild.required(HeaderComponent);
  private requestId = 0;

  constructor() {
    toObservable(this.state.role)
      .pipe(takeUntilDestroyed())
      .subscribe((role) => this.loadLists(role));
  }

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

  protected assignmentsFor(taskId: number): TaskAssignment[] {
    return this.assignments().filter((row) => row.task_id === taskId);
  }

  protected selectActor(taskId: number, actorId: number): void {
    this.actionPending.set(true);
    this.tasksApi.selectActor(taskId, actorId).subscribe({
      next: () => {
        this.actionPending.set(false);
        this.loadLists(this.state.role());
      },
      error: (message: string) => {
        this.listsError.set(message);
        this.actionPending.set(false);
      },
    });
  }

  protected setStatus(taskId: number, status: Extract<TaskStatus, 'in_progress' | 'completed'>): void {
    this.actionPending.set(true);
    this.tasksApi.update({ id: taskId, status }).subscribe({
      next: () => {
        this.actionPending.set(false);
        this.loadLists(this.state.role());
      },
      error: (message: string) => {
        this.listsError.set(message);
        this.actionPending.set(false);
      },
    });
  }

  private loadLists(role: UserRole): void {
    const requestId = ++this.requestId;
    this.listsLoading.set(true);
    this.listsError.set(null);
    if (role === 'customer') {
      this.tasksApi.published().subscribe({
        next: (view) => {
          if (requestId !== this.requestId) {
            return;
          }
          this.published.set(view.tasks);
          this.assignments.set(view.assignments);
          this.listsLoading.set(false);
        },
        error: (message: string) => this.fail(requestId, message),
      });
      return;
    }

    forkJoin({
      assignments: this.tasksApi.myAssignments(),
      feed: this.tasksApi.unassigned(),
    }).subscribe({
      next: ({ assignments, feed }) => {
        if (requestId !== this.requestId) {
          return;
        }
        const userId = this.auth.user()?.id;
        this.assignments.set(assignments);
        this.feed.set(feed.filter((task) => task.publisher_id !== userId));
        this.listsLoading.set(false);
      },
      error: (message: string) => this.fail(requestId, message),
    });
  }

  private fail(requestId: number, message: string): void {
    if (requestId !== this.requestId) {
      return;
    }
    this.listsError.set(message);
    this.listsLoading.set(false);
  }
}
