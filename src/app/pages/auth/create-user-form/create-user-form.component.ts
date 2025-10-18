import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertComponent } from '../../../components/alert/alert.component';
import { AuthService } from '../../../services/auth.service';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputComponent } from '../../../shared/components/ui/input/input.component';

@Component({
  selector: 'app-create-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, ButtonComponent, InputComponent],
  templateUrl: './create-user-form.component.html',
  styleUrl: './create-user-form.component.css'
})
export class CreateUserFormComponent implements OnInit {
  userIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
  userForm: FormGroup;
  isLoading: boolean = false;
  currentStep: string = 'form';
  showPassword: boolean = false;
  emailChecking: boolean = false;
  emailExists: boolean = false;

  // Track field touched/dirty for validation feedback
  fieldTouched: { [key: string]: boolean } = {};

  // Alert properties
  alertMessage: string = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' = 'info';
  showAlertComponent: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    console.log('CreateUserFormComponent constructor ejecutado');
    console.log('localStorage selectedPlan:', localStorage.getItem('selectedPlan'));
    console.log('localStorage setupCompleted:', localStorage.getItem('setupCompleted'));
    
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    // Initialize fieldTouched
    Object.keys(this.userForm.controls).forEach(key => this.fieldTouched[key] = false);
  }

  ngOnInit(): void {
    // Subscribe to valueChanges to track dirty/touched
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.valueChanges.subscribe(() => {
        this.fieldTouched[key] = true;
      });
    });
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
    const formValue = this.userForm.value;
    const userData = {
      email: formValue.email.trim(),
      password: formValue.password,
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim()
    };

    // 1. Validar si el email ya existe antes de crear el usuario
    this.authService.checkEmailExists(userData.email).subscribe({
      next: (response: any) => {
        if (response?.exists) {
          this.isLoading = false;
          this.emailExists = true;
          this.showAlert('El correo electrónico ya está registrado. Usa otro o inicia sesión.', 'danger');
        } else {
          // 2. Si no existe, crear el usuario
          this.authService.createUser(userData).subscribe({
            next: (resp: any) => {
              console.log('Usuario creado exitosamente:', resp);
              this.isLoading = false;
              this.currentStep = 'success';
              this.showAlert('¡Cuenta creada exitosamente! Redirigiendo al login...', 'success');
              setTimeout(() => {
                this.goToLogin();
              }, 3000);
            },
            error: (error: any) => {
              console.error('Error al crear usuario:', error);
              this.isLoading = false;
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
      },
      error: (error: any) => {
        this.isLoading = false;
        this.showAlert('No se pudo validar el correo electrónico. Intenta nuevamente.', 'danger');
      }
    });
  }

  /**
   * Verificar si el email ya existe cuando el usuario termina de escribir
   */


  onEmailInput() {
    const email = this.userForm.get('email')?.value;
    this.fieldTouched['email'] = true;
    if (this.isEmailValid() && email?.trim()) {
      this.checkEmailAvailability();
    } else {
      this.emailExists = false;
    }
  }
  // Helper to get error message for a field, like setup component
  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (!field || !field.errors) return '';
    if (!(field.touched || field.dirty || this.fieldTouched[fieldName])) return '';
    const errors = field.errors;
    if (errors['required']) return 'Este campo es requerido';
    if (errors['email']) return 'Correo electrónico inválido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    return 'Campo inválido';
  }

  onEmailBlur() {
    // También valida en blur por si el usuario pega el email y sale del campo
    this.onEmailInput();
  }

  private checkEmailAvailability() {
    this.emailChecking = true;
    this.emailExists = false;

    const email = this.userForm.get('email')?.value?.trim();
    this.authService.checkEmailExists(email).subscribe({
      next: (response: any) => {
        console.log('Email check response:', response);
        this.emailChecking = false;
        
        // Suponiendo que el backend devuelve { exists: true/false }
        this.emailExists = response?.exists || false;
        
        // No mostrar alert flotante, solo el mensaje debajo del input
      },
      error: (error: any) => {
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
    const email = this.userForm.get('email')?.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email ? emailRegex.test(email) : false;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  isFormValid(): boolean {
    return this.userForm.valid && !this.emailExists;
  }

  // For input state (error/success/default)
  getEmailInputState(): 'success' | 'error' | 'default' {
    const field = this.userForm.get('email');
    if (this.emailChecking) return 'default';
    if ((field?.dirty || field?.touched || this.fieldTouched['email'])) {
      if (this.getFieldError('email')) return 'error';
      if (field?.valid && !this.emailExists) return 'success';
    }
    return 'default';
  }
}
