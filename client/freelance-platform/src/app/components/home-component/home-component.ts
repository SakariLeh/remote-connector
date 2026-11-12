import { DOCUMENT } from '@angular/common';
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
  private readonly document = inject(DOCUMENT);
  private static readonly LERP_FACTOR = 0.08;
  private static readonly STOP_THRESHOLD = 0.1;

  protected readonly categories = signal<TaskCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private windowRef: Window | null = null;
  private hoverMedia: MediaQueryList | null = null;
  private reducedMotionMedia: MediaQueryList | null = null;
  private targetX = 50;
  private targetY = 50;
  private currentX = 50;
  private currentY = 50;
  private animationFrame: number | null = null;
  private cursorGradientEnabled = false;

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (!this.windowRef) {
      return;
    }

    this.targetX = (event.clientX / this.windowRef.innerWidth) * 100;
    this.targetY = (event.clientY / this.windowRef.innerHeight) * 100;
    this.scheduleGradientFrame();
  };

  private readonly handlePointerLeave = (): void => {
    this.targetX = 50;
    this.targetY = 50;
    this.scheduleGradientFrame();
  };

  private readonly handleMediaChange = (): void => {
    this.updateCursorGradient();
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
    this.detachCursorTracking();
    this.hoverMedia?.removeEventListener('change', this.handleMediaChange);
    this.reducedMotionMedia?.removeEventListener('change', this.handleMediaChange);
    this.document.documentElement.style.removeProperty('--mx');
    this.document.documentElement.style.removeProperty('--my');
  }

  private initializeCursorGradient(): void {
    const windowRef = this.document.defaultView;
    if (!windowRef || typeof windowRef.matchMedia !== 'function') {
      return;
    }

    this.windowRef = windowRef;
    this.writeGradientPosition();

    this.hoverMedia = windowRef.matchMedia('(hover: none)');
    this.reducedMotionMedia = windowRef.matchMedia('(prefers-reduced-motion: reduce)');
    this.hoverMedia.addEventListener('change', this.handleMediaChange);
    this.reducedMotionMedia.addEventListener('change', this.handleMediaChange);
    this.updateCursorGradient();
  }

  private updateCursorGradient(): void {
    const shouldTrack =
      this.hoverMedia !== null &&
      !this.hoverMedia.matches &&
      this.reducedMotionMedia !== null &&
      !this.reducedMotionMedia.matches;

    if (shouldTrack === this.cursorGradientEnabled) {
      return;
    }

    if (shouldTrack) {
      this.cursorGradientEnabled = true;
      this.windowRef?.addEventListener('pointermove', this.handlePointerMove, { passive: true });
      this.document.documentElement.addEventListener('pointerleave', this.handlePointerLeave, {
        passive: true,
      });
      return;
    }

    this.detachCursorTracking();
    this.currentX = this.targetX = 50;
    this.currentY = this.targetY = 50;
    this.writeGradientPosition();
  }

  private detachCursorTracking(): void {
    this.cursorGradientEnabled = false;
    this.windowRef?.removeEventListener('pointermove', this.handlePointerMove);
    this.document.documentElement.removeEventListener('pointerleave', this.handlePointerLeave);

    if (this.animationFrame !== null) {
      this.windowRef?.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private scheduleGradientFrame(): void {
    if (this.windowRef && this.animationFrame === null) {
      this.animationFrame = this.windowRef.requestAnimationFrame(() => this.animateGradient());
    }
  }

  private animateGradient(): void {
    this.animationFrame = null;
    this.currentX += (this.targetX - this.currentX) * HomeComponent.LERP_FACTOR;
    this.currentY += (this.targetY - this.currentY) * HomeComponent.LERP_FACTOR;

    if (
      Math.abs(this.targetX - this.currentX) < HomeComponent.STOP_THRESHOLD &&
      Math.abs(this.targetY - this.currentY) < HomeComponent.STOP_THRESHOLD
    ) {
      this.currentX = this.targetX;
      this.currentY = this.targetY;
    }

    this.writeGradientPosition();

    if (
      Math.abs(this.targetX - this.currentX) >= HomeComponent.STOP_THRESHOLD ||
      Math.abs(this.targetY - this.currentY) >= HomeComponent.STOP_THRESHOLD
    ) {
      this.scheduleGradientFrame();
    }
  }

  private writeGradientPosition(): void {
    const rootStyle = this.document.documentElement.style;
    rootStyle.setProperty('--mx', `${this.currentX}%`);
    rootStyle.setProperty('--my', `${this.currentY}%`);
  }
}
