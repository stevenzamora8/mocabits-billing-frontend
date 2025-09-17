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
   */
  getPlans(): Observable<Plan[]> {
    // El endpoint de planes es público, no requiere autenticación
    return this.http.get<Plan[]>(`${this.apiUrl}/plans`);
  }

  /**
   * Obtiene los headers de autenticación con el token Bearer
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    console.log('PlansService - getAuthHeaders token present:', !!token);
    console.log('PlansService - token value (first 50 chars):', token ? token.substring(0, 50) + '...' : 'null');

    let headers = new HttpHeaders();

    // Forzar el case correcto del header Authorization
    headers = headers.set('Content-Type', 'application/json');
    if (token) {
      // Enviar el header con case correcto y verificar que se guarde
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('PlansService - Authorization header set with EXACT case "Authorization"');
      console.log('PlansService - Verification - header present:', !!headers.get('Authorization'));
      console.log('PlansService - Verification - header value starts with:', headers.get('Authorization')?.substring(0, 10));
    } else {
      console.error('PlansService - No token found in AuthService!');
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
   * Asigna un plan al usuario autenticado
   */
  assignPlanToUser(planId: number): Observable<any> {
    console.log('=== PlansService - assignPlanToUser START ===');
    console.log('PlansService - planId:', planId);

    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('accessToken');
    console.log('PlansService - token exists:', !!token);
    console.log('PlansService - token length:', token ? token.length : 0);
    console.log('PlansService - token preview:', token ? `${token.substring(0, 20)}...${token.substring(token.length - 20)}` : 'null');

    if (!token) {
      console.error('PlansService - CRITICAL: No authentication token found! User must login first.');
      return throwError(() => new Error('Usuario no autenticado. Debe iniciar sesión primero.'));
    }

    // Verificar que el token tenga el formato correcto
    if (!token.startsWith('eyJ')) {
      console.error('PlansService - CRITICAL: Token does not look like a JWT token!');
      console.error('PlansService - Token starts with:', token.substring(0, 10));
      return throwError(() => new Error('Token de autenticación inválido.'));
    }

    const headers = this.getAuthHeaders();
    const body = { planId: planId };

    console.log('PlansService - request body:', body);
    console.log('PlansService - headers keys:', Array.from(headers.keys()));
    console.log('PlansService - Authorization header:', headers.get('Authorization'));
    console.log('PlansService - Content-Type header:', headers.get('Content-Type'));

    const fullUrl = `${this.apiUrl}/plans/user-plans`;
    console.log('PlansService - full URL:', fullUrl);
    console.log('PlansService - apiUrl:', this.apiUrl);

    console.log('PlansService - About to make HTTP request...');

    return this.http.post(fullUrl, body, { headers, withCredentials: true }).pipe(
      map(response => {
        console.log('PlansService - SUCCESS: assignPlanToUser response:', response);
        return response;
      }),
      catchError(error => {
        console.error('PlansService - ERROR: assignPlanToUser failed:', error);
        console.error('PlansService - error status:', error.status);
        console.error('PlansService - error statusText:', error.statusText);
        console.error('PlansService - error message:', error.message);
        console.error('PlansService - error url:', error.url);

        // Verificar si es un error de CORS
        if (error.status === 0) {
          console.error('PlansService - This looks like a CORS error or network error!');
          console.error('PlansService - Check if backend is running and CORS is configured correctly');
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Función de prueba para enviar EXACTAMENTE la misma solicitud que funciona en Postman
   */
  testExactPostmanRequest(): Observable<any> {
    console.log('=== TEST: Enviando EXACTAMENTE la misma solicitud que funciona en Postman ===');

    // Headers EXACTOS del curl que funciona
    const headers = new HttpHeaders({
      'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJjZmNkZThiMi01NzFkLTQ5MGMtYTJkOC0yOTRmMzVlMDhkNDciLCJzdWIiOiIxIiwiaWF0IjoxNzU4MTIxMDY4LCJleHAiOjE3NTgxMjQ2NjgsInR5cGUiOiJhY2Nlc3MiLCJlbWFpbCI6InN0ZXZlbnphbW9yYThAb3V0bG9vay5jb20ifQ.fkq-XJIGhn6JStft4F-9IIc4tugcYOn0LjFGx_XovYnJssYI4crBhIe3wT9KSq8CbXqQZyRRPKRyyMTaHiyHpQ',
      'Content-Type': 'application/json'
    });

    // Body EXACTO del curl que funciona
    const body = { "planId": 1 };

    // URL EXACTA del curl que funciona
    const url = 'http://localhost:8080/billing/v1/plans/user-plans';

    console.log('TEST - URL:', url);
    console.log('TEST - Headers:', headers);
    console.log('TEST - Body:', body);
    console.log('TEST - Method: POST');

    return this.http.post(url, body, { headers }).pipe(
      map(response => {
        console.log('TEST - SUCCESS: Response received:', response);
        return response;
      }),
      catchError(error => {
        console.error('TEST - ERROR: Request failed:', error);
        console.error('TEST - Status:', error.status);
        console.error('TEST - StatusText:', error.statusText);
        console.error('TEST - Message:', error.message);
        console.error('TEST - URL:', error.url);
        return throwError(() => error);
      })
    );
  }

  /**
   * Función de comparación: envía la solicitud normal vs la de Postman
   */
  compareRequests(planId: number): Observable<any> {
    console.log('=== COMPARISON: Normal request vs Postman request ===');

    // 1. Solicitud normal (que falla)
    const normalRequest = this.assignPlanToUser(planId);

    // 2. Solicitud exacta de Postman (que funciona)
    const postmanRequest = this.testExactPostmanRequest();

    // Ejecutar ambas y comparar resultados
    return normalRequest.pipe(
      map(result => ({ type: 'normal', result })),
      catchError(error => throwError(() => ({ type: 'normal', error })))
    );
  }
}