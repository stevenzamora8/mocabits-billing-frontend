// Re-export from the new UI location for backward compatibilityimport { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges } from '@angular/core';

export { UiAlertComponent as AlertComponent, UiAlertType as AlertType } from '../shared/components/ui/alert/alert.component';import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

export type AlertType = 'success' | 'danger' | 'warning' | 'info' | 'confirm';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms cubic-bezier(0.2, 0.8, 0.2, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <!-- Modern Toast Alert -->
    <div 
      *ngIf="message && type !== 'confirm'"
      class="toast-container"
      [class.toast-fixed]="fixed"
      [@slideIn]
      role="status"
      aria-live="polite"
      aria-atomic="true">
      
      <div class="toast" [class]="'toast-' + type">
        <div class="toast-content">
          <div class="toast-icon">
            <svg *ngIf="type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <svg *ngIf="type === 'danger'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <svg *ngIf="type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <svg *ngIf="type === 'info'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          
          <div class="toast-text">
            <div class="toast-title" [innerHTML]="getTitle()"></div>
            <div class="toast-message">{{ message }}</div>
          </div>
          
          <button 
            *ngIf="dismissible"
            type="button" 
            class="toast-close" 
            (click)="close()"
            aria-label="Cerrar notificación">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <!-- Progress bar for auto-dismiss -->
        <div 
          *ngIf="autoDismiss" 
          class="toast-progress"
          [style.animation-duration]="autoDismissTime + 'ms'">
        </div>
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
    /* Modern Toast Alert - Premium Design */
    .toast-container {
      pointer-events: none;
      z-index: 99999;
    }

    .toast-fixed {
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      z-index: 99999 !important;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      width: 380px;
      max-width: calc(100vw - 40px);
      background: rgba(255,255,255,0.85);
      border-radius: 16px;
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.12),
        0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      overflow: hidden;
      position: relative;
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
    }

    /* Decorative gradient stripe on top matching project colors */
    .toast::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #2563eb, #059669);
    }

    .toast-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 18px;
      position: relative;
    }

    .toast-icon {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 0;
      box-shadow: 0 8px 20px rgba(2,6,23,0.08);
      font-size: 18px;
    }

    .toast-text {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: 700;
      font-size: 15px;
      line-height: 1.3;
      margin-bottom: 4px;
      letter-spacing: -0.01em;
    }

    .toast-message {
      font-size: 14px;
      line-height: 1.4;
      color: #4b5563;
      font-weight: 500;
    }

    .toast-close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 28px;
      height: 28px;
      border: none;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      transition: all 150ms ease;
      opacity: 0.8;
    }

    .toast-close:hover {
      background: rgba(0, 0, 0, 0.08);
      transform: scale(1.05);
      opacity: 1;
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      transform-origin: left;
      animation-name: toast-progress;
      animation-timing-function: linear;
      animation-fill-mode: forwards;
    }

    @keyframes toast-progress {
      from { width: 100%; }
      to { width: 0%; }
    }

    /* Success variant */
    .toast-success .toast-icon {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }
    .toast-success .toast-title {
      color: #065f46;
    }
    .toast-success .toast-progress {
      background: linear-gradient(90deg, #10b981, #059669);
    }

    /* Error variant */
    .toast-danger .toast-icon {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
    }
    .toast-danger .toast-title {
      color: #991b1b;
    }
    .toast-danger .toast-progress {
      background: linear-gradient(90deg, #ef4444, #dc2626);
    }

    /* Warning variant */
    .toast-warning .toast-icon {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
    }
    .toast-warning .toast-title {
      color: #92400e;
    }
    .toast-warning .toast-progress {
      background: linear-gradient(90deg, #f59e0b, #d97706);
    }

    /* Info variant */
    .toast-info .toast-icon {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
    }
    .toast-info .toast-title {
      color: #1d4ed8;
    }
    .toast-info .toast-progress {
      background: linear-gradient(90deg, #3b82f6, #2563eb);
    }

    /* Responsive */
    @media (max-width: 480px) {
      .toast-fixed {
        top: 16px !important;
        right: 16px !important;
        left: 16px !important;
      }
      
      .toast {
        width: 100%;
        max-width: none;
      }
    }
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
    
    /* Project-styled alert to match brand look */
    .alert {
      position: relative;
      padding: 1rem 1.25rem;
      margin-bottom: 0.75rem;
      border-radius: 12px;
      font-size: 0.95rem;
      line-height: 1.4;
      transition: transform 240ms cubic-bezier(.2,.8,.2,1), opacity 200ms ease;
      box-shadow: 0 10px 30px rgba(2,6,23,0.08);
      backdrop-filter: blur(6px);
      overflow: visible;
      max-width: 720px;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border: 1px solid rgba(2,6,23,0.04);
      background: var(--bg-surface, #ffffff);
      color: var(--text-primary, #0f172a);
    }
    
    .alert-content { display:flex; align-items:center; gap:0.75rem; flex:1; }
    
    .alert-icon { flex-shrink:0; width:20px; height:20px; display:flex; align-items:center; justify-content:center; }
    
    .alert-message { font-weight:600; font-size:0.98rem; color:var(--text-primary, #0f172a); }
    
    .alert-close { position: absolute; right: 10px; top: 8px; background: transparent; border: none; padding:6px; border-radius:6px; cursor:pointer; color: rgba(15,23,42,0.6); }
    .alert-close:hover { background: rgba(15,23,42,0.04); color: rgba(15,23,42,0.9); }
    
    .alert-progress { position: absolute; bottom: -4px; left: 0; height: 4px; border-radius: 0 0 12px 12px; animation: progress-countdown linear; transform-origin: left; }
    
    @keyframes progress-countdown { from { width: 100%; } to { width: 0%; } }
    
    /* Brand variants */
    .alert-success { background: linear-gradient(90deg, rgba(var(--logo-primary-rgb, 34,197,94),0.08), rgba(var(--logo-secondary-rgb, 59,130,246),0.04)); border-color: rgba(var(--logo-primary-rgb, 34,197,94),0.18); color: var(--brand-success, #059669); }
    .alert-success .alert-progress { background: var(--brand-success, #10b981); }
    
    .alert-danger { background: linear-gradient(90deg, rgba(239,68,68,0.06), rgba(220,38,38,0.03)); border-color: rgba(239,68,68,0.16); color: var(--brand-danger, #dc2626); }
    .alert-danger .alert-progress { background: var(--brand-danger, #ef4444); }
    
    .alert-warning { background: linear-gradient(90deg, rgba(245,158,11,0.06), rgba(245,158,11,0.03)); border-color: rgba(245,158,11,0.14); color: #b45309; }
    .alert-warning .alert-progress { background: #f59e0b; }
    
    .alert-info { background: linear-gradient(90deg, rgba(59,130,246,0.06), rgba(37,99,235,0.03)); border-color: rgba(59,130,246,0.14); color: #1e40af; }
    .alert-info .alert-progress { background: #3b82f6; }
    
    .alert-auto-dismiss { animation: alert-fade-in 0.28s ease-out; }
    @keyframes alert-fade-in { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform: translateY(0); } }
    
    /* Fixed overlay variant */
    .alert-fixed {
      position: fixed !important;
      top: 88px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 720px !important;
      max-width: calc(100% - 32px) !important;
      z-index: 99999 !important;
      border-radius: 12px !important;
    }
    
    /* Modal confirm styles kept as-is, but slightly tightened */
    .modal-backdrop { position: fixed; top:0; left:0; z-index:1050; width:100%; height:100%; background-color: rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; }
    .modal-dialog { max-width:520px; margin:1.5rem; }
    .modal-content { border-radius:10px; overflow:hidden; }
    .modal-footer { padding: 0.75rem; display:flex; gap:0.5rem; justify-content:flex-end; }
    
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
    
    /* Fixed/overlaid alert variant to ensure visibility above app content */
    .alert-fixed {
      position: fixed !important;
      top: 80px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 680px !important;
      max-width: calc(100% - 32px) !important;
      z-index: 9999 !important;
      box-shadow: 0 10px 40px rgba(2,6,23,0.15) !important;
      border-radius: 12px !important;
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
  // When true, position the alert fixed at the top center of the viewport with high z-index
  @Input() fixed: boolean = false;
  
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

  getTitle(): string {
    switch (this.type) {
      case 'success': return '✅ Éxito';
      case 'danger': return '❌ Error';
      case 'warning': return '⚠️ Atención';
      case 'info': return 'ℹ️ Información';
      case 'confirm': return '⚡ Confirmar';
      default: return '📝 Notificación';
    }
  }
}