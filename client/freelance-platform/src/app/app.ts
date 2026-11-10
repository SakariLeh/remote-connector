import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardStateService } from './services/dashboard-state-service';
import { AuthService } from './services/auth-service';
import type { UserRole } from './components/dashboard/types';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly authService = inject(AuthService);
  private readonly dashboardState = inject(DashboardStateService);
  protected readonly isDashboard = signal(false);
  protected readonly isHome = signal(false);
  protected readonly userMenuOpen = signal(false);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.isDashboard.set(this.router.url.startsWith('/dashboard'));
    this.isHome.set(this.isHomeUrl(this.router.url));
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.isDashboard.set(event.urlAfterRedirects.startsWith('/dashboard'));
        this.isHome.set(this.isHomeUrl(event.urlAfterRedirects));
        this.closeUserMenu();
      });
  }

  private isHomeUrl(url: string): boolean {
    return url.split(/[?#]/, 1)[0] === '/';
  }

  protected toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  protected closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  protected openCabinet(role: UserRole): void {
    this.dashboardState.setRole(role);
    this.closeUserMenu();
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout();
  }
}
