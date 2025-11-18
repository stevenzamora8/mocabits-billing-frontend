import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductsService } from '../../../../services/products.service';
import { InputComponent } from '../../../../shared/components/ui/input/input.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { UiTableComponent } from '../../../../shared/components/ui/table/table.component';
import { UiPageIntroComponent } from '../../../../shared/components/ui/page-intro/page-intro.component';
import { UiFiltersPanelComponent } from '../../../../shared/components/ui/filters-panel/filters-panel.component';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';
import { UiStatCardComponent } from '../../../../shared/components/ui/stat-card/stat-card.component';
import { UiEmptyStateComponent } from '../../../../shared/components/ui/empty-state/empty-state.component';
import { UiAlertComponent, UiAlertType } from '../../../../shared/components/ui/alert/alert.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InputComponent, ButtonComponent, UiTableComponent, UiPageIntroComponent, UiStatCardComponent, UiFiltersPanelComponent, UiEmptyStateComponent, MoneyPipe, UiAlertComponent],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent implements OnInit, OnDestroy {
  filterName: string = '';
  filterMainCode: string = '';
  filterAuxiliaryCode: string = '';
  isLoading: boolean = false;
  products: any[] = [];
  filteredProducts: any[] = [];

  // Pagination
  currentPage = 1;
  // show a maximum of 5 records per page as requested
  itemsPerPage = 5;
  totalPages = 1;
  totalElements = 0;

  readonly Math = Math;

  // Alert model
  alertVisible = false;
  alertMessage = '';
  alertType: UiAlertType = 'info';
  alertAutoDismiss = true;

  get totalValue(): number {
    // Sum the final total (including tax) when available, otherwise fallback to unitPrice*quantity
    return this.products.reduce((total, p) => {
      const rowTotal = Number(p.total) || ((Number(p.unitPrice) || 0) * (Number(p.quantity) || 0));
      return total + rowTotal;
    }, 0);
  }

  // Grand totals (may come from API response or be computed as fallback)
  grandSubtotal: number = 0;
  grandIva: number = 0;
  grandTotal: number = 0;

  private currentFilters: any = {};
  private subscriptions = new Subscription();

  constructor(private productsService: ProductsService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // If navigated here with alert in the navigation state, show it
    const navigation = this.router.getCurrentNavigation?.();
    if (navigation?.extras?.state?.['alert']) {
      const alertData = navigation.extras.state['alert'];
      this.showAlert(alertData.message, alertData.type, alertData.autoDismiss);
    }
    else {
      // Fallback: check sessionStorage for alerts (useful when component is reused and navigation state is not preserved)
      try {
        const raw = sessionStorage.getItem('productAlert');
        if (raw) {
          const alertData = JSON.parse(raw);
          if (alertData && alertData.message) {
            this.showAlert(alertData.message, alertData.type || 'info', alertData.autoDismiss !== false);
            sessionStorage.removeItem('productAlert');
          }
        }
      } catch (e) {
        // ignore parsing/storage errors
      }
    }
    this.loadData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private showAlert(message: string, type: UiAlertType = 'info', autoDismiss: boolean = true) {
    this.alertMessage = message;
    this.alertType = type;
    this.alertAutoDismiss = autoDismiss;
    this.alertVisible = true;
    this.cdr.detectChanges();
  }

  private loadData() {
    this.loadDataWithPage(0);
  }

  private loadDataWithPage(page: number = 0, filters: any = {}) {
    this.isLoading = true;
    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.isLoading = false;
      return;
    }

    const params = { page, size: this.itemsPerPage, ...this.currentFilters, ...filters };
    this.productsService.getProductsApi(params, token).subscribe({
      next: (response: any) => {
        // Support responses where the payload is either at the root or under a `page` key
        const page = response.page ?? response;
        const productsData = Array.isArray(response.content)
          ? response.content
          : (Array.isArray(page.content) ? page.content : []);

        this.products = productsData.map((p: any) => {
          const unitPrice = Number(p.unitPrice) || 0;
          const quantity = Number(p.quantity) || 0;
          const subtotal = unitPrice * quantity;
          // taxRate may come as object with 'rate' field (percentage)
          const taxRateValue = p?.taxRate?.rate ? Number(p.taxRate.rate) : 0;
          const taxAmount = +(subtotal * (taxRateValue / 100));
          // If backend returns a precise total field, prefer it; otherwise compute
          const computedTotal = +(subtotal + taxAmount);

          const product = {
            id: p.id,
            name: p.name || '',
            mainCode: p.mainCode || '',
            auxiliaryCode: p.auxiliaryCode || '',
            description: p.description || '',
            unitPrice,
            quantity,
            taxRateRate: taxRateValue,
            subtotal,
            taxRate: p.taxRate || null,
            taxAmount,
            // prefer server-provided total if present
            total: p.total !== undefined && p.total !== null ? Number(p.total) : computedTotal,
            status: quantity > 0 ? 'Activo' : 'Inactivo'
          };
          
          return product;
        });
        this.filteredProducts = [...this.products];
        // totalPages/totalElements may live on either the root response or inside page
        this.totalPages = (page.totalPages ?? response.totalPages) || 1;
        // Use nullish coalescing to accept 0 from the server instead of falling back to previous data
        this.totalElements = (page.totalElements ?? response.totalElements) ?? 0;

        // Grand totals: prefer root-level server-provided values, then page-level, otherwise compute
        if (response.grandSubtotal !== undefined && response.grandSubtotal !== null) {
          this.grandSubtotal = Number(response.grandSubtotal);
        } else if (page.grandSubtotal !== undefined && page.grandSubtotal !== null) {
          this.grandSubtotal = Number(page.grandSubtotal);
        } else {
          this.grandSubtotal = this.products.reduce((s, r) => s + (Number(r.subtotal) || 0), 0);
        }

        if (response.grandIva !== undefined && response.grandIva !== null) {
          this.grandIva = Number(response.grandIva);
        } else if (page.grandIva !== undefined && page.grandIva !== null) {
          this.grandIva = Number(page.grandIva);
        } else {
          this.grandIva = this.products.reduce((s, r) => s + (Number(r.taxAmount) || 0), 0);
        }

        if (response.grandTotal !== undefined && response.grandTotal !== null) {
          this.grandTotal = Number(response.grandTotal);
        } else if (page.grandTotal !== undefined && page.grandTotal !== null) {
          this.grandTotal = Number(page.grandTotal);
        } else {
          this.grandTotal = this.products.reduce((s, r) => s + (Number(r.total) || 0), 0);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading = false;
      }
    });
  }

  filterProducts() {
    // Move to server-side filtering to avoid stale in-memory data
    this.currentFilters = {};
    if (this.filterName.trim()) this.currentFilters.name = this.filterName.trim();
    if (this.filterMainCode.trim()) this.currentFilters.mainCode = this.filterMainCode.trim();
    if (this.filterAuxiliaryCode.trim()) this.currentFilters.auxiliaryCode = this.filterAuxiliaryCode.trim();

    this.currentPage = 1;
    this.loadDataWithPage(0);
  }

  clearProductFilters() {
    this.filterName = '';
    this.filterMainCode = '';
    this.filterAuxiliaryCode = '';
    this.currentPage = 1;
    this.loadData();
  }

  onDeleteProduct(product: any) {
    if (!product || !product.id) return;
    const confirmed = confirm(`¿Eliminar el producto "${product.name}"?`);
    if (!confirmed) return;
    // Best-effort delete: try API if available, otherwise refresh list
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // no auth token, just reload
      this.loadData();
      return;
    }
    try {
      // productsService may expose a delete method; attempt optimistic approach
      (this.productsService as any).deleteProductApi?.(product.id, token)?.subscribe?.({
        next: () => this.loadData(),
        error: (e: any) => {
          console.error('Error deleting product', e);
          this.loadData();
        }
      });
    } catch (ex) {
      console.error('Delete product error', ex);
      this.loadData();
    }
  }

  // pagination helpers
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDataWithPage(page - 1);
    }
  }

  nextPage() { if (this.currentPage < this.totalPages) this.goToPage(this.currentPage + 1); }
  previousPage() { if (this.currentPage > 1) this.goToPage(this.currentPage - 1); }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) startPage = Math.max(1, endPage - maxVisiblePages + 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  }
}
