import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { FilterOption } from '../shared/interfaces/filter-config.interface';
import { environment } from '../../environments/environment';

export interface CatalogItem {
  id: number;
  code: string;
  name: string;
  description: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private apiUrl = environment.apiBaseUrl;
  private catalogsCache: Map<string, FilterOption[]> = new Map();
  
  // BehaviorSubjects para cachear los catálogos más comunes
  private identificationsSubject = new BehaviorSubject<FilterOption[]>([]);
  private statusSubject = new BehaviorSubject<FilterOption[]>([]);
  
  public identifications$ = this.identificationsSubject.asObservable();
  public status$ = this.statusSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.initializeCommonCatalogs();
  }

  private initializeCommonCatalogs(): void {
    // Cargar catálogos comunes al inicializar el servicio
    this.loadIdentificationsCatalog().subscribe();
    this.loadStatusCatalog().subscribe();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    console.log('CatalogService - Token obtenido:', !!token, token ? `len=${token.length}` : 'null');
    
    if (!token) {
      throw new Error('CatalogService - No hay token de autenticación disponible. El usuario debe iniciar sesión.');
    }
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    headers = headers.set('Authorization', `Bearer ${token}`);
    console.log('CatalogService - Headers con Authorization configurado correctamente');

    return headers;
  }

  /**
   * Carga el catálogo de identificaciones desde el API
   */
  loadIdentificationsCatalog(): Observable<FilterOption[]> {
    const cacheKey = 'identifications';
    
    // Verificar cache primero
    if (this.catalogsCache.has(cacheKey)) {
      const cached = this.catalogsCache.get(cacheKey)!;
      this.identificationsSubject.next(cached);
      return of(cached);
    }

    return this.http.get<CatalogItem[]>(`${this.apiUrl}/catalogs/identifications`, {
      headers: this.getHeaders()
    }).pipe(
      map(items => this.transformCatalogToOptions(items)),
      tap(options => {
        // Agregar opción "Todos" al inicio
        const optionsWithAll = [
          { value: '', label: 'Todos los tipos' },
          ...options
        ];
        this.catalogsCache.set(cacheKey, optionsWithAll);
        this.identificationsSubject.next(optionsWithAll);
      }),
      catchError(error => {
        console.error('Error loading identifications catalog:', error);
        // Fallback a opciones estáticas
        const fallbackOptions = [
          { value: '', label: 'Todos los tipos' },
          { value: 'RUC', label: 'RUC' },
          { value: 'CEDULA', label: 'Cédula' },
          { value: 'PASAPORTE', label: 'Pasaporte' }
        ];
        this.identificationsSubject.next(fallbackOptions);
        return of(fallbackOptions);
      })
    );
  }

  /**
   * Carga el catálogo de estados (genérico para activo/inactivo)
   */
  loadStatusCatalog(): Observable<FilterOption[]> {
    const cacheKey = 'status';
    
    if (this.catalogsCache.has(cacheKey)) {
      const cached = this.catalogsCache.get(cacheKey)!;
      this.statusSubject.next(cached);
      return of(cached);
    }

    // Para estados, usamos opciones estáticas ya que es un patrón común
    const statusOptions = [
      { value: '', label: 'Todos los estados' },
      { value: 'A', label: 'Activo' },
      { value: 'I', label: 'Inactivo' }
    ];

    this.catalogsCache.set(cacheKey, statusOptions);
    this.statusSubject.next(statusOptions);
    return of(statusOptions);
  }

  /**
   * Carga cualquier catálogo por endpoint
   */
  loadCatalog(endpoint: string, includeAllOption: boolean = true, allOptionLabel: string = 'Todos'): Observable<FilterOption[]> {
    const cacheKey = endpoint;
    
    if (this.catalogsCache.has(cacheKey)) {
      return of(this.catalogsCache.get(cacheKey)!);
    }

    return this.http.get<CatalogItem[]>(`${this.apiUrl}/catalogs/${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      map(items => {
        const options = this.transformCatalogToOptions(items);
        if (includeAllOption) {
          return [{ value: '', label: allOptionLabel }, ...options];
        }
        return options;
      }),
      tap(options => {
        this.catalogsCache.set(cacheKey, options);
      }),
      catchError(error => {
        console.error(`Error loading catalog ${endpoint}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Transforma items del catálogo a FilterOption[]
   */
  private transformCatalogToOptions(items: CatalogItem[]): FilterOption[] {
    return items
      .filter(item => item.status === 'A') // Solo items activos
      .map(item => ({
        // Usar el código como 'value' (p. ej. '04') y mostrar el name como label
        value: item.code,
        label: item.name
      }));
  }

  /**
   * Limpia el cache de catálogos
   */
  clearCache(): void {
    this.catalogsCache.clear();
  }

  /**
   * Obtiene opciones específicas para comprobantes/receipts
   */
  getReceiptStatusOptions(): FilterOption[] {
    return [
      { value: '', label: 'Todos los estados' },
      { value: 'AUTORIZADO', label: 'Autorizado' },
      { value: 'PENDIENTE', label: 'Pendiente' },
      { value: 'RECHAZADO', label: 'Rechazado' },
      { value: 'ANULADO', label: 'Anulado' }
    ];
  }
}