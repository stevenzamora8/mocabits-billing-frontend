import { Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { CompanyService, Company, CompanyResponse } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';
import { AlertComponent } from '../../../components/alert/alert.component';

interface CompanyData {
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
  codDoc: string;
  dirMatriz: string;
  obligadoContabilidad: string;
}

interface EstablishmentData {
  estab: string;
  ptoEmi: string;
  secuencial: string;
  dirEstablecimiento: string;
}

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AlertComponent],
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SetupComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  
  currentStep = 1;
  totalSteps = 3;
  isLoading = false;
  
  companyForm!: FormGroup;
  establishmentForm!: FormGroup;
  signatureFile: File | null = null;
  signaturePassword: string = '';

  // Logo configuration
  logoFile: File | null = null;
  logoOption: 'temporary' | 'custom' = 'temporary';

  // Múltiples establecimientos
  establishments: EstablishmentData[] = [];
  currentEstablishmentIndex = 0;

  // Estados para mejor UX
  formTouched = {
    company: false,
    establishment: false
  };

  // Signature error tracking
  private signatureError: string = '';

  // Alert component properties
  alertMessage = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' | 'confirm' = 'info';
  pendingAction: (() => void) | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private companyService: CompanyService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.setupFormSubscriptions();
  }

  ngAfterViewInit() {
    // Aplicar estilos después de que la vista se inicialice
    setTimeout(() => {
      this.applyInputStyles();
      this.enhanceFormInteractions();
    }, 100);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyInputStyles() {
    const inputs = document.querySelectorAll('.setup-container input, .setup-container select, .setup-container textarea');
    inputs.forEach((input: any) => {
      this.setInputBaseStyles(input);
    });
  }

  private setInputBaseStyles(input: any) {
    const isError = input.classList.contains('error');
    
    if (isError) {
      input.style.setProperty('border-color', '#ef4444', 'important');
      input.style.setProperty('background-color', '#fef2f2', 'important');
    } else {
      input.style.setProperty('border-color', '#94a3b8', 'important');
      input.style.setProperty('background-color', '#f9fafb', 'important');
    }
  }

  setupFormSubscriptions() {
    // Detectar cuando el usuario empieza a escribir
    this.companyForm.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(100))
      .subscribe(() => {
        this.formTouched.company = true;
      });

    this.establishmentForm.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(100))
      .subscribe(() => {
        this.formTouched.establishment = true;
      });
  }

  initializeForms() {
    this.companyForm = this.fb.group({
      razonSocial: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      nombreComercial: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      ruc: ['', [
        Validators.required, 
        Validators.pattern(/^\d{13}$/),
        this.rucValidator
      ]],
      codDoc: ['04', [Validators.required]],
      dirMatriz: ['', [
        Validators.required, 
        Validators.minLength(5),
        Validators.maxLength(300)
      ]],
      obligadoContabilidad: ['SI', Validators.required]
    });

    this.establishmentForm = this.fb.group({
      estab: ['001', [
        Validators.required, 
        Validators.pattern(/^\d{3}$/)
      ]],
      ptoEmi: ['001', [
        Validators.required, 
        Validators.pattern(/^\d{3}$/)
      ]],
      secuencial: ['000000001', [
        Validators.required, 
        Validators.pattern(/^\d{9}$/)
      ]],
      dirEstablecimiento: ['', [
        Validators.required, 
        Validators.minLength(5),
        Validators.maxLength(300)
      ]]
    });

    // Inicializar con un establecimiento por defecto
    if (this.establishments.length === 0) {
      this.addNewEstablishment();
    }
  }

  // Validador personalizado para RUC
  rucValidator(control: any) {
    if (!control.value) return null;
    
    const ruc = control.value.toString();
    if (ruc.length !== 13) return { invalidLength: true };
    
    // Validación básica de RUC ecuatoriano
    const provincia = parseInt(ruc.substring(0, 2));
    if (provincia < 1 || provincia > 24) return { invalidProvince: true };
    
    return null;
  }

  // Métodos para manejar múltiples establecimientos
  addNewEstablishment() {
    const newEstablishment: EstablishmentData = {
      estab: this.generateNextEstabCode(),
      ptoEmi: '001',
      secuencial: '000000001',
      dirEstablecimiento: ''
    };
    this.establishments.push(newEstablishment);
    this.currentEstablishmentIndex = this.establishments.length - 1;
    this.loadEstablishmentData();
  }

  removeEstablishment(index: number) {
    if (this.establishments.length > 1) {
      this.establishments.splice(index, 1);
      if (this.currentEstablishmentIndex >= this.establishments.length) {
        this.currentEstablishmentIndex = this.establishments.length - 1;
      }
      this.loadEstablishmentData();
    }
  }

  selectEstablishment(index: number) {
    this.saveCurrentEstablishmentData();
    this.currentEstablishmentIndex = index;
    this.loadEstablishmentData();
  }

  saveCurrentEstablishmentData() {
    if (this.establishmentForm.valid && this.establishments[this.currentEstablishmentIndex]) {
      const formData = this.establishmentForm.value;
      this.establishments[this.currentEstablishmentIndex] = { ...formData };
    }
  }

  loadEstablishmentData() {
    if (this.establishments[this.currentEstablishmentIndex]) {
      const establishment = this.establishments[this.currentEstablishmentIndex];
      this.establishmentForm.patchValue(establishment);
    }
  }

  generateNextEstabCode(): string {
    const maxEstab = Math.max(...this.establishments.map(e => parseInt(e.estab)));
    const nextEstab = isFinite(maxEstab) ? maxEstab + 1 : 1;
    return nextEstab.toString().padStart(3, '0');
  }

  getCurrentEstablishment(): EstablishmentData | null {
    return this.establishments[this.currentEstablishmentIndex] || null;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.markCurrentFormAsTouched();
      
      if (this.validateCurrentStep()) {
        // Guardar datos del establecimiento actual antes de continuar
        if (this.currentStep === 2) {
          this.saveCurrentEstablishmentData();
        }
        
        // Animar transición
        this.animateStepTransition();
        
        this.currentStep++;
        this.scrollToTop();
        
        // Aplicar estilos después de cambio de paso
        setTimeout(() => {
          this.applyInputStyles();
          this.enhanceFormInteractions();
        }, 300);
      } else {
        this.showValidationErrors();
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.scrollToTop();
      
      // Aplicar estilos después de cambio de paso
      setTimeout(() => {
        this.applyInputStyles();
      }, 100);
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showValidationErrors() {
    // Mostrar errores específicos según el paso actual
    switch (this.currentStep) {
      case 1:
        console.log('Error en datos del contribuyente. Revisa los campos requeridos.');
        break;
      case 2:
        console.log('Error en datos del establecimiento. Revisa los campos requeridos.');
        break;
      case 3:
        if (this.signatureError) {
          console.log('Error en certificado:', this.signatureError);
        } else if (!this.signatureFile) {
          console.log('Debes subir un certificado de firma electrónica válido.');
        } else if (!this.signaturePassword.trim()) {
          console.log('Debes ingresar la contraseña del certificado.');
        } else if (this.logoOption === 'custom' && !this.logoFile) {
          console.log('Si eliges logo personalizado, debes subir un archivo de logo.');
        }
        break;
      default:
        console.log('Por favor, completa todos los campos requeridos correctamente');
    }
  }

  markCurrentFormAsTouched() {
    if (this.currentStep === 1) {
      this.companyForm.markAllAsTouched();
      this.formTouched.company = true;
    } else if (this.currentStep === 2) {
      this.establishmentForm.markAllAsTouched();
      this.formTouched.establishment = true;
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.companyForm.valid;
      case 2:
        return this.establishmentForm.valid && this.establishments.length > 0;
      case 3:
        const signatureValid = this.signatureFile !== null && this.signatureError === '' && this.signaturePassword.trim() !== '';
        const logoValid = this.logoOption === 'temporary' || (this.logoOption === 'custom' && this.logoFile !== null);
        return signatureValid && logoValid;
      default:
        return true;
    }
  }

  logFormErrors(form: FormGroup) {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.invalid) {
        console.log(`Campo ${key} inválido:`, control.errors);
      }
    });
  }

  onSignatureChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.validateSignatureFile(file);
    }
  }

  async validateSignatureFile(file: File) {
    try {
      // Validar extensión
      if (!file.name.match(/\.(p12|pfx)$/i)) {
        this.showSignatureError('El archivo debe tener extensión .p12 o .pfx');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showSignatureError('El archivo es muy grande. Máximo 5MB.');
        return;
      }

      // Validar que no esté vacío
      if (file.size === 0) {
        this.showSignatureError('El archivo está vacío.');
        return;
      }

      // Leer los primeros bytes para validar estructura PKCS#12
      const isValidP12 = await this.validateP12Structure(file);
      if (!isValidP12) {
        this.showSignatureError('El archivo no tiene una estructura PKCS#12 válida.');
        return;
      }

      // Si pasa todas las validaciones
      this.signatureFile = file;
      this.clearSignatureError();
      console.log('Certificado válido seleccionado:', file.name);
      
    } catch (error) {
      console.error('Error validando certificado:', error);
      this.showSignatureError('Error al validar el certificado. Verifique que el archivo no esté corrupto.');
    }
  }

  private async validateP12Structure(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const bytes = new Uint8Array(arrayBuffer.slice(0, 16));
          
          // Verificar magic bytes típicos de PKCS#12
          if (bytes.length >= 2) {
            // Verificar que empiece con SEQUENCE (0x30)
            if (bytes[0] === 0x30) {
              resolve(true);
              return;
            }
          }
          
          // Verificar otros posibles magic bytes
          const fileSignature = Array.from(bytes.slice(0, 4))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
          
          // Algunas firmas conocidas de archivos PKCS#12
          const validSignatures = ['30800000', '30820000', '30840000'];
          const isValid = validSignatures.some(sig => fileSignature.startsWith(sig.substring(0, 4)));
          
          resolve(isValid);
        } catch (error) {
          console.error('Error reading file:', error);
          resolve(false);
        }
      };
      
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 16));
    });
  }

  showSignatureError(message: string) {
    this.signatureError = message;
    this.signatureFile = null;
    console.warn('Error de certificado:', message);
    
    // Limpiar el input
    const fileInput = document.getElementById('signature') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  clearSignatureError() {
    this.signatureError = '';
  }

  getSignatureError(): string {
    return this.signatureError;
  }

  // Método para obtener el estado de validación de la firma
  isSignatureValid(): boolean {
    return this.signatureFile !== null && this.signatureError === '';
  }

  // Método para formatear el tamaño del archivo
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Métodos para manejar el logo
  onLogoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.validateLogoFile(file);
    }
  }

  validateLogoFile(file: File) {
    try {
      // Validar extensión
      if (!file.name.match(/\.(png|jpg|jpeg|svg)$/i)) {
        console.warn('El logo debe tener extensión .png, .jpg, .jpeg o .svg');
        this.clearLogoFile();
        return;
      }

      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        console.warn('El logo es muy grande. Máximo 2MB.');
        this.clearLogoFile();
        return;
      }

      // Validar que no esté vacío
      if (file.size === 0) {
        console.warn('El archivo está vacío.');
        this.clearLogoFile();
        return;
      }

      // Si pasa todas las validaciones
      this.logoFile = file;
      this.logoOption = 'custom';
      console.log('Logo válido seleccionado:', file.name);
      
      // Actualizar el radio button
      const customRadio = document.getElementById('logo-custom') as HTMLInputElement;
      if (customRadio) {
        customRadio.checked = true;
      }
      
    } catch (error) {
      console.error('Error validando logo:', error);
      this.clearLogoFile();
    }
  }

  clearLogoFile() {
    this.logoFile = null;
    this.logoOption = 'temporary';
    
    // Limpiar el input
    const fileInput = document.getElementById('logo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    // Actualizar el radio button
    const tempRadio = document.getElementById('logo-temp') as HTMLInputElement;
    if (tempRadio) {
      tempRadio.checked = true;
    }
  }

  onLogoOptionChange(option: 'temporary' | 'custom') {
    this.logoOption = option;
    if (option === 'temporary') {
      this.clearLogoFile();
    }
  }

  getLogoPreview(): string {
    if (this.logoFile && this.logoOption === 'custom') {
      return URL.createObjectURL(this.logoFile);
    }
    return '';
  }

  async finishSetup() {
    if (!this.validateAllSteps()) {
      this.showValidationErrors();
      return;
    }

    this.isLoading = true;

    try {
      // Guardar el establecimiento actual antes de finalizar
      this.saveCurrentEstablishmentData();
      
      const companyData = this.companyForm.value;
      
      const companyPayload = {
        razonSocial: companyData.razonSocial,
        nombreComercial: companyData.nombreComercial,
        ruc: companyData.ruc,
        codDoc: companyData.codDoc,
        dirMatriz: companyData.dirMatriz,
        obligadoContabilidad: companyData.obligadoContabilidad,
        contribuyenteEspecial: 'NO',
        guiaRemision: 'NO',
        establecimientos: this.establishments,
        logoConfig: {
          useCustomLogo: this.logoOption === 'custom',
          logoFile: this.logoFile
        }
      };

      console.log('Completando setup con:', companyPayload);
      
      // Completar setup en una sola llamada
      if (!this.signatureFile) {
        throw new Error('Firma requerida');
      }
      if (!this.signaturePassword) {
        throw new Error('Contraseña del certificado requerida');
      }
      
      const setupResponse = await this.companyService.completeSetup(
        companyPayload, 
        this.signatureFile, 
        this.logoFile || undefined, 
        this.signaturePassword
      ).toPromise();
      console.log('Setup completado:', setupResponse);
      
      // Guardar datos en localStorage
      localStorage.setItem('companySetup', JSON.stringify({
        ...companyPayload,
        setupCompleted: true,
        setupDate: new Date().toISOString()
      }));
      localStorage.setItem('setupCompleted', 'true');

      // Redirigir a selección de plan después del setup
      this.router.navigate(['/onboarding/plan-selection']);
      
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      this.showValidationErrors();
    } finally {
      this.isLoading = false;
    }
  }

  validateAllSteps(): boolean {
    // Guardar el establecimiento actual antes de validar
    this.saveCurrentEstablishmentData();
    
    const companyValid = this.companyForm.valid;
    const establishmentsValid = this.establishments.length > 0 &&
           this.establishments.every(est => 
             est.estab && est.ptoEmi && est.secuencial && est.dirEstablecimiento
           );
    const signatureValid = this.signatureFile !== null && this.signatureError === '' && this.signaturePassword.trim() !== '';
    const logoValid = this.logoOption === 'temporary' || (this.logoOption === 'custom' && this.logoFile !== null);
    
    console.log('Validación final:', {
      company: companyValid,
      establishments: establishmentsValid,
      signature: signatureValid,
      logo: logoValid,
      logoOption: this.logoOption,
      signatureError: this.signatureError,
      signaturePassword: this.signaturePassword
    });
    
    return companyValid && establishmentsValid && signatureValid && logoValid;
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'Datos del Contribuyente';
      case 2:
        return 'Establecimientos';
      case 3:
        return 'Firma Electrónica y Logo';
      default:
        return 'Configuración';
    }
  }

  getStepDescription(): string {
    switch (this.currentStep) {
      case 1:
        return 'Información tributaria básica de tu empresa';
      case 2:
        return 'Configura tus puntos de emisión de facturas';
      case 3:
        return 'Certificado de firma electrónica y logo empresarial';
      default:
        return '';
    }
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  // Métodos de validación específicos
  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) return 'Este campo es requerido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['pattern']) return 'Formato inválido';
    if (errors['invalidLength']) return 'Debe tener exactamente 13 dígitos';
    if (errors['invalidProvince']) return 'Código de provincia inválido';

    return 'Campo inválido';
  }

  // Métodos de utilidad para el template
  canContinue(): boolean {
    return this.validateCurrentStep() && !this.isLoading;
  }

  canFinish(): boolean {
    return this.validateAllSteps() && !this.isLoading;
  }

  // Método para debug
  // Método para mejorar las interacciones del formulario
  enhanceFormInteractions() {
    this.addInputFocusAnimations();
    this.addFormValidationFeedback();
  }

  private addInputFocusAnimations() {
    const inputs = document.querySelectorAll('.setup-input');
    inputs.forEach((input: any) => {
      input.addEventListener('focus', () => {
        this.playFocusSound();
        input.parentElement?.classList.add('focused');
      });
      
      input.addEventListener('blur', () => {
        input.parentElement?.classList.remove('focused');
      });
    });
  }

  private addFormValidationFeedback() {
    const inputs = document.querySelectorAll('.setup-input');
    inputs.forEach((input: any) => {
      input.addEventListener('input', () => {
        this.debounceValidation(input);
      });
    });
  }

  private debounceValidation = this.debounce((input: any) => {
    const isValid = input.checkValidity() && input.value.length > 0;
    const parentGroup = input.closest('.form-group');
    
    if (parentGroup) {
      parentGroup.classList.toggle('field-valid', isValid);
      parentGroup.classList.toggle('field-invalid', !isValid && input.value.length > 0);
    }
  }, 300);

  private debounce(func: Function, wait: number) {
    let timeout: any;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  private playFocusSound() {
    // Simular feedback auditivo suave (solo en producción con configuración del usuario)
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        // Crear un sonido muy suave y corto para el focus
        // Este es opcional y se puede quitar si no se desea
      } catch (e) {
        // Silenciar errores de audio
      }
    }
  }

  // Mejorar la animación de cambio de paso
  private animateStepTransition() {
    const stepContent = document.querySelector('.step-content');
    if (stepContent) {
      stepContent.classList.add('step-transition-out');
      setTimeout(() => {
        stepContent.classList.remove('step-transition-out');
        stepContent.classList.add('step-transition-in');
        setTimeout(() => {
          stepContent.classList.remove('step-transition-in');
        }, 600);
      }, 200);
    }
  }

  debugCurrentStep() {
    console.log('=== DEBUG CURRENT STEP ===');
    console.log('Current Step:', this.currentStep);
    console.log('Company Form Valid:', this.companyForm.valid);
    console.log('Company Form Value:', this.companyForm.value);
    console.log('Establishment Form Valid:', this.establishmentForm.valid);
    console.log('Establishment Form Value:', this.establishmentForm.value);
    console.log('Signature File:', this.signatureFile);
    console.log('Validate Current Step Result:', this.validateCurrentStep());
    
    // Mostrar errores específicos
    if (this.currentStep === 1) {
      this.logFormErrors(this.companyForm);
    } else if (this.currentStep === 2) {
      this.logFormErrors(this.establishmentForm);
    }
  }

  /**
   * Mostrar confirmación con AlertComponent
   */
  showConfirmation(message: string, action: () => void): void {
    this.alertMessage = message;
    this.alertType = 'confirm';
    this.pendingAction = action;
  }

  /**
   * Manejar confirmación del AlertComponent
   */
  onAlertConfirmed(): void {
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.clearAlert();
  }

  /**
   * Manejar cancelación del AlertComponent
   */
  onAlertCancelled(): void {
    this.clearAlert();
  }

  /**
   * Limpiar alert
   */
  clearAlert(): void {
    this.alertMessage = '';
    this.alertType = 'info';
    this.pendingAction = null;
  }

  /**
   * Cerrar sesión y redirigir al login
   */
  logout(): void {
    // Usar modal de confirmación personalizado
    this.showConfirmation(
      '¿Está seguro que desea cerrar sesión? Se perderá el progreso no guardado.',
      () => {
        // Llamar al logout con el nuevo endpoint REST
        this.authService.logout().subscribe({
          next: (response) => {
            console.log('Setup - Logout successful:', response);
            
            // Limpiar datos de setup del localStorage si existen
            localStorage.removeItem('companySetup');
            localStorage.removeItem('setupCompleted');
            
            // Redirigir al login
            this.router.navigate(['/auth/login']);
          },
          error: (error) => {
            console.error('Setup - Logout error:', error);
            
            // Limpiar datos locales incluso si falla el logout en el servidor
            localStorage.removeItem('companySetup');
            localStorage.removeItem('setupCompleted');
            
            // Redirigir al login por seguridad
            this.router.navigate(['/auth/login']);
          }
        });
      }
    );
  }
}
