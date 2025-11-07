import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

export type UiConfirmType = 'warning' | 'danger' | 'info';

@Component({
  selector: 'ui-confirm',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
  <div class="ui-confirm-overlay" *ngIf="visible" (click)="onOverlayClick($event)">
    <div class="ui-confirm" [class.show]="visibleShown" role="dialog" aria-modal="true">
      <div class="stripe"></div>
      <div class="content">
        <div class="icon" [ngClass]="'icon-' + type">
          <ng-container [ngSwitch]="type">
            <i *ngSwitchCase="'danger'" class="fas fa-exclamation-triangle"></i>
            <i *ngSwitchCase="'warning'" class="fas fa-exclamation-circle"></i>
            <i *ngSwitchDefault class="fas fa-question-circle"></i>
          </ng-container>
        </div>

        <div class="text">
          <div class="title" *ngIf="title">{{ title }}</div>
          <div class="message">{{ message }}</div>
        </div>
      </div>

      <div class="actions">
        <app-button 
          variant="outline" 
          size="md" 
          (click)="cancel()">
          {{ cancelText }}
        </app-button>
        <app-button 
          [variant]="type === 'danger' ? 'danger' : 'primary'" 
          size="md" 
          (click)="confirm()">
          {{ confirmText }}
        </app-button>
      </div>
    </div>
  </div>
  `,
  styles: [
    `
    :host { display: block; font-family: var(--font-family-primary, system-ui); }
    
    .ui-confirm-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      backdrop-filter: blur(4px);
    }
    
    .ui-confirm { 
      width: 100%;
      max-width: 440px;
      background: white; 
      border-radius: 16px; 
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2); 
      border: 1px solid #e2e8f0; 
      overflow: hidden; 
      position: relative;
      transform: scale(0.95) translateY(20px);
      opacity: 0;
      transition: all 300ms cubic-bezier(.2,.8,.2,1);
    }
    
    .ui-confirm.show {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
    
    .ui-confirm::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--logo-primary-color, #2563eb), var(--logo-secondary-color, #059669));
      border-radius: 16px 16px 0 0;
    }
    
    .ui-confirm .stripe { 
      display: none; 
    }
    
    .ui-confirm .content { 
      display: flex; 
      gap: 16px; 
      align-items: flex-start; 
      padding: 24px 24px 20px 24px; 
    }
    
    .ui-confirm .icon { 
      width: 48px; 
      height: 48px; 
      border-radius: 12px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: white; 
      font-size: 20px; 
      flex: 0 0 48px; 
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.25);
    }
    
    .ui-confirm .icon.icon-danger { 
      background: linear-gradient(135deg, #ef4444, #dc2626); 
    }
    
    .ui-confirm .icon.icon-warning { 
      background: linear-gradient(135deg, #f59e0b, #d97706); 
    }
    
    .ui-confirm .icon.icon-info { 
      background: linear-gradient(135deg, #3b82f6, var(--logo-primary-color, #2563eb)); 
    }
    
    .ui-confirm .text { 
      flex: 1; 
      min-width: 0; 
    }
    
    .ui-confirm .title { 
      font-weight: 700; 
      color: #1e293b; 
      margin-bottom: 8px; 
      font-size: 1.1rem; 
      line-height: 1.3;
    }
    
    .ui-confirm .message { 
      color: #64748b; 
      font-weight: 500; 
      font-size: 0.95rem; 
      line-height: 1.5;
    }
    
    .ui-confirm .actions {
      display: flex;
      gap: 12px;
      padding: 0 24px 24px 24px;
      justify-content: flex-end;
    }
    
    @media (max-width: 480px) { 
      .ui-confirm { 
        margin: 16px;
        max-width: none;
      }
      
      .ui-confirm .content {
        padding: 20px 20px 16px 20px;
      }
      
      .ui-confirm .actions {
        padding: 0 20px 20px 20px;
        flex-direction: column-reverse;
      }
      
      .ui-confirm .actions app-button {
        width: 100%;
      }
    }
    `
  ]
})
export class UiConfirmComponent implements OnInit {
  @Input() message: string = '';
  @Input() type: UiConfirmType = 'warning';
  @Input() title: string = '¿Estás seguro?';
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  visible = false;
  visibleShown = false;

  ngOnInit(): void {
    // small delay to allow template to render before showing animation
    setTimeout(() => this.show(), 8);
  }

  private show() {
    this.visible = true;
    // trigger CSS entrance after element exists
    setTimeout(() => this.visibleShown = true, 20);
  }

  confirm() {
    this.close(() => this.confirmed.emit());
  }

  cancel() {
    this.close(() => this.cancelled.emit());
  }

  onOverlayClick(event: MouseEvent) {
    // Only close if clicked on overlay, not on the modal content
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  private close(callback?: () => void) {
    // play CSS leave animation, then remove from DOM
    this.visibleShown = false;
    setTimeout(() => {
      this.visible = false;
      this.closed.emit();
      if (callback) callback();
    }, 240);
  }
}