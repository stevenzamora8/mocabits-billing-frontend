import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="message"
      class="alert"
      [class]="'alert-' + type"
      [class.alert-dismissible]="dismissible"
      [class.alert-auto-dismiss]="autoDismiss"
      role="alert">
      
      <div class="alert-content">
        <div class="alert-icon">
          <svg *ngIf="type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <svg *ngIf="type === 'danger'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <svg *ngIf="type === 'warning'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <svg *ngIf="type === 'info'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <span class="alert-message">{{ message }}</span>
      </div>
      
      <button 
        *ngIf="dismissible"
        type="button" 
        class="alert-close" 
        (click)="close()"
        aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
      
      <div 
        *ngIf="autoDismiss" 
        class="alert-progress"
        [style.animation-duration.ms]="autoDismissTime">
      </div>
    </div>
  `,
  styles: [`
    .alert {
      position: relative;
      padding: 0.875rem 1.125rem;
      margin-bottom: 1rem;
      border: 1px solid transparent;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      line-height: 1.5;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      backdrop-filter: blur(10px);
      overflow: hidden;
    }
    
    .alert-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .alert-icon {
      flex-shrink: 0;
      width: 1.125rem;
      height: 1.125rem;
    }
    
    .alert-message {
      flex: 1;
      font-weight: 500;
    }
    
    .alert-close {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: none;
      border: none;
      padding: 0.25rem;
      cursor: pointer;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
      opacity: 0.6;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .alert-close:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.1);
    }
    
    .alert-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 0 0 0.75rem 0.75rem;
      animation: progress-countdown linear;
      transform-origin: left;
    }
    
    @keyframes progress-countdown {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
    
    .alert-success {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%);
      border-color: rgba(34, 197, 94, 0.2);
      color: #059669;
    }
    
    .alert-success .alert-progress {
      background: #10b981;
    }
    
    .alert-danger {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
      border-color: rgba(239, 68, 68, 0.2);
      color: #dc2626;
    }
    
    .alert-danger .alert-progress {
      background: #ef4444;
    }
    
    .alert-warning {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%);
      border-color: rgba(245, 158, 11, 0.2);
      color: #d97706;
    }
    
    .alert-warning .alert-progress {
      background: #f59e0b;
    }
    
    .alert-info {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%);
      border-color: rgba(59, 130, 246, 0.2);
      color: #2563eb;
    }
    
    .alert-info .alert-progress {
      background: #3b82f6;
    }
    
    .alert-auto-dismiss {
      animation: alert-fade-in 0.3s ease-out;
    }
    
    @keyframes alert-fade-in {
      from {
        opacity: 0;
        transform: translateY(-0.5rem);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .alert:not([style*="display: none"]) {
      animation: alert-fade-out 0.3s ease-in forwards;
    }
  `]
})
export class AlertComponent implements OnInit, OnDestroy, OnChanges {
  @Input() message: string = '';
  @Input() type: AlertType = 'info';
  @Input() dismissible: boolean = true;
  @Input() autoDismiss: boolean = false;
  @Input() autoDismissTime: number = 5000; // 5 segundos por defecto
  @Output() closed = new EventEmitter<void>();

  private autoDismissTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    if (this.autoDismiss && this.message) {
      this.startAutoDismissTimer();
    }
  }

  ngOnChanges(): void {
    // Reiniciar el timer cuando cambie el mensaje
    if (this.autoDismiss && this.message) {
      this.startAutoDismissTimer();
    } else if (!this.message) {
      this.clearAutoDismissTimer();
    }
  }

  ngOnDestroy(): void {
    this.clearAutoDismissTimer();
  }

  private startAutoDismissTimer(): void {
    this.clearAutoDismissTimer();
    this.autoDismissTimer = setTimeout(() => {
      this.close();
    }, this.autoDismissTime);
  }

  private clearAutoDismissTimer(): void {
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = undefined;
    }
  }

  close(): void {
    this.clearAutoDismissTimer();
    this.message = '';
    this.closed.emit();
  }


}