import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { InputComponent } from '../../../../shared/components/ui/input/input.component';
import { SelectComponent } from '../../../../shared/components/ui/select/select.component';
import { UiAlertComponent, UiAlertType } from '../../../../shared/components/ui/alert/alert.component';
import { UiPageIntroComponent } from '../../../../shared/components/ui/page-intro/page-intro.component';
import { UiFormSectionComponent } from '../../../../shared/components/ui/form-section/form-section.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Services
import { InvoicesService } from '../../../../services/invoices.service';
import { AuthService } from '../../../../services/auth.service';
import { ClientService, Client } from '../../../../services/client.service';
import { ProductsService } from '../../../../services/products.service';

interface CreateInvoiceRequest {
  clientId: number;
  issueDate: string;
  dueDate?: null;
  status: 'draft';
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
  }[];
}

interface InvoiceItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

interface Product {
  id: string;
  name: string;
  mainCode: string;
  auxiliaryCode?: string;
  description?: string;
  unitPrice: number;
  quantity?: number;
  taxRate?: {
    id: string;
    name: string;
    rate: number;
  };
}

@Component({
  selector: 'app-invoices-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonComponent, InputComponent, SelectComponent, UiAlertComponent, UiPageIntroComponent, UiFormSectionComponent],
  templateUrl: './invoices-create.component.html',
  styleUrls: ['./invoices-create.component.css']
})
export class InvoicesCreateComponent implements OnInit, OnDestroy {
  invoiceForm!: FormGroup;
  selectedProductId: any = null;

  clients: Client[] = [];
  products: Product[] = [];
  establishments: any[] = [];
  isLoading = false;
  isSaving = false;

  alertVisible = false;
  alertMessage = '';
  alertType: UiAlertType = 'info';
  alertAutoDismiss = true;

  quickCreateVisible = false;
  quickCreateLoading = false;
  quickCreateForm!: FormGroup;

  subtotal = 0;
  totalDiscount = 0;
  totalTax = 0;
  grandTotal = 0;

  clientOptions: { value: any; label: string }[] = [];
  productOptions: { value: any; label: string }[] = [];
  establishmentOptions: { value: any; label: string }[] = [];
  clientTypeOptions: { value: any; label: string }[] = [];

  clientFilters: any = { searchTerm: '', identification: '', selectedType: '' };
  productFilters: any = { filterName: '', filterMainCode: '', filterAuxiliaryCode: '', establishmentId: '' };

  private destroy$ = new Subject<void>();

  @ViewChild('clientSelectComp') clientSelectComp?: SelectComponent;

  constructor(
    private fb: FormBuilder,
    private invoicesService: InvoicesService,
    private authService: AuthService,
    private clientService: ClientService,
    private productsService: ProductsService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  get itemsFormArray(): FormArray {
    const array = this.invoiceForm.get('items') as FormArray;
    console.log('itemsFormArray getter called, length:', array?.length);
    return array;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadClients();
    this.loadProducts();
    this.loadEstablishments();
    this.loadClientTypes();

    const navigation = this.router.getCurrentNavigation?.();
    if (navigation?.extras?.state?.['alert']) {
      const alertData = navigation.extras.state['alert'];
      this.showAlert(alertData.message, alertData.type, alertData.autoDismiss);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.invoiceForm = this.fb.group({
      clientId: ['', [Validators.required]],
      issueDate: [today, [Validators.required]],
      items: this.fb.array([], { validators: [this.itemsArrayValidator.bind(this)] })
    });

    this.quickCreateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      identification: ['', [Validators.required]],
      email: ['', []],
      phone: ['', []]
    });

    this.invoiceForm.valueChanges.subscribe(() => this.calculateTotals());
    
    console.log('Form initialized, itemsFormArray:', this.itemsFormArray);
    console.log('itemsFormArray length:', this.itemsFormArray.length);
  }

  toggleQuickCreate(): void {
    this.quickCreateVisible = !this.quickCreateVisible;
  }

