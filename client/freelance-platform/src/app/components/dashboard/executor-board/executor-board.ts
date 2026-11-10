import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DASHBOARD_TEXT } from '../dashboard-text';
import { AuthService } from '../../../services/auth-service';
import {
  ACTOR_STATUS_LABEL,
  TASK_STATUS_LABEL,
  Task,
  TaskAssignment,
  TaskService,
} from '../../../services/task-service';

@Component({
  selector: 'app-executor-board',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './executor-board.html',
  styleUrl: './executor-board.css',
})
export class ExecutorBoardComponent implements OnInit {
  private readonly tasksApi = inject(TaskService);
  private readonly auth = inject(AuthService);

  protected readonly text = DASHBOARD_TEXT.executorBoard;
  protected readonly statusLabel = TASK_STATUS_LABEL;
  protected readonly actorStatusLabel = ACTOR_STATUS_LABEL;
  protected readonly assignments = signal<TaskAssignment[]>([]);
  protected readonly feed = signal<Task[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      assignments: this.tasksApi.myAssignments(),
      feed: this.tasksApi.unassigned(),
    }).subscribe({
      next: ({ assignments, feed }) => {
        const userId = this.auth.user()?.id;
        this.assignments.set(assignments);
        this.feed.set(feed.filter((task) => task.publisher_id !== userId));
        this.loading.set(false);
      },
      error: (message: string) => {
        this.error.set(message);
        this.loading.set(false);
      },
    });
  }
}
