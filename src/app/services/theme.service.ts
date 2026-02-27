import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<string>('light');
  public theme$ = this.themeSubject.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.setTheme(savedTheme);
      } else {
        // Optional: Check system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark ? 'dark' : 'light');
      }
    }
  }

  setTheme(theme: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', theme);
      this.themeSubject.next(theme);
      
      // Bootstrap 5.3 native dark mode toggle
      this.document.documentElement.setAttribute('data-bs-theme', theme);
    }
  }

  toggleTheme() {
    const nextTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme);
  }
}
