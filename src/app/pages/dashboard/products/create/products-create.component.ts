import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProductsService } from '../../../../services/products.service';
import { InputComponent } from '../../../../shared/components/ui/input/input.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { UiAlertComponent } from '../../../../shared/components/ui/alert/alert.component';
import { UiPageIntroComponent } from '../../../../shared/components/ui/page-intro/page-intro.component';
// Note: removed unused imports (SelectComponent, ScrollToTopDirective) to avoid TS-998113 warnings

@Component({
  selector: 'app-products-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputComponent, ButtonComponent, UiAlertComponent, UiPageIntroComponent],
  templateUrl: './products-create.component.html',
  styleUrls: ['../../clients/create-client/create-client.component.css', '../products.component.css']
})
export class ProductsCreateComponent {
  productForm: FormGroup;
  isSaving = false;

  // Alert model (re-using project's UiAlert)
  alertVisible = false;
  alertMessage = '';
  alertType: 'info' | 'success' | 'danger' = 'info';
  alertAutoDismiss = true;
  alertAutoDismissTime = 1800;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
      public router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      mainCode: ['', [Validators.required]],
      auxiliaryCode: [''],
      description: ['', [Validators.required]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      discount: [0, [Validators.min(0)]],
      vat: [12, [Validators.required, Validators.min(0), Validators.max(100)]],
      totalWithoutTax: [{ value: 0, disabled: true }]
    });

    // Recalculate total when relevant controls change
    this.productForm.get('unitPrice')?.valueChanges.subscribe(() => this.calculateTotalWithoutTax());
    this.productForm.get('quantity')?.valueChanges.subscribe(() => this.calculateTotalWithoutTax());
    this.productForm.get('discount')?.valueChanges.subscribe(() => this.calculateTotalWithoutTax());
  }

  private setAlert(message: string, type: 'info' | 'success' | 'danger' = 'info', autoDismiss = true, time = 1800) {
    this.alertMessage = message;
    this.alertType = type;
    this.alertAutoDismiss = autoDismiss;
    this.alertAutoDismissTime = time;
    this.alertVisible = true;
  }

  calculateTotalWithoutTax() {
    const unitPrice = Number(this.productForm.get('unitPrice')?.value) || 0;
    const quantity = Number(this.productForm.get('quantity')?.value) || 0;
    const discount = Number(this.productForm.get('discount')?.value) || 0;
    const subtotal = unitPrice * quantity;
    const total = Math.max(0, subtotal - discount);
    this.productForm.get('totalWithoutTax')?.setValue(total, { emitEvent: false });
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

    const payload = {
      name: this.productForm.get('name')?.value,
      mainCode: this.productForm.get('mainCode')?.value,
      auxiliaryCode: this.productForm.get('auxiliaryCode')?.value,
      description: this.productForm.get('description')?.value,
      unitPrice: Number(this.productForm.get('unitPrice')?.value) || 0,
      quantity: Number(this.productForm.get('quantity')?.value) || 0,
      discount: Number(this.productForm.get('discount')?.value) || 0,
      vat: Number(this.productForm.get('vat')?.value) || 0,
      totalWithoutTax: Number(this.productForm.get('totalWithoutTax')?.value) || 0
    };

    this.isSaving = true;
    this.productsService.createProductApi(payload, token).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/dashboard', 'products'], { state: { alert: { message: 'Producto creado correctamente', type: 'success', autoDismiss: true } } });
      },
      error: (err) => {
        console.error('Error creando producto', err);
        this.setAlert('Error al crear producto', 'danger', true, 3000);
        this.isSaving = false;
      }
    });
  }

  resetForm() {
    this.productForm.reset({
      name: '',
      mainCode: '',
      auxiliaryCode: '',
      description: '',
      unitPrice: 0,
      quantity: 1,
      discount: 0,
      vat: 12,
      totalWithoutTax: 0
    });
  }
}
