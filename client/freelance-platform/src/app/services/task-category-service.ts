import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

export interface TaskCategory {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class TaskCategoryService {
  private readonly http = inject(HttpClient);

  getCategories(): Observable<TaskCategory[]> {
    return this.http
      .get<TaskCategory[]>('/task-categories/')
      .pipe(catchError((err) => throwError(() => this.toMessage(err))));
  }

  getCategory(id: number): Observable<TaskCategory> {
    return this.http
      .get<TaskCategory>(`/task-categories/${id}`)
      .pipe(catchError((err) => throwError(() => this.toMessage(err))));
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
