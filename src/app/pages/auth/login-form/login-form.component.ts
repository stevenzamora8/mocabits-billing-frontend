import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
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
        this.showSuccessMessage = true;
        // Redirect after showing success message
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error: any) => {
        console.error('Login error', error);
        this.showAlert(error.error?.message || error.message || 'Error al iniciar sesión', 'danger');
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
    return message.includes('correo') || message.includes('contraseña') ||
           message.includes('email') || message.includes('password');
  }
}