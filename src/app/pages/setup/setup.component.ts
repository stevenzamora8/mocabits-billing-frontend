import { Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SetupComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  
  currentStep = 1;
  totalSteps = 4;
  isLoading = false;
  
  companyForm!: FormGroup;
  establishmentForm!: FormGroup;
  logoFile: File | null = null;
  signatureFile: File | null = null;

  // Múltiples establecimientos
  establishments: EstablishmentData[] = [];
  currentEstablishmentIndex = 0;

  // Estados para mejor UX
  formTouched = {
    company: false,
    establishment: false
  };

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.setupFormSubscriptions();
    // Asegurar estilos de inputs después de la inicialización
    setTimeout(() => {
      this.forceInputStyles();
    }, 100);
  }

  ngAfterViewInit() {
    // Forzar estilos de inputs después de que la vista se inicialice
    this.forceInputStyles();
  }

  private forceInputStyles() {
    const inputs = document.querySelectorAll('.setup-container input, .setup-container select, .setup-container textarea');
    console.log('Forzando estilos en', inputs.length, 'elementos');
    
    inputs.forEach((input: any, index) => {
      // Eliminar todos los event listeners previos
      input.removeEventListener('focus', this.onInputFocus);
      input.removeEventListener('blur', this.onInputBlur);
      
      // Aplicar estilos base
      this.applyBaseStyles(input);
      
      // Agregar nuevos event listeners
      input.addEventListener('focus', this.onInputFocus.bind(this));
      input.addEventListener('blur', this.onInputBlur.bind(this));
      
      console.log(`Input ${index} estilizado`);
    });
    
    // Usar MutationObserver para detectar cambios en el DOM
    this.setupMutationObserver();
  }

  private applyBaseStyles(input: any) {
    const isError = input.classList.contains('error');
    
    // Aplicar estilos directamente al elemento
    input.style.setProperty('border', isError ? '2px solid #ef4444' : '2px solid #d1d5db', 'important');
    input.style.setProperty('border-width', '2px', 'important');
    input.style.setProperty('border-style', 'solid', 'important');
    input.style.setProperty('border-color', isError ? '#ef4444' : '#d1d5db', 'important');
    input.style.setProperty('outline', 'none', 'important');
    input.style.setProperty('background-color', isError ? '#fef2f2' : '#ffffff', 'important');
    input.style.setProperty('box-shadow', isError ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none', 'important');
  }

  private onInputFocus = (event: any) => {
    const input = event.target;
    const isError = input.classList.contains('error');
    
    console.log('Focus detectado en:', input);
    
    if (isError) {
      input.style.setProperty('border', '2px solid #ef4444', 'important');
      input.style.setProperty('border-color', '#ef4444', 'important');
      input.style.setProperty('box-shadow', '0 0 0 4px rgba(239, 68, 68, 0.2)', 'important');
      input.style.setProperty('background-color', '#fef2f2', 'important');
    } else {
      input.style.setProperty('border', '2px solid #3b82f6', 'important');
      input.style.setProperty('border-color', '#3b82f6', 'important');
      input.style.setProperty('box-shadow', '0 0 0 4px rgba(59, 130, 246, 0.2)', 'important');
      input.style.setProperty('background-color', '#ffffff', 'important');
    }
    input.style.setProperty('outline', 'none', 'important');
  }

  private onInputBlur = (event: any) => {
    const input = event.target;
    console.log('Blur detectado en:', input);
    this.applyBaseStyles(input);
  }

  private setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;
          if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
            setTimeout(() => this.applyBaseStyles(target), 10);
          }
        }
      });
    });

    observer.observe(document.querySelector('.setup-container') || document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class']
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
        
        this.currentStep++;
        this.scrollToTop();
        
        // Reforzar estilos después de cambio de paso
        setTimeout(() => {
          this.forceInputStyles();
        }, 100);
      } else {
        this.showValidationErrors();
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.scrollToTop();
      
      // Reforzar estilos después de cambio de paso
      setTimeout(() => {
        this.forceInputStyles();
      }, 100);
    }
  }

  scrollToTop() {
    const setupCard = document.querySelector('.setup-card');
    if (setupCard) {
      setupCard.scrollTop = 0;
    }
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
        console.log('Debes subir un logo para tu empresa.');
        break;
      case 4:
        if (this.signatureError) {
          console.log('Error en certificado:', this.signatureError);
        } else {
          console.log('Debes subir un certificado de firma electrónica válido.');
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
        console.log('Validando paso 1 - Company Form:', this.companyForm.valid);
        console.log('Company Form errors:', this.companyForm.errors);
        console.log('Company Form value:', this.companyForm.value);
        this.logFormErrors(this.companyForm);
        return this.companyForm.valid;
      case 2:
        console.log('Validando paso 2 - Establishment Form:', this.establishmentForm.valid);
        console.log('Establishment Form errors:', this.establishmentForm.errors);
        console.log('Establishment Form value:', this.establishmentForm.value);
        this.logFormErrors(this.establishmentForm);
        // Validar que al menos haya un establecimiento válido
        return this.establishmentForm.valid && this.establishments.length > 0;
      case 3:
        const logoValid = this.logoFile !== null;
        if (!logoValid) {
          console.log('Validación paso 3: Logo requerido');
        }
        return logoValid;
      case 4:
        const signatureValid = this.signatureFile !== null && this.signatureError === '';
        if (!signatureValid) {
          console.log('Validación paso 4: Certificado requerido y válido');
          if (this.signatureError) {
            console.log('Error de certificado:', this.signatureError);
          }
        }
        return signatureValid;
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

  onLogoChange(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.warn('El archivo es muy grande. Máximo 5MB.');
        return;
      }
      this.logoFile = file;
      console.log('Logo seleccionado:', file.name);
    } else {
      console.warn('Por favor selecciona un archivo de imagen válido.');
    }
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
      if (!(file.name.endsWith('.p12') || file.name.endsWith('.pfx'))) {
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
          // Los archivos PKCS#12 típicamente empiezan con una secuencia ASN.1
          // Buscar patrones típicos: 0x30 (SEQUENCE), seguido de longitud
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

  private signatureError: string = '';

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

  // Métodos para manejar focus y blur directamente desde el template
  onInputFocusTemplate(event: any) {
    const input = event.target;
    const isError = input.classList.contains('error');
    
    console.log('Template focus:', input, 'isError:', isError);
    
    if (isError) {
      input.style.setProperty('border', '2px solid #ef4444', 'important');
      input.style.setProperty('box-shadow', '0 0 0 4px rgba(239, 68, 68, 0.2)', 'important');
    } else {
      input.style.setProperty('border', '2px solid #3b82f6', 'important');
      input.style.setProperty('box-shadow', '0 0 0 4px rgba(59, 130, 246, 0.2)', 'important');
    }
    input.style.setProperty('outline', 'none', 'important');
  }

  onInputBlurTemplate(event: any) {
    const input = event.target;
    const isError = input.classList.contains('error');
    
    console.log('Template blur:', input, 'isError:', isError);
    
    if (isError) {
      input.style.setProperty('border', '2px solid #ef4444', 'important');
      input.style.setProperty('box-shadow', '0 0 0 3px rgba(239, 68, 68, 0.1)', 'important');
    } else {
      input.style.setProperty('border', '2px solid #d1d5db', 'important');
      input.style.setProperty('box-shadow', 'none', 'important');
    }
    input.style.setProperty('outline', 'none', 'important');
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
      
      const setupData = {
        razonSocial: companyData.razonSocial,
        nombreComercial: companyData.nombreComercial,
        ruc: companyData.ruc,
        codDoc: companyData.codDoc,
        dirMatriz: companyData.dirMatriz,
        obligadoContabilidad: companyData.obligadoContabilidad,
        establishments: this.establishments, // Todos los establecimientos
        logo: this.logoFile,
        signature: this.signatureFile,
        signatureValidated: true, // Indicar que la firma fue validada
        setupCompleted: true,
        setupDate: new Date().toISOString()
      };

      console.log('Configuración completada:', setupData);
      console.log('Establecimientos configurados:', this.establishments.length);
      console.log('Certificado validado:', this.signatureFile?.name);
      
      // Simular guardado (reemplazar con llamada real al backend)
      await this.simulateApiCall();
      
      // Guardar datos en localStorage temporalmente
      localStorage.setItem('companySetup', JSON.stringify(setupData));
      localStorage.setItem('setupCompleted', 'true');

      // Redirigir al dashboard
      this.router.navigate(['/dashboard']);
      
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      this.showValidationErrors();
    } finally {
      this.isLoading = false;
    }
  }

  private simulateApiCall(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, 1500); // Simular tiempo de carga
    });
  }

  validateAllSteps(): boolean {
    // Guardar el establecimiento actual antes de validar
    this.saveCurrentEstablishmentData();
    
    const companyValid = this.companyForm.valid;
    const establishmentsValid = this.establishments.length > 0 &&
           this.establishments.every(est => 
             est.estab && est.ptoEmi && est.secuencial && est.dirEstablecimiento
           );
    const logoValid = this.logoFile !== null;
    const signatureValid = this.signatureFile !== null && this.signatureError === '';
    
    console.log('Validación final:', {
      company: companyValid,
      establishments: establishmentsValid,
      logo: logoValid,
      signature: signatureValid,
      signatureError: this.signatureError
    });
    
    return companyValid && establishmentsValid && logoValid && signatureValid;
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'Datos del Contribuyente';
      case 2:
        return 'Establecimientos';
      case 3:
        return 'Logo de la Empresa';
      case 4:
        return 'Firma Electrónica';
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
        return 'Logo que aparecerá en tus documentos';
      case 4:
        return 'Certificado para firmar electrónicamente';
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

  // Método para debug - puedes llamarlo desde la consola del navegador
  debugCurrentStep() {
    console.log('=== DEBUG CURRENT STEP ===');
    console.log('Current Step:', this.currentStep);
    console.log('Company Form Valid:', this.companyForm.valid);
    console.log('Company Form Value:', this.companyForm.value);
    console.log('Establishment Form Valid:', this.establishmentForm.valid);
    console.log('Establishment Form Value:', this.establishmentForm.value);
    console.log('Logo File:', this.logoFile);
    console.log('Signature File:', this.signatureFile);
    console.log('Validate Current Step Result:', this.validateCurrentStep());
    
    // Mostrar errores específicos
    if (this.currentStep === 1) {
      this.logFormErrors(this.companyForm);
    } else if (this.currentStep === 2) {
      this.logFormErrors(this.establishmentForm);
    }
  }
}
