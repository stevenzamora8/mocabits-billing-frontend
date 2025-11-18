import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../../services/products.service';
import { environment } from '../../../../../environments/environment';
import { InputComponent } from '../../../../shared/components/ui/input/input.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { UiAlertComponent } from '../../../../shared/components/ui/alert/alert.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/ui/select/select.component';
import { UiPageIntroComponent } from '../../../../shared/components/ui/page-intro/page-intro.component';
// Note: removed unused imports (SelectComponent, ScrollToTopDirective) to avoid TS-998113 warnings

@Component({
  selector: 'app-products-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputComponent, ButtonComponent, UiAlertComponent, UiPageIntroComponent, SelectComponent],
  templateUrl: './products-create.component.html',
  styleUrls: ['../../clients/create-client/create-client.component.css', '../products.component.css']
})
export class ProductsCreateComponent implements OnInit {
  private destroy$ = new Subject<void>();
  taxOptions: SelectOption[] = [];
  loadingTaxOptions = false;
  establishmentOptions: SelectOption[] = [];
  loadingEstablishments = false;
  productForm: FormGroup;
  isSaving = false;
  isEditMode = false;
  productId: number | null = null;
  isLoading = false;
  originalMainCode = '';
  originalAuxiliaryCode = '';

  // Alert model (re-using project's UiAlert)
  alertVisible = false;
  alertMessage = '';
  alertType: 'info' | 'success' | 'danger' = 'info';
  alertAutoDismiss = true;
  alertAutoDismissTime = 1800;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      mainCode: ['', [Validators.required, Validators.maxLength(50)]],
      auxiliaryCode: ['', [Validators.required, Validators.maxLength(50)]],
      establishmentId: [null, []], // nullable; we'll validate existence when provided
      description: ['', [Validators.required, Validators.maxLength(500)]],
      unitPrice: [0, [Validators.required, Validators.min(0), this.decimalScaleValidator(2)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      // discount removed: backend does not expect discount, compute totals from price/qty and taxRate
      // taxRateId refers to the catalog tax rate identifier (e.g. 1 for IVA 12%)
      taxRateId: [null, [Validators.required, this.existsInTaxOptionsValidator.bind(this)]],
      // Computed fields (readonly)
      subtotal: [{ value: 0, disabled: true }],
      taxAmount: [{ value: 0, disabled: true }],
      total: [{ value: 0, disabled: true }]
    });

    // Recalculate totals when relevant controls change
    this.productForm.get('unitPrice')?.valueChanges.subscribe(() => this.calculateTotals());
    this.productForm.get('quantity')?.valueChanges.subscribe(() => this.calculateTotals());
    this.productForm.get('taxRateId')?.valueChanges.subscribe(() => this.calculateTotals());

