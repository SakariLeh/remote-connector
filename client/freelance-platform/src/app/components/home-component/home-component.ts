import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
export class HomeComponent implements OnInit, OnDestroy {
  private readonly categoriesApi = inject(TaskCategoryService);
  private static readonly LERP_FACTOR = 0.08;

  protected readonly categories = signal<TaskCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private targetX = 0;
  private targetY = 0;
  private currentX = 0;
  private currentY = 0;
  private animationFrame: number | null = null;
  private cursorGradientInitialized = false;
  private cursorGradientEnabled = false;
  private pointerInWindow = false;

  private readonly handleMouseMove = (event: MouseEvent): void => {
    this.pointerInWindow = true;
    this.targetX = event.clientX;
    this.targetY = event.clientY;
    this.scheduleGradientFrame();
  };

  private readonly handleMouseLeave = (): void => {
    this.pointerInWindow = false;
    this.targetX = window.innerWidth / 2;
    this.targetY = window.innerHeight / 2;
    this.scheduleGradientFrame();
  };

  private readonly handleResize = (): void => {
    if (!this.pointerInWindow) {
      this.targetX = window.innerWidth / 2;
      this.targetY = window.innerHeight / 2;
      this.scheduleGradientFrame();
    }
  };

  ngOnInit(): void {
    this.initializeCursorGradient();
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

  ngOnDestroy(): void {
    if (this.cursorGradientEnabled) {
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('mouseleave', this.handleMouseLeave);
      window.removeEventListener('resize', this.handleResize);
    }

    if (this.animationFrame !== null) {
      window.cancelAnimationFrame(this.animationFrame);
    }

    if (this.cursorGradientInitialized) {
      document.documentElement.style.removeProperty('--mx');
      document.documentElement.style.removeProperty('--my');
    }
  }

  private initializeCursorGradient(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    this.cursorGradientInitialized = true;
    this.currentX = this.targetX = window.innerWidth / 2;
    this.currentY = this.targetY = window.innerHeight / 2;
    this.writeGradientPosition();

    if (typeof window.matchMedia !== 'function') {
      return;
    }

    const hasFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hasFineHover || reducedMotion) {
      return;
    }

    this.cursorGradientEnabled = true;
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseleave', this.handleMouseLeave);
    window.addEventListener('resize', this.handleResize);
  }

  private scheduleGradientFrame(): void {
    if (this.animationFrame === null) {
      this.animationFrame = window.requestAnimationFrame(() => this.animateGradient());
    }
  }

  private animateGradient(): void {
    this.animationFrame = null;
    this.currentX += (this.targetX - this.currentX) * HomeComponent.LERP_FACTOR;
    this.currentY += (this.targetY - this.currentY) * HomeComponent.LERP_FACTOR;
    this.writeGradientPosition();

    if (Math.hypot(this.targetX - this.currentX, this.targetY - this.currentY) < 0.1) {
      this.currentX = this.targetX;
      this.currentY = this.targetY;
      this.writeGradientPosition();
      return;
    }

    this.scheduleGradientFrame();
  }

  private writeGradientPosition(): void {
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--mx', `${this.currentX}px`);
    rootStyle.setProperty('--my', `${this.currentY}px`);
  }
}
