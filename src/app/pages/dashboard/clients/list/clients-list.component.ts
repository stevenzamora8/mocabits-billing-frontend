import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClientService, Client } from '../../../../services/client.service';
import { InputComponent } from '../../../../shared/components/ui/input/input.component';
import { SelectComponent } from '../../../../shared/components/ui/select/select.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { UiTableComponent } from '../../../../shared/components/ui/table/table.component';
import { UiPageIntroComponent } from '../../../../shared/components/ui/page-intro/page-intro.component';
import { UiFiltersPanelComponent } from '../../../../shared/components/ui/filters-panel/filters-panel.component';
import { UiStatCardComponent } from '../../../../shared/components/ui/stat-card/stat-card.component';
import { UiAlertComponent, UiAlertType } from '../../../../shared/components/ui/alert/alert.component';
import { UiConfirmComponent } from '../../../../shared/components/ui/confirm/confirm.component';
import { UiPaginatorComponent } from '../../../../shared/components/ui/paginator/paginator.component';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InputComponent, SelectComponent, ButtonComponent, UiTableComponent, UiPageIntroComponent, UiStatCardComponent, UiFiltersPanelComponent, UiAlertComponent, UiConfirmComponent, UiPaginatorComponent],
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.css']
})
export class ClientsListComponent implements OnInit, OnDestroy {
  // Data properties
  clients: Client[] = [];
  filteredClients: Client[] = [];
  paginatedClients: Client[] = [];
  
  // Stats
  totalClients = 0;
  activeClients = 0;
  inactiveClients = 0;
  
  // Pagination
  currentPage = 0;
  itemsPerPage = 5;
  totalPages = 0;
  totalElements = 0;
  
  // Filters
  searchTerm = '';
  selectedType = '';
  selectedIdentification = '';
  selectedStatus = '';
  
  // UI State
  isLoading = false;
  loadingClients = new Set<number>();
  
  // Alert system
  alertVisible = false;
  alertMessage = '';
  alertType: UiAlertType = 'info';
  alertAutoDismiss = true;
  alertAutoDismissTime = 2200;
  
  // Confirmation system
  confirmVisible = false;
  confirmMessage = '';
  confirmTitle = '';
  confirmType: 'warning' | 'danger' = 'warning';
  private confirmCallback: (() => void) | null = null;
  
