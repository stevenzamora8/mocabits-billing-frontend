import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductsService, Product, ProductCategory } from '../../../services/products.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: ProductCategory[] = [];
  filteredProducts: Product[] = [];

  // Modal and form state
  showProductModal = false;
  isEditing = false;
  currentProduct: Product = this.createEmptyProduct();

  // Filters and search
  searchTerm = '';
  selectedCategory = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  // Make Math available in template
  readonly Math = Math;

  private subscriptions = new Subscription();

  constructor(private productsService: ProductsService) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private loadData() {
    // Subscribe to products
    this.subscriptions.add(
      this.productsService.products$.subscribe(products => {
        this.products = products;
        this.filterProducts();
      })
    );

    // Subscribe to categories
    this.subscriptions.add(
      this.productsService.categories$.subscribe(categories => {
        this.categories = categories;
      })
    );
  }

  private createEmptyProduct(): Product {
    return {
      id: '',
      name: '',
      description: '',
      price: 0,
      category: '',
      sku: '',
      stock: 0,
      minStock: 1,
      unit: '',
      taxRate: 16,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Computed properties
  get activeProducts(): Product[] {
    return this.products.filter(p => p.isActive);
  }

  get lowStockProducts(): Product[] {
    return this.products.filter(p => p.stock <= p.minStock);
  }

  get totalValue(): number {
    return this.products.reduce((total, product) => total + (product.price * product.stock), 0);
  }

  // Pagination properties
  get paginatedProducts(): Product[] {
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

  editProduct(product: Product) {
    this.isEditing = true;
    this.currentProduct = { ...product };
    this.showProductModal = true;
  }

  closeProductModal() {
    this.showProductModal = false;
    this.currentProduct = this.createEmptyProduct();
  }

  // CRUD operations
  saveProduct() {
    if (this.isEditing) {
      this.productsService.updateProduct(this.currentProduct.id, this.currentProduct);
    } else {
      this.productsService.addProduct(this.currentProduct);
    }
    this.closeProductModal();
  }

  deleteProduct(product: Product) {
    if (confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) {
      this.productsService.deleteProduct(product.id);
    }
  }

  // Filter and search methods
  filterProducts() {
    let filtered = this.products;

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (this.selectedCategory) {
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }

    this.filteredProducts = filtered;
    this.currentPage = 1; // Reset to first page when filtering
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1; // Reset to first page when filtering
    this.filterProducts();
  }

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
