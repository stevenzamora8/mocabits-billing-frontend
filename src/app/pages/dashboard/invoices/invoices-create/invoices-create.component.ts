import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Services
import { InvoicesService } from '../../../../services/invoices.service';
import { AuthService } from '../../../../services/auth.service';
import { ClientService, Client } from '../../../../services/client.service';
import { ProductsService, Product } from '../../../../services/products.service';

interface CreateInvoiceRequest {
  clientId: number;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent';
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
  }[];
}

interface InvoiceItem {
  product: any;
  quantity: number;
  unitPrice: number;
  discount: number;
  vat: number;
  total: number;
}

interface InvoiceForm {
  clientId: number | null;
  client: Client | null;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent';
  items: InvoiceItem[];
  subtotal: number;
  totalVat: number;
  totalDiscount: number;
  total: number;
}

@Component({
  selector: 'app-invoices-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices-create.component.html',
  styleUrls: ['./invoices-create.component.css']
})
export class InvoicesCreateComponent implements OnInit, OnDestroy {
  // Form data
  invoiceForm: InvoiceForm = {
    clientId: null,
    client: null,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    items: [],
    subtotal: 0,
    totalVat: 0,
    totalDiscount: 0,
    total: 0
  };

  // UI state
  clients: Client[] = [];
  products: Product[] = [];
  loading = false;
  selectedProductId: string = '';
  itemQuantity: number = 1;

  // Unsubscribe subject
  private destroy$ = new Subject<void>();

  constructor(
    private invoicesService: InvoicesService,
    private authService: AuthService,
    private clientService: ClientService,
    private productsService: ProductsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('InvoicesCreateComponent ngOnInit');
    this.loadClients();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Client methods
  private loadClients(): void {
    this.loading = true;
    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('No token available');
      this.loading = false;
      return;
    }

    this.clientService.getClients(0, 100).subscribe({
      next: (response: any) => {
        this.clients = response.content;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
        this.loading = false;
        // Load sample clients for demonstration
        this.loadSampleClients();
      }
    });
  }

  private loadProducts(): void {
    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('No token available');
      return;
    }

