import { Component, OnInit } from '@angular/core';
import { AlertType } from '../../../components/alert/alert.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService, Client, ClientPage } from '../../../services/client.service';
import { Router } from '@angular/router';
import { AlertComponent } from '../../../components/alert/alert.component';
import { UiAlertComponent, UiAlertType } from '../../../shared/components/ui/alert/alert.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputComponent } from '../../../shared/components/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/ui/select/select.component';
import { ScrollToTopDirective } from '../../../shared/directives/scroll-to-top.directive';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AlertComponent, UiAlertComponent, ButtonComponent, InputComponent, SelectComponent],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
  hostDirectives: [ScrollToTopDirective]
})
export class ClientsComponent implements OnInit {
  // Properties
  clients: Client[] = [];
  searchTerm: string = '';
  selectedType: string = '';
  selectedIdentification: string = '';
  selectedStatus: string = '';

  Math = Math; // Make Math available in template

  // Select options
  typeOptions: SelectOption[] = [
    { value: '', label: 'Todos los tipos' },
    { value: 'CEDULA', label: 'Cédula' },
    { value: 'RUC', label: 'RUC' },
    { value: 'PASAPORTE', label: 'Pasaporte' }
  ];

  statusOptions: SelectOption[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'A', label: 'Activo' },
    { value: 'I', label: 'Inactivo' }
  ];

  typeIdentificationOptions: SelectOption[] = [
    { value: 'CEDULA', label: 'Cédula' },
    { value: 'RUC', label: 'RUC' },
    { value: 'PASAPORTE', label: 'Pasaporte' }
  ];

  clientStatusOptions: SelectOption[] = [
    { value: 'A', label: 'Activo' },
    { value: 'I', label: 'Inactivo' }
  ];

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

  // Icon strings for buttons
  readonly firstPageIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"/></svg>`;
  readonly prevPageIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>`;
  readonly nextPageIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>`;
  readonly lastPageIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"/></svg>`;
  readonly closeIcon = `<svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>`;
  readonly addIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4v16m8-8H4"/></svg>`;
  readonly clearIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 2a1 1 0 0 0-1 1v2.101a7.002 7.002 0 0 1 11.601 2.566 1 1 0 1 1-1.885.666A5.002 5.002 0 0 0 5.999 7H9a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1V3a1 1 0 0 0 1-1zm.008 9.057a1 1 0 0 1 1.276.61A5.002 5.002 0 0 1 14.001 13H11a1 1 0 0 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0v-2.101a7.002 7.002 0 0 1-11.601-2.566 1 1 0 0 1 .61-1.276z"/></svg>`;

  // Alert state
  alertMessage: string = '';
  alertType: AlertType | UiAlertType = 'info';
  alertVisible: boolean = false;
  alertAutoDismiss: boolean = false;
  alertConfirmMode: boolean = false;
  alertConfirmAction: (() => void) | null = null;
  alertConfirmTitle: string = '';
  alertConfirmText: string = '';
  alertCancelText: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private clientService: ClientService,
    private router: Router
  ) {
    this.clientForm = this.createClientForm();
    this.currentClientPage = null;
  }

  ngOnInit(): void {
    // If navigated here with alert data in navigation state (from Create/Edit), show it
    try {
      const nav = this.router.getCurrentNavigation?.();
      const state = nav?.extras?.state ?? (history && (history.state as any));
      if (state && state.alert) {
        const a = state.alert as { message?: string; type?: string; autoDismiss?: boolean };
        if (a && a.message) {
          this.showAlert(a.message, (a.type as AlertType) || 'info', !!a.autoDismiss);
        }
      }
    } catch (e) {
      // ignore if history access fails
    }

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
      typeIdentification: this.selectedType,
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

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadClients(this.currentPage);
  }

  clearType(): void {
    this.selectedType = '';
    this.currentPage = 0;
    this.loadClients(this.currentPage);
  }

  clearIdentification(): void {
    this.selectedIdentification = '';
    this.currentPage = 0;
    this.loadClients(this.currentPage);
  }

  clearStatus(): void {
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
    // Navigate to the edit route for the selected client
    if (client && client.id != null) {
      this.router.navigate(['/dashboard', 'clients', client.id, 'edit']);
    }
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

  getFieldError(fieldName: string): string | null {
    const control = this.clientForm.get(fieldName);
    if (control && control.invalid && control.touched) {
      if (control.errors?.['required']) {
        return 'Este campo es requerido';
      }
      if (control.errors?.['email']) {
        return 'Ingrese un email válido';
      }
      if (control.errors?.['minlength']) {
        return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return null;
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
