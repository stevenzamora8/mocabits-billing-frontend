import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductsService } from '../../../services/products.service';
import { InputComponent } from '../../../shared/components/ui/input/input.component';
import { SelectComponent } from '../../../shared/components/ui/select/select.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';

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
  totalWithoutTax: number;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, SelectComponent, ButtonComponent],
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
  itemsPerPage = 10;

  // Make Math available in template
  readonly Math = Math;

  // Icon strings for buttons
  readonly clearIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 2a1 1 0 0 0-1 1v2.101a7.002 7.002 0 0 1 11.601 2.566 1 1 0 1 1-1.885.666A5.002 5.002 0 0 0 5.999 7H9a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1V3a1 1 0 0 0 1-1zm.008 9.057a1 1 0 0 1 1.276.61A5.002 5.002 0 0 1 14.001 13H11a1 1 0 0 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0v-2.101a7.002 7.002 0 0 1-11.601-2.566 1 1 0 0 1 .61-1.276z"/></svg>`;

  private subscriptions = new Subscription();

  constructor(private productsService: ProductsService) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  clearProductFilters() {
    this.filterName = '';
    this.filterMainCode = '';
    this.filterAuxiliaryCode = '';
    this.loadData(); // Reload all products when clearing filters
  }

  private loadData() {
    this.isLoading = true;
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.productsService.getProductsApi({}, token).subscribe({
        next: (response: any) => {
          const productsData = Array.isArray(response.content) ? response.content : [];
          this.products = productsData.map((p: any) => ({
            id: p.id,
            name: p.name || '',
            mainCode: p.mainCode,
            auxiliaryCode: p.auxiliaryCode,
            description: p.description,
            unitPrice: p.unitPrice,
            quantity: p.quantity,
            discount: p.discount,
            vat: p.vat,
            totalWithoutTax: p.totalWithoutTax
          }));
          this.filteredProducts = [...this.products]; // Initialize filtered products with all products
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading products:', err);
          alert('Error al cargar productos.');
          this.isLoading = false;
        }
      });
    } else {
      alert('No se encontró el token de autenticación. Por favor, inicia sesión de nuevo.');
      this.isLoading = false;
    }
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
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
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
    this.isLoading = true;
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('No se encontró el token de autenticación. Por favor, inicia sesión de nuevo.');
      this.isLoading = false;
      return;
    }

    const filters: any = {};
    if (this.filterName.trim()) {
      filters.name = this.filterName.trim();
    }

    this.productsService.getProductsApi(filters, token).subscribe({
      next: (response: any) => {
        const productsData = Array.isArray(response.content) ? response.content : [];
        this.filteredProducts = productsData.map((p: any) => ({
          id: p.id,
          name: p.name || '',
          mainCode: p.mainCode,
          auxiliaryCode: p.auxiliaryCode,
          description: p.description,
          unitPrice: p.unitPrice,
          quantity: p.quantity,
          discount: p.discount,
          vat: p.vat,
          totalWithoutTax: p.totalWithoutTax
        }));
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error filtering products:', err);
        alert('Error al filtrar productos.');
        this.isLoading = false;
      }
    });
  }

  // El filtrado por categoría ya no aplica

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
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
}