  submitQuickCreate(): void {
    if (!this.quickCreateForm.valid) {
      this.showAlert('Por favor complete los datos requeridos del cliente', 'danger');
      return;
    }

    this.quickCreateLoading = true;
    const payload = {
      name: this.quickCreateForm.get('name')?.value,
      identification: this.quickCreateForm.get('identification')?.value,
      typeIdentification: '04',
      email: this.quickCreateForm.get('email')?.value || '',
      phone: this.quickCreateForm.get('phone')?.value || ''
    } as any;

    this.clientService.createClient(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (created) => {
        const newClient = created as any;
        this.clients.unshift(newClient);
        this.clientOptions.unshift({ value: newClient.id, label: `${newClient.name} (${newClient.identification})` });
        this.invoiceForm.patchValue({ clientId: newClient.id });
        this.quickCreateForm.reset();
        this.quickCreateVisible = false;
        this.showAlert('Cliente creado y seleccionado', 'success');
        this.quickCreateLoading = false;
      },
      error: (err) => {
        console.error('Error creating client from quick form', err);
        this.showAlert('Error al crear el cliente. Intente de nuevo.', 'danger');
        this.quickCreateLoading = false;
      }
    });
  }

  private itemsArrayValidator(control: AbstractControl): ValidationErrors | null {
    const arr = control as FormArray;
    if (!arr || arr.length === 0) return { itemsRequired: true };
    for (let i = 0; i < arr.length; i++) {
      const item = arr.at(i);
      if (!item.valid) return { invalidItem: true };
      const qty = item.get('quantity')?.value || 0;
      const unit = item.get('unitPrice')?.value || 0;
      if (qty <= 0 || unit <= 0) return { invalidItemValues: true };
    }
    return null;
  }

  private showAlert(message: string, type: UiAlertType = 'info', autoDismiss: boolean = true): void {
    this.alertMessage = message;
    this.alertType = type;
    this.alertAutoDismiss = autoDismiss;
    this.alertVisible = true;
    this.cdr.detectChanges();
  }

  private loadClients(): void {
    this.isLoading = true;
    const token = this.authService.getAccessToken();
    if (!token) {
      this.isLoading = false;
      return;
    }

    const filters = {
      name: this.clientFilters.searchTerm,
      identification: this.clientFilters.identification,
      idTypeIdentification: this.clientFilters.selectedType,
      status: undefined
    };

    this.clientService.getClients(0, 100, filters).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.clients = response.content || response.data || [];
        this.clientOptions = this.clients.map((client: any) => ({
          value: client.id,
          label: `${client.name} (${client.identification})`
        }));
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
        this.isLoading = false;
        this.showAlert('Error al cargar clientes', 'danger');
      }
    });
  }

  onClientSearch(term: string): void {
    this.clientFilters.searchTerm = term || '';
    if (term && /^\d+$/.test(term.trim())) {
      this.clientFilters.identification = term.trim();
      this.clientFilters.searchTerm = '';
    } else {
      this.clientFilters.identification = '';
    }
    this.loadClients();
  }

  loadProducts(): void {
    const token = this.authService.getAccessToken();
    if (!token) return;

    const params: any = { page: 0, size: 100 };
    if (this.productFilters.filterName) params.name = this.productFilters.filterName;
    if (this.productFilters.filterMainCode) params.mainCode = this.productFilters.filterMainCode;
    if (this.productFilters.filterAuxiliaryCode) params.auxiliaryCode = this.productFilters.filterAuxiliaryCode;
    if (this.productFilters.establishmentId) params.establishmentId = this.productFilters.establishmentId;

    this.productsService.getProductsApi(params, token).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        console.log('Products API response:', response);
        const productsData = Array.isArray(response.data) ? response.data : 
                           Array.isArray(response.content) ? response.content : 
                           Array.isArray(response.page?.content) ? response.page.content : [];
        this.products = productsData;
        console.log('Loaded products:', this.products);
        this.productOptions = this.products.map(product => ({
          value: product.id,
          label: `${product.name} - ${product.mainCode || ''} - $${product.unitPrice}`
        }));
        console.log('Product options:', this.productOptions);
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.showAlert('Error al cargar productos', 'danger');
      }
    });
  }

  onProductSearch(term: string): void {
    const t = term || '';
    this.productFilters.filterName = t;
    this.productFilters.filterMainCode = t;
    this.productFilters.filterAuxiliaryCode = t;
    this.loadProducts();
  }

  loadEstablishments(): void {
    const token = this.authService.getAccessToken();
    if (!token) return;

    this.productsService.getEstablishments(token).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
        const data = Array.isArray(resp.data) ? resp.data : (resp.content || resp);
        this.establishments = data || [];
        this.establishmentOptions = this.establishments.map((e: any) => ({
          value: e.id,
          label: e.name || e.address || `Establecimiento ${e.id}`
        }));
      },
      error: (err: any) => {
        console.warn('Error loading establishments:', err);
      }
    });
  }

  loadClientTypes(): void {
    this.clientTypeOptions = [
      { value: '', label: 'Todos' },
      { value: '04', label: 'RUC' },
      { value: '05', label: 'Cédula' },
      { value: '06', label: 'Pasaporte' }
    ];
  }

  createItemFormGroup(item?: Partial<InvoiceItem>): FormGroup {
    return this.fb.group({
      productId: [item?.productId || '', [Validators.required]],
      productName: [item?.productName || '', [Validators.required]],
      productCode: [item?.productCode || ''],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0.01)]],
      discount: [item?.discount || 0, [Validators.min(0), Validators.max(100)]],
      taxRate: [item?.taxRate || 0, [Validators.min(0)]],
      subtotal: [{ value: item?.subtotal || 0, disabled: true }],
      discountAmount: [{ value: item?.discountAmount || 0, disabled: true }],
      taxAmount: [{ value: item?.taxAmount || 0, disabled: true }],
      total: [{ value: item?.total || 0, disabled: true }]
    });
  }

  addProduct(productId?: any, quantity: number = 1): void {
    console.log('addProduct called with:', { productId, quantity });
    
    if (!productId) {
      console.warn('addProduct: No productId provided');
      return;
    }
    
  // Use loose equality to tolerate number/string id differences from select
  const product = this.products.find(p => p.id == productId);
    console.log('addProduct: Found product:', product);
    
    if (!product) {
      console.warn('addProduct: Product not found');
      return;
    }

    const existingIndex = this.itemsFormArray.controls.findIndex(control => 
      control.get('productId')?.value == productId);
    
    console.log('addProduct: Existing index:', existingIndex);
    console.log('addProduct: Current items count:', this.itemsFormArray.length);

    if (existingIndex >= 0) {
      const existingControl = this.itemsFormArray.at(existingIndex);
      const currentQuantity = existingControl.get('quantity')?.value || 0;
      console.log('addProduct: Updating existing item quantity from', currentQuantity, 'to', currentQuantity + quantity);
      existingControl.patchValue({ quantity: currentQuantity + quantity });
    } else {
      const taxRate = product.taxRate?.rate || 0;
      const itemGroup = this.createItemFormGroup({
        productId: product.id,
        productName: product.name,
        productCode: product.mainCode,
        quantity: quantity,
        unitPrice: product.unitPrice,
        discount: 0,
        taxRate: taxRate
      });
      console.log('addProduct: Adding new item to form array');
      this.itemsFormArray.push(itemGroup);
      this.itemsFormArray.updateValueAndValidity();
      console.log('addProduct: New items count:', this.itemsFormArray.length);
    }
    
    this.calculateTotals();
    console.log('addProduct: Totals calculated, grandTotal:', this.grandTotal);
  }

  addSelectedProduct(): void {
    console.log('addSelectedProduct called, selectedProductId:', this.selectedProductId);
    
    if (!this.selectedProductId) {
      console.warn('No product selected');
      return;
    }
    
    const product = this.products.find(p => p.id === this.selectedProductId);
    console.log('Found product:', product);
    
    if (!product) {
      console.warn('Product not found in products array');
      return;
    }

    try {
      console.log('Calling addProduct with:', this.selectedProductId.toString());
      this.addProduct(this.selectedProductId.toString(), 1);
      this.selectedProductId = null;
      
      // Force change detection
      this.cdr.detectChanges();
      
      // Close dropdown and focus input
      try {
        const productSelect = document.querySelector('#productSelect') as any;
        if (productSelect && typeof productSelect.closeDropdown === 'function') {
          productSelect.closeDropdown();
        }
      } catch (e) {}

      setTimeout(() => {
        const productInput = document.querySelector('#productSelect input') as HTMLElement;
        if (productInput) productInput.focus();
      }, 100);
    } catch (e) {
      console.error('Error adding selected product', e);
    }
  }

  removeItem(index: number): void {
    this.itemsFormArray.removeAt(index);
    this.itemsFormArray.updateValueAndValidity();
    this.calculateTotals();
  }

  private calculateTotals(): void {
    const items = this.itemsFormArray.controls;
    this.subtotal = 0;
    this.totalDiscount = 0;
    this.totalTax = 0;

    items.forEach(itemControl => {
      const quantity = itemControl.get('quantity')?.value || 0;
      const unitPrice = itemControl.get('unitPrice')?.value || 0;
      const discount = itemControl.get('discount')?.value || 0;
      const taxRate = itemControl.get('taxRate')?.value || 0;

      const itemSubtotal = quantity * unitPrice;
      const discountAmount = itemSubtotal * (discount / 100);
      const subtotalWithDiscount = itemSubtotal - discountAmount;
      const taxAmount = subtotalWithDiscount * (taxRate / 100);
      const itemTotal = subtotalWithDiscount + taxAmount;

      itemControl.patchValue({
        subtotal: itemSubtotal,
        discountAmount: discountAmount,
        taxAmount: taxAmount,
        total: itemTotal
      }, { emitEvent: false });

      this.subtotal += itemSubtotal;
      this.totalDiscount += discountAmount;
      this.totalTax += taxAmount;
    });

    this.grandTotal = this.subtotal - this.totalDiscount + this.totalTax;
  }

  isFormValid(): boolean {
    return this.invoiceForm.valid && this.grandTotal > 0;
  }

  saveInvoice(): void {
    if (!this.isFormValid()) {
      this.showAlert('Por favor complete todos los campos requeridos y agregue al menos un producto', 'danger');
      return;
    }

    this.isSaving = true;
    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('No token available');
      this.isSaving = false;
      this.showAlert('Error de autenticación. Por favor inicie sesión nuevamente.', 'danger');
      return;
    }

    const formValue = this.invoiceForm.value;
    const invoiceData: CreateInvoiceRequest = {
      clientId: formValue.clientId,
      issueDate: formValue.issueDate,
      dueDate: null,
      status: 'draft',
      items: formValue.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.taxRate
      }))
    };

    this.invoicesService.createInvoiceApi(invoiceData, token).subscribe({
      next: (response) => {
        console.log('Invoice created successfully:', response);
        this.isSaving = false;
        try {
          sessionStorage.setItem('invoiceAlert', JSON.stringify({
            message: 'Factura creada exitosamente',
            type: 'success',
            autoDismiss: true
          }));
        } catch (e) {}
        this.navigateToList();
      },
      error: (error) => {
        console.error('Error creating invoice:', error);
        this.isSaving = false;
        this.showAlert('Error al crear la factura. Por favor, inténtelo de nuevo.', 'danger');
      }
    });
  }

  cancel(): void {
    this.navigateToList();
  }

  private navigateToList(): void {
    this.router.navigate(['../list'], { relativeTo: this.route });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
  }

  getSelectedClient(): Client | null {
    const clientId = this.invoiceForm.get('clientId')?.value;
    return this.clients.find(c => c.id == clientId) || null;
  }

  onProductSelect(selection: any): void {
    console.log('onProductSelect called with:', selection);
    if (selection && selection.value) {
      this.selectedProductId = selection.value;
      console.log('selectedProductId set to:', this.selectedProductId);
    } else {
      console.log('No valid selection provided');
    }
  }

  onEstablishmentChange(): void {
    this.selectedProductId = null;
    this.loadProducts();
  }

  clearEstablishmentFilter(): void {
    this.productFilters.establishmentId = '';
    this.selectedProductId = null;
    this.loadProducts();
  }

  onClientSelect(selection: any): void {
    if (!selection) return;
    const val = Array.isArray(selection) ? (selection.length ? selection[0].value : '') : selection.value;
    if (val !== undefined) {
      this.invoiceForm.patchValue({ clientId: val });
      this.invoiceForm.get('clientId')?.markAsTouched();
    }
  }

  openClientSearch(): void {
    setTimeout(() => {
      try {
        this.clientSelectComp?.openDropdown();
      } catch (e) {}
    }, 0);
  }

  navigateToCreateClient(): void {
    this.router.navigate(['/dashboard', 'clients', 'create']);
  }

  clearSelectedClient(): void {
    this.invoiceForm.patchValue({ clientId: '' });
    try {
      this.clientSelectComp?.closeDropdown();
    } catch (e) {}
  }

  onQuantityChange(index: number, quantity: number): void {
    if (quantity > 0) {
      this.itemsFormArray.at(index).patchValue({ quantity });
    }
  }

  onDiscountChange(index: number, discount: number): void {
    const validDiscount = Math.max(0, Math.min(100, discount));
    this.itemsFormArray.at(index).patchValue({ discount: validDiscount });
  }
}