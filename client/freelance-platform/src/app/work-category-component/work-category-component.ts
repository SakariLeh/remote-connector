import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  TaskCategory,
  TaskCategoryService,
} from '../services/task-category-service';

@Component({
  selector: 'app-work-category-component',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './work-category-component.html',
  styleUrl: './work-category-component.css',
})
export class WorkCategoryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly categoriesApi = inject(TaskCategoryService);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly category = signal<TaskCategory | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const rawId = this.params().get('id');
    const id = rawId ? Number(rawId) : NaN;
    if (!Number.isFinite(id) || id <= 0) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    this.categoriesApi.getCategory(id).subscribe({
      next: (category) => {
        this.category.set(category);
        this.loading.set(false);
      },
      error: (message: string) => {
        this.loading.set(false);
        if (/not found/i.test(message)) {
          this.notFound.set(true);
          return;
        }
        this.error.set(message || 'Не удалось загрузить категорию');
      },
    });
  }
}
