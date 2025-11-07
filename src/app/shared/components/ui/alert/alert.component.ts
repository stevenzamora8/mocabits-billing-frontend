import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type UiAlertType = 'success' | 'danger' | 'warning' | 'info' | 'confirm';

@Component({
  selector: 'ui-alert',
  standalone: true,
  imports: [CommonModule],
  // Note: animations removed to avoid requiring global animation providers in app bootstrap.
  template: `
  <div class="ui-toast" *ngIf="visible" [class.fixed]="fixed" [class.show]="visibleShown" role="status" aria-live="polite">
    <div class="stripe"></div>
    <div class="content">
      <div class="icon" [ngClass]="'icon-' + type">
        <ng-container [ngSwitch]="type">
          <i *ngSwitchCase="'success'" class="fas fa-check"></i>
          <i *ngSwitchCase="'danger'" class="fas fa-times"></i>
          <i *ngSwitchCase="'warning'" class="fas fa-exclamation"></i>
          <i *ngSwitchDefault class="fas fa-info"></i>
        </ng-container>
      </div>

      <div class="text">
        <div class="title" *ngIf="title">{{ title }}</div>
        <div class="message">{{ displayMessage || title || defaultTitle }}</div>
      </div>

      <button aria-label="Cerrar" class="close" *ngIf="dismissible" (click)="close()"><i class="fas fa-times"></i></button>
    </div>

    <div *ngIf="autoDismiss" class="progress" [style.animation-duration]="duration + 'ms'"></div>
  </div>
  `,
  styles: [
    `
    :host { display: block; font-family: var(--font-family-primary, system-ui); }
    
    .ui-toast { 
      pointer-events: auto; 
      width: 420px; 
      max-width: calc(100vw - 32px); 
      background: white; 
      border-radius: 16px; 
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); 
      border: 1px solid #e2e8f0; 
      overflow: hidden; 
      position: relative; 
    }
    
    .ui-toast.fixed { 
      position: fixed; 
      top: 20px; 
      right: 20px; 
      z-index: 99999; 
    }
    
    .ui-toast::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--logo-primary-color, #2563eb), var(--logo-secondary-color, #059669));
      border-radius: 16px 16px 0 0;
    }
    
    .ui-toast .stripe { 
      display: none; 
    }
    
    .ui-toast .content { 
      display: flex; 
      gap: 12px; 
      align-items: center; 
      padding: 16px 20px; 
    }
    
    .ui-toast .icon { 
      width: 40px; 
      height: 40px; 
      border-radius: 10px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: white; 
      font-size: 16px; 
      flex: 0 0 40px; 
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.18);
    }
    
    .ui-toast .icon.icon-success { 
      background: linear-gradient(135deg, #10b981, #059669); 
    }
    
    .ui-toast .icon.icon-danger { 
      background: linear-gradient(135deg, #ef4444, #dc2626); 
    }
    
    .ui-toast .icon.icon-warning { 
      background: linear-gradient(135deg, #f59e0b, #d97706); 
    }
    
    .ui-toast .icon.icon-info { 
      background: linear-gradient(135deg, #3b82f6, var(--logo-primary-color, #2563eb)); 
    }
    
    .ui-toast .text { 
      flex: 1; 
      min-width: 0; 
    }
    
    .ui-toast .title { 
      font-weight: 700; 
      color: #1e293b; 
      margin-bottom: 4px; 
      font-size: 0.95rem; 
    }
    
    .ui-toast { transform: translateX(100%); opacity: 0; transition: transform 320ms cubic-bezier(.2,.8,.2,1), opacity 320ms ease; }
    .ui-toast.show { transform: translateX(0); opacity: 1; }

    .ui-toast .message { 
      color: #64748b; 
      font-weight: 500; 
      font-size: 0.95rem; 
      line-height: 1.4;
      min-height: 20px;
      display: block;
    }
    
    .ui-toast .close { 
      border: none; 
      background: transparent; 
      color: #64748b; 
      cursor: pointer; 
      font-size: 14px; 
      padding: 6px; 
      border-radius: 8px; 
      transition: all 0.2s ease;
    }
    
    .ui-toast .close:hover { 
      background: #f1f5f9; 
      color: #334155; 
    }
    
    .ui-toast .progress { 
      position: absolute; 
      bottom: 0; 
      left: 0; 
      height: 4px; 
      background: linear-gradient(90deg, var(--logo-primary-color, #2563eb), var(--logo-secondary-color, #059669)); 
      animation-name: progressBar; 
      animation-timing-function: linear; 
      animation-fill-mode: forwards; 
    }
    
    @keyframes progressBar { 
      from { width: 100%; } 
      to { width: 0%; } 
    }
    
    @media (max-width: 480px) { 
      .ui-toast.fixed { 
        left: 16px; 
        right: 16px; 
        top: 16px; 
        transform: none; 
      } 
      .ui-toast { 
        width: auto; 
      } 
    }
    `
  ]
})
export class UiAlertComponent implements OnInit, OnDestroy {
  @Input() message: string = '';
  @Input() type: UiAlertType = 'success';
  @Input() title?: string;
  @Input() dismissible = true;
  @Input() autoDismiss = true;
  @Input() duration = 3000; // ms
  @Input() fixed = true;

  @Output() closed = new EventEmitter<void>();

  visible = false;
  visibleShown = false;
  defaultTitle = 'Notificación';
  
  // Expose a trimmed version of the message to avoid empty/whitespace-only content
  get displayMessage(): string {
    return (this.message || '').toString().trim();
  }

  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    // small delay to allow template to render before showing animation
    setTimeout(() => this.show(), 8);
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private show() {
    this.visible = true;
    // trigger CSS entrance after element exists
    setTimeout(() => this.visibleShown = true, 20);

    if (this.autoDismiss && this.duration > 0) {
      this.clearTimer();
      this.timer = setTimeout(() => this.close(), this.duration);
    }
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  close() {
    this.clearTimer();
    // play CSS leave animation, then remove from DOM
    this.visibleShown = false;
    setTimeout(() => {
      this.visible = false;
      this.closed.emit();
    }, 240);
  }
}
