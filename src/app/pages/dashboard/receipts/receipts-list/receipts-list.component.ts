import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { InputComponent } from '../../../../shared/components/ui/input/input.component';
import { UiPageIntroComponent } from '../../../../shared/components/ui/page-intro/page-intro.component';
import { UiTableComponent } from '../../../../shared/components/ui/table/table.component';
import { UiPaginatorComponent } from '../../../../shared/components/ui/paginator/paginator.component';
import { UiFiltersPanelComponent } from '../../../../shared/components/ui/filters-panel/filters-panel.component';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';
import { SelectComponent } from '../../../../shared/components/ui/select/select.component';
import { UiStatCardComponent } from '../../../../shared/components/ui/stat-card/stat-card.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Reuse invoices service for fetching receipts-like data
import { InvoicesService, Invoice, InvoiceSummary } from '../../../../services/invoices.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-receipts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent, SelectComponent, UiPageIntroComponent, UiTableComponent, UiPaginatorComponent, UiStatCardComponent, UiFiltersPanelComponent],
  templateUrl: './receipts-list.component.html',
  styleUrls: ['./receipts-list.component.css']
})
export class ReceiptsListComponent implements OnInit, OnDestroy {
  readonly viewIcon: string = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path></svg>`;
  readonly editIcon: string = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>`;
  readonly statusIcon: string = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`;
  readonly deleteIcon: string = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`;

  invoices: Invoice[] = [];
  stats: InvoiceSummary = { total: 0, authorized: 0, pending: 0, rejected: 0 };

  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;
  totalElements: number = 0;

  isLoading: boolean = false;
  error: string | null = null;