  // Filter options
  typeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'RUC', label: 'RUC' },
    { value: 'CEDULA', label: 'Cédula' },
    { value: 'PASAPORTE', label: 'Pasaporte' }
  ];
  
  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'A', label: 'Activo' },
    { value: 'I', label: 'Inactivo' }
  ];

  constructor(
    private clientService: ClientService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadClients();
    
    // Check if there's an alert to show from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['alert']) {
      const alertData = navigation.extras.state['alert'];
      this.showAlert(alertData.message, alertData.type, alertData.autoDismiss);
    }
  }

  loadClients(page: number = 1): void {
    this.isLoading = true;
    this.currentPage = page;
    
    const filters = {
      name: this.searchTerm || undefined,
      typeIdentification: this.selectedType || undefined,
      identification: this.selectedIdentification || undefined,
      status: this.selectedStatus || undefined
    };
    
    this.clientService.getClients(page - 1, this.itemsPerPage, filters).subscribe({
      next: (response) => {
        this.clients = response.content || [];
        this.filteredClients = [...this.clients];
        // Use server pagination data
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        // Update currentPage to 0-based system
        this.currentPage = page - 1;
        this.updatePaginatedClients();
        this.updateStats(response.summary);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.isLoading = false;
        this.showAlert('Error al cargar clientes', 'danger');
      }
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedIdentification = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.clients];

    if (this.searchTerm) {
      filtered = filtered.filter(client => 
        client.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedIdentification) {
      filtered = filtered.filter(client => 
        client.identification?.includes(this.selectedIdentification)
      );
    }

    if (this.selectedType) {
      filtered = filtered.filter(client => 
        client.typeIdentification === this.selectedType
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(client => 
        client.status === this.selectedStatus
      );
    }

    this.filteredClients = filtered;
    this.totalElements = filtered.length;
    this.totalPages = Math.ceil(this.totalElements / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page
    this.updatePaginatedClients();
  }

  private updatePaginatedClients(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedClients = this.filteredClients.slice(startIndex, endIndex);
  }

  private updateStats(summary?: { total: number; active: number; inactive: number }): void {
    if (summary) {
      // Use server-provided summary data
      this.totalClients = summary.total;
      this.activeClients = summary.active;
      this.inactiveClients = summary.inactive;
    } else {
      // Fallback to client-side calculation
      this.totalClients = this.totalElements;
      this.activeClients = this.clients.filter(c => c.status === 'A').length;
      this.inactiveClients = this.clients.filter(c => c.status === 'I').length;
    }
  }

  // Pagination method for ui-paginator component (0-based pages)
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      // loadClients expects 1-based page, so add 1
      this.loadClients(page + 1);
    }
  }

  // Make Math available in template
  Math = Math;

  ngOnDestroy(): void {
    // Clean up any subscriptions if needed
  }

  // Client actions
  viewClient(client: Client): void {
    // Implement view logic or navigate to detail view
    console.log('View client:', client);
  }

  editClient(client: Client): void {
    this.router.navigate(['/dashboard', 'clients', client.id, 'edit']);
  }

  toggleClientStatus(client: Client): void {
    if (!client.id) return;
    
    this.loadingClients.add(client.id);
    const newStatus = client.status === 'A' ? 'I' : 'A';
    const action = newStatus === 'A' ? 'activar' : 'inactivar';
    
    const updatedClient = { ...client, status: newStatus };
    
    this.clientService.updateClient(client.id, updatedClient).subscribe({
      next: () => {
        client.status = newStatus;
        this.loadingClients.delete(client.id!);
        this.showAlert(`Cliente ${action === 'activar' ? 'activado' : 'inactivado'} correctamente`, 'success');
        this.updateStats();
      },
      error: (error) => {
        console.error(`Error al ${action} cliente:`, error);
        this.loadingClients.delete(client.id!);
        this.showAlert(`Error al ${action} cliente`, 'danger');
      }
    });
  }

  deleteClient(client: Client): void {
    this.confirmTitle = 'Eliminar Cliente';
    this.confirmMessage = `¿Estás seguro de que deseas eliminar el cliente "${client.name}"? Esta acción no se puede deshacer.`;
    this.confirmType = 'danger';
    this.confirmCallback = () => this.confirmDeleteClient(client);
    this.confirmVisible = true;
  }

  private confirmDeleteClient(client: Client): void {
    if (!client.id) return;
    
    this.clientService.deleteClient(client.id).subscribe({
      next: () => {
        this.showAlert('Cliente eliminado correctamente', 'success');
        this.loadClients(this.currentPage);
      },
      error: (error) => {
        console.error('Error deleting client:', error);
        this.showAlert('Error al eliminar cliente', 'danger');
      }
    });
  }

  // Alert system
  private showAlert(message: string, type: UiAlertType = 'info', autoDismiss: boolean = true): void {
    this.alertMessage = message;
    this.alertType = type;
    this.alertAutoDismiss = autoDismiss;
    this.alertVisible = true;
    this.cdr.detectChanges();
  }

  handleAlertClosed(): void {
    this.alertVisible = false;
  }

  // Confirmation system
  handleUiConfirmConfirmed(): void {
    if (this.confirmCallback) {
      this.confirmCallback();
      this.confirmCallback = null;
    }
    this.confirmVisible = false;
  }

  handleUiConfirmCancelled(): void {
    this.confirmCallback = null;
    this.confirmVisible = false;
  }

  handleUiConfirmClosed(): void {
    this.confirmCallback = null;
    this.confirmVisible = false;
  }

  getConfirmText(): string {
    return this.confirmType === 'danger' ? 'Eliminar' : 'Confirmar';
  }
}