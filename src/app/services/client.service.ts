import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface IdentificationType {
  id: number;
  name: string;
}

export interface ClientFromAPI {
  id?: number;
  name: string;
  identification: string;
  identificationType: IdentificationType;
  email: string;
  phone: string;
  address?: string;
  status?: string;
}

export interface Client {
  id?: number;
  name: string;
  identification: string;
  typeIdentification: string; // Para compatibilidad con UI existente
  typeIdentificationId?: number; // Para envío al API
  email: string;
  phone: string;
  address?: string;
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
  data: ClientFromAPI[];
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
      typeIdentificationId: client.typeIdentificationId || this.mapTypeToId(client.typeIdentification),
      email: client.email,
      phone: client.phone,
      address: client.address || ''
    };

    console.log('ClientService - Enviando cliente al API:', apiClient);
    return this.http.post<ClientFromAPI>(`${this.apiUrl}/billing/v1/clients`, apiClient, { headers: this.getHeaders() }).pipe(
      map(apiResponse => this.transformApiClientToClient(apiResponse))
    );
  }

  /**
   * Mapea el tipo de identificación string al ID numérico correspondiente
   * Este método es temporal para compatibilidad con la UI existente
   */
  private mapTypeToId(typeIdentification: string): number {
    const typeMap: { [key: string]: number } = {
      '04': 1, // RUC
      '05': 2, // Cédula  
      '06': 3, // Pasaporte
      'RUC': 1,
      'CEDULA': 2,
      'PASAPORTE': 3
    };
    
    return typeMap[typeIdentification] || 1; // Default a RUC si no se encuentra
  }

  /**
   * Transforma ClientFromAPI a Client para compatibilidad con la UI
   */
  private transformApiClientToClient(apiClient: ClientFromAPI): Client {
    return {
      id: apiClient.id,
      name: apiClient.name,
      identification: apiClient.identification,
      typeIdentification: apiClient.identificationType.name,
      typeIdentificationId: apiClient.identificationType.id,
      email: apiClient.email,
      phone: apiClient.phone,
      address: apiClient.address,
      status: apiClient.status
    };
  }

  getClients(page: number = 0, size: number = 10, filters?: {
    name?: string;
    idTypeIdentification?: string;
    identification?: string;
    status?: string;
  }): Observable<ClientPage> {
    // Validar parámetros antes de hacer la petición
    const validatedPage = Math.max(page, 0);
    const validatedSize = Math.min(Math.max(size, 1), 200);
    
    // Usar HttpParams para construcción más limpia de URL con parámetros de consulta
    const params = new URLSearchParams();
    params.append('page', validatedPage.toString());
    params.append('size', validatedSize.toString());
    
    if (filters) {
      // Solo agregar parámetros que tengan valor
      if (filters.identification && filters.identification.trim()) {
        params.append('identification', filters.identification.trim());
      }
      if (filters.name && filters.name.trim()) {
        params.append('name', filters.name.trim());
      }
      if (filters.idTypeIdentification && filters.idTypeIdentification.trim()) {
        params.append('idTypeIdentification', filters.idTypeIdentification.trim());
      }
      if (filters.status && filters.status.trim()) {
        params.append('status', filters.status.trim());
      }
    }

    const url = `${this.apiUrl}/billing/v1/clients?${params.toString()}`;
    console.log('ClientService - URL de búsqueda:', url);

    return this.http.get<NewClientResponse>(url, { headers: this.getHeaders() }).pipe(
      map(response => ({
        content: response.data.map(apiClient => this.transformApiClientToClient(apiClient)),
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
    return this.http.get<ClientFromAPI>(`${this.apiUrl}/billing/v1/clients/${id}`, { headers: this.getHeaders() }).pipe(
      map(apiClient => this.transformApiClientToClient(apiClient))
    );
  }

  updateClient(id: number, client: Client): Observable<Client> {
    // Map to API expected format
    const apiClient = {
      name: client.name,
      identification: client.identification,
      typeIdentificationId: client.typeIdentificationId || this.mapTypeToId(client.typeIdentification),
      email: client.email,
      phone: client.phone,
      address: client.address || ''
    };

    console.log('ClientService - Actualizando cliente ID:', id, 'con datos:', apiClient);
    return this.http.put(`${this.apiUrl}/billing/v1/clients/${id}`, apiClient, { 
      headers: this.getHeaders(),
      observe: 'response' // Para poder acceder al status code
    }).pipe(
      map(response => {
        console.log('ClientService - Respuesta del servidor:', response.status, response.body);
        // Si es 204 No Content, retornamos el cliente con los datos actualizados
        if (response.status === 204) {
          return {
            ...client,
            id: id,
            name: apiClient.name,
            identification: apiClient.identification,
            typeIdentification: client.typeIdentification,
            typeIdentificationId: apiClient.typeIdentificationId,
            email: apiClient.email,
            phone: apiClient.phone,
            address: apiClient.address
          };
        }
        // Si hay contenido en la respuesta, lo transformamos
        if (response.body) {
          return this.transformApiClientToClient(response.body as ClientFromAPI);
        }
        // Fallback: retornar el cliente actualizado
        return {
          ...client,
          id: id,
          name: apiClient.name,
          identification: apiClient.identification,
          typeIdentification: client.typeIdentification,
          typeIdentificationId: apiClient.typeIdentificationId,
          email: apiClient.email,
          phone: apiClient.phone,
          address: apiClient.address
        };
      }),
      catchError((error) => {
        console.error('ClientService - Error en updateClient:', error);
        throw error;
      })
    );
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/billing/v1/clients/${id}`, { headers: this.getHeaders() });
  }

  toggleClientStatus(id: number, status: string): Observable<Client> {
    return this.http.put(`${this.apiUrl}/billing/v1/clients/${id}`, { status }, { 
      headers: this.getHeaders(),
      observe: 'response'
    }).pipe(
      map(response => {
        // Si es 204 No Content, retornamos un cliente básico con el nuevo status
        if (response.status === 204) {
          return {
            id: id,
            status: status
          } as Client;
        }
        // Si hay contenido en la respuesta, lo transformamos
        if (response.body) {
          return this.transformApiClientToClient(response.body as ClientFromAPI);
        }
        // Fallback: retornar cliente básico con nuevo status
        return {
          id: id,
          status: status
        } as Client;
      })
    );
  }
}