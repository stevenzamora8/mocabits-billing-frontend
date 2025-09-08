import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="products-container">
      <div class="page-header">
        <h1>Gestión de Productos</h1>
        <p>Administra tu catálogo de productos y servicios</p>
      </div>
      
      <div class="content-placeholder">
        <div class="placeholder-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
          </svg>
        </div>
        <h2>Próximamente</h2>
        <p>El módulo de productos estará disponible pronto</p>
      </div>
    </div>
  `,
  styles: [`
    .products-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 3rem;
      text-align: center;
    }

    .page-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-header p {
      margin: 0;
      color: #64748b;
      font-size: 1.1rem;
    }

    .content-placeholder {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 20px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }

    .placeholder-icon {
      width: 120px;
      height: 120px;
      margin: 0 auto 2rem auto;
      background: linear-gradient(135deg, #f8fafc, #e2e8f0);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #667eea;
    }

    .content-placeholder h2 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
    }

    .content-placeholder p {
      margin: 0;
      color: #64748b;
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .products-container {
        padding: 1rem;
      }
      
      .page-header h1 {
        font-size: 2rem;
      }
      
      .content-placeholder {
        padding: 2rem 1rem;
      }
    }
  `]
})
export class ProductsComponent {
  constructor() { }
}
