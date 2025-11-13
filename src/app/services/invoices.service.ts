import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateInvoiceRequest {
  clientId: number;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent';
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
  }[];
}

export interface Invoice {
  id: number;
  accessKey: string;
  receiptStatus: 'AUTORIZADO' | 'PENDIENTE' | 'RECHAZADO' | 'ANULADO';
  receiptType: string;
  invoiceNumber: string;
  issuerRuc: string;
  issuerBusinessName: string;
  clientIdentification: string;
  clientBusinessName: string;
  total: number;
  environment: 'PRUEBAS' | 'PRODUCCION';
  authorizationNumber?: string;
  issueDate: string;
  authorizationDate?: string;
  // Optional display field for formatted issue date (date + hour:minute)
  issueDateDisplay?: string;
  // Optional display field for formatted total (e.g. "$1,234.56")
  totalDisplay?: string;
}

export interface InvoicePagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  firstPage: boolean;
  lastPage: boolean;
}

export interface InvoiceSummary {
  total: number;
  authorized: number;
  pending: number;
  rejected: number;
}

export interface InvoiceResponse {
  data: Invoice[];
  pagination: InvoicePagination;
  summary: InvoiceSummary;
}

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {
  constructor(private http: HttpClient) {}

  getInvoicesApi(params: {
    page?: number;
    size?: number;
    sort?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }, token: string): Observable<InvoiceResponse> {
    const url = `${environment.apiBaseUrl}/billing/v1/invoices`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const queryParams: any = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;
    if (params.sort) queryParams.sort = params.sort;
    if (params.status) queryParams.status = params.status;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    return this.http.get<InvoiceResponse>(url, { headers, params: queryParams });
  }

  createInvoiceApi(invoiceData: any, token: string): Observable<any> {
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