import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  isLoading: boolean = false;
  currentStep: string = 'form';
  errorMessage: string = '';
  recoveryEmail: string = '';

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

  async onSendRecoveryEmail() {
    if (!this.recoveryEmail || this.recoveryEmail.trim() === '') {
      this.errorMessage = 'El email es requerido';
      return;
    }

    if (!this.isEmailValid()) {
      this.errorMessage = 'Por favor ingresa un correo electrónico válido';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Enviar el email al backend para la recuperación de contraseña
      await this.authService.forgotPassword(this.recoveryEmail.trim()).toPromise();
      this.currentStep = 'success';
      console.log('Correo de recuperación enviado exitosamente');

      // Auto-regresar al login después de 5 segundos
      setTimeout(() => {
        this.goToLogin();
      }, 5000);
    } catch (error: any) {
      this.errorMessage = error.error?.message || 'Error al enviar el correo de recuperación. Inténtalo de nuevo.';
      console.error('Forgot password error:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
