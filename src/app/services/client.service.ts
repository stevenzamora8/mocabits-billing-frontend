import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Client {
  id?: number;
  name: string;
  identification: string;
  typeIdentification: string;
  email: string;
  phone: string;
  status?: string;
}

export interface ClientPageResponse {
  content: Client[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface NewClientResponse {
  data: Client[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    firstPage: boolean;
    lastPage: boolean;
  };
  summary: {
    total: number;
    active: number;
    inactive: number;
  };
}

export interface ClientPage {
  content: Client[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
  summary?: {
    total: number;
    active: number;
    inactive: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    console.log('ClientService - Token obtenido:', !!token, token ? `len=${token.length}` : 'null');
    
    if (!token) {
      throw new Error('ClientService - No hay token de autenticación disponible. El usuario debe iniciar sesión.');
    }
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    headers = headers.set('Authorization', `Bearer ${token}`);
    console.log('ClientService - Headers con Authorization configurado correctamente');

    return headers;
  }

  createClient(client: Client): Observable<Client> {
    // Map to API expected format
    const apiClient = {
      name: client.name,
      identification: client.identification,
      typeIdentification: client.typeIdentification,
      email: client.email,
      phone: client.phone
    };

    return this.http.post<Client>(`${this.apiUrl}/billing/v1/clients`, apiClient, { headers: this.getHeaders() });
  }

  getClients(page: number = 0, size: number = 10, filters?: {
    name?: string;
    typeIdentification?: string;
    identification?: string;
    status?: string;
  }): Observable<ClientPage> {
    let url = `${this.apiUrl}/billing/v1/clients?page=${page}&size=${size}`;
    
    if (filters) {
      if (filters.name && filters.name.trim()) {
        url += `&name=${encodeURIComponent(filters.name.trim())}`;
      }
      // filter by typeIdentification to match the Client model field
      if ((filters as any).typeIdentification && (filters as any).typeIdentification.trim()) {
        url += `&typeIdentification=${encodeURIComponent((filters as any).typeIdentification.trim())}`;
      }
      if (filters.identification && filters.identification.trim()) {
        url += `&identification=${encodeURIComponent(filters.identification.trim())}`;
      }
      if (filters.status && filters.status.trim()) {
        url += `&status=${encodeURIComponent(filters.status.trim())}`;
      }
    }

    return this.http.get<NewClientResponse>(url, { headers: this.getHeaders() }).pipe(
      map(response => ({
        content: response.data,
        totalElements: response.pagination.totalElements,
        totalPages: response.pagination.totalPages,
        number: response.pagination.currentPage,
        size: response.pagination.pageSize,
        first: response.pagination.firstPage,
        last: response.pagination.lastPage,
        pageable: {
          pageNumber: response.pagination.currentPage,
          pageSize: response.pagination.pageSize,
          sort: {
            empty: true,
            sorted: false,
            unsorted: true
          },
          offset: response.pagination.currentPage * response.pagination.pageSize,
          unpaged: false,
          paged: true
        },
        sort: {
          empty: true,
          sorted: false,
          unsorted: true
        },
        numberOfElements: response.data.length,
        empty: response.data.length === 0,
        summary: response.summary
      } as ClientPage))
    );
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/billing/v1/clients/${id}`, { headers: this.getHeaders() });
  }

  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/billing/v1/clients/${id}`, client, { headers: this.getHeaders() });
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/billing/v1/clients/${id}`, { headers: this.getHeaders() });
  }

  toggleClientStatus(id: number, status: string): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/billing/v1/clients/${id}`, { status }, { headers: this.getHeaders() });
  }
}