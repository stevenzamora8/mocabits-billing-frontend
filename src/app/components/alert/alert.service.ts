import { Injectable, ComponentRef, ApplicationRef, EnvironmentInjector, createComponent } from '@angular/core';
import { AlertComponent, AlertType } from './alert.component';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertRefs: ComponentRef<AlertComponent>[] = [];

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  showAlert(message: string, type: AlertType = 'info', autoDismiss: boolean = true, autoDismissTime: number = 5000): void {
    // Create alert component
    const alertRef = createComponent(AlertComponent, {
      environmentInjector: this.injector
    });

    // Set inputs
    alertRef.instance.message = message;
    alertRef.instance.type = type;
    alertRef.instance.autoDismiss = autoDismiss;
    alertRef.instance.autoDismissTime = autoDismissTime;

    // Listen to close event
    alertRef.instance.closed.subscribe(() => {
      this.removeAlert(alertRef);
    });

    // Attach to application
    this.appRef.attachView(alertRef.hostView);

    // Add to DOM
    const domElement = alertRef.location.nativeElement;
    document.body.appendChild(domElement);

    // Store reference
    this.alertRefs.push(alertRef);
  }

  showConfirm(
    message: string,
    confirmTitle: string = 'Confirmar Acción',
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      // Create alert component
      const alertRef = createComponent(AlertComponent, {
        environmentInjector: this.injector
      });

      // Set inputs
      alertRef.instance.message = message;
      alertRef.instance.type = 'confirm';
      alertRef.instance.confirmTitle = confirmTitle;
      alertRef.instance.confirmText = confirmText;
      alertRef.instance.cancelText = cancelText;

      // Listen to events
      alertRef.instance.confirmed.subscribe(() => {
        this.removeAlert(alertRef);
        resolve(true);
      });

      alertRef.instance.cancelled.subscribe(() => {
        this.removeAlert(alertRef);
        resolve(false);
      });

      // Attach to application
      this.appRef.attachView(alertRef.hostView);

      // Add to DOM
      const domElement = alertRef.location.nativeElement;
      document.body.appendChild(domElement);

      // Store reference
      this.alertRefs.push(alertRef);
    });
  }

  private removeAlert(alertRef: ComponentRef<AlertComponent>): void {
    const index = this.alertRefs.indexOf(alertRef);
    if (index > -1) {
      this.alertRefs.splice(index, 1);
      this.appRef.detachView(alertRef.hostView);
      alertRef.destroy();
    }
  }

  clearAll(): void {
    this.alertRefs.forEach(ref => {
      this.appRef.detachView(ref.hostView);
      ref.destroy();
    });
    this.alertRefs = [];
  }
}