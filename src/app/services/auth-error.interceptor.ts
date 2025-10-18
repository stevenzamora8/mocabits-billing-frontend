import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthErrorHandlerService } from './auth-error-handler.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

/**
 * AuthErrorInterceptor
 * Interceptor que maneja errores específicos de autenticación y redirige cuando el token expira
 */
@Injectable()
export class AuthErrorInterceptor implements HttpInterceptor {

  constructor(
    private authErrorHandler: AuthErrorHandlerService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores 401 (Unauthorized) - token expirado o inválido
        if (error.status === 401) {
          console.warn('AuthErrorInterceptor - Token expired or invalid (401), redirecting to login');
          this.authService.logoutLocal(); // Limpiar datos de autenticación
          this.router.navigate(['/auth/login']);
          return throwError(() => error);
        }

        // Solo manejar errores de endpoints de autenticación para otros códigos
        if (this.isAuthEndpoint(request.url)) {
          const customMessage = this.authErrorHandler.handleAuthError(error);

          // Crear un nuevo error con el mensaje personalizado
          const customError = {
            ...error,
            error: {
              ...error.error,
              message: customMessage,
              originalMessage: error.error?.message
            }
          };

          console.error('Auth Error Interceptor:', customMessage);
          return throwError(() => customError);
        }

        // Para otros endpoints, devolver el error original
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica si la URL es un endpoint de autenticación
   */
  private isAuthEndpoint(url: string): boolean {
    return url.includes('/security/v1/auth/') ||
           url.includes('/auth/login') ||
           url.includes('/auth/forgot-password') ||
           url.includes('/auth/reset-password');
  }
}