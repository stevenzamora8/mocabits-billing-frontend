import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state-card">
      <div class="empty-state">
        <div class="empty-icon" [attr.aria-hidden]="true">
          <i [class]="iconClass"></i>
        </div>
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
    </div>
  `,
  styles: [`
    /* Card wrapper con franja azul - igual que otros componentes */
    .empty-state-card {
      background: white;
      padding: 1rem;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      margin-bottom: 1.5rem;
      position: relative;
      overflow: visible;
    }

    .empty-state-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--logo-primary-color, #2563eb), var(--logo-secondary-color, #059669));
      border-radius: 16px 16px 0 0;
    }

    .empty-state {
      text-align: center;
      padding: 2rem 1rem;
      color: #64748b;
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.5rem auto;
      background: linear-gradient(135deg, var(--logo-primary-color, #2563eb), var(--logo-secondary-color, #059669));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25);
      font-size: 1.5rem;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { 
        transform: translateY(0px); 
      }
      50% { 
        transform: translateY(-6px); 
      }
    }

    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      font-size: 0.95rem;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }
  `]
})
export class UiEmptyStateComponent {
  @Input() iconClass: string = 'fas fa-inbox';
  @Input() title: string = 'No hay elementos';
  @Input() description: string = 'No se encontraron elementos para mostrar.';
}