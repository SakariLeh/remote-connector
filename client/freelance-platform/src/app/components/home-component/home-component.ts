import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
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
  private readonly host = inject(ElementRef<HTMLElement>);
  private static readonly LERP_FACTOR = 0.08;
  private static readonly STOP_THRESHOLD = 0.1;

  protected readonly categories = signal<TaskCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly mx = signal('50%');
  protected readonly my = signal('50%');

  private targetX = 0;
  private targetY = 0;
  private currentX = 0;
  private currentY = 0;
  private animationFrame: number | null = null;
  private cursorGradientEnabled = false;
  private pointerOnHero = false;
  private hero: HTMLElement | null = null;
  private hoverMedia: MediaQueryList | null = null;
  private reducedMotionMedia: MediaQueryList | null = null;

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (!this.pointerOnHero || !this.hero) {
      return;
    }

    const rect = this.hero.getBoundingClientRect();
    this.targetX = event.clientX - rect.left;
    this.targetY = event.clientY - rect.top;
    this.scheduleGradientFrame();
  };

  private readonly handlePointerEnter = (event: PointerEvent): void => {
    this.pointerOnHero = true;
    this.handlePointerMove(event);
  };

  private readonly handlePointerLeave = (): void => {
    this.pointerOnHero = false;
    this.setTargetToHeroCenter();
    this.scheduleGradientFrame();
  };

  private readonly handleResize = (): void => {
    if (!this.pointerOnHero) {
      this.setTargetToHeroCenter();
      this.currentX = this.targetX;
      this.currentY = this.targetY;
      this.writeGradientPosition();
    }
  };

  private readonly handleMediaChange = (): void => {
    this.updateCursorGradient();
  };

  constructor() {
    afterNextRender(() => this.initializeCursorGradient());
  }

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

  ngOnDestroy(): void {
    this.detachCursorTracking();
    this.hoverMedia?.removeEventListener('change', this.handleMediaChange);
    this.reducedMotionMedia?.removeEventListener('change', this.handleMediaChange);
    window.removeEventListener('resize', this.handleResize);
  }

  private initializeCursorGradient(): void {
    this.hero = this.host.nativeElement.querySelector('.hero');
    if (!this.hero || typeof window.matchMedia !== 'function') {
      return;
    }

    this.setTargetToHeroCenter();
    this.currentX = this.targetX;
    this.currentY = this.targetY;
    this.writeGradientPosition();

    this.hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
    this.reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.hoverMedia.addEventListener('change', this.handleMediaChange);
    this.reducedMotionMedia.addEventListener('change', this.handleMediaChange);
    window.addEventListener('resize', this.handleResize, { passive: true });
    this.updateCursorGradient();
  }

  private updateCursorGradient(): void {
    const shouldTrack =
      this.hoverMedia !== null &&
      this.hoverMedia.matches &&
      this.reducedMotionMedia !== null &&
      !this.reducedMotionMedia.matches;

    if (shouldTrack === this.cursorGradientEnabled) {
      return;
    }

    if (shouldTrack) {
      this.attachCursorTracking();
      return;
    }

    this.detachCursorTracking();
    this.pointerOnHero = false;
    this.setTargetToHeroCenter();
    this.currentX = this.targetX;
    this.currentY = this.targetY;
    this.writeGradientPosition();
  }

  private attachCursorTracking(): void {
    if (!this.hero) {
      return;
    }

    this.cursorGradientEnabled = true;
    this.hero.addEventListener('pointerenter', this.handlePointerEnter, { passive: true });
    this.hero.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    this.hero.addEventListener('pointerleave', this.handlePointerLeave, { passive: true });
  }

  private detachCursorTracking(): void {
    this.cursorGradientEnabled = false;
    this.hero?.removeEventListener('pointerenter', this.handlePointerEnter);
    this.hero?.removeEventListener('pointermove', this.handlePointerMove);
    this.hero?.removeEventListener('pointerleave', this.handlePointerLeave);

    if (this.animationFrame !== null) {
      window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private setTargetToHeroCenter(): void {
    if (!this.hero) {
      return;
    }
    this.targetX = this.hero.clientWidth / 2;
    this.targetY = this.hero.clientHeight / 2;
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

    if (
      Math.abs(this.targetX - this.currentX) < HomeComponent.STOP_THRESHOLD &&
      Math.abs(this.targetY - this.currentY) < HomeComponent.STOP_THRESHOLD
    ) {
      this.currentX = this.targetX;
      this.currentY = this.targetY;
      this.writeGradientPosition();
      return;
    }

    this.writeGradientPosition();
    this.scheduleGradientFrame();
  }

  private writeGradientPosition(): void {
    this.mx.set(`${this.currentX}px`);
    this.my.set(`${this.currentY}px`);
  }
}
