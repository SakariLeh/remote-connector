import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dashboard-dropdown',
  standalone: true,
  template: `
    <div
      class="dashboard-dropdown"
      [id]="panelId()"
      [class.dashboard-dropdown-open]="open()"
      [attr.aria-hidden]="!open()"
    >
      <ng-content />
    </div>
  `,
})
export class DropdownComponent {
  readonly open = input(false);
  readonly panelId = input.required<string>();
}
