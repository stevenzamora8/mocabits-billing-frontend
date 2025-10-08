import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AlertComponent } from '../../../components/alert/alert.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputComponent } from '../../../shared/components/ui/input/input.component';

@Component({
  selector: 'app-forgot-password-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, ButtonComponent, InputComponent],
  templateUrl: './forgot-password-form.component.html',
  styleUrls: ['./forgot-password-form.component.css']
})
export class ForgotPasswordFormComponent implements OnInit, OnDestroy {
  recoveryForm: FormGroup;
  currentStep: 'form' | 'success' = 'form';
  isLoading: boolean = false;
  showSuccessLoadingBar: boolean = false;

  // Alert properties
  alertMessage: string = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' = 'info';
  showAlertComponent: boolean = false;

  private alertTimeout: any;
  private successLoadingTimeout: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }
    if (this.successLoadingTimeout) {
      clearTimeout(this.successLoadingTimeout);
    }
  }

  onEmailInput(): void {
    this.clearAlert();
  }

  onSendRecoveryEmail(): void {
    if (this.recoveryForm.invalid) {
      this.showAlert('Por favor ingresa un correo electrónico válido', 'warning');
      return;
    }

    this.isLoading = true;
    this.clearAlert();

    const email = this.recoveryForm.get('email')?.value;
    this.authService.forgotPassword(email).subscribe({
      next: (response: any) => {
        console.log('Forgot password request successful:', response);
        this.currentStep = 'success';
        this.showSuccessLoadingBar = true;

        // Ocultar la barra de carga después de 3 segundos y redirigir al login
        this.successLoadingTimeout = setTimeout(() => {
          this.showSuccessLoadingBar = false;
          // Redirigir al login después de 1 segundo adicional
          setTimeout(() => {
            this.goToLogin();
          }, 1000);
        }, 3000);
      },
      error: (error: any) => {
        console.error('Forgot password error:', error);
        this.showAlert(error.error?.message || error.message || 'Error al enviar el correo de recuperación', 'danger');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  isEmailValid(): boolean {
    const email = this.recoveryForm.get('email')?.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email ? emailRegex.test(email) : false;
  }

  private showAlert(message: string, type: 'success' | 'danger' | 'warning' | 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlertComponent = true;

    // Auto-dismiss success messages after 4 seconds
    if (type === 'success') {
      this.alertTimeout = setTimeout(() => {
        this.onAlertClosed();
      }, 4000);
    }
  }

  onAlertClosed(): void {
    this.showAlertComponent = false;
    this.alertMessage = '';
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
      this.alertTimeout = null;
    }
  }

  private clearAlert(): void {
    this.showAlertComponent = false;
    this.alertMessage = '';
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
      this.alertTimeout = null;
    }
  }

  isFieldValidationError(message: string): boolean {
    return message.includes('correo') || message.includes('email');
  }
}