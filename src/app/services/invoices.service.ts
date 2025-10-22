import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InvoiceItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  clientId: string;
  clientName?: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  notes?: string;
  items: InvoiceItem[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {
  constructor(private http: HttpClient) {}

  getInvoicesApi(params: {
    clientId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number
  }, token: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/billing/v1/invoices`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const queryParams: any = {};
    if (params.clientId) queryParams.clientId = params.clientId;
    if (params.status) queryParams.status = params.status;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;
    return this.http.get(url, { headers, params: queryParams });
  }

  createInvoiceApi(invoiceData: Invoice, token: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/billing/v1/invoices`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(url, invoiceData, { headers });
  }

  getInvoiceByIdApi(id: string, token: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/billing/v1/invoices/${id}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(url, { headers });
  }

  updateInvoiceApi(id: string, invoiceData: Invoice, token: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/billing/v1/invoices/${id}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(url, invoiceData, { headers });
  }

  deleteInvoiceApi(id: string, token: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/billing/v1/invoices/${id}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(url, { headers });
  }

  updateInvoiceStatusApi(id: string, status: string, token: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/billing/v1/invoices/${id}/status`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.patch(url, { status }, { headers });
  }
}