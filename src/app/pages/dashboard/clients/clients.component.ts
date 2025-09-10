import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface Client {
  id: string;
  name: string;
  identification: string;
  identificationType: 'CEDULA' | 'RUC' | 'PASAPORTE';
  email: string;
  phone: string;
  address: string;
  type: 'PERSONA_NATURAL' | 'EMPRESA';
  status: 'ACTIVO' | 'INACTIVO';
  lastInvoiceDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  // Properties
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm: string = '';
  selectedType: string = '';
  selectedStatus: string = '';

  // Modal
  isClientModalOpen: boolean = false;
  editingClient: Client | null = null;
  clientForm: FormGroup;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.clientForm = this.createClientForm();
  }

  ngOnInit(): void {
    this.loadClients();
    this.filterClients();
  }

  // Computed properties
  get totalClients(): number {
    return this.clients.length;
  }

  get activeClients(): number {
    return this.clients.filter(client => client.status === 'ACTIVO').length;
  }

  get inactiveClients(): number {
    return this.clients.filter(client => client.status === 'INACTIVO').length;
  }

  get paginatedClients(): Client[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredClients.slice(startIndex, endIndex);
  }

  // Form creation
  private createClientForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      identification: ['', [Validators.required]],
      identificationType: ['CEDULA', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      type: ['PERSONA_NATURAL', [Validators.required]],
      status: ['ACTIVO', [Validators.required]]
    });
  }

  // Data loading
  loadClients(): void {
    // Mock data - replace with actual API call
    this.clients = [
      {
        id: '1',
        name: 'Juan Pérez',
        identification: '0123456789',
        identificationType: 'CEDULA',
        email: 'juan.perez@email.com',
        phone: '0987654321',
        address: 'Av. Principal 123, Quito',
        type: 'PERSONA_NATURAL',
        status: 'ACTIVO',
        lastInvoiceDate: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Empresa ABC S.A.',
        identification: '1234567890001',
        identificationType: 'RUC',
        email: 'facturacion@empresaabc.com',
        phone: '0234567890',
        address: 'Calle Comercial 456, Guayaquil',
        type: 'EMPRESA',
        status: 'ACTIVO',
        lastInvoiceDate: new Date('2024-01-20'),
        createdAt: new Date('2023-12-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: '3',
        name: 'María González',
        identification: '0987654321',
        identificationType: 'CEDULA',
        email: 'maria.gonzalez@email.com',
        phone: '0876543210',
        address: 'Sector Norte 789, Cuenca',
        type: 'PERSONA_NATURAL',
        status: 'INACTIVO',
        lastInvoiceDate: new Date('2023-12-20'),
        createdAt: new Date('2023-11-01'),
        updatedAt: new Date('2023-12-20')
      }
    ];
  }

  // Filtering and search
  filterClients(): void {
    let filtered = [...this.clients];

    // Text search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.identification.toLowerCase().includes(term) ||
        client.phone?.toLowerCase().includes(term) ||
        client.address?.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (this.selectedType) {
      filtered = filtered.filter(client => client.type === this.selectedType);
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(client => client.status === this.selectedStatus);
    }

    this.filteredClients = filtered;
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.filterClients();
  }

  // Pagination
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredClients.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Modal management
  openClientModal(client?: Client): void {
    this.isClientModalOpen = true;
    this.editingClient = client || null;

    if (client) {
      this.clientForm.patchValue({
        name: client.name,
        identification: client.identification,
        identificationType: client.identificationType,
        email: client.email,
        phone: client.phone,
        address: client.address,
        type: client.type,
        status: client.status
      });
    } else {
      this.clientForm.reset({
        name: '',
        identification: '',
        identificationType: 'CEDULA',
        email: '',
        phone: '',
        address: '',
        type: 'PERSONA_NATURAL',
        status: 'ACTIVO'
      });
    }
  }

  closeClientModal(): void {
    this.isClientModalOpen = false;
    this.editingClient = null;
    this.clientForm.reset();
  }

  // CRUD operations
  saveClient(): void {
    if (this.clientForm.valid) {
      const formData = this.clientForm.value;
      const now = new Date();

      // Validar identificación según tipo
      if (!this.validateIdentification(formData.identification, formData.identificationType)) {
        alert('La identificación no es válida para el tipo seleccionado.');
        return;
      }

      // Verificar si ya existe un cliente con la misma identificación (excepto cuando editamos)
      if (!this.editingClient && this.clients.some(c => c.identification === formData.identification)) {
        alert('Ya existe un cliente con esta identificación.');
        return;
      }

      if (this.editingClient) {
        // Update existing client
        const index = this.clients.findIndex(c => c.id === this.editingClient!.id);
        if (index !== -1) {
          this.clients[index] = {
            ...this.editingClient,
            ...formData,
            updatedAt: now
          };
          console.log('Cliente actualizado:', this.clients[index]);
        }
      } else {
        // Create new client
        const newClient: Client = {
          id: this.generateClientId(),
          ...formData,
          createdAt: now,
          updatedAt: now
        };
        this.clients.push(newClient);
        console.log('Cliente creado:', newClient);
      }

      this.filterClients();
      this.closeClientModal();
    } else {
      this.markFormGroupTouched();
    }
  }

  private generateClientId(): string {
    return 'CLI-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  private validateIdentification(identification: string, type: string): boolean {
    const cleanId = identification.replace(/\s+/g, '');

    switch (type) {
      case 'CEDULA':
        return /^\d{10}$/.test(cleanId);
      case 'RUC':
        return /^\d{13}$/.test(cleanId);
      case 'PASAPORTE':
        return /^[A-Z0-9]{6,12}$/.test(cleanId.toUpperCase());
      default:
        return true;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      control?.markAsTouched();
    });
  }

  editClient(client: Client): void {
    this.openClientModal(client);
  }

  viewClient(client: Client): void {
    // Navigate to client detail view or open detail modal
    console.log('Ver detalles del cliente:', client);
    // Aquí podrías navegar a una vista de detalle o abrir un modal con más información
    alert(`Detalles del cliente:\n\nNombre: ${client.name}\nEmail: ${client.email}\nIdentificación: ${client.identification}\nEstado: ${client.status}`);
  }

  deleteClient(client: Client): void {
    const confirmMessage = `¿Estás seguro de que deseas eliminar el cliente "${client.name}"?\n\nEsta acción no se puede deshacer.`;
    if (confirm(confirmMessage)) {
      this.clients = this.clients.filter(c => c.id !== client.id);
      this.filterClients();
      console.log('Cliente eliminado:', client.id);
    }
  }

  // Utility functions
  trackByClientId(index: number, client: Client): string {
    return client.id;
  }

  exportClients(): void {
    try {
      const dataToExport = this.filteredClients.map(client => ({
        ID: client.id,
        Nombre: client.name,
        'Tipo Identificación': client.identificationType,
        Identificación: client.identification,
        Email: client.email,
        Teléfono: client.phone || '',
        Dirección: client.address || '',
        Tipo: client.type === 'PERSONA_NATURAL' ? 'Persona Natural' : 'Empresa',
        Estado: client.status === 'ACTIVO' ? 'Activo' : 'Inactivo',
        'Última Factura': client.lastInvoiceDate ? client.lastInvoiceDate.toLocaleDateString('es-ES') : 'Sin facturas',
        'Fecha Creación': client.createdAt.toLocaleDateString('es-ES'),
        'Última Actualización': client.updatedAt.toLocaleDateString('es-ES')
      }));

      const csvContent = this.convertToCSV(dataToExport);
      this.downloadCSV(csvContent, 'clientes.csv');
      console.log('Clientes exportados exitosamente');
    } catch (error) {
      console.error('Error al exportar clientes:', error);
      alert('Error al exportar los clientes. Por favor, inténtalo de nuevo.');
    }
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma or quote
        if (value.toString().includes(',') || value.toString().includes('"')) {
          return `"${value.toString().replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  private downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Additional utility methods
  getClientStatusColor(status: string): string {
    return status === 'ACTIVO' ? '#10b981' : '#ef4444';
  }

  getClientTypeIcon(type: string): string {
    return type === 'EMPRESA' ? '🏢' : '👤';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Bulk operations
  selectAllClients(): void {
    // Implementation for bulk selection
    console.log('Seleccionar todos los clientes');
  }

  bulkDeleteClients(): void {
    // Implementation for bulk delete
    console.log('Eliminar clientes seleccionados');
  }

  bulkUpdateStatus(newStatus: 'ACTIVO' | 'INACTIVO'): void {
    // Implementation for bulk status update
    console.log('Actualizar estado de clientes seleccionados:', newStatus);
  }
}
