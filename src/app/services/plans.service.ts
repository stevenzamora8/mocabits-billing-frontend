import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

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

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Obtiene la lista de planes disponibles desde el backend
   * Nueva URL REST: GET /billing/v1/plans
   */
  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.apiUrl}/plans`, { headers: this.getAuthHeaders() });
  }

  /**
   * Obtiene los headers de autenticación con el token Bearer
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.error('PlansService - No authentication token found');
    }

    return headers;
  }

  /**
   * Obtiene la lista de planes disponibles en formato de display
   */
  getPlansForDisplay(): Observable<PlanDisplay[]> {
    return this.getPlans().pipe(
      map(plans => plans.map(plan => this.transformPlanToDisplay(plan)))
    );
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
  }

  /**
   * Asigna un plan a la compañía del usuario autenticado
   * Nueva URL REST: POST /billing/v1/plans/assign
   */
  assignPlanToUser(planId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { planId: planId };
    const fullUrl = `${this.apiUrl}/plans/assign`;

    return this.http.post(fullUrl, body, { headers }).pipe(
      map(response => {
        console.log('PlansService - Plan assigned successfully:', response);
        return response;
      }),
      catchError(error => {
        console.error('PlansService - Failed to assign plan:', error);
        return throwError(() => error);
      })
    );
  }



  /**
   * Obtiene los planes asignados al usuario autenticado
   */
  getUserPlans(): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}/plans/user-plans`;

    return this.http.get(url, { headers }).pipe(
      catchError(error => {
        console.error('PlansService - Failed to get user plans:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene el estado de configuración del usuario según la nueva API REST
   * Nueva URL REST: GET /billing/v1/plans/setup-status
   */
  getSetupStatus(): Observable<{ hasActivePlan: boolean; hasCompanyInfo: boolean }> {
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}/plans/setup-status`;

    return this.http.get<{ hasActivePlan: boolean; hasCompanyInfo: boolean }>(url, { headers }).pipe(
      catchError(error => {
        console.error('PlansService - Failed to get setup status:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * @deprecated Use getSetupStatus() instead. Will be removed in future version.
   * Obtiene el estado de setup del usuario (si tiene plan activo y info de compañía)
   */
  getUserSetupStatus(): Observable<{ hasActivePlan: boolean; hasCompanyInfo: boolean }> {
    console.warn('PlansService - getUserSetupStatus() is deprecated. Use getSetupStatus() instead.');
    return this.getSetupStatus();
  }
}