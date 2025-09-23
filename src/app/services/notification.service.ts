import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationConfig, NotificationType } from '../components/notification/notification.component';

export interface ActiveNotification extends NotificationConfig {
  id: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<ActiveNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private idCounter = 0;

  /**
   * Muestra una notificación de éxito
   */
  showSuccess(message: string, title?: string, options?: Partial<NotificationConfig>): string {
    return this.show({
      type: 'success',
      title: title || '¡Éxito!',
      message,
      duration: 4000,
      showClose: true,
      ...options
    });
  }

  /**
   * Muestra una notificación de error
   */
  showError(message: string, title?: string, options?: Partial<NotificationConfig>): string {
    return this.show({
      type: 'error',
      title: title || 'Error',
      message,
      duration: 6000,
      showClose: true,
      ...options
    });
  }

  /**
   * Muestra una notificación de advertencia
   */
  showWarning(message: string, title?: string, options?: Partial<NotificationConfig>): string {
    return this.show({
      type: 'warning',
      title: title || 'Advertencia',
      message,
      duration: 5000,
      showClose: true,
      ...options
    });
  }

  /**
   * Muestra una notificación informativa
   */
  showInfo(message: string, title?: string, options?: Partial<NotificationConfig>): string {
    return this.show({
      type: 'info',
      title: title || 'Información',
      message,
      duration: 4000,
      showClose: true,
      ...options
    });
  }

  /**
   * Muestra una notificación de error con opción de reintentar
   */
  showErrorWithRetry(message: string, retryHandler: () => void, title?: string): string {
    return this.show({
      type: 'error',
      title: title || 'Error',
      message,
      duration: 8000,
      showClose: true,
      actionText: 'Reintentar',
      actionHandler: retryHandler
    });
  }

  /**
   * Muestra una notificación de sesión expirada
   */
  showSessionExpired(): string {
    return this.show({
      type: 'warning',
      title: 'Sesión Expirada',
      message: 'Tu sesión ha expirado. Serás redirigido al login.',
      duration: 3000,
      showClose: false
    });
  }

  /**
   * Muestra una notificación personalizada
   */
  show(config: NotificationConfig): string {
    const notification: ActiveNotification = {
      ...config,
      id: this.generateId(),
      timestamp: Date.now()
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    return notification.id;
  }

  /**
   * Cierra una notificación específica
   */
  close(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Cierra todas las notificaciones
   */
  closeAll(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Cierra todas las notificaciones de un tipo específico
   */
  closeByType(type: NotificationType): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.type !== type);
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Obtiene todas las notificaciones activas
   */
  getAll(): ActiveNotification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Verifica si hay notificaciones activas de un tipo específico
   */
  hasNotificationsOfType(type: NotificationType): boolean {
    return this.notificationsSubject.value.some(n => n.type === type);
  }

  private generateId(): string {
    return `notification-${++this.idCounter}-${Date.now()}`;
  }
}