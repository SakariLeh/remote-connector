import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-auth-component',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './auth-component.html',
  styleUrl: './auth-component.css',
})
export class AuthComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly mode = signal<'login' | 'register'>('login');
  protected readonly error = signal<string | null>(null);
  protected readonly pending = signal(false);
  protected readonly user = this.authService.user;

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.error.set(null);
  }

  submit(): void {
    if (this.form.invalid || this.pending()) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.pending.set(true);
    this.error.set(null);

    const request =
      this.mode() === 'login'
        ? this.authService.login(email, password)
        : this.authService.register(email, password);

    request.subscribe({
      next: () => this.pending.set(false),
      error: (message: string) => {
        this.error.set(message);
        this.pending.set(false);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
