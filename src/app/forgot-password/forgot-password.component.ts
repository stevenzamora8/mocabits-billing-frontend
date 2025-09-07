import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  recoveryEmail: string = '';
  isLoading: boolean = false;
  currentStep: string = 'form';

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onSendRecoveryEmail() {
    if (!this.isEmailValid()) {
      console.error('Email inválido');
      return;
    }
    
    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      this.currentStep = 'success';
      console.log('Correo de recuperación enviado a:', this.recoveryEmail);
      
      // Auto-regresar al login después de 5 segundos
      setTimeout(() => {
        this.goToLogin();
      }, 5000);
    }, 2000);
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.recoveryEmail);
  }
}
