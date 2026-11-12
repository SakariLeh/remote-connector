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
  private pointerInWindow = false;

  private readonly handleMouseMove = (event: MouseEvent): void => {
    this.pointerInWindow = true;
    const point = this.toHeroPoint(event.clientX, event.clientY);
    if (!point) {
      return;
    }
    this.targetX = point.x;
    this.targetY = point.y;
    this.scheduleGradientFrame();
  };

  private readonly handleMouseLeave = (): void => {
    this.pointerInWindow = false;
    this.setTargetToHeroCenter();
    this.scheduleGradientFrame();
  };

  private readonly handleResize = (): void => {
    if (!this.pointerInWindow) {
      this.setTargetToHeroCenter();
      this.scheduleGradientFrame();
    }
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
    if (this.cursorGradientEnabled) {
      window.removeEventListener('mousemove', this.handleMouseMove);
      document.documentElement.removeEventListener('mouseleave', this.handleMouseLeave);
      window.removeEventListener('resize', this.handleResize);
    }

    if (this.animationFrame !== null) {
      window.cancelAnimationFrame(this.animationFrame);
    }
  }

  private heroElement(): HTMLElement | null {
    return this.host.nativeElement.querySelector('.hero');
  }

  private initializeCursorGradient(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    this.setTargetToHeroCenter();
    this.currentX = this.targetX;
    this.currentY = this.targetY;
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
    document.documentElement.addEventListener('mouseleave', this.handleMouseLeave);
    window.addEventListener('resize', this.handleResize);
  }

  private setTargetToHeroCenter(): void {
    const hero = this.heroElement();
    if (!hero) {
      return;
    }
    this.targetX = hero.clientWidth / 2;
    this.targetY = hero.clientHeight / 2;
  }

  private toHeroPoint(clientX: number, clientY: number): { x: number; y: number } | null {
    const hero = this.heroElement();
    if (!hero) {
      return null;
    }
    const rect = hero.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
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
    this.mx.set(`${this.currentX}px`);
    this.my.set(`${this.currentY}px`);
  }
}
