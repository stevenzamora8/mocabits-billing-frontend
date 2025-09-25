import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { AlertComponent, AlertType } from '../../components/alert/alert.component';
import { HttpErrorResponse } from '@angular/common/http';

const MESSAGES = {
  TITLE: 'Restablecer Contraseña',
  VALIDATING_LINK: 'Validando enlace...',
  INVALID_LINK: 'El enlace de restablecimiento es inválido o ha expirado.',
  REQUEST_NEW_LINK: 'Solicitar nuevo enlace',
  NEW_PASSWORD_LABEL: 'Nueva Contraseña',
  NEW_PASSWORD_PLACEHOLDER: 'Ingresa tu nueva contraseña',
  CONFIRM_PASSWORD_LABEL: 'Confirmar Contraseña',
  CONFIRM_PASSWORD_PLACEHOLDER: 'Confirma tu nueva contraseña',
  PASSWORD_REQUIRED: 'La contraseña es requerida',
  PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 8 caracteres',
  CONFIRM_PASSWORD_REQUIRED: 'La confirmación es requerida',
  PASSWORDS_DO_NOT_MATCH: 'Las contraseñas no coinciden',
  RESETTING: 'Restableciendo...',
  RESET_PASSWORD: 'Restablecer Contraseña',
  GO_TO_LOGIN: 'Ir al Login',
  SUCCESS_MESSAGE: 'Contraseña restablecida exitosamente. Redirigiendo al login...',
  ERROR_MESSAGE: 'Error al restablecer la contraseña. Inténtalo de nuevo.'
} as const;

const PASSWORD_MIN_LENGTH = 8;

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly MESSAGES = MESSAGES;

  resetForm!: FormGroup;
  isLoading = true;
  isInvalidLink = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  uid = '';
  showPassword = false;

  // Alert properties
  alertMessage: string = '';
  alertType: AlertType = 'danger';
  showAlertComponent: boolean = false;

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.uid = this.route.snapshot.params['uid'];

    if (!this.uid) {
      this.handleInvalidLink();
      return;
    }

    // Validar el token con el backend antes de mostrar el formulario
    this.validateResetToken();
  }

  private validateResetToken(): void {
    this.authService.validateResetToken(this.uid).subscribe({
      next: () => {
        // Token válido, mostrar formulario
        this.initializeForm();
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Token validation error:', error);
        
        // Usar el servicio de manejo de errores
        const errorResult = this.errorHandler.handleError(error);
        this.showAlert(errorResult.message, 'danger');
        
        // Token inválido, mostrar mensaje de error
        this.handleInvalidLink();
      }
    });
  }

  private initializeForm(): void {
    this.resetForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
    } else {
      const errors = confirmPassword?.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        confirmPassword?.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
    return null;
  }

  private handleInvalidLink(): void {
    this.isInvalidLink = true;
    this.isLoading = false;
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.showAlert('Por favor completa todos los campos correctamente', 'danger');
      return;
    }

    this.setSubmittingState(true);
    this.clearMessages();

    this.authService.resetPassword(this.uid, this.resetForm.value.password).subscribe({
      next: () => {
        this.handleSuccess();
        this.setSubmittingState(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Reset password error:', error);
        
        // Usar el servicio de manejo de errores
        const errorResult = this.errorHandler.handleError(error);
        
        if (errorResult.shouldRetry) {
          this.showAlert(`${errorResult.message} - Puedes intentar nuevamente`, 'warning');
        } else {
          this.showAlert(errorResult.message, 'danger');
        }
        
        this.handleError(errorResult.message);
        this.setSubmittingState(false);
      }
    });
  }

  private setSubmittingState(isSubmitting: boolean): void {
    this.isSubmitting = isSubmitting;
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private handleSuccess(): void {
    this.successMessage = MESSAGES.SUCCESS_MESSAGE;
    this.showAlert('Tu contraseña ha sido restablecida exitosamente. Redirigiendo al inicio de sesión...', 'success');
    this.resetForm.reset();
    // Redirigir automáticamente al login después de 2 segundos
    setTimeout(() => {
      this.navigateToLogin();
    }, 2000);
  }

  private handleError(message: string): void {
    this.errorMessage = message;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getPasswordStrength(): string {
    const password = this.resetForm.get('password')?.value || '';
    const hasNumbers = /\d/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    let score = 0;
    if (password.length >= 8) score++;
    if (hasNumbers) score++;
    if (hasLowerCase) score++;
    if (hasUpperCase) score++;
    if (hasSpecialChars) score++;

    if (score < 2) return 'weak';
    if (score < 4) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    const textMap = {
      'weak': 'Débil',
      'medium': 'Mediana',
      'strong': 'Fuerte'
    };
    return textMap[strength as keyof typeof textMap];
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
