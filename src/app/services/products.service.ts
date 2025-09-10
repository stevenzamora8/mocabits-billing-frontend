import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost?: number;
  category: string;
  sku: string;
  stock: number;
  minStock: number;
  unit: string;
  taxRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private categoriesSubject = new BehaviorSubject<ProductCategory[]>([
    {
      id: '1',
      name: 'Servicios',
      description: 'Servicios profesionales',
      color: '#667eea'
    },
    {
      id: '2',
      name: 'Productos Físicos',
      description: 'Productos tangibles',
      color: '#764ba2'
    },
    {
      id: '3',
      name: 'Software',
      description: 'Licencias y software',
      color: '#f093fb'
    }
  ]);

  constructor() {
    this.loadProducts();
  }

  // Observables
  get products$(): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  get categories$(): Observable<ProductCategory[]> {
    return this.categoriesSubject.asObservable();
  }

  // Getters
  get products(): Product[] {
    return this.productsSubject.value;
  }

  get categories(): ProductCategory[] {
    return this.categoriesSubject.value;
  }

  // Methods
  private loadProducts(): void {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      const products = JSON.parse(savedProducts).map((product: any) => ({
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      }));
      this.productsSubject.next(products);
    } else {
      // Sample data
      const sampleProducts: Product[] = [
        {
          id: '1',
          name: 'Desarrollo Web Básico',
          description: 'Desarrollo de sitio web básico con hasta 5 páginas',
          price: 1500.00,
          cost: 300.00,
          category: 'Servicio',
          sku: 'WEB-BASIC-001',
          stock: 999,
          minStock: 1,
          unit: 'servicio',
          taxRate: 16,
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          name: 'Consultoría SEO',
          description: 'Optimización de motores de búsqueda para sitio web',
          price: 2500.00,
          cost: 500.00,
          category: 'Servicio',
          sku: 'SEO-CONSULT-001',
          stock: 999,
          minStock: 1,
          unit: 'hora',
          taxRate: 16,
          isActive: true,
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20')
        },
        {
          id: '3',
          name: 'Licencia Antivirus Premium',
          description: 'Licencia anual de antivirus premium para 1 dispositivo',
          price: 899.00,
          cost: 450.00,
          category: 'Producto',
          sku: 'AV-PREMIUM-001',
          stock: 50,
          minStock: 5,
          unit: 'licencia',
          taxRate: 16,
          isActive: true,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01')
        },
        {
          id: '4',
          name: 'Desarrollo de Aplicación Móvil',
          description: 'Desarrollo de app móvil nativa para iOS y Android',
          price: 8500.00,
          cost: 2500.00,
          category: 'Servicio',
          sku: 'MOBILE-APP-001',
          stock: 999,
          minStock: 1,
          unit: 'proyecto',
          taxRate: 16,
          isActive: true,
          createdAt: new Date('2024-02-05'),
          updatedAt: new Date('2024-02-05')
        },
        {
          id: '5',
          name: 'Hosting Premium Anual',
          description: 'Hosting compartido premium con SSL incluido',
          price: 1200.00,
          cost: 400.00,
          category: 'Servicio',
          sku: 'HOSTING-PREM-001',
          stock: 999,
          minStock: 1,
          unit: 'año',
          taxRate: 16,
          isActive: true,
          createdAt: new Date('2024-02-10'),
          updatedAt: new Date('2024-02-10')
        },
        {
          id: '6',
          name: 'Licencia Microsoft Office 365',
          description: 'Suscripción anual a Microsoft Office 365 Business',
          price: 2400.00,
          cost: 1200.00,
          category: 'Producto',
          sku: 'MS-OFFICE-365',
          stock: 25,
          minStock: 3,
          unit: 'licencia',
          taxRate: 16,
          isActive: true,
          createdAt: new Date('2024-02-15'),
          updatedAt: new Date('2024-02-15')
        },
        {
          id: '7',
          name: 'Mantenimiento Web Mensual',
          description: 'Servicio de mantenimiento y actualización web mensual',
          price: 800.00,
          cost: 150.00,
          category: 'Servicio',
          sku: 'WEB-MAINT-001',
          stock: 999,
          minStock: 1,
          unit: 'mes',
          taxRate: 16,
          isActive: true,
          createdAt: new Date('2024-02-20'),
          updatedAt: new Date('2024-02-20')
        },
        {
          id: '8',
          name: 'Servidor Dedicado Básico',
          description: 'Servidor dedicado con 8GB RAM y 500GB SSD',
          price: 3500.00,
          cost: 1800.00,
          category: 'Producto',
          sku: 'SERVER-DED-001',
          stock: 5,
          minStock: 1,
          unit: 'servidor',
          taxRate: 16,
          isActive: true,
          createdAt: new Date('2024-02-25'),
          updatedAt: new Date('2024-02-25')
        },
        {
          id: '9',
          name: 'Curso de Programación Online',
          description: 'Curso completo de desarrollo web full-stack',
          price: 299.00,
          cost: 50.00,
          category: 'Producto',
          sku: 'COURSE-WEB-001',
          stock: 100,
          minStock: 10,
          unit: 'curso',
          taxRate: 16,
          isActive: true,
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date('2024-03-01')
        },
        {
          id: '10',
          name: 'Consultoría de Ciberseguridad',
          description: 'Auditoría completa de seguridad informática',
          price: 3200.00,
          cost: 800.00,
          category: 'Servicio',
          sku: 'SEC-AUDIT-001',
          stock: 999,
          minStock: 1,
          unit: 'auditoría',
          taxRate: 16,
          isActive: true,
          createdAt: new Date('2024-03-05'),
          updatedAt: new Date('2024-03-05')
        },
        {
          id: '11',
          name: 'Dominio .com Premium',
          description: 'Registro de dominio .com con privacidad incluida',
          price: 450.00,
          cost: 120.00,
          category: 'Producto',
          sku: 'DOMAIN-COM-001',
          stock: 200,
          minStock: 20,
          unit: 'dominio',
          taxRate: 16,
          isActive: true,
          createdAt: new Date('2024-03-10'),
          updatedAt: new Date('2024-03-10')
        },
        {
          id: '12',
          name: 'Desarrollo de E-commerce',
          description: 'Tienda online completa con pasarela de pagos',
          price: 6500.00,
          cost: 2000.00,
          category: 'Servicio',
          sku: 'ECOMMERCE-001',
          stock: 999,
          minStock: 1,
          unit: 'tienda',
          taxRate: 16,
          isActive: true,
          createdAt: new Date('2024-03-15'),
          updatedAt: new Date('2024-03-15')
        }
      ];
      this.productsSubject.next(sampleProducts);
      this.saveProducts();
    }
  }

  private saveProducts(): void {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newProduct: Product = {
      ...product,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentProducts = this.productsSubject.value;
    this.productsSubject.next([...currentProducts, newProduct]);
    this.saveProducts();
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    const currentProducts = this.productsSubject.value;
    const updatedProducts = currentProducts.map(product =>
      product.id === id
        ? { ...product, ...updates, updatedAt: new Date() }
        : product
    );
    this.productsSubject.next(updatedProducts);
    this.saveProducts();
  }

  deleteProduct(id: string): void {
    const currentProducts = this.productsSubject.value;
    const filteredProducts = currentProducts.filter(product => product.id !== id);
    this.productsSubject.next(filteredProducts);
    this.saveProducts();
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  getProductsByCategory(category: string): Product[] {
    return this.products.filter(product => product.category === category);
  }

  getLowStockProducts(): Product[] {
    return this.products.filter(product => product.stock <= product.minStock);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Category methods
  addCategory(category: Omit<ProductCategory, 'id'>): void {
    const newCategory: ProductCategory = {
      ...category,
      id: this.generateId()
    };

    const currentCategories = this.categoriesSubject.value;
    this.categoriesSubject.next([...currentCategories, newCategory]);
    this.saveCategories();
  }

  private saveCategories(): void {
    localStorage.setItem('productCategories', JSON.stringify(this.categories));
  }
}
