import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { AUTH_ERROR_MESSAGES, AUTH_ERROR_CODES } from '../constants/auth-errors.constants';

/**
 * AuthErrorHandlerService
 * Maneja errores específicos de autenticación con mensajes personalizados
 */
@Injectable({
  providedIn: 'root'
})
export class AuthErrorHandlerService {

  /**
   * Maneja errores específicos del login según códigos del backend
   */
  handleLoginError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      const errorCode = error.error?.code;

      switch (errorCode) {
        case AUTH_ERROR_CODES.CREDENTIALS_INVALID:
          return AUTH_ERROR_MESSAGES.GENERIC_INVALID_CREDENTIALS;

        case AUTH_ERROR_CODES.TOKEN_MISSING:
          return AUTH_ERROR_MESSAGES.GENERIC_AUTH_ERROR;

        case AUTH_ERROR_CODES.USER_NOT_FOUND:
          return AUTH_ERROR_MESSAGES.USER_NOT_FOUND_GENERIC;

        default:
          return AUTH_ERROR_MESSAGES.GENERIC_AUTH_ERROR;
      }
    }

    // Para otros errores HTTP
    if (error.status === 0) {
      return AUTH_ERROR_MESSAGES.NETWORK_ERROR;
    }

    if (error.status >= 500) {
      return AUTH_ERROR_MESSAGES.SERVER_ERROR;
    }

    return AUTH_ERROR_MESSAGES.UNEXPECTED_ERROR;
  }

  /**
   * Maneja errores generales de autenticación
   */
  handleAuthError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return AUTH_ERROR_MESSAGES.SESSION_EXPIRED;
    }

    if (error.status === 403) {
      return AUTH_ERROR_MESSAGES.UNAUTHORIZED;
    }

    return this.handleLoginError(error);
  }
}