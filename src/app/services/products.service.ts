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
  vat: number;
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
