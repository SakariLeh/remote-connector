import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WORK_CATEGORIES } from '../work-categories';

@Component({
  selector: 'app-work-category-component',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './work-category-component.html',
  styleUrl: './work-category-component.css',
})
export class WorkCategoryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly subcategory = computed(() => {
    const slug = this.params().get('slug');
    return WORK_CATEGORIES.flatMap((category) =>
      category.subcategories.map((subcategory) => ({ ...subcategory, category })),
    ).find((item) => item.slug === slug);
  });
}
