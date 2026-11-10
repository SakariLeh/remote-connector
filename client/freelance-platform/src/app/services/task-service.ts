import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

export type TaskStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'rejected';

export interface Task {
  id: number;
  publisher_id: number;
  actor_id: number | null;
  task_category_id: number;
  task_category_name: string;
  title: string;
  description: string;
  status: TaskStatus;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: number;
  actor_id: number;
  task_id: number;
  actor_status: number;
}

export interface PublisherView {
  tasks: Task[];
  assignments: TaskAssignment[];
}

export interface TaskDraft {
  title: string;
  description: string;
  price: number;
  task_category_id: number;
}

export interface TaskUpdate {
  id: number;
  title?: string;
  description?: string;
  price?: number;
  status?: TaskStatus;
  actor_id?: number;
  task_category_id?: number;
}

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  new: 'Новый',
  assigned: 'Назначен',
  in_progress: 'В работе',
  completed: 'Выполнен',
  rejected: 'Отклонён',
};

export const ACTOR_STATUS_LABEL: Record<number, string> = {
  1: 'Отклик',
  2: 'Отказ',
  3: 'Выполнен',
};

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  unassigned(): Observable<Task[]> {
    return this.read(this.http.get<Task[]>('/tasks/unassigned'));
  }

  getTask(id: number): Observable<Task> {
    return this.read(this.http.get<Task>(`/tasks/${id}`));
  }

  create(draft: TaskDraft): Observable<Task> {
    return this.read(this.http.post<Task>('/tasks/', draft));
  }

  update(body: TaskUpdate): Observable<Task> {
    return this.read(this.http.post<Task>('/tasks/update', body));
  }

  subscribe(taskId: number): Observable<TaskAssignment> {
    return this.read(this.http.post<TaskAssignment>(`/tasks/${taskId}/subscribe`, {}));
  }

  decline(taskId: number): Observable<TaskAssignment> {
    return this.read(this.http.post<TaskAssignment>(`/tasks/${taskId}/decline`, {}));
  }

  selectActor(taskId: number, actorId: number): Observable<TaskAssignment> {
    return this.read(
      this.http.post<TaskAssignment>(`/tasks/${taskId}/select-actor`, { actor_id: actorId }),
    );
  }

  published(taskId?: number): Observable<PublisherView> {
    return this.read(
      this.http.get<PublisherView>('/tasks/me/published', {
        params: taskId == null ? undefined : { task_id: String(taskId) },
      }),
    );
  }

  myAssignments(taskId?: number): Observable<TaskAssignment[]> {
    return this.read(
      this.http.get<TaskAssignment[]>('/tasks/me/assignments', {
        params: taskId == null ? undefined : { task_id: String(taskId) },
      }),
    );
  }

  private read<T>(source: Observable<T>): Observable<T> {
    return source.pipe(catchError((err) => throwError(() => this.toMessage(err))));
  }

  private toMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      const wrapped = body?.error?.message;
      if (typeof wrapped === 'string' && wrapped) {
        return wrapped;
      }
      const detail = body?.detail;
      if (typeof detail === 'string') {
        return detail;
      }
      if (Array.isArray(detail)) {
        return detail.map((d: { msg?: string }) => d.msg ?? JSON.stringify(d)).join('; ');
      }
      return err.message || 'Request failed';
    }
    return 'Request failed';
  }
}
