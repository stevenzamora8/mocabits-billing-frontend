import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductsService } from '../../../services/products.service';
import { InputComponent } from '../../../shared/components/ui/input/input.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { UiTableComponent } from '../../../shared/components/ui/table/table.component';
import { UiPageIntroComponent } from '../../../shared/components/ui/page-intro/page-intro.component';
import { UiFiltersPanelComponent } from '../../../shared/components/ui/filters-panel/filters-panel.component';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { UiStatCardComponent } from '../../../shared/components/ui/stat-card/stat-card.component';

// Nuevo modelo de producto para el formulario
export interface ProductFormModel {
  id?: string;
  name: string;
  mainCode: string;
  auxiliaryCode?: string;
  description: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  vat: number;
  status?: string;
  totalWithoutTax: number;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent, UiTableComponent, UiPageIntroComponent, UiStatCardComponent, UiFiltersPanelComponent, MoneyPipe],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, OnDestroy {
  filterName: string = '';
  filterMainCode: string = '';
  filterAuxiliaryCode: string = '';
  isLoading: boolean = false;
  products: ProductFormModel[] = [];
  filteredProducts: ProductFormModel[] = [];

  // Modal and form state
  showProductModal = false;
  isEditing = false;
  currentProduct: ProductFormModel = this.createEmptyProduct();

  // Filters and search
  searchTerm = '';
  selectedCategory = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10; // Mostrar 10 registros por página (ajuste para mejor densidad)
  totalPages = 1;
  totalElements = 0;

  // Make Math available in template
  readonly Math = Math;

  // Icon for clear filters button
  clearIcon = 'M6 18L18 6M6 6l12 12';

  // Current filters for pagination
  private currentFilters: any = {};

  private subscriptions = new Subscription();

  constructor(private productsService: ProductsService) {}

  ngOnInit() {
    this.loadData();
  }

  // Map tax rate IDs from the API to percentage values used in the UI
  private mapTaxRate(taxRateId: any): number {
    const id = Number(taxRateId);
    switch (id) {
      case 1: return 0;   // example: exento
      case 2: return 8;   // example: 8%
      case 3: return 12;  // common IVA 12%
      default: return 0;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  clearProductFilters() {
    this.filterName = '';
    this.filterMainCode = '';
    this.filterAuxiliaryCode = '';
    this.currentFilters = {}; // Clear current filters
    this.currentPage = 1;
    this.loadData(); // Reload all products when clearing filters
  }

  private loadData() {
    this.loadDataWithPage(0); // Load first page by default
  }

  private loadDataWithPage(page: number = 0, filters: any = {}) {
    this.isLoading = true;
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('No se encontró el token de autenticación. Por favor, inicia sesión de nuevo.');
      this.isLoading = false;
      return;
    }

    // Merge current filters with pagination parameters
    const params = { 
      page, 
      size: this.itemsPerPage,
      ...this.currentFilters,
      ...filters 
    };

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
          // Map taxRateId to a vat percentage when provided, fallback to p.vat
          vat: p.taxRateId ? this.mapTaxRate(p.taxRateId) : (Number(p.vat) || 0),
          // Derive status from quantity (simple rule: quantity > 0 => active)
          status: (Number(p.quantity) || 0) > 0 ? 'A' : 'I',
          // Compute total without tax if not provided by API
          totalWithoutTax: (Number(p.unitPrice) || 0) * (Number(p.quantity) || 0) - (Number(p.discount) || 0)
        }));
        this.filteredProducts = [...this.products]; // For server-side pagination, this contains current page
        
        // Update pagination info from API response
        this.totalPages = response.totalPages || 1;
        this.totalElements = response.totalElements || this.products.length;
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        alert('Error al cargar productos.');
        this.isLoading = false;
      }
    });
  }

  private createEmptyProduct(): ProductFormModel {
    return {
      name: '',
      mainCode: '',
      auxiliaryCode: '',
      description: '',
      unitPrice: 0,
      quantity: 1,
      discount: 0,
      vat: 12,
      totalWithoutTax: 0
    };
  }

  // Computed properties
  // Métodos de ejemplo para stats (puedes ajustar según lógica deseada)
  get totalValue(): number {
    return this.products.reduce((total, product) => total + (product.unitPrice * product.quantity), 0);
  }

  // Pagination properties
  get paginatedProducts(): ProductFormModel[] {
    // For server-side pagination, filteredProducts already contains only the current page
    return this.filteredProducts;
  }

  // Simplified categories
  get simplifiedCategories(): { name: string; color: string }[] {
    return [
      { name: 'Producto', color: '#667eea' },
      { name: 'Servicio', color: '#764ba2' }
    ];
  }

  // Modal methods
  openProductModal() {
    this.isEditing = false;
    this.currentProduct = this.createEmptyProduct();
    this.calculateTotalWithoutTax(); // Calculate initial total
    this.showProductModal = true;
  }

  editProduct(product: ProductFormModel) {
    if (!product.id) {
      alert('El producto no tiene un ID válido.');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('No se encontró el token de autenticación. Por favor, inicia sesión de nuevo.');
      return;
    }

    this.isLoading = true;
    this.productsService.getProductByIdApi(product.id, token).subscribe({
      next: (response: any) => {
        this.isEditing = true;
        this.currentProduct = {
          id: response.id,
          name: response.name || '',
          mainCode: response.mainCode,
          auxiliaryCode: response.auxiliaryCode,
          description: response.description,
          unitPrice: response.unitPrice,
          quantity: response.quantity,
          discount: response.discount,
          vat: response.vat,
          totalWithoutTax: response.totalWithoutTax
        };
        this.calculateTotalWithoutTax(); // Recalculate to ensure it's correct
        this.showProductModal = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener producto:', err);
        alert('Error al cargar los datos del producto. Por favor, inténtalo de nuevo.');
        this.isLoading = false;
      }
    });
  }

  closeProductModal() {
    this.showProductModal = false;
    this.currentProduct = this.createEmptyProduct();
  }

  // CRUD operations
  saveProduct() {
    // Calculate totalWithoutTax before saving
    this.calculateTotalWithoutTax();

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('No se encontró el token de autenticación. Por favor, inicia sesión de nuevo.');
      return;
    }

    if (this.isEditing && this.currentProduct.id) {
      // Update existing product
      this.productsService.updateProductApi(this.currentProduct.id, this.currentProduct, token).subscribe({
        next: (response) => {
          this.closeProductModal();
          alert('Producto actualizado exitosamente.');
          this.loadData(); // Reload products to show updated data
        },
        error: (err) => {
          console.error('Error al actualizar producto:', err);
          alert('Error al actualizar el producto. Por favor, verifica los datos e inténtalo de nuevo.');
        }
      });
    } else {
      // Create new product
      this.productsService.createProductApi(this.currentProduct, token).subscribe({
        next: (response) => {
          this.closeProductModal();
          alert('Producto creado exitosamente.');
          this.loadData(); // Reload products to show new product
        },
        error: (err) => {
          console.error('Error al crear producto:', err);
          alert('Error al crear el producto. Por favor, verifica los datos e inténtalo de nuevo.');
        }
      });
    }
  }

  // Eliminar producto
  deleteProduct(product: ProductFormModel) {
    if (!product.id) {
      alert('El producto no tiene un ID válido.');
      return;
    }

    if (confirm(`¿Estás seguro de que quieres eliminar el producto "${product.name}"?`)) {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('No se encontró el token de autenticación. Por favor, inicia sesión de nuevo.');
        return;
      }

      this.productsService.deleteProductApi(product.id, token).subscribe({
        next: (response) => {
          alert('Producto eliminado exitosamente.');
          this.loadData(); // Reload products to remove deleted product
        },
        error: (err) => {
          console.error('Error al eliminar producto:', err);
          alert('Error al eliminar el producto. Por favor, inténtalo de nuevo.');
        }
      });
    }
  }

  // Filter and search methods
  filterProducts() {
    // If filtering by name, make API call
    if (this.filterName.trim()) {
      this.loadProductsWithFilters();
      return;
    }

    // For other filters, use client-side filtering
    let filtered = this.products;

    // Filtrar por código principal
    if (this.filterMainCode.trim()) {
      const mainCodeTerm = this.filterMainCode.toLowerCase();
      filtered = filtered.filter(product =>
        product.mainCode && product.mainCode.toLowerCase().includes(mainCodeTerm)
      );
    }

    // Filtrar por código auxiliar
    if (this.filterAuxiliaryCode.trim()) {
      const auxiliaryCodeTerm = this.filterAuxiliaryCode.toLowerCase();
      filtered = filtered.filter(product =>
        product.auxiliaryCode && product.auxiliaryCode.toLowerCase().includes(auxiliaryCodeTerm)
      );
    }

    // Filtrar por término de búsqueda general (si existe)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        (product.mainCode && product.mainCode.toLowerCase().includes(term)) ||
        (product.auxiliaryCode && product.auxiliaryCode.toLowerCase().includes(term)) ||
        (product.description && product.description.toLowerCase().includes(term))
      );
    }

    this.filteredProducts = filtered;
    this.currentPage = 1;
  }

  private loadProductsWithFilters() {
    // Update current filters
    this.currentFilters = {};
    if (this.filterName.trim()) {
      this.currentFilters.name = this.filterName.trim();
    }

    // Load data with filters applied
    this.loadDataWithPage(0, this.currentFilters);
  }

  // El filtrado por categoría ya no aplica

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDataWithPage(page - 1); // API uses 0-based indexing
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadDataWithPage(this.currentPage - 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDataWithPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Utility methods
  getCategoryColor(categoryName: string): string {
    const category = this.simplifiedCategories.find(c => c.name === categoryName);
    return category ? category.color : '#64748b';
  }

  // Calculate total without tax
  calculateTotalWithoutTax() {
    const subtotal = this.currentProduct.unitPrice * this.currentProduct.quantity;
    this.currentProduct.totalWithoutTax = subtotal - this.currentProduct.discount;
  }

  // Update total when price, quantity, or discount changes
  onPriceChange() {
    this.calculateTotalWithoutTax();
  }

  onQuantityChange() {
    this.calculateTotalWithoutTax();
  }

  onDiscountChange() {
    this.calculateTotalWithoutTax();
  }
}
