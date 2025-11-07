import { Directive, OnInit, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appScrollToTop]',
  standalone: true
})
export class ScrollToTopDirective implements OnInit, AfterViewInit {
  
  ngOnInit(): void {
    this.scrollToTop();
  }
  
  ngAfterViewInit(): void {
    // Ensure scroll after view is fully initialized
    setTimeout(() => {
      this.scrollToTop();
    }, 0);
  }
  
  private scrollToTop(): void {
    // Multiple approaches to ensure scroll works across different scenarios
    
    // 1. Window scroll (most reliable)
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (e) {
      // Fallback for older browsers or special environments
      try {
        window.scrollTo(0, 0);
      } catch (fallbackError) {
        // Ignore
      }
    }
    
    // 2. Document element scroll
    try {
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    } catch (e) {
      // Ignore
    }
    
    // 3. Scroll containers
    try {
      const containers = document.querySelectorAll('[data-scroll-container], .clients-container, .main-content, .content-wrapper');
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
      // Ignore
    }
  }
}