import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'danger' | 'warning' | 'info' | 'confirm';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Alert Normal -->
    <div 
      *ngIf="message && type !== 'confirm'"
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

    <!-- Modal de Confirmación -->
    <div *ngIf="type === 'confirm' && message" class="modal-backdrop" (click)="cancel()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">{{ confirmTitle || 'Confirmar Acción' }}</h4>
            <button 
              type="button" 
              class="btn-close" 
              (click)="cancel()"
              aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="alert alert-warning" role="alert">
              <i class="alert-icon">⚠️</i>
              {{ message }}
            </div>
          </div>
          
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              (click)="cancel()">
              {{ cancelText || 'Cancelar' }}
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              (click)="confirm()">
              {{ confirmText || 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alert {
      position: relative;
      padding: 0.875rem 1.125rem;
      margin-bottom: 0.5rem;
      border: 1px solid transparent;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      line-height: 1.5;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      backdrop-filter: blur(10px);
      overflow: hidden;
      max-width: 100%;
      width: 100%;
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

    /* Estilos del Modal de Confirmación */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1050;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.15s ease-out;
    }

    .modal-dialog {
      position: relative;
      width: auto;
      max-width: 500px;
      margin: 1.75rem;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
    }

    .modal-content {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      background-color: white;
      background-clip: padding-box;
      border: 1px solid rgba(0, 0, 0, 0.175);
      border-radius: 0.375rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .modal-header {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1rem;
      border-bottom: 1px solid #dee2e6;
      border-top-left-radius: calc(0.375rem - 1px);
      border-top-right-radius: calc(0.375rem - 1px);
    }

    .modal-title {
      margin-bottom: 0;
      line-height: 1.5;
      font-size: 1.25rem;
      font-weight: 500;
      color: #212529;
    }

    .btn-close {
      box-sizing: content-box;
      width: 1em;
      height: 1em;
      padding: 0.25em 0.25em;
      color: #000;
      background: transparent;
      border: 0;
      border-radius: 0.375rem;
      opacity: 0.5;
      cursor: pointer;
      font-size: 1.5rem;
      line-height: 1;
    }

    .btn-close:hover {
      opacity: 0.75;
    }

    .modal-body {
      position: relative;
      flex: 1 1 auto;
      padding: 1rem;
    }

    .modal-body .alert {
      margin-bottom: 0;
      border-radius: 0.5rem;
      background: linear-gradient(135deg, #fff3cd 0%, #fefcf3 100%);
      border: 1px solid #ffeaa7;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .modal-body .alert-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .modal-footer {
      display: flex;
      flex-wrap: nowrap;
      flex-shrink: 0;
      align-items: center;
      justify-content: flex-end;
      padding: 1rem;
      border-top: 1px solid #dee2e6;
      border-bottom-right-radius: calc(0.375rem - 1px);
      border-bottom-left-radius: calc(0.375rem - 1px);
      gap: 0.75rem;
      background-color: #f8f9fa;
      min-height: 60px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      line-height: 1.5;
      color: #212529;
      text-align: center;
      text-decoration: none;
      vertical-align: middle;
      cursor: pointer;
      user-select: none;
      background-color: transparent;
      border: 1px solid transparent;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      border-radius: 0.375rem;
      min-width: 80px;
      height: 38px;
      transition: all 0.15s ease-in-out;
      box-sizing: border-box;
    }

    .btn-secondary {
      color: #fff !important;
      background-color: #6c757d !important;
      border-color: #6c757d !important;
      font-weight: 500 !important;
    }

    .btn-secondary:hover {
      color: #fff !important;
      background-color: #5c636a !important;
      border-color: #565e64 !important;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn-secondary:focus {
      color: #fff !important;
      background-color: #5c636a !important;
      border-color: #565e64 !important;
      box-shadow: 0 0 0 0.2rem rgba(130, 138, 145, 0.5) !important;
      outline: 0;
    }

    .btn-secondary:active {
      color: #fff !important;
      background-color: #565e64 !important;
      border-color: #51585e !important;
      transform: translateY(0);
    }

    .btn-danger {
      color: #fff !important;
      background-color: #dc3545 !important;
      border-color: #dc3545 !important;
      font-weight: 500 !important;
    }

    .btn-danger:hover {
      color: #fff !important;
      background-color: #c82333 !important;
      border-color: #bd2130 !important;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn-danger:focus {
      color: #fff !important;
      background-color: #c82333 !important;
      border-color: #bd2130 !important;
      box-shadow: 0 0 0 0.2rem rgba(225, 83, 97, 0.5) !important;
      outline: 0;
    }

    .btn-danger:active {
      color: #fff !important;
      background-color: #bd2130 !important;
      border-color: #b21f2d !important;
      transform: translateY(0);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-50px) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Responsive para botones */
    @media (max-width: 576px) {
      .modal-footer {
        flex-direction: column-reverse;
        gap: 0.5rem;
        padding: 1rem;
      }
      
      .modal-footer .btn {
        width: 100% !important;
        min-width: auto !important;
        justify-content: center;
        margin: 0;
      }
    }

    @media (min-width: 577px) {
      .modal-footer {
        flex-direction: row;
        justify-content: flex-end;
      }
      
      .modal-footer .btn {
        width: auto !important;
        min-width: 80px !important;
      }
    }
  `]
})
export class AlertComponent implements OnInit, OnDestroy, OnChanges {
  @Input() message: string = '';
  @Input() type: AlertType = 'info';
  @Input() dismissible: boolean = true;
  @Input() autoDismiss: boolean = false;
  @Input() autoDismissTime: number = 5000; // 5 segundos por defecto
  
  // Propiedades para confirmación
  @Input() confirmTitle: string = '';
  @Input() confirmText: string = '';
  @Input() cancelText: string = '';
  
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private autoDismissTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    if (this.autoDismiss && this.message && this.type !== 'confirm') {
      this.startAutoDismissTimer();
    }
  }

  ngOnChanges(): void {
    // Reiniciar el timer cuando cambie el mensaje (pero no para confirmaciones)
    if (this.autoDismiss && this.message && this.type !== 'confirm') {
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

  confirm(): void {
    this.confirmed.emit();
    this.close();
  }

  cancel(): void {
    this.cancelled.emit();
    this.close();
  }


}