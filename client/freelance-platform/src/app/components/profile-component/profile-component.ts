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
  protected readonly profileForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  protected readonly passwordForm = this.fb.nonNullable.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  });
  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  constructor() {
    this.profileForm.controls.email.setValue(this.authService.user()?.email ?? '');
  }

  protected updateProfile(): void {
    if (this.profileForm.invalid || this.pending()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { email } = this.profileForm.getRawValue();
    this.pending.set(true);
    this.error.set(null);
    this.success.set(null);

    this.authService.updateProfile(email).subscribe({
      next: (updatedUser) => {
        this.authService.user.set(updatedUser);
        this.success.set('Profile updated successfully');
        this.pending.set(false);
      },
      error: (message: string) => {
        this.error.set(message);
        this.pending.set(false);
      },
    });
  }

  protected changePassword(): void {
    if (this.passwordForm.invalid || this.pending()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { oldPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    this.pending.set(true);
    this.error.set(null);
    this.success.set(null);

    this.authService.changePassword(oldPassword, newPassword).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.success.set('Password changed successfully');
        this.pending.set(false);
      },
      error: (message: string) => {
        this.error.set(message);
        this.pending.set(false);
      },
    });
  }
}
