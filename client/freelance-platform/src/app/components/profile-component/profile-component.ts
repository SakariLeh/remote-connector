import { Component, inject, signal, type Signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, type AuthUser } from '../../services/auth-service';

@Component({
  selector: 'app-profile-component',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.css',
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly user: Signal<AuthUser | null> = this.authService.user;
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]],
    confirmPassword: ['', [Validators.minLength(6)]],
  });
  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  constructor() {
    this.form.controls.email.setValue(this.authService.user()?.email ?? '');
  }

  protected updateProfile(): void {
    if (this.form.invalid || this.pending()) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, confirmPassword } = this.form.getRawValue();
    if (password && password !== confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    const currentUser = this.user();
    if (!currentUser) {
      return;
    }

    this.pending.set(true);
    this.error.set(null);
    this.success.set(null);

    this.authService.updateProfile(currentUser.id, email, password || null).subscribe({
      next: (updatedUser) => {
        this.authService.user.set(updatedUser);
        this.form.patchValue({ password: '', confirmPassword: '' });
        this.success.set('Profile updated successfully');
        this.pending.set(false);
      },
      error: (message: string) => {
        this.error.set(message);
        this.pending.set(false);
      },
    });
  }
}
