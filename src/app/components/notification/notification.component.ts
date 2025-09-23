import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationConfig {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // En milisegundos, 0 para permanente
  showClose?: boolean;
  actionText?: string;
  actionHandler?: () => void;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="notification"
      [class]="'notification-' + config.type"
      [class.notification-visible]="isVisible"
      [@slideIn]="isVisible ? 'in' : 'out'"
      role="alert"
      [attr.aria-live]="config.type === 'error' ? 'assertive' : 'polite'">
      
      <div class="notification-icon">
        <!-- Success Icon -->
        <svg *ngIf="config.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        
        <!-- Error Icon -->
        <svg *ngIf="config.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        
        <!-- Warning Icon -->
        <svg *ngIf="config.type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
        
        <!-- Info Icon -->
        <svg *ngIf="config.type === 'info'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </div>
      
      <div class="notification-content">
        <div class="notification-title" *ngIf="config.title">{{ config.title }}</div>
        <div class="notification-message">{{ config.message }}</div>
      </div>
      
      <div class="notification-actions">
        <button 
          *ngIf="config.actionText && config.actionHandler"
          class="notification-action"
          (click)="handleAction()"
          type="button">
          {{ config.actionText }}
        </button>
        
        <button 
          *ngIf="config.showClose !== false"
          class="notification-close"
          (click)="close()"
          type="button"
          aria-label="Cerrar notificación">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <!-- Progress bar for timed notifications -->
      <div 
        *ngIf="config.duration && config.duration > 0" 
        class="notification-progress"
        [style.animation-duration]="config.duration + 'ms'">
      </div>
    </div>
  `,
  styles: [`
    .notification {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 0.5rem;
      position: relative;
      overflow: hidden;
      max-width: 480px;
      min-width: 320px;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease-out;
    }

    .notification-visible {
      opacity: 1;
      transform: translateX(0);
    }

    .notification-success {
      background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
      border: 1px solid #bbf7d0;
      color: #166534;
    }

    .notification-error {
      background: linear-gradient(135deg, #fef2f2 0%, #fef1f1 100%);
      border: 1px solid #fecaca;
      color: #991b1b;
    }

    .notification-warning {
      background: linear-gradient(135deg, #fffbeb 0%, #fefce8 100%);
      border: 1px solid #fed7aa;
      color: #92400e;
    }

    .notification-info {
      background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
      border: 1px solid #bfdbfe;
      color: #1e40af;
    }

    .notification-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-top: 0.125rem;
    }

    .notification-success .notification-icon {
      background: #10b981;
      color: white;
    }

    .notification-error .notification-icon {
      background: #ef4444;
      color: white;
    }

    .notification-warning .notification-icon {
      background: #f59e0b;
      color: white;
    }

    .notification-info .notification-icon {
      background: #3b82f6;
      color: white;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
      line-height: 1.25;
    }

    .notification-message {
      font-size: 0.875rem;
      line-height: 1.4;
      opacity: 0.9;
    }

    .notification-actions {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .notification-action {
      background: none;
      border: 1px solid currentColor;
      color: inherit;
      padding: 0.375rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .notification-action:hover {
      background: currentColor;
      color: white;
    }

    .notification-close {
      background: none;
      border: none;
      color: inherit;
      padding: 0.25rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      opacity: 0.7;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-close:hover {
      background: rgba(0, 0, 0, 0.1);
      opacity: 1;
    }

    .notification-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: currentColor;
      opacity: 0.3;
      animation: progressBar linear forwards;
    }

    @keyframes progressBar {
      from { width: 100%; }
      to { width: 0%; }
    }

    /* Responsive */
    @media (max-width: 480px) {
      .notification {
        max-width: calc(100vw - 2rem);
        min-width: unset;
        margin: 0 1rem 0.5rem 1rem;
      }
      
      .notification-title {
        font-size: 0.8rem;
      }
      
      .notification-message {
        font-size: 0.8rem;
      }
      
      .notification-action {
        font-size: 0.7rem;
        padding: 0.25rem 0.5rem;
      }
    }
  `],
  animations: []
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() config!: NotificationConfig;
  @Output() onClose = new EventEmitter<void>();
  @Output() onAction = new EventEmitter<void>();

  isVisible = false;
  private autoCloseTimer?: number;

  ngOnInit(): void {
    // Mostrar la notificación con una pequeña demora para la animación
    setTimeout(() => {
      this.isVisible = true;
    }, 100);

    // Configurar auto-cierre si se especifica duración
    if (this.config.duration && this.config.duration > 0) {
      this.autoCloseTimer = window.setTimeout(() => {
        this.close();
      }, this.config.duration);
    }
  }

  ngOnDestroy(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
  }

  close(): void {
    this.isVisible = false;
    
    // Esperar a que termine la animación antes de emitir el evento
    setTimeout(() => {
      this.onClose.emit();
    }, 300);
  }

  handleAction(): void {
    if (this.config.actionHandler) {
      this.config.actionHandler();
    }
    this.onAction.emit();
  }
}