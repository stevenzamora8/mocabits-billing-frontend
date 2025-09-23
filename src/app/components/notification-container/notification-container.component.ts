import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, ActiveNotification } from '../../services/notification.service';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  template: `
    <div class="notification-container" 
         [class.has-notifications]="notifications.length > 0"
         role="alert"
         aria-live="polite">
      <app-notification
        *ngFor="let notification of notifications; trackBy: trackByNotification"
        [config]="notification"
        (close)="closeNotification($event)"
        (action)="handleAction($event)"
        class="notification-item">
      </app-notification>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      width: 100%;
      pointer-events: none;
      transition: all 0.3s ease;
    }

    .notification-container.has-notifications {
      pointer-events: auto;
    }

    .notification-item {
      margin-bottom: 12px;
      animation: slideInRight 0.3s ease-out;
    }

    .notification-item:last-child {
      margin-bottom: 0;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .notification-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }
    }

    @media (max-width: 480px) {
      .notification-container {
        top: 5px;
        right: 5px;
        left: 5px;
      }
      
      .notification-item {
        margin-bottom: 8px;
      }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .notification-container {
        filter: contrast(1.2);
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .notification-item {
        animation: none;
      }
      
      .notification-container {
        transition: none;
      }
    }
  `]
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: ActiveNotification[] = [];
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(
      notifications => {
        this.notifications = notifications;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  closeNotification(notificationId: string): void {
    this.notificationService.close(notificationId);
  }

  handleAction(event: { notificationId: string, action: () => void }): void {
    // Ejecutar la acción
    event.action();
    
    // Cerrar la notificación después de ejecutar la acción
    setTimeout(() => {
      this.notificationService.close(event.notificationId);
    }, 100);
  }

  trackByNotification(index: number, notification: ActiveNotification): string {
    return notification.id;
  }
}