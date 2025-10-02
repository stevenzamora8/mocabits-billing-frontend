/**
 * Constantes de mensajes de error para autenticación
 * Centraliza todos los mensajes personalizados para facilitar mantenimiento
 */
export const AUTH_ERROR_MESSAGES = {
  // Errores de credenciales inválidas
  GENERIC_INVALID_CREDENTIALS: 'El email o la contraseña que ingresaste no son correctos. Por favor, verifica e intenta nuevamente.',

  // Errores de header de autorización
  GENERIC_AUTH_ERROR: 'Hubo un problema con la autenticación. Por favor, intenta iniciar sesión nuevamente.',

  // Errores de usuario no encontrado
  USER_NOT_FOUND_GENERIC: 'No encontramos una cuenta con ese email. ¿Quizás te registraste con otro email?',

  // Errores generales
  NETWORK_ERROR: 'Parece que hay un problema de conexión. Revisa tu internet e intenta de nuevo.',
  SERVER_ERROR: 'Estamos teniendo problemas técnicos. Por favor, intenta en unos minutos.',
  UNEXPECTED_ERROR: 'Algo salió mal. Por favor, intenta de nuevo o contacta a soporte si el problema persiste.',

  // Errores de sesión
  SESSION_EXPIRED: 'Tu sesión ha expirado por seguridad. Por favor, inicia sesión nuevamente.',
  UNAUTHORIZED: 'No tienes permisos para acceder a esta sección.'
} as const;

/**
 * Códigos de error del backend
 */
export const AUTH_ERROR_CODES = {
  CREDENTIALS_INVALID: 'AUTH_CREDENTIALS_INVALID',
  TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
  USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND'
} as const;