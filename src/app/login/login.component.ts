import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  rememberMe: boolean = false;
  isLoading: boolean = false;
  showPassword: boolean = false;
  showSuccessMessage: boolean = false;
  loginAttempts: number = 0;

  constructor(private router: Router) {}

  onLogin() {
    this.isLoading = true;
    this.loginAttempts++;
    
    // Simulación de login con feedback mejorado
    setTimeout(() => {
      this.isLoading = false;
      
      // Simular login exitoso después de 2 intentos
      if (this.loginAttempts >= 2) {
        this.showSuccessAnimation();
        console.log('Login successful:', { email: this.email });
      } else {
        this.showErrorMessage('Credenciales incorrectas. Intenta nuevamente.');
      }
    }, 1500);
  }

  onForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  onCreateUser() {
    this.router.navigate(['/create-user']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private showSuccessAnimation() {
    this.showSuccessMessage = true;
    // Simular redirección después de mostrar éxito
    setTimeout(() => {
      console.log('Redirecting to dashboard...');
      // this.router.navigate(['/dashboard']);
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
