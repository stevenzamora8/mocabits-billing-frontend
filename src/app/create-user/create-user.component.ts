import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  currentStep: string = 'form';
  showPassword: boolean = false;

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onSubmitRequest() {
    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      this.currentStep = 'success';
      console.log('Usuario creado:', {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password
      });
      
      // Auto-regresar al login después de 3 segundos
      setTimeout(() => {
        this.goToLogin();
      }, 3000);
    }, 2000);
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  isFormValid(): boolean {
    return this.firstName.trim() !== '' && 
           this.lastName.trim() !== '' && 
           this.isEmailValid() && 
           this.password.length >= 6;
  }
}
