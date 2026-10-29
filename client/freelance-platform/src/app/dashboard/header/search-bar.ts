import { Component, ElementRef, HostListener, inject, output, viewChild } from '@angular/core';
import { DashboardStateService } from '../dashboard-state.service';
import { DASHBOARD_TEXT } from '../dashboard-text';

@Component({
  selector: 'app-dashboard-search',
  standalone: true,
  template: `
    <div class="dashboard-search-wrap" [class.dashboard-search-expanded]="expanded">
      <button
        class="icon-button mobile-search-toggle"
        type="button"
        [attr.aria-label]="text.search.open"
        (click)="toggleExpanded()"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      </button>
      <form class="dashboard-search" role="search" (submit)="submit($event)">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <input
          #searchInput
          type="search"
          [placeholder]="placeholder"
          [attr.aria-label]="text.search.label"
          (input)="query = searchInput.value"
        />
        <button class="search-submit" type="submit">{{ text.search.submit }}</button>
      </form>
    </div>
  `,
})
export class SearchBarComponent {
  private readonly state = inject(DashboardStateService);
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  readonly search = output<string>();
  protected readonly text = DASHBOARD_TEXT;
  protected query = '';
  protected expanded = false;

  protected get placeholder(): string {
    return this.text.search[this.state.role()];
  }

  submit(event: Event): void {
    event.preventDefault();
    this.search.emit(this.query.trim());
    this.expanded = false;
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
    if (this.expanded) {
      setTimeout(() => this.searchInput().nativeElement.focus());
    }
  }

  @HostListener('document:keydown', ['$event'])
  focusShortcut(event: KeyboardEvent): void {
    const target = event.target;
    const isInput = target instanceof HTMLElement &&
      (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    if (isInput || (event.key !== '/' && !(event.ctrlKey && event.key.toLowerCase() === 'k'))) {
      return;
    }
    event.preventDefault();
    this.expanded = true;
    this.searchInput().nativeElement.focus();
  }
}
