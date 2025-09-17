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
  maxInvoices: number;
  isPopular: boolean;
  color: string;
  gradient: string;
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
    // Generar label para facturas basado en maxInvoices del backend
    let invoicesLabel: string;
    if (plan.maxInvoices === -1) {
      invoicesLabel = 'Facturas ilimitadas';
    } else {
      const periodText = plan.period === 'ANNUAL' ? 'al año' :
                        plan.period === 'MONTHLY' ? 'al mes' : 'por período';
      invoicesLabel = `${plan.maxInvoices} facturas ${periodText}`;
    }

    return {
      id: `plan-${plan.id}`,
      name: plan.name,
      price: plan.price,
      priceLabel: plan.price === 0 ? 'Gratis' : `$${plan.price}/año`,
      invoices: plan.maxInvoices,
      invoicesLabel: invoicesLabel,
      features: plan.descriptions || ['Características básicas'],
      popular: plan.isPopular,
      color: plan.color,
      gradient: plan.gradient
    };
  }  /**
   * Asigna un plan al usuario autenticado
   */
  assignPlanToUser(planId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { planId: planId };

    return this.http.post(`${this.apiUrl}/user-plans`, body, { headers }).pipe(
      catchError(this.handleError)
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