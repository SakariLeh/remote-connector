import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, switchMap, tap, throwError } from 'rxjs';

const STORAGE_KEY = 'fp_auth';

export interface AuthUser {
  id: number;
  email: string;
  role?: string;
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

  updateProfile(email: string): Observable<AuthUser> {
    return this.http.post<AuthUser>('/profile/update', { email }).pipe(
      tap((user) => this.applyUser(user)),
      catchError((err) => throwError(() => this.toMessage(err))),
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<JwtResponse> {
    return this.http
      .post<JwtResponse>('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      })
      .pipe(
        tap((res) => this.persist(res)),
        catchError((err) => throwError(() => this.toMessage(err))),
      );
  }

  applyUser(user: AuthUser): void {
    const next: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role ?? this.user()?.role,
    };
    this.user.set(next);
    const token = this.token();
    if (token) {
      this.write(token, next);
    }
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
    const user: AuthUser = {
      id: res.id,
      email: res.email,
      role: this.user()?.role,
    };
    this.token.set(res.jwt_token);
    this.user.set(user);
    this.write(res.jwt_token, user);
  }

  private write(token: string, user: AuthUser): void {
    if (!this.browser) {
      return;
    }
    const session: StoredSession = { token, user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
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
  const authed = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(authed).pipe(
    catchError((err: unknown) => {
      const isLogin = req.url.includes('/auth/authorize') || req.url.includes('/auth/register');
      if (err instanceof HttpErrorResponse && err.status === 401 && token && !isLogin) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