    // Reactive existence checks for mainCode and auxiliaryCode
    const mainCtrl = this.productForm.get('mainCode');
    if (mainCtrl) {
      mainCtrl.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((val: string) => {
          if (!val || String(val).trim().length === 0) return of({ exists: false });
          
          // In edit mode, don't validate if the value hasn't changed from original
          if (this.isEditMode && String(val).trim() === this.originalMainCode.trim()) {
            return of({ exists: false });
          }
          
          const token = localStorage.getItem('accessToken') || undefined;
          return this.productsService.checkMainCodeExists(String(val).trim(), token).pipe(
            catchError(() => of({ exists: false }))
          );
        }),
        takeUntil(this.destroy$)
      ).subscribe((res: any) => {
        const ctrl = this.productForm.get('mainCode');
        if (!ctrl) return;
        if (res && res.exists) {
          ctrl.setErrors({ ...(ctrl.errors || {}), mainCodeExists: true });
        } else {
          const errs = { ...(ctrl.errors || {}) } as any;
          if (errs.mainCodeExists) delete errs.mainCodeExists;
          if (Object.keys(errs).length) ctrl.setErrors(errs); else ctrl.setErrors(null);
        }
      });
    }

    const auxCtrl = this.productForm.get('auxiliaryCode');
    if (auxCtrl) {
      auxCtrl.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((val: string) => {
          if (!val || String(val).trim().length === 0) return of({ exists: false });
          
          // In edit mode, don't validate if the value hasn't changed from original
          if (this.isEditMode && String(val).trim() === this.originalAuxiliaryCode.trim()) {
            return of({ exists: false });
          }
          
          const token = localStorage.getItem('accessToken') || undefined;
          return this.productsService.checkAuxiliaryCodeExists(String(val).trim(), token).pipe(
            catchError(() => of({ exists: false }))
          );
        }),
        takeUntil(this.destroy$)
      ).subscribe((res: any) => {
        const ctrl = this.productForm.get('auxiliaryCode');
        if (!ctrl) return;
        if (res && res.exists) {
          ctrl.setErrors({ ...(ctrl.errors || {}), auxiliaryCodeExists: true });
        } else {
          const errs = { ...(ctrl.errors || {}) } as any;
          if (errs.auxiliaryCodeExists) delete errs.auxiliaryCodeExists;
          if (Object.keys(errs).length) ctrl.setErrors(errs); else ctrl.setErrors(null);
        }
      });
    }
  }

  private setAlert(message: string, type: 'info' | 'success' | 'danger' = 'info', autoDismiss = true, time = 1800) {
    this.alertMessage = message;
    this.alertType = type;
    this.alertAutoDismiss = autoDismiss;
    this.alertAutoDismissTime = time;
    this.alertVisible = true;
  }

  calculateTotals() {
    const unitPrice = Number(this.productForm.get('unitPrice')?.value) || 0;
    const quantity = Number(this.productForm.get('quantity')?.value) || 0;
    const subtotal = unitPrice * quantity;
    // Determine tax rate percentage from selected taxRateId / taxOptions list or from loaded taxOptions
    let taxRatePercent = 0;
    const selectedTaxId = this.productForm.get('taxRateId')?.value;
    if (selectedTaxId != null) {
      const found = (this.taxOptions || []).find((o: any) => o.value === selectedTaxId);
      if (found) {
        // Prefer explicit numeric rate saved on the option
        if (typeof found.rate === 'number') {
          taxRatePercent = Number(found.rate) || 0;
        } else if (typeof found.label === 'string') {
          // fallback: try to parse percent from label (e.g. 'IVA 15%')
          const m = found.label.match(/(\d+(?:[.,]\d+)?)%?/);
          if (m) taxRatePercent = Number(m[1].replace(',', '.'));
        }
      }
    }

    // Also if taxOptions are insufficient, try reading the tax rate from the productForm raw value (some flows prefill a taxRate object)
    // (No direct control exists for the full taxRate object here.)

    const taxAmount = +(subtotal * (taxRatePercent / 100));
    const total = +(subtotal + taxAmount);

    this.productForm.get('subtotal')?.setValue(subtotal, { emitEvent: false });
    this.productForm.get('taxAmount')?.setValue(taxAmount, { emitEvent: false });
    this.productForm.get('total')?.setValue(total, { emitEvent: false });
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.setAlert('No se encontró token de autenticación.', 'danger');
      return;
    }

    // Build payload to match the curl example exactly
    const payload: any = {
      name: this.productForm.get('name')?.value,
      mainCode: this.productForm.get('mainCode')?.value,
      auxiliaryCode: this.productForm.get('auxiliaryCode')?.value,
      description: this.productForm.get('description')?.value,
      unitPrice: Number(this.productForm.get('unitPrice')?.value) || 0,
      quantity: Number(this.productForm.get('quantity')?.value) || 0,
      taxRateId: Number(this.productForm.get('taxRateId')?.value),
      establishmentId: Number(this.productForm.get('establishmentId')?.value)
    };

    this.isSaving = true;
    
    if (this.isEditMode && this.productId) {
      // Update existing product
      this.productsService.updateProductApi(String(this.productId), payload, token).subscribe({
        next: () => {
            this.isSaving = false;
            try {
              // Persist alert in sessionStorage as a fallback in case the list component is reused
              sessionStorage.setItem('productAlert', JSON.stringify({ message: 'Producto actualizado correctamente', type: 'success', autoDismiss: true }));
            } catch (e) {
              // ignore storage errors
            }
            this.router.navigate(['/dashboard', 'products'], { state: { alert: { message: 'Producto actualizado correctamente', type: 'success', autoDismiss: true } } });
          },
        error: (err: any) => {
          console.error('Error actualizando producto', err);
          this.setAlert('Error al actualizar producto', 'danger', true, 3000);
          this.isSaving = false;
        }
      });
    } else {
      // Create new product
      this.productsService.createProductApi(payload, token).subscribe({
        next: () => {
          this.isSaving = false;
          try {
            sessionStorage.setItem('productAlert', JSON.stringify({ message: 'Producto creado correctamente', type: 'success', autoDismiss: true }));
          } catch (e) {}
          this.router.navigate(['/dashboard', 'products'], { state: { alert: { message: 'Producto creado correctamente', type: 'success', autoDismiss: true } } });
        },
        error: (err: any) => {
          console.error('Error creando producto', err);
          this.setAlert('Error al crear producto', 'danger', true, 3000);
          this.isSaving = false;
        }
      });
    }

    // Attach establishment existence validator (establishmentId is nullable; validate only when present)
    const estabCtrl = this.productForm.get('establishmentId');
    if (estabCtrl) {
      estabCtrl.setValidators([this.existsInEstablishmentOptionsValidator()]);
      estabCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
  }

  // Validator: enforce decimal scale (number of decimal places)
  decimalScaleValidator(maxScale: number) {
    return (control: any) => {
      const val = control.value;
      if (val === null || val === undefined || val === '') return null;
      const str = String(val);
      const m = str.match(/^[+-]?\d+(?:\.(\d+))?$/);
      if (!m) return { invalidNumber: true };
      const frac = m[1] || '';
      if (frac.length > maxScale) return { scaleExceeded: { maxScale } };
      return null;
    };
  }

  // Validator: taxRateId should exist in loaded taxOptions
  existsInTaxOptionsValidator(control: any) {
    const val = control.value;
    if (val === null || val === undefined) return { required: true };
    const found = (this.taxOptions || []).some((o: any) => o.value === val);
    return found ? null : { notFound: true };
  }

  // Validator factory: establishment must exist in establishmentOptions if provided
  existsInEstablishmentOptionsValidator() {
    return (control: any) => {
      const val = control.value;
      if (val === null || val === undefined || val === '') return null; // nullable
      const found = (this.establishmentOptions || []).some((o: any) => o.value === val);
      return found ? null : { establishmentNotFound: true };
    };
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = Number(params['id']);
        this.loadProductForEdit();
      }
    });
    
    this.loadTaxRates();
    this.loadEstablishments();
    // Ensure computed fields are initialized
    this.calculateTotals();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTaxRates(): void {
    this.loadingTaxOptions = true;
    // token optional
    const token = localStorage.getItem('accessToken') || undefined;
    // Request tax rates using the configured taxTypeName from environment
    const taxType = environment.catalogTaxTypeName || 'IVA';
    this.productsService.getTaxRates(token, taxType).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res && res.content) ? res.content : [];
        // keep active rates only
        const active = list.filter((r: any) => String(r.status) === 'A');
        // Map options to use the tax rate id as value (API expects taxRateId on create).
        // Also store the numeric 'rate' so we can compute amounts reliably on the client.
        this.taxOptions = active.map((r: any) => ({ value: r.id, label: r.name || `${r.rate}%`, rate: Number(r.rate) }));

        // Ensure there's always an explicit 0% IVA option available and visible to the user.
        const hasZero = this.taxOptions.some((o: any) => Number(o.rate) === 0);
        if (!hasZero) {
          // insert at the beginning so it's easy to pick as default when needed
          this.taxOptions.unshift({ value: 0, label: 'IVA 0%', rate: 0 });
        }

        // if catalog provides a default rate (default === 'Y'), set taxRateId control to that id
        if (this.taxOptions.length) {
          const defaultRate = list.find((r: any) => r.default === 'Y' && String(r.status) === 'A');
          const initialId = defaultRate ? defaultRate.id : this.taxOptions[0].value;
          const current = this.productForm.get('taxRateId')?.value;
          if (!current) {
            this.productForm.get('taxRateId')?.setValue(initialId);
          }
        }
        this.loadingTaxOptions = false;
      },
      error: (err) => {
        console.error('Error loading tax rates:', err);
        this.loadingTaxOptions = false;
      }
    });
  }

  private loadEstablishments(): void {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    this.loadingEstablishments = true;
    this.productsService.getEstablishments(token).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res && res.content) ? res.content : [];
        this.establishmentOptions = list.map((e: any) => {
          // Build a concise label: only sucursal (code) and dirección.
          // Example input: { id: 10, estab: '001', ptoEmi: '001', dirEstablecimiento: 'Av. Principal 123' }
          const codeParts: string[] = [];
          if (e.estab) codeParts.push(String(e.estab));
          if (e.ptoEmi) codeParts.push(String(e.ptoEmi));
          const code = codeParts.length ? codeParts.join('-') : String(e.id);
          const desc = e.dirEstablecimiento || e.description || e.name || '';
          const label = desc ? `${code} — ${desc}`.trim() : `${code}`;
          return { value: e.id, label };
        });
        // If there's at least one establishment and control is empty, pick first
        const current = this.productForm.get('establishmentId')?.value;
        if (!current && this.establishmentOptions.length) {
          this.productForm.get('establishmentId')?.setValue(this.establishmentOptions[0].value);
        }
        this.loadingEstablishments = false;
      },
      error: (err) => {
        console.error('Error loading establishments:', err);
        this.loadingEstablishments = false;
      }
    });
  }

  resetForm() {
    this.productForm.reset({
      name: '',
      mainCode: '',
      auxiliaryCode: '',
      establishmentId: null,
      description: '',
      unitPrice: 0,
      quantity: 1,
      taxRateId: null,
      subtotal: 0,
      taxAmount: 0,
      total: 0
    });
  }

  private loadProductForEdit(): void {
    if (!this.productId) return;
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.setAlert('No se encontró token de autenticación.', 'danger');
      return;
    }

    this.isLoading = true;
    this.productsService.getProductByIdApi(String(this.productId), token).subscribe({
      next: (product: any) => {
        // Store original codes for validation
        this.originalMainCode = product.mainCode || '';
        this.originalAuxiliaryCode = product.auxiliaryCode || '';
        
        // Populate form with product data
        this.productForm.patchValue({
          name: product.name || '',
          mainCode: product.mainCode || '',
          auxiliaryCode: product.auxiliaryCode || '',
          establishmentId: product.establishmentId || null,
          description: product.description || '',
          unitPrice: Number(product.unitPrice) || 0,
          quantity: Number(product.quantity) || 0,
          taxRateId: product.taxRateId || null
        });
        
        // Recalculate totals after loading data
        this.calculateTotals();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.setAlert('Error al cargar el producto', 'danger');
        this.isLoading = false;
      }
    });
  }
}
