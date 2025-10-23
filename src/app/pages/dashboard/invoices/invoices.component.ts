import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Services
import { InvoicesService, Invoice, InvoiceResponse, InvoiceSummary } from '../../../services/invoices.service';
import { AuthService } from '../../../services/auth.service';

// Interfaces
interface InvoiceItem {
  product: any;
  quantity: number;
  unitPrice: number;
  discount: number;
  vat: number;
  total: number;
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css']
})
export class InvoicesComponent implements OnInit, OnDestroy {
  // API data
  invoices: Invoice[] = [];
  stats: InvoiceSummary = {
    total: 0,
    authorized: 0,
    pending: 0,
    rejected: 0
  };

  // Pagination
  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;
  totalElements: number = 0;

  // Loading and error states
  isLoading: boolean = false;
  error: string | null = null;

  // Filter properties
  searchTerm: string = '';
  selectedStatus: string = '';
  startDate: string = '';
  endDate: string = '';
  filteredInvoices: Invoice[] = [];

  // Unsubscribe subject
  private destroy$ = new Subject<void>();

  constructor(
    private invoicesService: InvoicesService,
    private authService: AuthService
  ) {
    this.filteredInvoices = [...this.invoices];
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.error = null;

    const token = this.authService.getAccessToken();
    if (!token) {
      this.error = 'No se encontró token de autenticación';
      this.isLoading = false;
      return;
    }

    const params: any = {
      page: this.currentPage,
      size: this.pageSize,
      sort: 'issueDate,desc'
    };

    // Add filters if they exist
    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }
    if (this.startDate) {
      params.startDate = this.startDate;
    }
    if (this.endDate) {
      params.endDate = this.endDate;
    }

    this.invoicesService.getInvoicesApi(params, token).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: InvoiceResponse) => {
        this.invoices = response.data;
        this.stats = response.summary;
        this.currentPage = response.pagination.currentPage;
        this.totalPages = response.pagination.totalPages;
        this.totalElements = response.pagination.totalElements;
        this.filteredInvoices = [...this.invoices];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.error = 'Error al cargar las facturas';
        this.isLoading = false;
      }
    });
  }

  // Filter methods
  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 0;
    this.applyFilters();
    this.loadInvoices();
  }

  private applyFilters(): void {
    this.filteredInvoices = this.invoices.filter(invoice => {
      const matchesSearch = !this.searchTerm ||
        invoice.invoiceNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        invoice.clientBusinessName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        invoice.accessKey.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.selectedStatus || invoice.receiptStatus === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  // Utility methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'AUTORIZADO': return 'status-authorized';
      case 'PENDIENTE': return 'status-pending';
      case 'RECHAZADO': return 'status-rejected';
      case 'ANULADO': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusBadgeClass(status: string): string {
    return `status-badge ${status.toLowerCase()}`;
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'AUTORIZADO': return 'Autorizado';
      case 'PENDIENTE': return 'Pendiente';
      case 'RECHAZADO': return 'Rechazado';
      case 'ANULADO': return 'Anulado';
      default: return status;
    }
  }

  getStatusLabel(status: string): string {
    return this.getStatusText(status);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  isValidInvoice(): boolean {
    return false; // Mock implementation
  }

  // Invoice creation methods - Mock implementations
  createInvoice(): void {
    alert('La funcionalidad de crear facturas estará disponible próximamente. Use el botón "Nueva Factura" para navegar a la página dedicada.');
  }

  onClientChange(): void {
    // Mock implementation
  }

  addProductToInvoice(): void {
    // Mock implementation
  }

  removeProductFromInvoice(index: number): void {
    // Mock implementation
  }

  private calculateItemTotal(item: InvoiceItem): void {
    // Mock implementation
  }

  private calculateInvoiceTotal(): void {
    // Mock implementation
  }

  saveInvoice(): void {
    // Mock implementation
  }

  closeCreateModal(): void {
    // Mock implementation
  }

  private generateInvoiceNumber(): string {
    return 'MOCK-INV-001'; // Mock implementation
  }

  private updateStats(): void {
    // Mock implementation
  }

  viewInvoice(invoice: Invoice): void {
    alert(`Ver detalles de factura ${invoice.invoiceNumber}\nClave de acceso: ${invoice.accessKey}\nEstado: ${this.getStatusText(invoice.receiptStatus)}`);
  }

  editInvoice(invoice: Invoice): void {
    alert(`Editar factura ${invoice.invoiceNumber} próximamente disponible`);
  }

  deleteInvoice(invoice: Invoice): void {
    alert(`Eliminar factura ${invoice.invoiceNumber} próximamente disponible`);
  }

  updateStatus(invoice: Invoice): void {
    alert(`Cambiar estado de factura ${invoice.invoiceNumber} próximamente disponible`);
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadInvoices();
    }
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(0, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getMaxItemsForPage(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }
}