import { Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, skip } from 'rxjs';
import { DASHBOARD_TEXT } from '../dashboard-text';
import { DashboardStateService } from '../../../services/dashboard-state-service';
import {
  TaskCategory,
  TaskCategoryService,
} from '../../../services/task-category-service';
import {
  ACTOR_STATUS_LABEL,
  FilterLogic,
  TASK_STATUS_LABEL,
  Task,
  TaskAssignment,
  TaskQueryOptions,
  TaskService,
} from '../../../services/task-service';

type SortOption = 'created_at:desc' | 'price:asc' | 'price:desc';

@Component({
  selector: 'app-executor-board',
  imports: [RouterLink, FormsModule],
  standalone: true,
  templateUrl: './executor-board.html',
  styleUrl: './executor-board.css',
})
export class ExecutorBoardComponent implements OnInit {
  private readonly tasksApi = inject(TaskService);
  private readonly categoriesApi = inject(TaskCategoryService);
  private readonly state = inject(DashboardStateService);

  protected readonly text = DASHBOARD_TEXT.executorBoard;
  protected readonly statusLabel = TASK_STATUS_LABEL;
  protected readonly actorStatusLabel = ACTOR_STATUS_LABEL;
  protected readonly assignments = signal<TaskAssignment[]>([]);
  protected readonly feed = signal<Task[]>([]);
  protected readonly categories = signal<TaskCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly feedLoading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly categoriesError = signal<string | null>(null);

  protected selectedCategoryIds: number[] = [];
  protected priceMin = '';
  protected priceMax = '';
  protected sortKey: SortOption = 'created_at:desc';
  protected filterLogic: FilterLogic = 'and';

  constructor() {
    toObservable(this.state.catalogSearch)
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe(() => {
        if (!this.loading()) {
          this.loadFeed();
        }
      });
  }

  ngOnInit(): void {
    this.load();
    this.loadCategories();
  }

  protected toggleCategory(categoryId: number, checked: boolean): void {
    if (checked) {
      if (!this.selectedCategoryIds.includes(categoryId)) {
        this.selectedCategoryIds = [...this.selectedCategoryIds, categoryId];
      }
      return;
    }
    this.selectedCategoryIds = this.selectedCategoryIds.filter((id) => id !== categoryId);
  }

  protected isCategorySelected(categoryId: number): boolean {
    return this.selectedCategoryIds.includes(categoryId);
  }

  protected applyFilters(): void {
    this.loadFeed();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      assignments: this.tasksApi.myAssignments(),
      feed: this.tasksApi.filtered(this.buildQuery()),
    }).subscribe({
      next: ({ assignments, feed }) => {
        this.assignments.set(assignments);
        this.feed.set(feed);
        this.loading.set(false);
      },
      error: (message: string) => {
        this.error.set(message);
        this.loading.set(false);
      },
    });
  }

  private loadFeed(): void {
    this.feedLoading.set(true);
    this.error.set(null);
    this.tasksApi.filtered(this.buildQuery()).subscribe({
      next: (feed) => {
        this.feed.set(feed);
        this.feedLoading.set(false);
      },
      error: (message: string) => {
        this.error.set(message);
        this.feedLoading.set(false);
      },
    });
  }

  private loadCategories(): void {
    this.categoriesApi.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.categoriesError.set(null);
      },
      error: (message: string) => {
        this.categoriesError.set(message);
      },
    });
  }

  private buildQuery(): TaskQueryOptions {
    const filters: string[] = [];
    const categoryIds = this.selectedCategoryIds;
    if (categoryIds.length === 1) {
      filters.push(`category_id:eq:${categoryIds[0]}`);
    } else if (categoryIds.length > 1) {
      filters.push(`category_id:in:${categoryIds.join(',')}`);
    }

    const min = String(this.priceMin ?? '').trim();
    const max = String(this.priceMax ?? '').trim();
    if (min) {
      filters.push(`price:gte:${min}`);
    }
    if (max) {
      filters.push(`price:lte:${max}`);
    }

    const search = this.state.catalogSearch().trim();
    if (search) {
      filters.push(`search:contains:${search}`);
    }

    return {
      logic: this.filterLogic,
      filters,
      sorts: [this.sortKey],
    };
  }
}
