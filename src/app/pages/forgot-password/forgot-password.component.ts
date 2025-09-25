import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { AlertComponent, AlertType } from '../../components/alert/alert.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly errorHandler = inject(ErrorHandlerService);

  isLoading: boolean = false;
  currentStep: string = 'form';
  errorMessage: string = '';
  recoveryEmail: string = '';
  countdown: number = 5;
  countdownDuration: number = 5000;
  private countdownInterval?: any;

  // Alert properties
  alertMessage: string = '';
  alertType: AlertType = 'info';
  showAlertComponent: boolean = false;

  ngOnInit() {
    console.log('ForgotPasswordComponent constructor ejecutado');
    console.log('localStorage selectedPlan:', localStorage.getItem('selectedPlan'));
    console.log('localStorage setupCompleted:', localStorage.getItem('setupCompleted'));
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onEmailInput() {
    // Limpiar mensaje de error cuando el usuario escribe
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  isEmailValid(): boolean {
    if (!this.recoveryEmail || this.recoveryEmail.trim() === '') {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.recoveryEmail.trim());
  }

  onSendRecoveryEmail() {
    if (!this.recoveryEmail || this.recoveryEmail.trim() === '') {
      this.showAlert('El email es requerido', 'danger');
      return;
    }

    if (!this.isEmailValid()) {
      this.showAlert('Por favor ingresa un correo electrónico válido', 'danger');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.forgotPassword(this.recoveryEmail.trim()).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 'success';
        this.showAlert(`Se ha enviado un correo de recuperación a ${this.recoveryEmail}`, 'success');
        console.log('Correo de recuperación enviado exitosamente');
        this.startCountdown();
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Forgot password error:', error);

        // Usar el servicio de manejo de errores
        const errorResult = this.errorHandler.handleError(error);
        
        if (errorResult.shouldRetry) {
          this.showAlert(`${errorResult.message} - Puedes intentar nuevamente`, 'warning');
        } else {
          this.showAlert(errorResult.message, 'danger');
        }
        
        // Mantener compatibilidad con la UI actual
        this.errorMessage = errorResult.message;
      }
    });
  }

  private startCountdown(): void {
    this.countdown = 5;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.clearCountdown();
        this.goToLogin();
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  // Alert methods
  showAlert(message: string, type: AlertType): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlertComponent = true;
  }

  clearAlert(): void {
    this.showAlertComponent = false;
    this.alertMessage = '';
  }

  onAlertClosed(): void {
    this.clearAlert();
  }
}
