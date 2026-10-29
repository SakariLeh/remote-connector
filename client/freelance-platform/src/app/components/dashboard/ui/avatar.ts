import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dashboard-avatar',
  standalone: true,
  template: `
    @if (src()) {
      <img class="dashboard-avatar" [src]="src()" [alt]="label()" />
    } @else {
      <span class="dashboard-avatar dashboard-avatar-fallback" aria-hidden="true">{{ initials() }}</span>
    }
  `,
})
export class AvatarComponent {
  readonly src = input<string | undefined>();
  readonly initials = input.required<string>();
  readonly label = input.required<string>();
}
