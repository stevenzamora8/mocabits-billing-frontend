import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
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

  // Expose current access token as an observable so other services can react to changes
  private _accessToken$ = new BehaviorSubject<string | null>(localStorage.getItem('accessToken'));
  public readonly accessToken$: Observable<string | null> = this._accessToken$.asObservable();

  /**
   * Central helper to set token in localStorage and notify subscribers
   */
  private setAccessToken(token: string | null) {
    try {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
      this._accessToken$.next(token);
      console.log('AuthService - setAccessToken:', !!token, token ? `len=${token.length}` : 'null');
    } catch (e) {
      console.warn('AuthService - Could not persist access token', e);
    }
  }

  /**
   * Read current token synchronously
   */
  public getAccessToken(): string | null {
    return this._accessToken$.value;
  }

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

    // Para Basic Auth, NO enviamos body JSON - las credenciales van solo en el header
    // El backend extrae email/password del header Authorization
    const body = null;

    // Determinar si debemos enviar credenciales (cookies) según environment
    const httpOptions: any = { headers };
    if ((environment as any).withCredentials) {
      httpOptions.withCredentials = true;
      console.log('AuthService - will send request with credentials (withCredentials=true)');
    }

    console.log('AuthService - Login attempt with Basic Auth header');
    console.log('AuthService - Authorization header preview:', basic.substring(0, 20) + '...');

    return this.http.post(this.loginUrl, body, httpOptions).pipe(
      tap((resp: any) => {
        // Log completo para depuración: ayuda a detectar la forma exacta del token devuelto
        console.log('AuthService - Login response payload:', resp);

        // Persist tokens and user info for later use. Muchos backends devuelven distintas formas:
        // { accessToken, refreshToken }, { token }, { data: { accessToken } }, etc.
        try {
          const possibleAccessToken = resp?.accessToken || resp?.token || resp?.data?.accessToken || resp?.data?.token || resp?.tokens?.accessToken;
          const possibleRefreshToken = resp?.refreshToken || resp?.data?.refreshToken || resp?.tokens?.refreshToken;

          if (possibleAccessToken) {
            this.setAccessToken(possibleAccessToken);
          } else {
            console.warn('AuthService - No access token found in response payload');
            this.setAccessToken(null);
          }

          if (possibleRefreshToken) {
            try { localStorage.setItem('refreshToken', possibleRefreshToken); } catch (e) { console.warn('Could not persist refresh token', e); }
            console.log('AuthService - Refresh token saved to localStorage');
          }

          if (resp?.user) {
            try { localStorage.setItem('user', JSON.stringify(resp.user)); } catch (e) { console.warn('Could not persist user', e); }
            console.log('AuthService - User info saved to localStorage');
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

  forgotPassword(email?: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/security/v1/auth/forgot-password`;
    const body = email ? { email } : {};

    return this.http.post(url, body).pipe(
      tap((response: any) => {
        console.log('Forgot password request successful:', response);
        return response;
      }),
      catchError((error: any) => {
        console.error('Forgot password error:', error);
        return throwError(() => error);
      })
    );
  }

  resetPassword(uid: string, newPassword: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/security/v1/auth/reset-password`;
    const body = { resetCode: uid, newPassword };

    return this.http.post(url, body).pipe(
      tap((response: any) => {
        console.log('Password reset successful:', response);
        return response;
      }),
      catchError((error: any) => {
        console.error('Password reset error:', error);
        return throwError(() => error);
      })
    );
  }

  validateResetToken(uid: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/security/v1/auth/validate-reset-token/${uid}`;

    return this.http.post(url, {}).pipe(
      tap((response: any) => {
        console.log('Reset token validation successful:', response);
        return response;
      }),
      catchError((error: any) => {
        console.error('Reset token validation error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout method to clear authentication data
   */
  logout(): void {
    this.setAccessToken(null);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    console.log('AuthService - User logged out, tokens cleared');
  }
}
