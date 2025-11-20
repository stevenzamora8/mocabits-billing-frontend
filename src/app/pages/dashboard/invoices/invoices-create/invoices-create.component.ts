import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { InputComponent } from '../../../../shared/components/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/ui/select/select.component';
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
  // Invoices are always drafts without due date in simplified version
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
  // bound id for explicitly adding selected product
  selectedProductId: any = null;
  
  // UI state
  clients: Client[] = [];
  products: Product[] = [];
  establishments: any[] = [];
  isLoading = false;
  isSaving = false;
  
  // Alert state
  alertVisible = false;
  alertMessage = '';
  alertType: UiAlertType = 'info';
  alertAutoDismiss = true;

  // Inline quick-create client UI state
  quickCreateVisible = false;
  quickCreateLoading = false;
  quickCreateForm!: FormGroup;
  
  // Current totals
  subtotal = 0;
  totalDiscount = 0;
  totalTax = 0;
  grandTotal = 0;
  
  // Client options for select
  clientOptions: { value: any; label: string }[] = [];
  productOptions: { value: any; label: string }[] = [];
  establishmentOptions: { value: any; label: string }[] = [];
  clientTypeOptions: { value: any; label: string }[] = [];

  // Filters state (mirrors origin components)
  clientFilters: any = {
    searchTerm: '',
    identification: '',
    selectedType: ''
  };

  productFilters: any = {
    filterName: '',
    filterMainCode: '',
    filterAuxiliaryCode: '',
    establishmentId: ''
  };

  // Unsubscribe subject
  private destroy$ = new Subject<void>();
 

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
    return this.invoiceForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadClients();
    this.loadProducts();
    this.loadEstablishments();
    this.loadClientTypes();
    
    // Check for navigation alerts
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
    
    // Subscribe to form changes to recalculate totals
    this.invoiceForm.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
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
      typeIdentification: '04', // default RUC, UI could be extended
      email: this.quickCreateForm.get('email')?.value || '',
      phone: this.quickCreateForm.get('phone')?.value || ''
    } as any;

    this.clientService.createClient(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (created) => {
        // Insert into local arrays so select shows it immediately
        const newClient = created as any;
        this.clients.unshift(newClient);
        this.clientOptions.unshift({ value: newClient.id, label: `${newClient.name} (${newClient.identification})` });

        // Auto-select the newly created client
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

  /**
   * Validator for the items FormArray: requires at least one valid item and each item to be valid.
   */
  private itemsArrayValidator(control: AbstractControl): ValidationErrors | null {
    const arr = control as FormArray;
    if (!arr || arr.length === 0) {
      return { itemsRequired: true };
    }

    // Ensure each item group is valid (quantity > 0 and unitPrice > 0)
    for (let i = 0; i < arr.length; i++) {
      const item = arr.at(i);
      if (!item.valid) {
        return { invalidItem: true };
      }
      const qty = item.get('quantity')?.value || 0;
      const unit = item.get('unitPrice')?.value || 0;
      if (qty <= 0 || unit <= 0) {
        return { invalidItemValues: true };
      }
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
      console.error('No token available');
      this.isLoading = false;
      return;
    }
    // Use filters if present
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

  searchClients(): void {
    // Debounce could be added later; for now call loadClients which applies current filters
    this.loadClients();
  }

  onClientSearch(term: string): void {
    // term can be name or identification; detect numeric identification
    this.clientFilters.searchTerm = term || '';
    if (term && /^\d+$/.test(term.trim())) {
      this.clientFilters.identification = term.trim();
      // clear name to avoid sending both
      this.clientFilters.searchTerm = '';
    } else {
      this.clientFilters.identification = '';
    }
    this.loadClients();
  }

  loadProducts(): void {
    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('No token available');
      return;
    }
    // Pass filters from productFilters and selected establishment
    const params: any = {
      page: 0,
      size: 100
    };
    if (this.productFilters.filterName) params.name = this.productFilters.filterName;
    if (this.productFilters.filterMainCode) params.mainCode = this.productFilters.filterMainCode;
    if (this.productFilters.filterAuxiliaryCode) params.auxiliaryCode = this.productFilters.filterAuxiliaryCode;
    if (this.productFilters.establishmentId) params.establishmentId = this.productFilters.establishmentId;

    this.productsService.getProductsApi(params, token).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        const productsData = Array.isArray(response.data) 
          ? response.data
          : Array.isArray(response.content)
          ? response.content
          : Array.isArray(response.page?.content)
          ? response.page.content
          : [];

        this.products = productsData;
        this.productOptions = this.products.map(product => ({
          value: product.id,
          label: `${product.name} - ${product.mainCode || ''} - $${product.unitPrice}`
        }));
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.showAlert('Error al cargar productos', 'danger');
      }
    });
  }

  searchProducts(): void {
    this.loadProducts();
  }

  onProductSearch(term: string): void {
    // Use the same term to search by name or codes
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
        this.establishmentOptions = this.establishments.map((e: any) => ({ value: e.id, label: e.name || e.address || `Establecimiento ${e.id}`}));
      },
      error: (err: any) => {
        console.warn('Error loading establishments:', err);
      }
    });
  }

  loadClientTypes(): void {
    // Small helper to populate client type select; can be replaced with catalog service call
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

  addProduct(productId?: string, quantity: number = 1): void {
    if (!productId) return;

    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    // Check if product already exists in items
    const existingIndex = this.itemsFormArray.controls.findIndex(
      control => control.get('productId')?.value === productId
    );

    if (existingIndex >= 0) {
      // Update existing item quantity
      const existingControl = this.itemsFormArray.at(existingIndex);
      const currentQuantity = existingControl.get('quantity')?.value || 0;
      existingControl.patchValue({ quantity: currentQuantity + quantity });
    } else {
      // Add new item
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
      
      this.itemsFormArray.push(itemGroup);
      // ensure validators on array re-evaluate
      this.itemsFormArray.updateValueAndValidity();
    }
    
    this.calculateTotals();
  }

  /**
   * Add the product currently selected in the product select control.
   * This is used by the explicit "Añadir" button next to the product select.
   */
  addSelectedProduct(): void {
    if (!this.selectedProductId) {
      this.showAlert('Por favor selecciona un producto primero', 'warning', true);
      return;
    }

    const product = this.products.find(p => p.id === this.selectedProductId);
    if (!product) {
      this.showAlert('Producto no encontrado', 'danger', true);
      return;
    }

    try {
      this.addProduct(this.selectedProductId.toString(), 1);
      // clear selection after adding
      this.selectedProductId = null;
      
      // Close dropdown if possible
      try {
        const productSelect = document.querySelector('#productSelect') as any;
        if (productSelect && typeof productSelect.closeDropdown === 'function') {
          productSelect.closeDropdown();
        }
      } catch (e) {
        // Ignore dropdown close errors
      }
      
      // Show success feedback with product name
      this.showAlert(`${product.name} añadido a la factura`, 'success', true);
      
      // Focus back on product search for better UX
      setTimeout(() => {
        const productInput = document.querySelector('#productSelect input') as HTMLElement;
        if (productInput) {
          productInput.focus();
        }
      }, 100);
      
    } catch (e) {
      console.warn('Error adding selected product', e);
      this.showAlert('Error al añadir el producto', 'danger', true);
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
      
      // Update the form control calculated values
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
    // invoiceForm.valid will include the items array validator
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
      // Always draft without due date in simplified version
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
        
        // Store alert in session storage for navigation
        try {
          sessionStorage.setItem('invoiceAlert', JSON.stringify({
            message: 'Factura creada exitosamente',
            type: 'success',
            autoDismiss: true
          }));
        } catch (e) {
          // Ignore storage errors
        }
        
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

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getSelectedClient(): Client | null {
    const clientId = this.invoiceForm.get('clientId')?.value;
    return this.clients.find(c => c.id == clientId) || null;
  }

  // Helper methods for template
  onProductSelect(selection: any): void {
    // Don't auto-add product on selection - user should use the "Añadir" button
    // This gives users more control over when products are added
    if (selection && selection.value) {
      // Just update the selection, don't auto-add
      this.selectedProductId = selection.value;
    }
  }

  onEstablishmentChange(): void {
    // Clear current product selection when establishment changes
    this.selectedProductId = null;
    // Reload products with new establishment filter
    this.loadProducts();
  }

  clearEstablishmentFilter(): void {
    this.productFilters.establishmentId = '';
    this.selectedProductId = null;
    this.loadProducts();
  }

  @ViewChild('clientSelectComp') clientSelectComp?: SelectComponent;

  onClientSelect(selection: any): void {
    if (!selection) return;
    const val = Array.isArray(selection) ? (selection.length ? selection[0].value : '') : selection.value;
    if (val !== undefined) {
      this.invoiceForm.patchValue({ clientId: val });
      // mark as touched so validation updates
      this.invoiceForm.get('clientId')?.markAsTouched();
    }
  }

  openClientSearch(): void {
    // Open the select dropdown programmatically if available
    setTimeout(() => {
      try {
        this.clientSelectComp?.openDropdown();
      } catch (e) {
        // fallback: do nothing
      }
    }, 0);
  }

  /**
   * Navigate to the client creation screen so user can add a new client if not found
   */
  navigateToCreateClient(): void {
    this.router.navigate(['/dashboard', 'clients', 'create']);
  }

  clearSelectedClient(): void {
    this.invoiceForm.patchValue({ clientId: '' });
    // close dropdown if open
    try { this.clientSelectComp?.closeDropdown(); } catch (e) {}
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