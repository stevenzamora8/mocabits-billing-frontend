import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

export interface ErrorInfo {
  code: string;
  message: string;
  userMessage: string;
  type: 'auth' | 'billing' | 'mail' | 'general';
  severity: 'error' | 'warning' | 'info';
  shouldRetry: boolean;
  requiresAuth: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  private readonly errorMap = new Map<string, ErrorInfo>([
    // Errores de Autenticación
    ['AUTH_TOKEN_MISSING', {
      code: 'AUTH_TOKEN_MISSING',
      message: 'Token de autenticación faltante',
      userMessage: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      type: 'auth',
      severity: 'error',
      shouldRetry: false,
      requiresAuth: true
    }],
    ['AUTH_TOKEN_INVALID', {
      code: 'AUTH_TOKEN_INVALID',
      message: 'Token de autenticación inválido',
      userMessage: 'Tu sesión no es válida. Por favor, inicia sesión nuevamente.',
      type: 'auth',
      severity: 'error',
      shouldRetry: false,
      requiresAuth: true
    }],
    ['AUTH_TOKEN_EXPIRED', {
      code: 'AUTH_TOKEN_EXPIRED',
      message: 'Token de autenticación expirado',
      userMessage: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      type: 'auth',
      severity: 'warning',
      shouldRetry: false,
      requiresAuth: true
    }],
    ['AUTH_USER_NOT_FOUND_IN_TOKEN', {
      code: 'AUTH_USER_NOT_FOUND_IN_TOKEN',
      message: 'Usuario no encontrado en el token',
      userMessage: 'Hubo un problema con tu sesión. Por favor, inicia sesión nuevamente.',
      type: 'auth',
      severity: 'error',
      shouldRetry: false,
      requiresAuth: true
    }],
    ['AUTH_INVALID_USER_ID', {
      code: 'AUTH_INVALID_USER_ID',
      message: 'ID de usuario inválido',
      userMessage: 'Datos de sesión incorrectos. Por favor, inicia sesión nuevamente.',
      type: 'auth',
      severity: 'error',
      shouldRetry: false,
      requiresAuth: true
    }],
    ['AUTH_JWT_CONTEXT_ERROR', {
      code: 'AUTH_JWT_CONTEXT_ERROR',
      message: 'Error en el contexto JWT',
      userMessage: 'Error de autenticación. Intenta nuevamente en unos momentos.',
      type: 'auth',
      severity: 'error',
      shouldRetry: true,
      requiresAuth: false
    }],
    ['AUTH_CREDENTIALS_INVALID', {
      code: 'AUTH_CREDENTIALS_INVALID',
      message: 'Credenciales inválidas',
      userMessage: 'Email o contraseña incorrectos. Por favor, verifica tus datos.',
      type: 'auth',
      severity: 'error',
      shouldRetry: false,
      requiresAuth: false
    }],

    // Errores de Facturación
    ['BILLING_USER_ALREADY_HAS_PLAN', {
      code: 'BILLING_USER_ALREADY_HAS_PLAN',
      message: 'Usuario ya tiene un plan activo',
      userMessage: 'Ya tienes un plan activo. Para cambiar de plan, cancela el actual primero.',
      type: 'billing',
      severity: 'warning',
      shouldRetry: false,
      requiresAuth: false
    }],
    ['BILLING_PLAN_NOT_FOUND', {
      code: 'BILLING_PLAN_NOT_FOUND',
      message: 'Plan no encontrado',
      userMessage: 'El plan solicitado no está disponible. Por favor, selecciona otro plan.',
      type: 'billing',
      severity: 'error',
      shouldRetry: false,
      requiresAuth: false
    }],
    ['BILLING_PLAN_NOT_AVAILABLE', {
      code: 'BILLING_PLAN_NOT_AVAILABLE',
      message: 'Plan no disponible',
      userMessage: 'Este plan no está disponible actualmente. Te mostraremos otras opciones.',
      type: 'billing',
      severity: 'warning',
      shouldRetry: false,
      requiresAuth: false
    }],
    ['BILLING_COMPANY_ALREADY_EXISTS', {
      code: 'BILLING_COMPANY_ALREADY_EXISTS',
      message: 'Empresa ya registrada',
      userMessage: 'Ya existe una empresa registrada con este RUC. Verifica los datos.',
      type: 'billing',
      severity: 'error',
      shouldRetry: false,
      requiresAuth: false
    }],
    ['BILLING_COMPANY_NOT_FOUND', {
      code: 'BILLING_COMPANY_NOT_FOUND',
      message: 'Empresa no encontrada',
      userMessage: 'No se encontraron datos de tu empresa. Necesitas completar el registro.',
      type: 'billing',
      severity: 'warning',
      shouldRetry: false,
      requiresAuth: false
    }],
    ['BILLING_INVALID_RUC', {
      code: 'BILLING_INVALID_RUC',
      message: 'RUC inválido',
      userMessage: 'El RUC ingresado no tiene un formato válido. Debe tener 13 dígitos.',
      type: 'billing',
      severity: 'error',
      shouldRetry: false,
      requiresAuth: false
    }],
    ['BILLING_INVALID_DIGITAL_SIGNATURE', {
      code: 'BILLING_INVALID_DIGITAL_SIGNATURE',
      message: 'Firma digital inválida',
      userMessage: 'El archivo de firma digital no es válido. Por favor, sube un archivo .p12 correcto.',
      type: 'billing',
      severity: 'error',
      shouldRetry: false,
      requiresAuth: false
    }],
    ['BILLING_DIGITAL_SIGNATURE_PASSWORD_REQUIRED', {
      code: 'BILLING_DIGITAL_SIGNATURE_PASSWORD_REQUIRED',
      message: 'Se requiere contraseña de firma',
      userMessage: 'Ingresa la contraseña de tu firma digital para continuar.',
      type: 'billing',
      severity: 'warning',
      shouldRetry: false,
      requiresAuth: false
    }],
    ['BILLING_DIGITAL_SIGNATURE_TOO_LARGE', {
      code: 'BILLING_DIGITAL_SIGNATURE_TOO_LARGE',
      message: 'Archivo demasiado grande',
      userMessage: 'El archivo de firma digital es demasiado grande. El límite es de 5MB.',
      type: 'billing',
      severity: 'error',
      shouldRetry: false,
      requiresAuth: false
    }],
    ['BILLING_SETUP_INCOMPLETE', {
      code: 'BILLING_SETUP_INCOMPLETE',
      message: 'Configuración incompleta',
      userMessage: 'Completa la configuración de tu empresa para continuar.',
      type: 'billing',
      severity: 'warning',
      shouldRetry: false,
      requiresAuth: false
    }],
    ['BILLING_RATE_LIMIT_EXCEEDED', {
      code: 'BILLING_RATE_LIMIT_EXCEEDED',
      message: 'Límite de peticiones excedido',
      userMessage: 'Has realizado demasiadas peticiones. Espera un momento y vuelve a intentar.',
      type: 'billing',
      severity: 'warning',
      shouldRetry: true,
      requiresAuth: false
    }],

    // Errores de Correo
    ['MAIL_SEND_FAILED', {
      code: 'MAIL_SEND_FAILED',
      message: 'Error enviando correo',
      userMessage: 'No pudimos enviar el correo. Verifica tu dirección e intenta nuevamente.',
      type: 'mail',
      severity: 'error',
      shouldRetry: true,
      requiresAuth: false
    }],
    ['MAIL_INVALID_RECIPIENT', {
      code: 'MAIL_INVALID_RECIPIENT',
      message: 'Destinatario inválido',
      userMessage: 'La dirección de correo no es válida. Verifica que esté bien escrita.',
      type: 'mail',
      severity: 'error',
      shouldRetry: false,
      requiresAuth: false
    }],
    ['MAIL_TEMPLATE_NOT_FOUND', {
      code: 'MAIL_TEMPLATE_NOT_FOUND',
      message: 'Plantilla no encontrada',
      userMessage: 'Error interno del sistema. Contacta al soporte técnico.',
      type: 'mail',
      severity: 'error',
      shouldRetry: true,
      requiresAuth: false
    }],

    // Errores Generales
    ['BILLING_DATABASE_ERROR', {
      code: 'BILLING_DATABASE_ERROR',
      message: 'Error de base de datos',
      userMessage: 'Error temporal del sistema. Intenta nuevamente en unos momentos.',
      type: 'general',
      severity: 'error',
      shouldRetry: true,
      requiresAuth: false
    }],
    ['BILLING_FILE_PROCESSING_ERROR', {
      code: 'BILLING_FILE_PROCESSING_ERROR',
      message: 'Error procesando archivo',
      userMessage: 'No pudimos procesar el archivo. Verifica que sea válido e intenta nuevamente.',
      type: 'general',
      severity: 'error',
      shouldRetry: true,
      requiresAuth: false
    }],
    ['BILLING_JSON_PARSING_ERROR', {
      code: 'BILLING_JSON_PARSING_ERROR',
      message: 'Error analizando JSON',
      userMessage: 'Error en la comunicación con el servidor. Intenta nuevamente.',
      type: 'general',
      severity: 'error',
      shouldRetry: true,
      requiresAuth: false
    }],
    ['BILLING_MISSING_REQUIRED_FIELD', {
      code: 'BILLING_MISSING_REQUIRED_FIELD',
      message: 'Campo requerido faltante',
      userMessage: 'Completa todos los campos obligatorios para continuar.',
      type: 'general',
      severity: 'error',
      shouldRetry: false,
      requiresAuth: false
    }],
    ['BILLING_INVALID_FIELD_FORMAT', {
      code: 'BILLING_INVALID_FIELD_FORMAT',
      message: 'Formato de campo inválido',
      userMessage: 'Algunos datos tienen un formato incorrecto. Revisa e intenta nuevamente.',
      type: 'general',
      severity: 'error',
      shouldRetry: false,
      requiresAuth: false
    }]
  ]);

