import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertComponent } from '../../../components/alert/alert.component';

@Component({
  selector: 'app-create-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent],
  templateUrl: './create-user-form.component.html',
  styleUrl: './create-user-form.component.css'
})
export class CreateUserFormComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  currentStep: string = 'form';
  showPassword: boolean = false;

  // Alert properties
  alertMessage: string = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' = 'info';
  showAlertComponent: boolean = false;

  constructor(private router: Router) {
    console.log('CreateUserFormComponent constructor ejecutado');
    console.log('localStorage selectedPlan:', localStorage.getItem('selectedPlan'));
    console.log('localStorage setupCompleted:', localStorage.getItem('setupCompleted'));
  }

  ngOnInit(): void {
    // No hacer nada especial en el registro
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  onAlertClosed() {
    this.showAlertComponent = false;
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
