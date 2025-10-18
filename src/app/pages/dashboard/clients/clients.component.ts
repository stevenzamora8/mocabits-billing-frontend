import { Component, OnInit } from '@angular/core';
import { AlertType } from '../../../components/alert/alert.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService, Client, ClientPage } from '../../../services/client.service';
import { AlertComponent } from '../../../components/alert/alert.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  // Properties
  clients: Client[] = [];
  searchTerm: string = '';
  selectedType: string = '';
  selectedIdentification: string = '';
  selectedStatus: string = '';

  // Modal
  isClientModalOpen: boolean = false;
  editingClient: Client | null = null;
  clientForm: FormGroup;

  // Pagination - now using API pagination
  currentPage: number = 0; // 0-based for API
  itemsPerPage: number = 5; // Mostrar solo 5 registros por página
  totalPages: number = 1;
  totalElements: number = 0;
  currentClientPage: ClientPage | null;

  // Summary counts
  totalClientsCount: number = 0;
  activeClientsCount: number = 0;
  inactiveClientsCount: number = 0;

  // Loading states
  isLoading: boolean = false;
  isSaving: boolean = false;

  // Make Math available in template
  readonly Math = Math;

  // Alert state
  alertMessage: string = '';
  alertType: AlertType = 'info';
  alertVisible: boolean = false;
  alertAutoDismiss: boolean = false;
  alertConfirmMode: boolean = false;
  alertConfirmAction: (() => void) | null = null;
  alertConfirmTitle: string = '';
  alertConfirmText: string = '';
  alertCancelText: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private clientService: ClientService
  ) {
    this.clientForm = this.createClientForm();
    this.currentClientPage = null;
  }

  ngOnInit(): void {
    this.loadClients();
  }

  // Computed properties
  get totalClients(): number {
    return this.totalClientsCount;
  }

  get activeClients(): number {
    return this.activeClientsCount;
  }

  get inactiveClients(): number {
    return this.inactiveClientsCount;
  }

  get paginatedClients(): Client[] {
    return this.clients; // Now clients already contains only the current page
  }

  // Form creation
  private createClientForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      identification: ['', [Validators.required]],
      typeIdentification: ['CEDULA', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      status: ['A', [Validators.required]]
    });
  }

  // Data loading
  loadClients(page: number = 0): void {
    this.isLoading = true;
    
    const filters = {
      name: this.searchTerm,
      type: this.selectedType,
      identification: this.selectedIdentification,
      status: this.selectedStatus
    };
    
    this.clientService.getClients(page, this.itemsPerPage, filters).subscribe({
      next: (clientPage) => {
        this.currentClientPage = clientPage;
        this.clients = clientPage.content;
        this.totalPages = clientPage.totalPages;
        this.totalElements = clientPage.totalElements;
        this.currentPage = clientPage.number;
        // Set summary counts
        if (clientPage.summary) {
          this.totalClientsCount = clientPage.summary.total;
          this.activeClientsCount = clientPage.summary.active;
          this.inactiveClientsCount = clientPage.summary.inactive;
        } else {
          this.totalClientsCount = clientPage.totalElements;
          this.activeClientsCount = this.clients.filter(c => c.status === 'A').length;
          this.inactiveClientsCount = this.clients.filter(c => c.status !== 'A').length;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.isLoading = false;
        // Fallback to empty state
        this.clients = [];
        this.currentClientPage = null;
        this.totalPages = 1;
        this.totalElements = 0;
        this.totalClientsCount = 0;
        this.activeClientsCount = 0;
        this.inactiveClientsCount = 0;
      }
    });
  }

  // Filtering and search
  onSearchChange(): void {
    // Reset to first page when searching
    this.currentPage = 0;
    this.loadClients(this.currentPage);
  }

  onFilterChange(): void {
    // Reset to first page when filtering
    this.currentPage = 0;
    this.loadClients(this.currentPage);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedIdentification = '';
    this.selectedStatus = '';
    this.currentPage = 0;
    this.loadClients(this.currentPage);
  }

  // Pagination - now server-side
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadClients(this.currentPage);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadClients(this.currentPage);
    }
  }

  goToPage(page: number): void {
    // Convert from 1-based to 0-based for API
    const apiPage = page - 1;
    if (apiPage >= 0 && apiPage < this.totalPages) {
      this.currentPage = apiPage;
      this.loadClients(this.currentPage);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    // Convert to 1-based for display
    const currentPage1Based = this.currentPage + 1;
    
    let startPage = Math.max(1, currentPage1Based - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Modal management
  openClientModal(client?: Client): void {
    this.isClientModalOpen = true;
    this.editingClient = client || null;

    if (client) {
      this.clientForm.patchValue({
        name: client.name,
        identification: client.identification,
        typeIdentification: client.typeIdentification,
        email: client.email,
        phone: client.phone,
        status: client.status || 'A'
      });
    } else {
      this.clientForm.reset({
        name: '',
        identification: '',
        typeIdentification: 'CEDULA',
        email: '',
        phone: '',
        status: 'A'
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
      this.isSaving = true;

      // Validar identificación según tipo
      if (!this.validateIdentification(formData.identification, formData.identificationType)) {
        this.isSaving = false;
        return;
      }

      if (this.editingClient) {
        // Update existing client
        const updatedClient: Client = {
          ...this.editingClient,
          name: formData.name,
          identification: formData.identification,
          typeIdentification: formData.typeIdentification,
          email: formData.email,
          phone: formData.phone,
          status: formData.status
        };

        this.clientService.updateClient(this.editingClient.id!, updatedClient).subscribe({
          next: (updatedClientResponse) => {
            // Reload current page to get updated data
            this.loadClients(this.currentPage);
            this.closeClientModal();
            this.isSaving = false;
          },
          error: (error) => {
            console.error('Error updating client:', error);
            this.isSaving = false;
          }
        });
      } else {
        // Create new client
        const newClient: Client = {
          name: formData.name,
          identification: formData.identification,
          typeIdentification: formData.typeIdentification,
          email: formData.email,
          phone: formData.phone
        };

        this.clientService.createClient(newClient).subscribe({
          next: (createdClient) => {
            // Reload current page to get updated data
            this.loadClients(this.currentPage);
            this.closeClientModal();
            this.isSaving = false;
          },
          error: (error) => {
            console.error('Error creating client:', error);
            this.isSaving = false;
          }
        });
      }
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
    // Abrir el modal directamente con los datos actuales del cliente
    this.openClientModal(client);
  }

  viewClient(client: Client): void {
    // Navigate to client detail view or open detail modal
    console.log('Ver detalles del cliente:', client);
    // Aquí podrías navegar a una vista de detalle o abrir un modal con más información
  }

  deleteClient(client: Client): void {
    if (!client.id) return;
    this.showConfirmAlert(
      `¿Estás seguro de que deseas eliminar el cliente "${client.name}"? Esta acción no se puede deshacer.`,
      'Eliminar Cliente',
      'Eliminar',
      'Cancelar',
      () => {
        this.isLoading = true;
        this.clientService.deleteClient(client.id!).subscribe({
          next: () => {
            this.showAlert('Cliente eliminado correctamente', 'success', true);
            this.loadClients(this.currentPage);
            this.isLoading = false;
          },
          error: (error) => {
            this.showAlert('Error al eliminar el cliente', 'danger');
            this.isLoading = false;
          }
        });
      }
    );
  }

  toggleClientStatus(client: Client): void {
    if (!client.id) return;
    const newStatus = client.status === 'A' ? 'I' : 'A';
    const actionText = newStatus === 'A' ? 'activar' : 'inactivar';
    this.showConfirmAlert(
      `¿Estás seguro de que deseas ${actionText} el cliente "${client.name}"?`,
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Cliente`,
      actionText.charAt(0).toUpperCase() + actionText.slice(1),
      'Cancelar',
      () => {
        this.isLoading = true;
        this.clientService.toggleClientStatus(client.id!, newStatus).subscribe({
          next: (updatedClient) => {
            this.showAlert(`Cliente ${actionText}do correctamente`, 'success', true);
            this.loadClients(this.currentPage);
            this.isLoading = false;
          },
          error: (error) => {
            this.showAlert(`Error al ${actionText} el cliente`, 'danger');
            this.isLoading = false;
          }
        });
      }
    );
  }
  // Alert helpers
  showAlert(message: string, type: AlertType = 'info', autoDismiss: boolean = false) {
    this.alertMessage = message;
    this.alertType = type;
    this.alertVisible = true;
    this.alertAutoDismiss = autoDismiss;
    this.alertConfirmMode = false;
  }

  showConfirmAlert(message: string, title: string, confirmText: string, cancelText: string, onConfirm: () => void) {
    this.alertMessage = message;
    this.alertType = 'confirm';
    this.alertVisible = true;
    this.alertConfirmMode = true;
    this.alertConfirmAction = onConfirm;
    this.alertConfirmTitle = title;
    this.alertConfirmText = confirmText;
    this.alertCancelText = cancelText;
  }

  handleAlertClosed() {
    this.alertVisible = false;
    this.alertConfirmMode = false;
    this.alertMessage = '';
  }

  handleAlertConfirmed() {
    if (this.alertConfirmAction) {
      this.alertConfirmAction();
    }
    this.handleAlertClosed();
  }

  handleAlertCancelled() {
    this.handleAlertClosed();
  }

  // Utility functions
  trackByClientId(index: number, client: Client): string {
    return client.id?.toString() || `client-${index}`;
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
