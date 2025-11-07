import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UiAlertComponent, UiAlertType } from '../../../shared/components/ui/alert/alert.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputComponent } from '../../../shared/components/ui/input/input.component';
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
  SUCCESS_MESSAGE: '¡Tu contraseña ha sido actualizada exitosamente! Ahora puedes iniciar sesión con tu nueva contraseña.',
  ERROR_MESSAGE: 'Error al restablecer la contraseña. Inténtalo de nuevo.'
} as const;

const PASSWORD_MIN_LENGTH = 8;

@Component({
  selector: 'app-reset-password-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiAlertComponent, ButtonComponent, InputComponent],
  templateUrl: './reset-password-form.component.html',
  styleUrls: ['./reset-password-form.component.css']
})
export class ResetPasswordFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  // Make MESSAGES available in template
  readonly MESSAGES = MESSAGES;

  // Form properties
  resetForm: FormGroup;
  uid: string = '';
  isLoading: boolean = true;
  isInvalidLink: boolean = false;
  isSubmitting: boolean = false;
  showPassword: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Alert properties
  alertMessage: string = '';
  alertType: UiAlertType = 'info';
  showAlertComponent: boolean = false;

  // Redirect countdown
  redirectCountdown: number = 0;

  constructor() {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword?.errors?.['passwordMismatch']) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }

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
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Token validation error:', error);
        this.handleInvalidLink();
      }
    });
  }

  private handleInvalidLink(): void {
    this.isInvalidLink = true;
    this.isLoading = false;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showAlert('Por favor completa todos los campos correctamente', 'danger');
      return;
    }

    this.isSubmitting = true;
    this.clearAlert();
    this.errorMessage = '';
    this.successMessage = '';

    const password = this.resetForm.get('password')?.value;
    this.authService.resetPassword(this.uid, password).subscribe({
      next: () => {
        this.handleSuccess();
        this.isSubmitting = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Reset password error:', error);
        this.errorMessage = MESSAGES.ERROR_MESSAGE;
        this.successMessage = '';
        this.isSubmitting = false;
      }
    });
  }

  private handleSuccess(): void {
    this.successMessage = MESSAGES.SUCCESS_MESSAGE;
    this.errorMessage = '';
    this.resetForm.reset();

    // Iniciar contador de redirección automática
    this.startRedirectCountdown();
  }

  private startRedirectCountdown(): void {
    this.redirectCountdown = 5;
    const countdownInterval = setInterval(() => {
      this.redirectCountdown--;
      if (this.redirectCountdown <= 0) {
        clearInterval(countdownInterval);
        this.navigateToLogin();
      }
    }, 1000);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFormValid(): boolean {
    const password = this.resetForm.get('password')?.value;
    const confirmPassword = this.resetForm.get('confirmPassword')?.value;
    return this.resetForm.valid && password === confirmPassword;
  }

  isPasswordValid(): boolean {
    const password = this.resetForm.get('password')?.value;
    return password ? password.length >= PASSWORD_MIN_LENGTH : false;
  }

  doPasswordsMatch(): boolean {
    const password = this.resetForm.get('password')?.value;
    const confirmPassword = this.resetForm.get('confirmPassword')?.value;
    return password === confirmPassword && confirmPassword && confirmPassword.length > 0;
  }

  // Alert methods
  showAlert(message: string, type: 'success' | 'danger' | 'warning' | 'info'): void {
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
