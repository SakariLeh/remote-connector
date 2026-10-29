import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import type { Theme } from './types';

const THEME_STORAGE_KEY = 'workpulse-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly theme = signal<Theme>(this.readInitialTheme());

  constructor() {
    this.applyTheme(this.theme());
  }

  toggle(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.applyTheme(theme);
    if (!this.browser) {
      return;
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Unable to save the selected theme.', error);
    }
  }

  private readInitialTheme(): Theme {
    if (!this.browser) {
      return 'dark';
    }

    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    } catch (error) {
      console.warn('Unable to read the saved theme.', error);
    }

    return this.document.defaultView?.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }

  private applyTheme(theme: Theme): void {
    if (this.browser) {
      this.document.documentElement.dataset['theme'] = theme;
    }
  }
}
