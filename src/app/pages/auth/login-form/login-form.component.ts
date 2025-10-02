import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PlansService } from '../../../services/plans.service';
import { AlertComponent } from '../../../components/alert/alert.component';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit, OnDestroy {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  showSuccessMessage: boolean = false;

  // Alert properties
  alertMessage: string = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' = 'info';
  showAlertComponent: boolean = false;

  private alertTimeout: any;

  constructor(
    private authService: AuthService,
    private plansService: PlansService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.getAccessToken()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy(): void {
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }
  }

  onEmailInput(): void {
    this.clearAlert();
  }

  onPasswordInput(): void {
    this.clearAlert();
  }

  onEmailEnter(): void {
    if (this.isEmailValid(this.email)) {
      // Focus password field
      const passwordField = document.getElementById('password');
      if (passwordField) {
        passwordField.focus();
      }
    }
  }

  onLogin(): void {
    if (!this.email || !this.password) {
      this.showAlert('Por favor complete todos los campos', 'warning');
      return;
    }

    this.isLoading = true;
    this.clearAlert();

    this.authService.login(this.email, this.password).subscribe({
      next: (result) => {
        console.log('Login successful', result);
        
        // Verificar el estado de setup del usuario para determinar a dónde redirigir
        this.plansService.getUserSetupStatus().subscribe({
          next: (setupStatus) => {
            console.log('User setup status:', setupStatus);
            
            const { hasActivePlan, hasCompanyInfo } = setupStatus;
            
            this.showSuccessMessage = true;
            
            // Redirigir basado en el estado de setup - FLUJO: Setup primero, luego Plan
            setTimeout(() => {
              if (!hasCompanyInfo) {
                // Si no tiene información de compañía, ir al setup primero
                this.router.navigate(['/setup']);
              } else if (!hasActivePlan) {
                // Si tiene compañía pero no plan, ir a selección de plan
                this.router.navigate(['/plan-selection']);
              } else {
                // Usuario completamente configurado (tiene compañía Y plan) - ir al dashboard
                this.router.navigate(['/dashboard']);
              }
            }, 2000);
          },
          error: (setupError) => {
            console.warn('Could not get user setup status:', setupError);
            // En caso de error, ir al dashboard por defecto
            this.showSuccessMessage = true;
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 2000);
          }
        });
      },
      error: (error: any) => {
        console.error('Login error', error);
        this.showAlert(error.error?.message || error.message || 'Error al iniciar sesión', 'danger');
        this.isLoading = false; // Reset loading state on error
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  onCreateUser(): void {
    this.router.navigate(['/auth/create-user']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private showAlert(message: string, type: 'success' | 'danger' | 'warning' | 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlertComponent = true;

    // Auto-dismiss messages after specified time
    if (type === 'success') {
      this.alertTimeout = setTimeout(() => {
        this.onAlertClosed();
      }, 4000);
    } else if (type === 'danger') {
      // Auto-dismiss error messages after 6 seconds
      this.alertTimeout = setTimeout(() => {
        this.onAlertClosed();
      }, 6000);
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
    return message.includes('correo') || message.includes('contraseña') ||
           message.includes('email') || message.includes('password');
  }
}