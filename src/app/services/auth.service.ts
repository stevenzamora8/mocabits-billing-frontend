import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * AuthService
 * - Calls the given login endpoint with the required Basic Authorization header.
 * - Stores tokens and user info in localStorage on success.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Build login URL from environment
  private readonly loginUrl = `${environment.apiBaseUrl}/security/v1/auth/login`;

  // Optional pre-encoded basic auth string from environment (can be empty).
  // If set, may contain the "Basic " prefix or just the base64 part.
  private readonly envBasic = environment.basicAuth || '';

  constructor(private http: HttpClient) {}

  /**
   * Login with user email/password and optional client credentials.
   * Authorization header building priority:
   * 1) If `clientId` and `clientSecret` are provided, use them (client credentials).
   * 2) Otherwise, use the user's `email:password` (this matches the cURL example where the
   *    Basic header encodes the user's email and password).
   * 3) If neither is available, fall back to a pre-encoded value from `environment.basicAuth`.
   */
  login(email: string, password: string, clientId?: string, clientSecret?: string) {
    // Prefer explicit client credentials when present
    const basic = clientId && clientSecret
      ? this.buildBasicHeader(clientId, clientSecret)
      : this.buildBasicHeaderFromUser(email, password);

    const headers = new HttpHeaders({
      Authorization: basic,
      'Content-Type': 'application/json'
    });

    const body = { email, password };

    return this.http.post<any>(this.loginUrl, body, { headers }).pipe(
      tap(resp => {
        // Persist tokens and user info for later use
        try {
          if (resp?.accessToken) {
            localStorage.setItem('accessToken', resp.accessToken);
          }
          if (resp?.refreshToken) {
            localStorage.setItem('refreshToken', resp.refreshToken);
          }
          if (resp?.user) {
            localStorage.setItem('user', JSON.stringify(resp.user));
          }
        } catch (e) {
          // localStorage might be unavailable in some environments
          console.warn('Could not persist auth tokens', e);
        }
      })
    );
  }

  private buildBasicHeader(clientId?: string, clientSecret?: string) {
    if (clientId && clientSecret) {
      const encoded = btoa(`${clientId}:${clientSecret}`);
      return `Basic ${encoded}`;
    }

    if (!this.envBasic) {
      throw new Error('No Basic credentials provided: pass clientId/clientSecret or set environment.basicAuth');
    }

    // Ensure the stored value has the Basic prefix
    return this.envBasic.startsWith('Basic ') ? this.envBasic : `Basic ${this.envBasic}`;
  }

  /**
   * Build Basic header from the user's email and password.
   * This is used by default to match the behaviour where the API expects the user's
   * credentials in the Authorization header (e.g. Basic base64(email:password)).
   */
  private buildBasicHeaderFromUser(email: string, password: string) {
    if (!email || !password) {
      // If user credentials are missing, fall back to environment basic if available
      if (this.envBasic) {
        return this.envBasic.startsWith('Basic ') ? this.envBasic : `Basic ${this.envBasic}`;
      }
      throw new Error('No credentials provided to build Basic auth header');
    }

    const encoded = btoa(`${email}:${password}`);
    return `Basic ${encoded}`;
  }
}
