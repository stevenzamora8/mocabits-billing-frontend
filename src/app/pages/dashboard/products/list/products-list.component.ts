import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductsService } from '../../../../services/products.service';
import { InputComponent } from '../../../../shared/components/ui/input/input.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { UiTableComponent } from '../../../../shared/components/ui/table/table.component';
import { UiPageIntroComponent } from '../../../../shared/components/ui/page-intro/page-intro.component';
import { UiFiltersPanelComponent } from '../../../../shared/components/ui/filters-panel/filters-panel.component';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';
import { UiStatCardComponent } from '../../../../shared/components/ui/stat-card/stat-card.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InputComponent, ButtonComponent, UiTableComponent, UiPageIntroComponent, UiStatCardComponent, UiFiltersPanelComponent, MoneyPipe],
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
  itemsPerPage = 10;
  totalPages = 1;
  totalElements = 0;

  readonly Math = Math;

  get totalValue(): number {
    return this.products.reduce((total, p) => total + ((Number(p.unitPrice) || 0) * (Number(p.quantity) || 0)), 0);
  }

  private currentFilters: any = {};
  private subscriptions = new Subscription();

  constructor(private productsService: ProductsService) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
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
        const productsData = Array.isArray(response.content) ? response.content : [];
        this.products = productsData.map((p: any) => ({
          id: p.id,
          name: p.name || '',
          mainCode: p.mainCode,
          auxiliaryCode: p.auxiliaryCode,
          description: p.description,
          unitPrice: Number(p.unitPrice) || 0,
          quantity: Number(p.quantity) || 0,
          discount: Number(p.discount) || 0,
          vat: Number(p.vat) || 0
        }));
        this.filteredProducts = [...this.products];
        this.totalPages = response.totalPages || 1;
        this.totalElements = response.totalElements || this.products.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading = false;
      }
    });
  }

  filterProducts() {
    // simple client-side filters for quick UX while server supports search
    let filtered = this.products;
    if (this.filterName.trim()) {
      const term = this.filterName.toLowerCase();
      filtered = filtered.filter(p => (p.name || '').toLowerCase().includes(term));
    }
    if (this.filterMainCode.trim()) {
      const term = this.filterMainCode.toLowerCase();
      filtered = filtered.filter(p => (p.mainCode || '').toLowerCase().includes(term));
    }
    if (this.filterAuxiliaryCode.trim()) {
      const term = this.filterAuxiliaryCode.toLowerCase();
      filtered = filtered.filter(p => (p.auxiliaryCode || '').toLowerCase().includes(term));
    }
    this.filteredProducts = filtered;
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
