import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly MESSAGES = MESSAGES;

  resetForm!: FormGroup;
  isLoading = true;
  isInvalidLink = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  uid = '';

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

  private async validateResetToken(): Promise<void> {
    try {
      await this.authService.validateResetToken(this.uid).toPromise();
      // Token válido, mostrar formulario
      this.initializeForm();
      this.isLoading = false;
    } catch (error) {
      // Token inválido, mostrar mensaje de error
      this.handleInvalidLink();
    }
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

  async onSubmit(): Promise<void> {
    if (this.resetForm.invalid) return;

    this.setSubmittingState(true);
    this.clearMessages();

    try {
      await this.performPasswordReset();
      this.handleSuccess();
    } catch (error: any) {
      this.handleError(error);
    } finally {
      this.setSubmittingState(false);
    }
  }

  private setSubmittingState(isSubmitting: boolean): void {
    this.isSubmitting = isSubmitting;
  }

  private clearMessages(): void {
    this.errorMessage = '';
  }

  private async performPasswordReset(): Promise<void> {
    await this.authService.resetPassword(this.uid, this.resetForm.value.password).toPromise();
  }

  private handleSuccess(): void {
    this.successMessage = MESSAGES.SUCCESS_MESSAGE;
    this.resetForm.reset();
    // Redirigir automáticamente al login después de 2 segundos
    setTimeout(() => {
      this.navigateToLogin();
    }, 2000);
  }

  private handleError(error: any): void {
    this.errorMessage = error.error?.message || MESSAGES.ERROR_MESSAGE;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
