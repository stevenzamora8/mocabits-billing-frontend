import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PlansService } from '../../services/plans.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { BrandService } from '../../services/brand.service';
import { AlertComponent, AlertType } from '../../components/alert/alert.component';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent],
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
  
  // Alert properties
  alertMessage: string = '';
  alertType: AlertType = 'danger';
  currentYear: number = new Date().getFullYear();

  // Brand properties
  brandName: string = '';
  brandSubtitle: string = '';
  brandTagline: string = '';
  brandDescription: string = '';
  brandVersion: string = '';
  useCustomLogo: boolean = false;
  customLogoPath: string = '';

  constructor(
    private readonly router: Router, 
    private readonly authService: AuthService, 
    private readonly plansService: PlansService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly brandService: BrandService
  ) {
    console.log('Rutas disponibles:', this.router.config.length);
    this.initializeBrandData();
  }

  /**
   * Inicializa los datos de branding desde el servicio
   */
  private initializeBrandData(): void {
    this.brandName = this.brandService.getBrandName();
    this.brandSubtitle = this.brandService.getBrandSubtitle();
    this.brandTagline = this.brandService.getBrandTagline();
    this.brandDescription = this.brandService.getBrandDescription();
    this.brandVersion = this.brandService.getBrandVersion();
    this.useCustomLogo = this.brandService.useCustomLogo();
    this.customLogoPath = this.brandService.getCustomLogoPath() || '';
  }

  onLogin() {
    this.clearAlert();
    this.isLoading = true;
    this.loginAttempts++;

    this.authService.login(this.email, this.password, this.clientId || undefined, this.clientSecret || undefined).subscribe({
      next: (resp: any) => {
        this.isLoading = false;
        console.log('Login successful', resp);
        this.showAlert('¡Bienvenido! Iniciando sesión...', 'success');
        this.showSuccessAnimation();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Login error', err);
        
        // Usar el servicio de manejo de errores
        const errorResult = this.errorHandler.handleError(err);
        this.showAlert(errorResult.message, 'danger');
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

  // Detectar si es un error de validación de campo (no debería mostrarse como alerta)
  isFieldValidationError(message: string): boolean {
    const fieldValidationMessages = [
      'El correo electrónico es requerido',
      'Por favor ingresa un correo válido',
      'La contraseña es requerida',
      'La contraseña debe tener al menos',
      'Campo requerido',
      'Formato inválido'
    ];
    
    return fieldValidationMessages.some(msg => message.includes(msg));
  }

  // Enhanced UX methods
  onEmailInput() {
    // Solo limpiar alertas del servidor al escribir en email
    if (this.alertMessage && !this.isFieldValidationError(this.alertMessage)) {
      this.clearAlert();
    }
  }

  onPasswordInput() {
    // Solo limpiar alertas del servidor al escribir en contraseña
    if (this.alertMessage && !this.isFieldValidationError(this.alertMessage)) {
      this.clearAlert();
    }
  }

  // Métodos para manejar alerts
  showAlert(message: string, type: AlertType) {
    this.alertMessage = message;
    this.alertType = type;
  }

  clearAlert() {
    this.alertMessage = '';
  }

  onAlertClosed() {
    this.clearAlert();
  }

  // Auto-focus para mejor UX
  onEmailEnter() {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) passwordInput.focus();
  }
}
