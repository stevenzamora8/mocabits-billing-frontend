import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScrollToTopService {
  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller
  ) {}

  /**
   * Initialize scroll-to-top behavior on route changes.
   * Call this once in app initialization (e.g., app.component.ts ngOnInit).
   */
  initialize(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.scrollToTop();
      });
  }

  /**
   * Scroll both the document viewport and any scrollable containers to the top.
   */
  scrollToTop(): void {
    // Scroll the main viewport
    try {
      this.viewportScroller.scrollToPosition([0, 0]);
    } catch (e) {
      // Fallback for environments where ViewportScroller might not work
      try {
        window.scrollTo(0, 0);
      } catch (fallbackError) {
        // Ignore if window is not available (SSR)
      }
    }

    // Small delay to ensure DOM is rendered before scrolling containers
    setTimeout(() => {
      this.scrollContainersToTop();
    }, 0);
  }

  /**
   * Scroll common scrollable containers to the top.
   * Add more selectors here if you have other scrollable containers.
   */
  private scrollContainersToTop(): void {
    const containerSelectors = [
      '.clients-container',
      '.dashboard-container',
      '.main-content',
      '.content-wrapper',
      // Add more container selectors as needed
    ];

    containerSelectors.forEach(selector => {
      try {
        const container = document.querySelector(selector) as HTMLElement | null;
        if (container) {
          if (typeof container.scrollTo === 'function') {
            container.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          } else {
            container.scrollTop = 0;
          }
        }
      } catch (e) {
        // Ignore DOM access errors (e.g., during SSR)
      }
    });
  }
}