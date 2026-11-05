import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

export interface CurrentUser {
  id: number;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getCurrentUser(): Observable<CurrentUser> {
    return this.http
      .get<CurrentUser>('/auth/me')
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
