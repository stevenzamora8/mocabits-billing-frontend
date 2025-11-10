import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-page-intro',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="page-intro-card">
    <div class="page-intro">
    <div class="intro-left">
      <span class="intro-icon" aria-hidden="true"><i [class]="iconClass || 'fas fa-users'"></i></span>
      <div class="intro-text">
        <div class="intro-title">{{ title }}</div>
        <div class="intro-desc">{{ description }}</div>
      </div>
    </div>

    <div class="intro-action" *ngIf="actionTemplate">
      <ng-container *ngTemplateOutlet="actionTemplate"></ng-container>
    </div>
    </div>
  </div>
  `,
  styles: [
    `
    /* Local styles for the reusable page intro card. Copied from clients.component.css
       so the component remains visually consistent when used standalone. */
    :host{display:block;margin-bottom:1rem}

    /* Outer card wrapper - match exactly the inputs card (.filters-section)
       so the intro appears identical to the input-fields card used in Clients. */
    .page-intro-card, .ui-page-intro-card {
      background: white;
      padding: 1rem;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      margin-bottom: 1.5rem;
      display: flex;
      gap: 0.75rem;
      align-items: center;
      position: relative;
      overflow: visible;
    }

    .page-intro-card::before, .ui-page-intro-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--logo-primary-color, #2563eb), var(--logo-secondary-color, #059669));
      border-radius: 16px 16px 0 0;
    }

    /* Inner content area: keep layout but remove the duplicated outer padding
       so the visual spacing matches the input card exactly. */
    .page-intro, .ui-page-intro {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0; /* outer wrapper provides the padding now */
      background: transparent;
      border-radius: 0;
      margin: 0;
      position: relative;
      overflow: visible;
      flex: 1 1 auto;
    }

    .intro-left { display:flex; align-items:center; gap:0.75rem; }

    .intro-icon {
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--logo-primary-color, #2563eb), var(--logo-secondary-color, #059669));
      color: white;
      font-size: 0.95rem;
      box-shadow: 0 6px 18px rgba(16,24,40,0.06);
    }

    .intro-icon i { font-size: 1rem; line-height: 1; display: inline-block; }

    .intro-text .intro-title { font-weight:700; color:#0f172a; font-size:1rem; margin:0; }
    .intro-text .intro-desc { color:#475569; font-size:0.9rem; margin-top:2px; }

    .intro-action { display:flex; align-items:center; margin-left:1rem; }
    .intro-action app-button { height:40px; }

    @media (max-width:720px) {
      .page-intro { flex-direction:column; align-items:stretch; gap:0.5rem; }
      .intro-left { display:flex; gap:0.5rem; }
      .intro-action { justify-content:flex-end; }
    }
    `
  ]
})
export class UiPageIntroComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() iconClass?: string;
  @Input() actionTemplate?: TemplateRef<any> | null = null;
}
