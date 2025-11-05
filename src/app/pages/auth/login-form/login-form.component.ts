import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/components/ui/input/input.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { AuthService } from '../../../services/auth.service';
import { PlansService } from '../../../services/plans.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit, AfterViewInit {
  submitted = false;
  // ===== FORM PROPERTIES =====
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;

  // ===== ERROR HANDLING =====
  showErrorMessage = false;
  errorMessage = '';

  // ===== CONFIGURATION =====
  private readonly CONFIG = {
    validCredentials: [
      { user: 'admin', pass: 'admin123' },
      { user: 'demo@mocabits.com', pass: 'demo123' },
      { user: 'usuario', pass: '123456' }
    ],
    errorTimeout: 6000,
    loginDelay: 2000
  };

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private plansService: PlansService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngAfterViewInit(): void {
    (window as any).togglePassword = this.togglePassword.bind(this);
  }

  // ===== FORM INITIALIZATION =====
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // ===== FORM VALIDATION =====
  private validateForm(): { isValid: boolean; message?: string } {
    const { username, password } = this.loginForm.value;

    if (!username || !password) {
      return { isValid: false, message: 'Por favor, completa todos los campos obligatorios.' };
    }

    if (password.length < 6) {
      return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    if (username.includes('@') && !this.isValidEmail(username)) {
      return { isValid: false, message: 'Por favor, ingresa un correo electrónico válido.' };
    }

    return { isValid: true };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private checkCredentials(username: string, password: string): boolean {
    return this.CONFIG.validCredentials.some(cred =>
      (username === cred.user) && password === cred.pass
    );
  }

  // ===== UI STATE MANAGEMENT =====
  private setLoadingState(loading: boolean): void {
    this.isLoading = loading;
    if (loading) {
      this.hideError();
    }
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.showErrorMessage = true;

    setTimeout(() => {
      this.hideError();
    }, this.CONFIG.errorTimeout);
  }

  private hideError(): void {
    this.showErrorMessage = false;
    this.errorMessage = '';
  }

  // ===== PASSWORD TOGGLE =====
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // ===== FORM SUBMISSION =====
  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const { username, password } = this.loginForm.value;

    // Validate form
    const validation = this.validateForm();
    if (!validation.isValid) {
      this.showError(validation.message!);
      return;
    }

    // Set loading state
    this.setLoadingState(true);

    // Simulate API call
    setTimeout(() => {
      if (this.checkCredentials(username, password)) {
        this.handleLoginSuccess();
      } else {
        this.showError('Usuario o contraseña incorrectos. Por favor, verifica tus credenciales e intenta nuevamente.');
        this.setLoadingState(false);
      }
    }, this.CONFIG.loginDelay);
  }

  private handleLoginSuccess(): void {
    // Here you would typically call the actual auth service
    // For now, we'll simulate success and redirect
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1000);
  }

  // ===== FORM HELPERS =====
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    const interacted = !!(control && (control.touched || control.dirty || this.submitted));
    const value = control?.value ?? '';
    const hasValue = value !== null && value !== undefined && (value.toString().trim().length > 0);

    if (control?.errors && interacted) {
      if (control.errors['required']) {
        // show required only after interaction or submit
        if (this.submitted || hasValue) return 'Este campo es obligatorio';
        return '';
      }
      if (control.errors['minlength']) {
        if (hasValue || this.submitted) return 'La contraseña debe tener al menos 6 caracteres';
        return '';
      }
      if (control.errors['email']) {
        if (hasValue || this.submitted) return 'Ingresa un correo electrónico válido';
        return '';
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!(control?.errors && control.touched);
  }

  // ===== NAVIGATION =====
  onForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  onCreateAccount(): void {
    this.router.navigate(['/auth/create-user']);
  }

  // ===== INPUT HANDLERS =====
  onInputChange(): void {
    if (this.showErrorMessage) {
      this.hideError();
    }
  }
}
