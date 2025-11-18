import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id?: string;
  name: string;
  mainCode: string;
  auxiliaryCode?: string;
  description: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  /** VAT percentage (optional, legacy). Use taxRateId for catalog reference. */
  vat?: number;
  /** Reference to catalog tax rate id (preferred) */
  taxRateId?: number;
  totalWithoutTax: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  constructor(private http: HttpClient) {}

  getProductsApi(params: { name?: string; mainCode?: string; auxiliaryCode?: string; description?: string; page?: number; size?: number }, token: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/billing/v1/products`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const queryParams: any = {};
    if (params.name) queryParams.name = params.name;
    if (params.mainCode) queryParams.mainCode = params.mainCode;
    if (params.auxiliaryCode) queryParams.auxiliaryCode = params.auxiliaryCode;
    if (params.description) queryParams.description = params.description;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;
    return this.http.get(url, { headers, params: queryParams });
  }

  /**
   * Fetch available tax rates from catalogs service.
   * The endpoint provided by the user is: /catalogs/tax-rates
   * Token is optional (catalogs may be public). If provided, it will be added as Bearer header.
   */
  /**
   * Fetch available tax rates from catalogs service.
   * Supports optional filtering by taxTypeName (e.g. 'IVA').
   */
  getTaxRates(token?: string, taxTypeName?: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/catalogs/tax-rates`;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const params: any = {};
    if (taxTypeName) params.taxTypeName = taxTypeName;
    return this.http.get(url, { headers, params });
  }

  /**
   * Fetch company establishments for the current user/company.
   * Endpoint: /billing/v1/companies/establishments
   */
  getEstablishments(token: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/billing/v1/companies/establishments`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(url, { headers });
  }

  /**
   * Check if a main code already exists. Returns { exists: boolean }
   * Endpoint: GET /billing/v1/products/exists/main-code?mainCode=...
   */
  checkMainCodeExists(mainCode: string, token?: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/billing/v1/products/exists/main-code`;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const params: any = {};
    if (mainCode) params.mainCode = mainCode;
    return this.http.get(url, { headers, params });
  }

  /**
   * Check if an auxiliary code already exists. Returns { exists: boolean }
   * Endpoint: GET /billing/v1/products/exists/auxiliary-code?auxiliaryCode=...
   */
  checkAuxiliaryCodeExists(auxiliaryCode: string, token?: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/billing/v1/products/exists/auxiliary-code`;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const params: any = {};
    if (auxiliaryCode) params.auxiliaryCode = auxiliaryCode;
    return this.http.get(url, { headers, params });
  }

  createProductApi(productData: Product, token: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/billing/v1/products`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(url, productData, { headers });
  }

  getProductByIdApi(id: string, token: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/billing/v1/products/${id}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(url, { headers });
  }

  updateProductApi(id: string, productData: Product, token: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/billing/v1/products/${id}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(url, productData, { headers });
  }

  deleteProductApi(id: string, token: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/billing/v1/products/${id}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(url, { headers });
  }
}
