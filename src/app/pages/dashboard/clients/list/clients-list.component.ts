import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ClientService, Client } from '../../../../services/client.service';
import { CatalogService } from '../../../../services/catalog.service';
import { FilterOption } from '../../../../shared/interfaces/filter-config.interface';
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
  itemsPerPage = 5; // Solo 5 filas por página
  totalPages = 0;
  totalElements = 0;
  
  // Filters
  searchTerm = '';
  selectedType = '';
  selectedIdentification = '';
  selectedStatus = '';
  
  // Filter validation errors
  nameError = '';
  identificationError = '';
  statusError = '';
  
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
  
  // Filter options - cargadas dinámicamente
  typeOptions: FilterOption[] = [
    { value: '', label: 'Todos los tipos' }
  ];
  
  statusOptions: FilterOption[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'A', label: 'Activo' },
    { value: 'I', label: 'Inactivo' }
  ];

  // Subscriptions
  private subscriptions = new Subscription();
  private searchSubject = new Subject<void>();


  constructor(
    private clientService: ClientService,
    private catalogService: CatalogService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadClients();
    
    // Check if there's an alert to show from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['alert']) {
      const alertData = navigation.extras.state['alert'];
      this.showAlert(alertData.message, alertData.type, alertData.autoDismiss);
    }
  }

  private loadCatalogs(): void {
    // Suscribirse a los catálogos dinámicos
    this.subscriptions.add(
      this.catalogService.identifications$.subscribe(options => {
        this.typeOptions = options;
        this.cdr.detectChanges();
      })
    );

    // Cargar catálogos si no están cargados
    this.catalogService.loadIdentificationsCatalog().subscribe({
      error: (error) => {
        console.error('Error loading identification types:', error);
        // Fallback a opciones estáticas si falla la carga dinámica
        this.typeOptions = [
          { value: '', label: 'Todos los tipos' },
          { value: 'RUC', label: 'RUC' },
          { value: 'CEDULA', label: 'Cédula' },
          { value: 'PASAPORTE', label: 'Pasaporte' }
        ];
      }
    });
  }

  loadClients(page: number = 1): void {
    this.isLoading = true;
    // Keep currentPage as 0-based consistently
    this.currentPage = page - 1;
    
    // Validar size (1-200 según especificación)
    const validatedSize = Math.min(Math.max(this.itemsPerPage, 1), 200);
    
    const filters = {
      name: this.searchTerm && this.searchTerm.trim() ? this.searchTerm.trim() : undefined,
      idTypeIdentification: this.selectedType ? this.mapTypeToId(this.selectedType).toString() : undefined,
      identification: this.selectedIdentification && this.selectedIdentification.trim() ? this.selectedIdentification.trim() : undefined,
      status: this.selectedStatus || undefined
    };
    
    console.log('ClientsListComponent - Filtros aplicados:', filters);
    console.log('Size validado:', validatedSize);
    
    this.clientService.getClients(page - 1, validatedSize, filters).subscribe({
      next: (response) => {
        this.clients = response.content || [];
        this.filteredClients = [...this.clients];
        // Use server pagination data
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        // currentPage is already set above as 0-based
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
    // Validar filtros antes de hacer la búsqueda
    if (this.validateFilters()) {
      // Reiniciar a la primera página cuando se cambian los filtros
      this.currentPage = 0;
      this.loadClients(1); // Cargar desde el servidor con los nuevos filtros
    }
  }

  private validateFilters(): boolean {
    let isValid = true;
    
    // Validar name: máximo 255 caracteres
    this.nameError = '';
    if (this.searchTerm && this.searchTerm.length > 255) {
      this.nameError = 'El nombre no puede exceder 255 caracteres';
      isValid = false;
    }
    
    // Validar identification: máximo 255 caracteres, match exacto
    this.identificationError = '';
    if (this.selectedIdentification && this.selectedIdentification.length > 255) {
      this.identificationError = 'La identificación no puede exceder 255 caracteres';
      isValid = false;
    }
    
    // Validar status: solo 'A' o 'I'
    this.statusError = '';
    if (this.selectedStatus && !['A', 'I'].includes(this.selectedStatus)) {
      this.statusError = 'El estado debe ser A (Activo) o I (Inactivo)';
      isValid = false;
    }
    
    return isValid;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedIdentification = '';
    this.selectedStatus = '';
    // Limpiar errores de validación
    this.nameError = '';
    this.identificationError = '';
    this.statusError = '';
    // Reiniciar a la primera página y recargar desde el servidor
    this.currentPage = 0;
    this.loadClients(1);
  }

  // Eliminar applyFilters() - ya no es necesario el filtrado local
  // La búsqueda se hace en el servidor usando los parámetros de consulta

  private updatePaginatedClients(): void {
    // Los datos ya vienen paginados del servidor, no necesitamos slice local
    this.paginatedClients = [...this.filteredClients];
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
    this.subscriptions.unsubscribe();
  }

  // Client actions

  editClient(client: Client): void {
    this.router.navigate(['/dashboard', 'clients', client.id, 'edit']);
  }

  toggleClientStatus(client: Client): void {
    if (!client.id) return;

    // Prepare confirmation dialog before toggling status
    const newStatus = client.status === 'A' ? 'I' : 'A';
    const action = newStatus === 'A' ? 'activar' : 'inactivar';

    this.confirmTitle = action === 'activar' ? 'Activar Cliente' : 'Inactivar Cliente';
    this.confirmMessage = `¿Estás seguro de que deseas ${action} al cliente "${client.name}"?`;
    this.confirmType = 'warning';

    // Set the callback that will run when user confirms
    this.confirmCallback = () => {
      // Show per-row loader (disable the button)
      this.loadingClients.add(client.id!);

      // Use the dedicated endpoint that toggles status
      this.clientService.toggleClientStatus(client.id!, newStatus).subscribe({
        next: () => {
          // Remove per-row loader and reload list from server (loadClients sets isLoading)
          this.loadingClients.delete(client.id!);
          this.loadClients(this.currentPage + 1);
          this.showAlert(`Cliente ${action === 'activar' ? 'activado' : 'inactivado'} correctamente`, 'success');
        },
        error: (error) => {
          console.error(`Error al ${action} cliente:`, error);
          this.loadingClients.delete(client.id!);
          this.showAlert(`Error al ${action} cliente`, 'danger');
        }
      });
    };

    this.confirmVisible = true;
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

  /**
   * Mapea el código de tipo de identificación al ID numérico correspondiente
   * Basado en el ejemplo del curl: idTypeIdentification=2 para cédula
   */
  private mapTypeToId(typeCode: string): number {
    const typeMap: { [key: string]: number } = {
      '04': 1, // RUC 
      '05': 2, // Cédula
      '06': 3, // Pasaporte
      // Fallbacks para nombres completos si vienen así del catálogo
      'RUC': 1,
      'CEDULA': 2,
      'CEDULA DE IDENTIDAD': 2,
      'PASAPORTE': 3
    };
    
    return typeMap[typeCode] || 1; // Default a RUC si no se encuentra
  }
}