    this.productsService.getProductsApi({ page: 0, size: 100 }, token).subscribe({
      next: (response: any) => {
        this.products = response.content || response.data || [];
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        // Load sample products for demonstration
        this.loadSampleProducts();
      }
    });
  }

  onClientChange(): void {
    if (this.invoiceForm.clientId) {
      this.invoiceForm.client = this.clients.find(c => c.id === this.invoiceForm.clientId) || null;
    } else {
      this.invoiceForm.client = null;
    }
  }

  // Product methods
  addProduct(): void {
    if (!this.selectedProductId || this.itemQuantity <= 0) return;

    const product = this.products.find(p => p.id === this.selectedProductId);
    if (!product) return;

    const existingItem = this.invoiceForm.items.find(item => item.product.id === this.selectedProductId);

    if (existingItem) {
      existingItem.quantity += this.itemQuantity;
      this.calculateItemTotal(existingItem);
    } else {
      const newItem: InvoiceItem = {
        product: product,
        quantity: this.itemQuantity,
        unitPrice: product.unitPrice,
        discount: 0,
        vat: product.vat || 0,
        total: 0
      };
      this.calculateItemTotal(newItem);
      this.invoiceForm.items.push(newItem);
    }

    this.calculateTotals();
    this.selectedProductId = '';
    this.itemQuantity = 1;
  }

  removeItem(index: number): void {
    this.invoiceForm.items.splice(index, 1);
    this.calculateTotals();
  }

  updateItemQuantity(item: InvoiceItem, quantity: number): void {
    if (quantity <= 0) return;
    item.quantity = quantity;
    this.calculateItemTotal(item);
    this.calculateTotals();
  }

  updateItemDiscount(item: InvoiceItem, discount: number): void {
    item.discount = Math.max(0, Math.min(100, discount));
    this.calculateItemTotal(item);
    this.calculateTotals();
  }

  private calculateItemTotal(item: InvoiceItem): void {
    const subtotal = item.unitPrice * item.quantity;
    const discountAmount = subtotal * (item.discount / 100);
    const subtotalWithDiscount = subtotal - discountAmount;
    const vatAmount = subtotalWithDiscount * (item.vat / 100);
    item.total = subtotalWithDiscount + vatAmount;
  }

  private calculateTotals(): void {
    this.invoiceForm.subtotal = this.invoiceForm.items.reduce((sum, item) => {
      return sum + (item.unitPrice * item.quantity);
    }, 0);

    this.invoiceForm.totalDiscount = this.invoiceForm.items.reduce((sum, item) => {
      return sum + (item.unitPrice * item.quantity * item.discount / 100);
    }, 0);

    this.invoiceForm.totalVat = this.invoiceForm.items.reduce((sum, item) => {
      const subtotal = item.unitPrice * item.quantity;
      const discountAmount = subtotal * (item.discount / 100);
      const subtotalWithDiscount = subtotal - discountAmount;
      return sum + (subtotalWithDiscount * (item.vat / 100));
    }, 0);

    this.invoiceForm.total = this.invoiceForm.subtotal - this.invoiceForm.totalDiscount + this.invoiceForm.totalVat;
  }

  isFormValid(): boolean {
    return !!(
      this.invoiceForm.client &&
      this.invoiceForm.issueDate &&
      this.invoiceForm.dueDate &&
      this.invoiceForm.items.length > 0 &&
      this.invoiceForm.total > 0
    );
  }

  saveInvoice(): void {
    if (!this.isFormValid()) return;

    this.loading = true;
    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('No token available');
      this.loading = false;
      return;
    }

    // Transform form data to Invoice format
    const invoiceData: CreateInvoiceRequest = {
      clientId: this.invoiceForm.clientId!,
      issueDate: this.invoiceForm.issueDate,
      dueDate: this.invoiceForm.dueDate,
      status: this.invoiceForm.status,
      items: this.invoiceForm.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.vat
      }))
    };

    this.invoicesService.createInvoiceApi(invoiceData, token).subscribe({
      next: (response) => {
        console.log('Invoice created successfully:', response);
        this.loading = false;
        this.navigateToList();
      },
      error: (error) => {
        console.error('Error creating invoice:', error);
        this.loading = false;
        // TODO: Show error message to user
        alert('Error al crear la factura. Por favor, inténtelo de nuevo.');
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

  private loadSampleClients(): void {
    this.clients = [
      {
        id: 1,
        name: 'Empresa de Ejemplo S.A.',
        identification: '1234567890',
        typeIdentification: 'RUC',
        email: 'contacto@empresa.com',
        phone: '0991234567',
        status: 'ACTIVE'
      },
      {
        id: 2,
        name: 'Otra Empresa Ltda.',
        identification: '0987654321',
        typeIdentification: 'RUC',
        email: 'info@otraempresa.com',
        phone: '0987654321',
        status: 'ACTIVE'
      },
      {
        id: 3,
        name: 'Compañía de Prueba C.A.',
        identification: '1122334455',
        typeIdentification: 'CEDULA',
        email: 'test@compania.com',
        phone: '0976543210',
        status: 'ACTIVE'
      }
    ];
  }

  private loadSampleProducts(): void {
    this.products = [
      {
        id: '1',
        name: 'Producto de Ejemplo 1',
        mainCode: 'PROD001',
        description: 'Descripción del producto 1',
        unitPrice: 100.00,
        quantity: 10,
        discount: 0,
        vat: 12,
        totalWithoutTax: 100.00
      },
      {
        id: '2',
        name: 'Producto de Ejemplo 2',
        mainCode: 'PROD002',
        description: 'Descripción del producto 2',
        unitPrice: 250.50,
        quantity: 5,
        discount: 0,
        vat: 12,
        totalWithoutTax: 250.50
      },
      {
        id: '3',
        name: 'Servicio de Ejemplo',
        mainCode: 'SERV001',
        description: 'Descripción del servicio',
        unitPrice: 500.00,
        quantity: 1,
        discount: 0,
        vat: 12,
        totalWithoutTax: 500.00
      }
    ];
  }
}