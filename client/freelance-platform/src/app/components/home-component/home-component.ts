import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  TaskCategory,
  TaskCategoryService,
} from '../../services/task-category-service';

@Component({
  selector: 'app-home-component',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent implements OnInit {
  private readonly categoriesApi = inject(TaskCategoryService);

  protected readonly categories = signal<TaskCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.categoriesApi.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (message: string) => {
        this.error.set(typeof message === 'string' ? message : 'Не удалось загрузить категории');
        this.loading.set(false);
      },
    });
  }
}
