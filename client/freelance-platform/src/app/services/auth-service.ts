import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, switchMap, tap, throwError } from 'rxjs';

const STORAGE_KEY = 'fp_auth';

export interface AuthUser {
  id: number;
  email: string;
}

interface JwtResponse {
  id: number;
  email: string;
  jwt_token: string;
}

interface StoredSession {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);

  readonly token = signal<string | null>(null);
  readonly user = signal<AuthUser | null>(null);

  constructor() {
    this.restore();
  }

  login(email: string, password: string): Observable<JwtResponse> {
    return this.http
      .post<JwtResponse>('/auth/authorize', { email, password })
      .pipe(
        tap((res) => this.persist(res)),
        catchError((err) => throwError(() => this.toMessage(err))),
      );
  }

  register(email: string, password: string): Observable<JwtResponse> {
    return this.http.post('/auth/register', { email, password }).pipe(
      switchMap(() => this.login(email, password)),
      catchError((err) => {
        if (typeof err === 'string') {
          return throwError(() => err);
        }
        return throwError(() => this.toMessage(err));
      }),
    );
  }

  logout(): void {
    this.token.set(null);
    this.user.set(null);
    if (this.browser) {
      localStorage.removeItem(STORAGE_KEY);
    }
    void this.router.navigate(['/auth']);
  }

  private persist(res: JwtResponse): void {
    const session: StoredSession = {
      token: res.jwt_token,
      user: { id: res.id, email: res.email },
    };
    this.token.set(session.token);
    this.user.set(session.user);
    if (this.browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }

  private restore(): void {
    if (!this.browser) {
      return;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const session = JSON.parse(raw) as StoredSession;
      if (session?.token && session?.user?.email) {
        this.token.set(session.token);
        this.user.set(session.user);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
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

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  if (!token) {
    return next(req);
  }
  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
