import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthErrorHandlerService } from './auth-error-handler.service';

/**
 * AuthErrorInterceptor
 * Interceptor que maneja errores específicos de autenticación
 */
@Injectable()
export class AuthErrorInterceptor implements HttpInterceptor {

  constructor(private authErrorHandler: AuthErrorHandlerService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Solo manejar errores de endpoints de autenticación
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