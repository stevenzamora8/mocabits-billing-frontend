import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Plan {
  id: number;
  name: string;
  price: number;
  description: string;
  period: string;
  descriptions: string[];
}

export interface PlanDisplay {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  invoices: number;
  invoicesLabel: string;
  features: string[];
  popular?: boolean;
  color: string;
  gradient: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlansService {
  private apiUrl = `${environment.apiBaseUrl}/billing/v1`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de planes disponibles desde el backend
   */
  getPlans(): Observable<Plan[]> {
    // El endpoint de planes es público, no requiere autenticación
    return this.http.get<Plan[]>(`${this.apiUrl}/plans`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene los headers de autenticación con el token Bearer
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Convierte un plan del backend al formato de display del frontend
   */
  transformPlanToDisplay(plan: Plan): PlanDisplay {
    // Mapeo de colores y propiedades adicionales basado en el precio
    const planMappings: { [key: number]: Partial<PlanDisplay> } = {
      0: {
        id: 'free',
        invoices: 10,
        invoicesLabel: '10 facturas al año',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #059669)'
      },
      9.99: {
        id: 'starter',
        invoices: 50,
        invoicesLabel: '50 facturas al año',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
      },
      19.99: {
        id: 'professional',
        invoices: 200,
        invoicesLabel: '200 facturas al año',
        popular: true,
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
      },
      29.99: {
        id: 'enterprise',
        invoices: -1,
        invoicesLabel: 'Facturas ilimitadas',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
      }
    };

    const mapping = planMappings[plan.price];

    return {
      id: mapping?.id || `plan-${plan.id}`,
      name: plan.name,
      price: plan.price,
      priceLabel: plan.price === 0 ? 'Gratis' : `$${plan.price}/año`,
      invoices: mapping?.invoices || 10,
      invoicesLabel: mapping?.invoicesLabel || '10 facturas al año',
      features: plan.descriptions || ['Características básicas'], // Usar las descriptions del backend
      popular: mapping?.popular || false,
      color: mapping?.color || '#10b981',
      gradient: mapping?.gradient || 'linear-gradient(135deg, #10b981, #059669)'
    };
  }

  /**
   * Obtiene los planes transformados para display
   */
  getPlansForDisplay(): Observable<PlanDisplay[]> {
    return this.getPlans().pipe(
      map(plans => plans.map(plan => this.transformPlanToDisplay(plan)))
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 401:
          errorMessage = 'Token de autenticación inválido o expirado. Redirigiendo al login...';
          // Limpiar tokens y redirigir a login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          // Redirigir al login después de un breve delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          break;
        case 403:
          errorMessage = 'No tienes permisos para acceder a este recurso.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
          break;
        case 404:
          errorMessage = 'Servicio no disponible temporalmente.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('PlansService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}