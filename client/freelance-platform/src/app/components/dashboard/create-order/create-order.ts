import { Component, inject, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DASHBOARD_TEXT } from '../dashboard-text';
import { TaskCategory, TaskCategoryService } from '../../../services/task-category-service';
import { TaskService } from '../../../services/task-service';

@Component({
  selector: 'app-create-order',
  imports: [FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './create-order.html',
  styleUrl: './create-order.css',
})
export class CreateOrderComponent implements OnInit {
  private readonly tasksApi = inject(TaskService);
  private readonly categoriesApi = inject(TaskCategoryService);
  private readonly fb = inject(FormBuilder);

  readonly created = output<void>();

  protected readonly text = DASHBOARD_TEXT.createOrder;
  protected readonly open = signal(false);
  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly categories = signal<TaskCategory[]>([]);
  protected readonly categoriesError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(1)]],
    task_category_id: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.categoriesApi.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (message: string) => this.categoriesError.set(message),
    });
  }

  protected toggle(): void {
    this.open.update((value) => !value);
    this.error.set(null);
  }

  protected submit(): void {
    if (this.form.invalid || this.pending()) {
      this.form.markAllAsTouched();
      return;
    }

    const draft = this.form.getRawValue();
    this.pending.set(true);
    this.error.set(null);
    this.tasksApi.create(draft).subscribe({
      next: () => {
        this.pending.set(false);
        this.form.reset({ title: '', description: '', price: 0, task_category_id: 0 });
        this.open.set(false);
        this.created.emit();
      },
      error: (message: string) => {
        this.error.set(message);
        this.pending.set(false);
      },
    });
  }
}
