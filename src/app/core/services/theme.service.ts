import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'capital-finance-theme';
  isDarkMode = signal<boolean>(false);

  constructor() {
    // Load persisted theme
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefersDark);
    }

    // Effect to apply classes automatically
    effect(() => {
      const dark = this.isDarkMode();
      localStorage.setItem(this.THEME_KEY, dark ? 'dark' : 'light');
      if (dark) {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
      } else {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark-theme');
      }
    });
  }

  toggleTheme() {
    this.isDarkMode.update(prev => !prev);
  }
}
