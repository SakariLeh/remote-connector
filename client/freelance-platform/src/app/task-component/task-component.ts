import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth-service';
import {
  ACTOR_STATUS_LABEL,
  TASK_STATUS_LABEL,
  Task,
  TaskAssignment,
  TaskService,
  TaskStatus,
} from '../services/task-service';

@Component({
  selector: 'app-task',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './task-component.html',
  styleUrl: './task-component.css',
})
export class TaskComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly tasksApi = inject(TaskService);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly auth = inject(AuthService);
  protected readonly statusLabel = TASK_STATUS_LABEL;
  protected readonly actorStatusLabel = ACTOR_STATUS_LABEL;
  protected readonly task = signal<Task | null>(null);
  protected readonly assignments = signal<TaskAssignment[]>([]);
  protected readonly mine = signal<TaskAssignment | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly pending = signal(false);

  ngOnInit(): void {
    const id = this.taskId();
    if (id == null) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    this.load(id);
  }

  protected isPublisher(task: Task): boolean {
    return this.auth.user()?.id === task.publisher_id;
  }

  protected subscribe(taskId: number): void {
    this.run(this.tasksApi.subscribe(taskId), taskId);
  }

  protected decline(taskId: number): void {
    this.run(this.tasksApi.decline(taskId), taskId);
  }

  protected selectActor(taskId: number, actorId: number): void {
    this.run(this.tasksApi.selectActor(taskId, actorId), taskId);
  }

  protected setStatus(taskId: number, status: TaskStatus): void {
    this.run(this.tasksApi.update({ id: taskId, status }), taskId);
  }

  private taskId(): number | null {
    const rawId = this.params().get('id');
    const id = rawId ? Number(rawId) : NaN;
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private run(request: Observable<unknown>, taskId: number): void {
    this.pending.set(true);
    this.actionError.set(null);
    request.subscribe({
      next: () => {
        this.pending.set(false);
        this.load(taskId);
      },
      error: (message: string) => {
        this.actionError.set(message);
        this.pending.set(false);
      },
    });
  }

  private load(id: number): void {
    this.tasksApi.getTask(id).subscribe({
      next: (task) => {
        this.task.set(task);
        this.loading.set(false);
        this.loadSide(task);
      },
      error: (message: string) => {
        this.loading.set(false);
        if (/not found/i.test(message)) {
          this.notFound.set(true);
          return;
        }
        this.error.set(message || 'Не удалось загрузить заказ');
      },
    });
  }

  private loadSide(task: Task): void {
    const user = this.auth.user();
    if (!user) {
      this.assignments.set([]);
      this.mine.set(null);
      return;
    }
    if (user.id === task.publisher_id) {
      this.mine.set(null);
      this.tasksApi.published(task.id).subscribe({
        next: (view) => this.assignments.set(view.assignments),
        error: (message: string) => this.actionError.set(message),
      });
      return;
    }
    this.assignments.set([]);
    this.tasksApi.myAssignments(task.id).subscribe({
      next: (rows) => this.mine.set(rows[0] ?? null),
      error: (message: string) => this.actionError.set(message),
    });
  }
}
