import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/components/ui/input/input.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { Router } from '@angular/router';

// Services
import { ClientService, Client } from '../../../../services/client.service';
import { ProductsService, Product } from '../../../../services/products.service';
import { AuthService } from '../../../../services/auth.service';

// Interfaces
interface InvoiceItem {
  product: Product;
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
  selector: 'app-create-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent],
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.css']
})
export class CreateInvoiceComponent implements OnInit {
  // Data
  clients: Client[] = [];
  products: Product[] = [];
  loading = false;

  // Icons
  readonly backIcon: string = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0L4.71 11.3c-.39.39-.39 1.02 0 1.41L11.3 19.3c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>`;
  readonly addIcon: string = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4v16m8-8H4"/></svg>`;
  readonly deleteIcon: string = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`;
  readonly saveIcon: string = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

  // Form
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
  selectedProductId: string = '';
  itemQuantity: number = 1;

  constructor(
    private clientService: ClientService,
    private productsService: ProductsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadProducts();
  }

  private loadClients(): void {
    this.loading = true;
    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('No token available');
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

    // Here you would typically save to the backend
    // For now, we'll just navigate back to invoices list
    console.log('Saving invoice:', this.invoiceForm);
    this.router.navigate(['/dashboard/invoices']);
  }

  cancel(): void {
    this.router.navigate(['/dashboard/invoices']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}