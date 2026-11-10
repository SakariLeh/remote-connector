import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CreateOrderComponent } from '../create-order/create-order';
import { DASHBOARD_TEXT } from '../dashboard-text';
import {
  ACTOR_STATUS_LABEL,
  TASK_STATUS_LABEL,
  Task,
  TaskAssignment,
  TaskService,
  TaskStatus,
} from '../../../services/task-service';

@Component({
  selector: 'app-customer-orders',
  imports: [RouterLink, CreateOrderComponent],
  standalone: true,
  templateUrl: './customer-orders.html',
  styleUrl: './customer-orders.css',
})
export class CustomerOrdersComponent implements OnInit {
  private readonly tasksApi = inject(TaskService);

  protected readonly text = DASHBOARD_TEXT.customerOrders;
  protected readonly statusLabel = TASK_STATUS_LABEL;
  protected readonly actorStatusLabel = ACTOR_STATUS_LABEL;
  protected readonly published = signal<Task[]>([]);
  protected readonly assignments = signal<TaskAssignment[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly actionPending = signal(false);

  ngOnInit(): void {
    this.load();
  }

  protected assignmentsFor(taskId: number): TaskAssignment[] {
    return this.assignments().filter((row) => row.task_id === taskId);
  }

  protected selectActor(taskId: number, actorId: number): void {
    this.actionPending.set(true);
    this.tasksApi.selectActor(taskId, actorId).subscribe({
      next: () => {
        this.actionPending.set(false);
        this.load();
      },
      error: (message: string) => {
        this.error.set(message);
        this.actionPending.set(false);
      },
    });
  }

  protected setStatus(taskId: number, status: Extract<TaskStatus, 'in_progress' | 'completed'>): void {
    this.actionPending.set(true);
    this.tasksApi.update({ id: taskId, status }).subscribe({
      next: () => {
        this.actionPending.set(false);
        this.load();
      },
      error: (message: string) => {
        this.error.set(message);
        this.actionPending.set(false);
      },
    });
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.tasksApi.published().subscribe({
      next: (view) => {
        this.published.set(view.tasks);
        this.assignments.set(view.assignments);
        this.loading.set(false);
      },
      error: (message: string) => {
        this.error.set(message);
        this.loading.set(false);
      },
    });
  }
}
