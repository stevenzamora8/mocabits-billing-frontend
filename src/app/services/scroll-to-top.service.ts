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
      .subscribe((event: NavigationEnd) => {
        // Immediate scroll
        this.scrollToTop();
        // Also try after a small delay to ensure DOM is rendered
        setTimeout(() => {
          this.scrollToTop();
        }, 50);
      });
  }

  /**
   * Scroll both the document viewport and any scrollable containers to the top.
   */
  scrollToTop(): void {
    // Multiple approaches to ensure scroll works
    
    // Approach 1: ViewportScroller (Angular recommended)
    try {
      this.viewportScroller.scrollToPosition([0, 0]);
    } catch (e) {
      // Ignore
    }
    
    // Approach 2: Direct window scroll (most reliable)
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (e) {
      // Ignore
    }
    
    // Approach 3: Document scroll fallback
    try {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (e) {
      // Ignore
    }

    // Scroll containers after DOM stabilizes
    setTimeout(() => {
      this.scrollContainersToTop();
    }, 10);
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
      '.page-content',
      '[data-scroll-container]'
    ];

    containerSelectors.forEach(selector => {
      try {
        const containers = document.querySelectorAll(selector);
        containers.forEach(container => {
          const element = container as HTMLElement;
          if (element) {
            if (typeof element.scrollTo === 'function') {
              element.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            } else {
              element.scrollTop = 0;
            }
          }
        });
      } catch (e) {
        // Ignore DOM access errors
      }
    });
  }
}