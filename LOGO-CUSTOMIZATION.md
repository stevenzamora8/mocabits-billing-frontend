# 🎨 GUÍA DE PERSONALIZACIÓN DE LOGO - MOCABITS

## 📋 Resumen Rápido

Este sistema está diseñado para facilitar el cambio de logo cuando compres tu diseño personalizado. Solo necesitas seguir estos pasos:

## 🚀 Cambio Rápido (Método Recomendado)

### 1. Preparar tu Logo
- **Formato**: PNG con fondo transparente (recomendado) o SVG
- **Tamaño**: Mínimo 100x100px, preferiblemente cuadrado
- **Nombre**: `logo.png` o `logo.svg`

### 2. Colocar el Logo
```
src/
  assets/
    images/
      logo.png  ← Coloca tu logo aquí
```

### 3. Activar Logo Personalizado
Edita: `src/app/config/brand.config.ts`

```typescript
export const BRAND_CONFIG: BrandConfig = {
  // ... otros campos
  logo: {
    useCustomImage: true,  // ← Cambiar de false a true
    imagePath: '/assets/images/logo.png',  // ← Descomenta esta línea
    // svgConfig: { ... }  // ← Puedes comentar esto
  }
};
```

### 4. Actualizar Textos de Marca
En el mismo archivo `brand.config.ts`:

```typescript
export const BRAND_CONFIG: BrandConfig = {
  name: 'Tu Empresa',  // ← Cambiar nombre
  subtitle: 'Tu Slogan',  // ← Cambiar subtítulo
  tagline: 'Tu Tagline',  // ← Cambiar tagline
  description: 'Descripción de tu sistema',  // ← Cambiar descripción
  version: 'v1.0.0',  // ← Actualizar versión
  // ...
};
```

¡Y listo! Tu logo aparecerá automáticamente en toda la aplicación.

---

## 🛠️ Personalización Avanzada

### Ubicaciones del Logo
Tu logo aparece en:
- ✅ Panel de login (logo principal)
- ✅ Firma de la empresa (logo pequeño)
- ✅ Cualquier futuro componente que use el BrandService

### Archivos Modificados Automáticamente
- `login.component.html` - Se actualiza con tus textos
- `login.component.css` - Se aplican los colores y tamaños
- Cualquier componente que use `BrandService`

### Variables CSS Disponibles
```css
:root {
  --brand-name: 'Tu Empresa';
  --brand-subtitle: 'Tu Slogan';
  --logo-size-main: 50px;
  --logo-size-signature: 24px;
  --logo-primary-color: #1e3a8a;
  /* ... más variables */
}
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Solo cambiar el logo (mantener colores actuales)
```typescript
logo: {
  useCustomImage: true,
  imagePath: '/assets/images/mi-logo.png'
}
```

### Caso 2: Cambiar logo y colores corporativos
```typescript
logo: {
  useCustomImage: true,
  imagePath: '/assets/images/mi-logo.png',
  svgConfig: {
    primaryColor: '#FF6B35',    // Tu color primario
    secondaryColor: '#F7931E',  // Tu color secundario
    accentColor: '#FFD23F',     // Tu color de acento
    textColor: 'white'
  }
}
```

### Caso 3: Solo cambiar textos (mantener logo SVG actual)
```typescript
name: 'Mi Empresa',
subtitle: 'Facturación Profesional',
tagline: 'Eficiencia • Precisión • Confiabilidad',
logo: {
  useCustomImage: false  // Mantener SVG con nuevos colores
}
```

---

## 🔧 Troubleshooting

### Logo no aparece
1. ✅ Verificar que el archivo existe en `src/assets/images/`
2. ✅ Confirmar que `useCustomImage: true`
3. ✅ Verificar la ruta en `imagePath`
4. ✅ Reiniciar el servidor de desarrollo (`ng serve`)

### Logo se ve muy grande/pequeño
Editar en `brand.config.ts`:
```typescript
// En las variables CSS (login.component.css)
--logo-size-main: 60px;      // Logo principal
--logo-size-signature: 28px; // Logo de firma
```

### Colores no se aplican
Los colores del `svgConfig` solo se aplican al SVG temporal. Si usas imagen personalizada, los colores vienen de tu archivo de imagen.

---

## 📁 Estructura de Archivos

```
src/
├── app/
│   ├── config/
│   │   └── brand.config.ts          ← Configuración principal
│   ├── services/
│   │   └── brand.service.ts         ← Servicio de branding
│   └── pages/login/
│       ├── login.component.ts       ← Componente actualizado
│       ├── login.component.html     ← Template con variables
│       └── login.component.css      ← Estilos parametrizados
└── assets/
    └── images/
        └── logo.png                 ← Tu logo personalizado
```

---

## 🎨 Consejos de Diseño

### Logo Ideal
- **Formato**: PNG transparente o SVG
- **Proporción**: Cuadrada (1:1) funciona mejor
- **Tamaño**: Al menos 100x100px para calidad
- **Colores**: Que contrasten bien con fondos azul y blanco

### Textos Recomendados
- **Nombre**: Corto y memorable (ej: "TuEmpresa")
- **Subtítulo**: Descriptivo (ej: "Sistema de Facturación")
- **Tagline**: Valores clave (ej: "Rápido • Seguro • Confiable")

---

## 🚀 ¿Necesitas Ayuda?

Si tienes problemas:
1. Revisa que todos los archivos estén en las ubicaciones correctas
2. Verifica la consola del navegador para errores
3. Confirma que el servidor de desarrollo esté corriendo
4. Borra caché del navegador (Ctrl+F5)

¡Tu nueva marca estará lista en minutos! 🎉