import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PlansService } from '../../services/plans.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  // Optional client credentials for Basic auth (can be left empty to use env.basicAuth)
  clientId: string = environment['clientId'] || '';
  clientSecret: string = environment['clientSecret'] || '';
  rememberMe: boolean = false;
  isLoading: boolean = false;
  showPassword: boolean = false;
  showSuccessMessage: boolean = false;
  loginAttempts: number = 0;
  serverError: string | null = null;
  showAdvanced: boolean = false;

  constructor(private router: Router, private authService: AuthService, private plansService: PlansService) {
    console.log('Rutas disponibles:', this.router.config.length);
  }

  onLogin() {
    this.serverError = null;
    this.isLoading = true;

    this.authService.login(this.email, this.password, this.clientId || undefined, this.clientSecret || undefined).subscribe({
      next: (resp) => {
        this.isLoading = false;
        console.log('Login successful', resp);
        this.showSuccessAnimation();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Login error', err);
        if (err.error && typeof err.error === 'string') {
          this.serverError = err.error;
        } else if (err.error && err.error.message) {
          this.serverError = err.error.message;
        } else {
          this.serverError = 'Ocurrió un error al iniciar sesión. Intenta nuevamente.';
        }
      }
    });
  }

  onForgotPassword() {
    console.log('Navegando a forgot-password...');
    // Ya no necesitamos guardar el email, el backend lo identifica automáticamente
    window.location.href = '/forgot-password';
  }

  onCreateUser() {
    console.log('Navegando a create-user...');
    // Usar window.location para navegación directa  
    window.location.href = '/create-user';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private showSuccessAnimation() {
    this.showSuccessMessage = true;
    // Llamar al endpoint de status para determinar a dónde redirigir
    setTimeout(() => {
      this.plansService.getUserSetupStatus().subscribe({
        next: (status) => {
          console.log('User setup status:', status);
          this.showSuccessMessage = false;

          if (!status.hasActivePlan) {
            // No tiene plan activo, ir a selección de planes
            this.router.navigate(['/plan-selection']);
          } else {
            // Tiene plan activo, ir a setup (independientemente de hasCompanyInfo)
            this.router.navigate(['/setup']);
          }
        },
        error: (error) => {
          console.error('Error getting user setup status:', error);
          this.showSuccessMessage = false;
          // En caso de error, ir a plan-selection por defecto
          this.router.navigate(['/plan-selection']);
        }
      });
    }, 2000);
  }

  private showErrorMessage(message: string) {
    // En una implementación real, usarías un servicio de notificaciones
    console.error(message);
    // Aquí podrías mostrar un toast o modal de error
  }

  // Validadores en tiempo real
  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Auto-focus para mejor UX
  onEmailEnter() {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) passwordInput.focus();
  }
}
