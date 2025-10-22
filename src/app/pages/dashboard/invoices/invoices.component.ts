import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Interfaces
interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total: number;
}

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
export class InvoicesComponent implements OnInit {
  // Mock data
  invoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      clientName: 'Empresa ABC S.A.',
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      status: 'paid',
      total: 2500.00
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      clientName: 'Tech Solutions Ltd.',
      issueDate: '2024-01-20',
      dueDate: '2024-02-20',
      status: 'sent',
      total: 1800.50
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      clientName: 'Consulting Group',
      issueDate: '2024-01-25',
      dueDate: '2024-02-25',
      status: 'overdue',
      total: 3200.75
    },
    {
      id: '4',
      invoiceNumber: 'INV-2024-004',
      clientName: 'Digital Agency',
      issueDate: '2024-02-01',
      dueDate: '2024-03-01',
      status: 'draft',
      total: 950.25
    },
    {
      id: '5',
      invoiceNumber: 'INV-2024-005',
      clientName: 'Manufacturing Corp',
      issueDate: '2024-02-05',
      dueDate: '2024-03-05',
      status: 'paid',
      total: 4200.00
    }
  ];

  stats = {
    total: 5,
    draft: 1,
    sent: 1,
    paid: 2,
    overdue: 1
  };

  // Filter properties
  searchTerm: string = '';
  selectedStatus: string = '';
  filteredInvoices: Invoice[] = [];

  constructor() {
    this.filteredInvoices = [...this.invoices];
  }

  ngOnInit(): void {
    // Initialize filters
    this.applyFilters();
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
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredInvoices = this.invoices.filter(invoice => {
      const matchesSearch = !this.searchTerm ||
        invoice.invoiceNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.selectedStatus || invoice.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  // Utility methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'sent': return 'status-sent';
      case 'overdue': return 'status-overdue';
      case 'draft': return 'status-draft';
      default: return '';
    }
  }

  getStatusBadgeClass(status: string): string {
    return `status-badge ${status}`;
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'paid': return 'Pagada';
      case 'sent': return 'Enviada';
      case 'overdue': return 'Vencida';
      case 'draft': return 'Borrador';
      default: return status;
    }
  }

  getStatusLabel(status: string): string {
    const labels = {
      draft: 'Borrador',
      sent: 'Enviada',
      paid: 'Pagada',
      overdue: 'Vencida',
      cancelled: 'Cancelada'
    };
    return labels[status as keyof typeof labels] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
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

  editInvoice(invoice: Invoice): void {
    alert(`Editar factura ${invoice.invoiceNumber} próximamente disponible`);
  }

  deleteInvoice(invoice: Invoice): void {
    alert(`Eliminar factura ${invoice.invoiceNumber} próximamente disponible`);
  }

  viewInvoice(invoice: Invoice): void {
    alert(`Ver detalles de factura ${invoice.invoiceNumber} próximamente disponible`);
  }

  updateStatus(invoice: Invoice): void {
    alert(`Cambiar estado de factura ${invoice.invoiceNumber} próximamente disponible`);
  }
}