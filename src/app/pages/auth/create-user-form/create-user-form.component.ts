import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertComponent } from '../../../components/alert/alert.component';
import { AuthService } from '../../../services/auth.service';

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
  emailChecking: boolean = false;
  emailExists: boolean = false;

  // Alert properties
  alertMessage: string = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' = 'info';
  showAlertComponent: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
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
    if (!this.isFormValid()) {
      this.showAlert('Por favor, completa todos los campos correctamente.', 'warning');
      return;
    }

    this.isLoading = true;
    
    const userData = {
      email: this.email.trim(),
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      password: btoa(this.password) // Codificar contraseña en base64
    };

    console.log('Creando usuario con datos:', {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      passwordEncoded: true
    });

    this.authService.createUser(userData).subscribe({
      next: (response) => {
        console.log('Usuario creado exitosamente:', response);
        this.isLoading = false;
        this.currentStep = 'success';
        
        this.showAlert('¡Cuenta creada exitosamente! Redirigiendo al login...', 'success');
        
        // Auto-regresar al login después de 3 segundos
        setTimeout(() => {
          this.goToLogin();
        }, 3000);
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        this.isLoading = false;
        
        // Extraer el mensaje de error
        let errorMessage = 'Error al crear la cuenta. Intenta nuevamente.';
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        this.showAlert(errorMessage, 'danger');
      }
    });
  }

  /**
   * Verificar si el email ya existe cuando el usuario termina de escribir
   */
  onEmailBlur() {
    if (this.isEmailValid() && this.email.trim()) {
      this.checkEmailAvailability();
    }
  }

  private checkEmailAvailability() {
    this.emailChecking = true;
    this.emailExists = false;

    this.authService.checkEmailExists(this.email.trim()).subscribe({
      next: (response) => {
        console.log('Email check response:', response);
        this.emailChecking = false;
        
        // Suponiendo que el backend devuelve { exists: true/false }
        this.emailExists = response?.exists || false;
        
        // No mostrar alert flotante, solo el mensaje debajo del input
      },
      error: (error) => {
        console.error('Error al verificar email:', error);
        this.emailChecking = false;
        // No mostrar error al usuario para esta validación opcional
      }
    });
  }

  private showAlert(message: string, type: 'success' | 'danger' | 'warning' | 'info') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlertComponent = true;
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
           this.password.length >= 6 &&
           !this.emailExists;
  }
}