  constructor(private router: Router) {}

  /**
   * Maneja errores HTTP y devuelve información amigable para el usuario
   */
  handleError(error: HttpErrorResponse): ErrorInfo {
    // Extraer código de error de la respuesta
    const errorCode = this.extractErrorCode(error);
    
    // Buscar información del error
    const errorInfo = this.errorMap.get(errorCode);
    
    if (errorInfo) {
      // Manejar errores de autenticación automáticamente
      if (errorInfo.requiresAuth) {
        this.handleAuthError();
      }
      
      return errorInfo;
    }

    // Error no mapeado - devolver información genérica
    return this.getGenericError(error);
  }

  /**
   * Extrae el código de error de la respuesta HTTP
   */
  private extractErrorCode(error: HttpErrorResponse): string {
    if (error.error && typeof error.error === 'object') {
      // Estructura estándar de la API
      return error.error.code || 'UNKNOWN_ERROR';
    }
    
    if (error.error && typeof error.error === 'string') {
      // Error como string
      return error.error;
    }

    // Mapear códigos HTTP a códigos internos
    switch (error.status) {
      case 401:
        return 'AUTH_TOKEN_INVALID';
      case 403:
        return 'BILLING_OPERATION_NOT_ALLOWED';
      case 404:
        return 'RESOURCE_NOT_FOUND';
      case 429:
        return 'BILLING_RATE_LIMIT_EXCEEDED';
      case 500:
        return 'INTERNAL_SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  /**
   * Devuelve información de error genérico
   */
  private getGenericError(error: HttpErrorResponse): ErrorInfo {
    let userMessage = 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.';
    let shouldRetry = true;

    switch (error.status) {
      case 0:
        userMessage = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
        shouldRetry = true;
        break;
      case 400:
        userMessage = 'Los datos enviados son incorrectos. Revisa la información.';
        shouldRetry = false;
        break;
      case 401:
        userMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        shouldRetry = false;
        break;
      case 403:
        userMessage = 'No tienes permisos para realizar esta acción.';
        shouldRetry = false;
        break;
      case 404:
        userMessage = 'El recurso solicitado no se encontró.';
        shouldRetry = false;
        break;
      case 429:
        userMessage = 'Has realizado demasiadas peticiones. Espera un momento.';
        shouldRetry = true;
        break;
      case 500:
        userMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
        shouldRetry = true;
        break;
    }

    return {
      code: 'GENERIC_ERROR',
      message: error.message || 'Error desconocido',
      userMessage,
      type: 'general',
      severity: 'error',
      shouldRetry,
      requiresAuth: error.status === 401
    };
  }

  /**
   * Maneja errores de autenticación limpiando la sesión
   */
  private handleAuthError(): void {
    // Limpiar tokens de localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Redirigir a login después de un pequeño delay para mostrar el mensaje
    setTimeout(() => {
      this.router.navigate(['/login'], { 
        queryParams: { sessionExpired: 'true' } 
      });
    }, 2000);
  }

  /**
   * Determina si un error debería reintentar automáticamente
   */
  shouldRetryError(errorCode: string): boolean {
    const errorInfo = this.errorMap.get(errorCode);
    return errorInfo?.shouldRetry || false;
  }

  /**
   * Obtiene los códigos de error que son temporales
   */
  getTemporaryErrorCodes(): string[] {
    return Array.from(this.errorMap.entries())
      .filter(([_, info]) => info.shouldRetry)
      .map(([code]) => code);
  }

  /**
   * Obtiene mensaje amigable para el usuario
   */
  getUserMessage(errorCode: string): string {
    const errorInfo = this.errorMap.get(errorCode);
    return errorInfo?.userMessage || 'Ha ocurrido un error inesperado.';
  }

  /**
   * Obtiene el tipo de severidad del error
   */
  getErrorSeverity(errorCode: string): 'error' | 'warning' | 'info' {
    const errorInfo = this.errorMap.get(errorCode);
    return errorInfo?.severity || 'error';
  }
}