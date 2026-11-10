import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth-service';
import {
  TaskCategory,
  TaskCategoryService,
} from '../services/task-category-service';
import { TASK_STATUS_LABEL, Task, TaskService } from '../services/task-service';

@Component({
  selector: 'app-work-category-component',
  imports: [RouterLink, ReactiveFormsModule],
  standalone: true,
  templateUrl: './work-category-component.html',
  styleUrl: './work-category-component.css',
})
export class WorkCategoryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly categoriesApi = inject(TaskCategoryService);
  private readonly tasksApi = inject(TaskService);
  private readonly fb = inject(FormBuilder);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly auth = inject(AuthService);
  protected readonly statusLabel = TASK_STATUS_LABEL;
  protected readonly category = signal<TaskCategory | null>(null);
  protected readonly tasks = signal<Task[]>([]);
  protected readonly loading = signal(true);
  protected readonly tasksLoading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly tasksError = signal<string | null>(null);
  protected readonly createPending = signal(false);
  protected readonly createError = signal<string | null>(null);
  protected readonly createSuccess = signal<string | null>(null);
  protected readonly createForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.required, Validators.maxLength(255)]],
    price: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    const rawId = this.params().get('id');
    const id = rawId ? Number(rawId) : NaN;
    if (!Number.isFinite(id) || id <= 0) {
      this.notFound.set(true);
      this.loading.set(false);
      this.tasksLoading.set(false);
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
    this.loadTasks(id);
  }

  protected createTask(categoryId: number): void {
    if (this.createForm.invalid || this.createPending()) {
      this.createForm.markAllAsTouched();
      return;
    }

    const { title, description, price } = this.createForm.getRawValue();
    this.createPending.set(true);
    this.createError.set(null);
    this.createSuccess.set(null);
    this.tasksApi
      .create({ title, description, price: Number(price), task_category_id: categoryId })
      .subscribe({
        next: () => {
          this.createForm.reset({ title: '', description: '', price: 1 });
          this.createSuccess.set('Заказ опубликован');
          this.createPending.set(false);
          this.loadTasks(categoryId);
        },
        error: (message: string) => {
          this.createError.set(message);
          this.createPending.set(false);
        },
      });
  }

  private loadTasks(categoryId: number): void {
    this.tasksLoading.set(true);
    this.tasksError.set(null);
    this.tasksApi.unassigned().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks.filter((task) => task.task_category_id === categoryId));
        this.tasksLoading.set(false);
      },
      error: (message: string) => {
        this.tasksError.set(message || 'Не удалось загрузить заказы');
        this.tasksLoading.set(false);
      },
    });
  }
}
