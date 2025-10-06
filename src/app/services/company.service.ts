// Interfaces para Company API
export interface Company {
  id?: number;
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
  codDoc: string;
  dirMatriz: string;
  contribuyenteEspecial?: string;
  obligadoContabilidad?: string;
  guiaRemision?: string;
  establecimientos: Establecimiento[];
}

export interface Establecimiento {
  estab: string;
  ptoEmi: string;
  secuencial: string;
  dirEstablecimiento: string;
}

export interface CompanyResponse {
  id: number;
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
}

export interface SignatureUploadResponse {
  id: number;
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private apiUrl = `${environment.apiBaseUrl}/billing/v1/companies`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createCompany(company: Company): Observable<CompanyResponse> {
    return this.http.post<CompanyResponse>(this.apiUrl, company, { headers: this.getHeaders() });
  }

  uploadSignature(companyId: number, signatureFile: File): Observable<SignatureUploadResponse> {
    const formData = new FormData();
    formData.append('signature', signatureFile);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getAccessToken()}`
    });

    return this.http.post<SignatureUploadResponse>(
      `${this.apiUrl}/${companyId}/signature`,
      formData,
      { headers }
    );
  }

  completeSetup(companyData: any, digitalCertificate: File, logo?: File, certificatePassword?: string): Observable<any> {
    const formData = new FormData();
    formData.append('companyData', JSON.stringify(companyData));
    formData.append('digitalCertificate', digitalCertificate);
    formData.append('certificatePassword', certificatePassword || '');
    
    if (logo) {
      formData.append('logo', logo);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getAccessToken()}`
    });

    // Nueva URL REST: POST /billing/v1/companies
    return this.http.post(`${this.apiUrl}`, formData, { headers });
  }
}