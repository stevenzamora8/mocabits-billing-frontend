import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { InputComponent } from '../../../../shared/components/ui/input/input.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Services
import { InvoicesService, Invoice, InvoiceSummary } from '../../../../services/invoices.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent],
  templateUrl: './invoices-list.component.html',
  styleUrls: ['./invoices-list.component.css']
})
export class InvoicesListComponent implements OnInit, OnDestroy {
  // Icon SVG strings used by <app-button>
  readonly viewIcon: string = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path></svg>`;
  readonly editIcon: string = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>`;
  readonly statusIcon: string = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`;
  readonly deleteIcon: string = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`;
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
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filteredInvoices = [...this.invoices];
  }

  ngOnInit(): void {
    console.log('InvoicesListComponent ngOnInit');
    this.loadInvoices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInvoices(): void {
    console.log('InvoicesListComponent loadInvoices called');
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
      next: (response: any) => {
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
        this.error = 'Error al cargar las facturas. Mostrando datos de ejemplo.';
        this.isLoading = false;
        // Load sample data for demonstration
        this.loadSampleData();
      }
    });
  }

  // Filter methods
  onSearchChange(): void {
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

  getMaxItemsForPage(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  navigateToCreate(): void {
    this.router.navigate(['../create'], { relativeTo: this.route });
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

  private loadSampleData(): void {
    // Sample data for demonstration
    this.invoices = [
      {
        id: 1,
        invoiceNumber: '001-001-000000001',
        accessKey: '12345678901234567890123456789012345678901234567890',
        clientIdentification: '1234567890',
        clientBusinessName: 'Empresa de Ejemplo S.A.',
        issueDate: '2024-01-15',
        total: 1500.00,
        receiptStatus: 'AUTORIZADO',
        receiptType: 'FACTURA',
        issuerRuc: '1234567890001',
        issuerBusinessName: 'Mi Empresa S.A.',
        environment: 'PRUEBAS'
      },
      {
        id: 2,
        invoiceNumber: '001-001-000000002',
        accessKey: '09876543210987654321098765432109876543210987654321',
        clientIdentification: '0987654321',
        clientBusinessName: 'Otra Empresa Ltda.',
        issueDate: '2024-01-20',
        total: 2500.50,
        receiptStatus: 'PENDIENTE',
        receiptType: 'FACTURA',
        issuerRuc: '1234567890001',
        issuerBusinessName: 'Mi Empresa S.A.',
        environment: 'PRUEBAS'
      },
      {
        id: 3,
        invoiceNumber: '001-001-000000003',
        accessKey: '11223344556677889900112233445566778899001122334455',
        clientIdentification: '1122334455',
        clientBusinessName: 'Compañía de Prueba C.A.',
        issueDate: '2024-01-25',
        total: 750.25,
        receiptStatus: 'RECHAZADO',
        receiptType: 'FACTURA',
        issuerRuc: '1234567890001',
        issuerBusinessName: 'Mi Empresa S.A.',
        environment: 'PRUEBAS'
      }
    ];

    this.stats = {
      total: 3,
      authorized: 1,
      pending: 1,
      rejected: 1
    };

    this.filteredInvoices = [...this.invoices];
    this.totalElements = 3;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
  }
}