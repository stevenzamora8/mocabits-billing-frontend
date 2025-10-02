# Manejo de Errores de Autenticación

## Resumen

El sistema de autenticación del frontend incluye un manejo personalizado de errores que transforma los códigos de error del backend en mensajes amigables para el usuario.

## Arquitectura

### Estrategia de Manejo de Errores

El sistema utiliza una **estrategia basada únicamente en códigos de error** del backend, sin depender del contenido específico de los mensajes. Esto garantiza:

- **Robustez**: Los cambios en los mensajes del backend no afectan la funcionalidad
- **Mantenibilidad**: Mensajes centralizados y consistentes
- **Escalabilidad**: Fácil agregar nuevos códigos de error

### Componentes Principales

1. **`AuthErrorHandlerService`** - Servicio que mapea códigos de error a mensajes personalizados
2. **`AuthErrorInterceptor`** - Interceptor HTTP que captura errores de autenticación
3. **`auth-errors.constants.ts`** - Constantes centralizadas de mensajes de error

### Flujo de Manejo de Errores

```
Error HTTP 401 → AuthErrorInterceptor → AuthErrorHandlerService → Mensaje Personalizado → UI
```

## Códigos de Error Soportados

### `AUTH_CREDENTIALS_INVALID` (HTTP 401)
- **Mensaje al Usuario**: "El email o la contraseña que ingresaste no son correctos. Por favor, verifica e intenta nuevamente."
- **Descripción**: Credenciales incorrectas (usuario no existe, contraseña errónea, formato inválido, etc.)

### `AUTH_TOKEN_MISSING` (HTTP 401)
- **Mensaje al Usuario**: "Hubo un problema con la autenticación. Por favor, intenta iniciar sesión nuevamente."
- **Descripción**: Problemas con el header de autorización (faltante, formato incorrecto, etc.)

### `AUTH_USER_NOT_FOUND` (HTTP 401)
- **Mensaje al Usuario**: "No encontramos una cuenta con ese email. ¿Quizás te registraste con otro email?"
- **Descripción**: El usuario especificado no existe en la base de datos

## Errores Generales

### Errores de Red (Status 0)
- **Mensaje**: "Parece que hay un problema de conexión. Revisa tu internet e intenta de nuevo."

### Errores del Servidor (Status 5xx)
- **Mensaje**: "Estamos teniendo problemas técnicos. Por favor, intenta en unos minutos."

### Errores Inesperados
- **Mensaje**: "Algo salió mal. Por favor, intenta de nuevo o contacta a soporte si el problema persiste."

## Errores de Sesión

### Sesión Expirada (HTTP 401 en requests autenticados)
- **Mensaje**: "Tu sesión ha expirado por seguridad. Por favor, inicia sesión nuevamente."

### Sin Permisos (HTTP 403)
- **Mensaje**: "No tienes permisos para acceder a esta sección."

## Uso en Componentes

Los componentes que usan autenticación automáticamente reciben los mensajes personalizados:

```typescript
// En login-form.component.ts
this.authService.login(email, password).subscribe({
  next: (result) => {
    // Login exitoso
  },
  error: (error: any) => {
    // error.error.message contiene el mensaje personalizado
    this.showAlert(error.error?.message || 'Error desconocido', 'danger');
  }
});
```

## Agregar Nuevos Mensajes de Error

### 1. Agregar Código de Error
Agregar el nuevo código en `AUTH_ERROR_CODES`:

```typescript
export const AUTH_ERROR_CODES = {
  // ... códigos existentes
  NEW_ERROR_CODE: 'NEW_ERROR_CODE'
} as const;
```

### 2. Agregar Mensaje Personalizado
Agregar el mensaje correspondiente en `AUTH_ERROR_MESSAGES`:

```typescript
export const AUTH_ERROR_MESSAGES = {
  // ... mensajes existentes
  NEW_ERROR_MESSAGE: 'Mensaje personalizado para el nuevo error.'
} as const;
```

### 3. Actualizar el Handler
Modificar `AuthErrorHandlerService.handleLoginError()` para manejar el nuevo código:

```typescript
case AUTH_ERROR_CODES.NEW_ERROR_CODE:
  return AUTH_ERROR_MESSAGES.NEW_ERROR_MESSAGE;
```

## Testing

Para probar los mensajes de error, puedes simular respuestas del backend con diferentes códigos de error en las herramientas de desarrollo del navegador.

## Mejores Prácticas para Mensajes de Error

### Principios de Mensajes Amigables

1. **Empatía**: Usa un tono amable y comprensivo
2. **Acción Clara**: Indica qué puede hacer el usuario para resolver el problema
3. **Evita Jerga Técnica**: No uses términos técnicos que confundan al usuario
4. **Sé Específico**: Da pistas sobre qué pudo salir mal
5. **Ofrece Ayuda**: Sugiere soluciones o contactar soporte cuando sea apropiado

### Ejemplos de Transformación

| Mensaje Técnico | Mensaje Amigable |
|-----------------|------------------|
| "AUTH_CREDENTIALS_INVALID" | "El email o la contraseña que ingresaste no son correctos. Por favor, verifica e intenta nuevamente." |
| "Error 500" | "Estamos teniendo problemas técnicos. Por favor, intenta en unos minutos." |
| "Network Error" | "Parece que hay un problema de conexión. Revisa tu internet e intenta de nuevo." |

### Estrategia de Mensaje por Tipo de Error

- **Credenciales**: Sugiere verificar y reintentar
- **Usuario no encontrado**: Ofrece ayuda recordando registro
- **Problemas técnicos**: Tranquiliza y pide paciencia
- **Conexión**: Guía sobre qué verificar
- **Sesión expirada**: Explica por seguridad y pide re-login

## Mantenimiento

- Los mensajes están centralizados en `auth-errors.constants.ts` para facilitar cambios
- El interceptor maneja automáticamente todos los endpoints de autenticación
- **No depende del contenido de los mensajes del backend**, solo de los códigos de error
- Los logs incluyen tanto el mensaje original como el personalizado para debugging
- Cambios en los mensajes del backend no afectan la funcionalidad del frontend