  searchTerm: string = '';
  nameSearch: string = '';
  idSearch: string = '';
  numberSearch: string = '';
  selectedStatus: string = '';
  startDate: string = '';
  endDate: string = '';
  filteredInvoices: Invoice[] = [];
  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'AUTORIZADO', label: 'Autorizado' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'RECHAZADO', label: 'Rechazado' },
    { value: 'ANULADO', label: 'Anulado' }
  ];

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
    this.setDefaultMonthRange();
    this.loadReceipts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReceipts(): void {
    this.isLoading = true;
    this.error = null;

    const token = this.authService.getAccessToken();
    if (!token) {
      this.error = 'No se encontró token de autenticación';
      this.isLoading = false;
      return;
    }

    const params: any = { page: this.currentPage, size: this.pageSize, sort: 'issueDate,desc' };
    if (this.selectedStatus) params.status = this.selectedStatus;
    if (this.startDate) params.startDate = this.startDate;
    if (this.endDate) params.endDate = this.endDate;

    this.invoicesService.getInvoicesApi(params, token).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        // Add display fields for formatted issue date and total (domain-specific formatting kept in this page)
        const money = new MoneyPipe();
        this.invoices = (response.data || []).map((inv: any) => ({
          ...inv,
          issueDateDisplay: this.formatDate(inv.issueDate),
          totalDisplay: money.transform(typeof inv.total === 'number' ? inv.total : Number(inv.total), 'USD', 'en-US')
        }));
        this.stats = response.summary;
        this.currentPage = response.pagination.currentPage;
        this.totalPages = response.pagination.totalPages;
        this.totalElements = response.pagination.totalElements;
        this.filteredInvoices = [...this.invoices];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading receipts:', err);
        this.error = 'Error al cargar comprobantes. Mostrando datos de ejemplo.';
        this.isLoading = false;
        this.loadSampleData();
      }
    });
  }

  onSearchChange(): void { this.applyFilters(); }
  onFilterChange(): void { this.applyFilters(); }

  clearFilters(): void {
    this.searchTerm = '';
    this.nameSearch = '';
    this.idSearch = '';
    this.numberSearch = '';
    this.selectedStatus = '';
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 0;
    this.applyFilters();
    this.loadReceipts();
  }

  private applyFilters(): void {
    this.filteredInvoices = this.invoices.filter(invoice => {
      const matchesName = !this.nameSearch || invoice.clientBusinessName.toLowerCase().includes(this.nameSearch.toLowerCase());
      const matchesId = !this.idSearch || (invoice.clientIdentification || '').toLowerCase().includes(this.idSearch.toLowerCase());
      const matchesNumber = !this.numberSearch || invoice.invoiceNumber.toLowerCase().includes(this.numberSearch.toLowerCase());
      const matchesSearch = (!this.searchTerm ||
        invoice.invoiceNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        invoice.clientBusinessName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        invoice.accessKey.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesStatus = !this.selectedStatus || invoice.receiptStatus === this.selectedStatus;

      // Date filter (issueDate assumed in ISO or parseable format)
      let matchesDate = true;
      if (this.startDate) {
        const inv = new Date(invoice.issueDate);
        const s = new Date(this.startDate + 'T00:00:00');
        if (inv < s) matchesDate = false;
      }
      if (this.endDate) {
        const inv = new Date(invoice.issueDate);
        const e = new Date(this.endDate + 'T23:59:59');
        if (inv > e) matchesDate = false;
      }

      return matchesName && matchesId && matchesNumber && matchesSearch && matchesStatus && matchesDate;
    });
  }

  private setDefaultMonthRange(): void {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const pad = (n: number) => n.toString().padStart(2, '0');
    this.startDate = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`;
    this.endDate = `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`;
  }

  getStatusBadgeClass(status: string): string { return `status-badge ${status.toLowerCase()}`; }
  getStatusLabel(status: string): string {
    switch (status) {
      case 'AUTORIZADO': return 'Autorizado';
      case 'PENDIENTE': return 'Pendiente';
      case 'RECHAZADO': return 'Rechazado';
      case 'ANULADO': return 'Anulado';
      default: return status;
    }
  }

  // Format currency with a leading dollar sign and standard en-US formatting, e.g. "$1,234.56"
  formatCurrency(amount: number): string { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount); }
  /** Format issue date to 'dd/MM/yyyy HH:mm' (date, hour and minute) */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  getMaxItemsForPage(): number { return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements); }

  navigateToCreate(): void { this.router.navigate(['../create'], { relativeTo: this.route }); }

  viewInvoice(invoice: Invoice): void { alert(`Ver comprobante ${invoice.invoiceNumber}`); }
  editInvoice(invoice: Invoice): void { alert(`Editar comprobante ${invoice.invoiceNumber}`); }
  deleteInvoice(invoice: Invoice): void {
    // Deleting receipts is not allowed. Keep a non-destructive handler in case code elsewhere calls it.
    alert(`No es posible eliminar comprobantes desde la interfaz. Si necesita anular un comprobante, utilice la acción 'Anular'.`);
    console.log('Delete attempted for invoice (blocked):', invoice?.id);
  }

  updateStatus(invoice: Invoice): void {
    // Placeholder for cycling or updating status; real implementation should call API
    alert(`Actualizar estado del comprobante ${invoice.invoiceNumber} (simulado).`);
  }

  /**************** Actions requested: enviar correo, anular, PDF, XML ****************/
  sendEmail(invoice: Invoice): void {
    if (!invoice) return;
    const ok = confirm(`Enviar comprobante ${invoice.invoiceNumber} por correo electrónico al cliente ${invoice.clientBusinessName}?`);
    if (!ok) return;
    // TODO: call backend API to send email. For now simulate.
    console.log('Send email for invoice', invoice.id);
    alert(`Correo enviado para comprobante ${invoice.invoiceNumber} (simulado).`);
  }

  voidReceipt(invoice: Invoice): void {
    if (!invoice) return;
    const ok = confirm(`¿Está seguro que desea anular el comprobante ${invoice.invoiceNumber}?`);
    if (!ok) return;
    // TODO: call API to void/anular the receipt; simulate local update
    invoice.receiptStatus = 'ANULADO' as any;
    console.log('Voided invoice', invoice.id);
    alert(`Comprobante ${invoice.invoiceNumber} anulado (simulado).`);
  }

  downloadPdf(invoice: Invoice): void {
    if (!invoice) return;
    // TODO: call API to fetch PDF blob and download. For now simulate.
    console.log('Download PDF for invoice', invoice.id);
    alert(`Descargando PDF de ${invoice.invoiceNumber} (simulado).`);
  }

  downloadXml(invoice: Invoice): void {
    if (!invoice) return;
    // TODO: call API to fetch XML and trigger download. For now simulate.
    console.log('Download XML for invoice', invoice.id);
    alert(`Descargando XML de ${invoice.invoiceNumber} (simulado).`);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadReceipts();
    }
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(0, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) startPage = Math.max(0, endPage - maxVisiblePages + 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  }

  private loadSampleData(): void {
    const money = new MoneyPipe();
    this.invoices = [
      { id: 1, invoiceNumber: 'RC-0001', accessKey: 'RC-KEY-123', clientIdentification: '1234567890', clientBusinessName: 'Cliente A', issueDate: '2024-01-15T09:12:00', issueDateDisplay: this.formatDate('2024-01-15T09:12:00'), total: 120.5, totalDisplay: money.transform(120.5), receiptStatus: 'AUTORIZADO', receiptType: 'COMPROBANTE', issuerRuc: '123', issuerBusinessName: 'Mi Empresa', environment: 'PRUEBAS' },
      { id: 2, invoiceNumber: 'RC-0002', accessKey: 'RC-KEY-456', clientIdentification: '0987654321', clientBusinessName: 'Cliente B', issueDate: '2024-02-15T14:35:00', issueDateDisplay: this.formatDate('2024-02-15T14:35:00'), total: 450.75, totalDisplay: money.transform(450.75), receiptStatus: 'PENDIENTE', receiptType: 'COMPROBANTE', issuerRuc: '123', issuerBusinessName: 'Mi Empresa', environment: 'PRUEBAS' }
    ];

    this.stats = { total: 2, authorized: 1, pending: 1, rejected: 0 };
    this.filteredInvoices = [...this.invoices];
    this.totalElements = 2;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
  }
}
