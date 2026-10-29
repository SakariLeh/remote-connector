import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { User } from '../types';
import { AvatarComponent } from '../ui/avatar';
import { DropdownComponent } from '../ui/dropdown';
import { DASHBOARD_TEXT } from '../dashboard-text';

@Component({
  selector: 'app-user-menu',
  imports: [AvatarComponent, DropdownComponent, RouterLink],
  standalone: true,
  template: `
    @if (user(); as currentUser) {
      <div class="header-popover" data-popover-root="user">
        <button
          class="user-menu-trigger"
          id="user-trigger"
          type="button"
          [attr.aria-label]="text.userMenu.label"
          aria-haspopup="true"
          [attr.aria-expanded]="open()"
          aria-controls="user-panel"
          (click)="toggle()()"
        >
          <app-dashboard-avatar
            [src]="currentUser.avatarUrl"
            [initials]="currentUser.firstName[0] + currentUser.lastNameInitial[0]"
            [label]="currentUser.firstName + ' ' + currentUser.lastNameInitial"
          />
          <span class="user-menu-copy">
            <strong>{{ currentUser.firstName }} {{ currentUser.lastNameInitial }}</strong>
            <span>{{ currentUser.grade }} {{ currentUser.specialization }}</span>
          </span>
        </button>
        <app-dashboard-dropdown [open]="open()" panelId="user-panel">
          <nav class="user-menu-links" [attr.aria-label]="text.userMenu.label">
            <a routerLink="/profile" (click)="toggle()()">{{ text.userMenu.profile }}</a>
            <a routerLink="/profile" (click)="toggle()()">{{ text.userMenu.settings }}</a>
            <a routerLink="/profile" (click)="toggle()()">{{ text.userMenu.wallet }}</a>
            <a routerLink="/profile" (click)="toggle()()">{{ text.userMenu.pro }}</a>
            <span class="menu-divider"></span>
            <button type="button" (click)="logout()()">{{ text.userMenu.logout }}</button>
          </nav>
        </app-dashboard-dropdown>
      </div>
    }
  `,
})
export class UserMenuComponent {
  readonly user = input<User | null>(null);
  readonly open = input(false);
  readonly toggle = input.required<() => void>();
  readonly logout = input.required<() => void>();
  protected readonly text = DASHBOARD_TEXT;
}
