# Configuración del Setup - Nueva Funcionalidad

## Funcionalidades Agregadas

### 1. Configuración de Contribuyente (Paso 1)
- **Razón Social**: Nombre legal de la empresa
- **Nombre Comercial**: Marca o nombre comercial
- **RUC**: Registro Único de Contribuyente (validación incluida)
- **Tipo de Documento**: RUC, Cédula o Pasaporte
- **Dirección Matriz**: Dirección principal de la empresa
- **Obligado a llevar contabilidad**: Sí/No

**Validaciones implementadas:**
- RUC: 13 dígitos, validación de provincia ecuatoriana
- Campos requeridos con longitudes mínimas y máximas
- Validación en tiempo real con feedback visual

### 2. Configuración de Establecimientos (Paso 2)
- **Múltiples establecimientos**: Soporte para varios puntos de emisión
- **Código Establecimiento**: 3 dígitos (001, 002, etc.)
- **Punto de Emisión**: 3 dígitos
- **Secuencial Inicial**: 9 dígitos para numeración de facturas
- **Dirección del Establecimiento**: Ubicación física

**Características:**
- Pestañas para navegar entre establecimientos
- Botón para agregar/eliminar establecimientos
- Resumen visual de todos los establecimientos configurados
- Validación individual de cada establecimiento

### 3. Firma Electrónica y Logo (Paso 3)

#### Certificado de Firma Electrónica
- **Subida de archivo**: Acepta formatos .p12 y .pfx
- **Validaciones**:
  - Extensión de archivo correcta
  - Tamaño máximo: 5MB
  - Estructura PKCS#12 válida
  - Contraseña requerida
- **Feedback visual**: Estados de éxito, error y carga

#### Logo Empresarial
- **Dos opciones**:
  1. **Logo Temporal**: Usar el logo por defecto del sistema
  2. **Logo Personalizado**: Subir logo propio
- **Formatos soportados**: PNG, JPG, JPEG, SVG
- **Validaciones**:
  - Tamaño máximo: 2MB
  - Extensiones permitidas
  - Vista previa en tiempo real
- **Requerimientos**:
  - Tamaño mínimo: 100x100px
  - Fondo transparente (recomendado)

## Diseño y UX

### Características Visuales
- **Diseño moderno**: Gradientes y efectos de cristal (glassmorphism)
- **Responsive**: Adaptable a dispositivos móviles
- **Animaciones suaves**: Transiciones entre pasos
- **Feedback visual**: Estados de validación en tiempo real
- **Accesibilidad**: Soporte para lectores de pantalla

### Barra de Progreso
- Indicadores visuales de cada paso
- Porcentaje de completado
- Estados: activo, completado, pendiente

### Validación de Formularios
- **Validación en tiempo real**: Mientras el usuario escribe
- **Mensajes de error específicos**: Ayuda contextual
- **Estados visuales**: Campos válidos/inválidos
- **Prevención de errores**: Validación antes de continuar

## Estructura Técnica

### Componentes
- `setup.component.ts`: Lógica principal del setup
- `setup.component.html`: Template con formularios y navegación
- `setup.component.css`: Estilos modernos y responsive

### Servicios Utilizados
- `CompanyService`: Para guardar la configuración
- `BrandService`: Para manejo del logo (futuro)

### Validaciones Implementadas
- **RUC Ecuatoriano**: Validación de estructura y provincia
- **Archivos**: Tipo, tamaño y estructura
- **Formularios reactivos**: Validación en tiempo real
- **Pasos secuenciales**: No permite avanzar sin completar

## Flujo de Usuario

1. **Paso 1**: Completar datos tributarios básicos
2. **Paso 2**: Configurar al menos un establecimiento
3. **Paso 3**: Subir certificado de firma y configurar logo
4. **Finalización**: Guardar toda la configuración y redirigir

### Navegación
- **Botones de navegación**: Anterior/Continuar/Completar
- **Validación de pasos**: No permite avanzar con errores
- **Estados de carga**: Feedback durante el guardado
- **Persistencia**: Datos guardados localmente

## Datos Guardados

Al completar el setup se guarda:
```json
{
  "razonSocial": "string",
  "nombreComercial": "string", 
  "ruc": "string",
  "codDoc": "string",
  "dirMatriz": "string",
  "obligadoContabilidad": "string",
  "establecimientos": [
    {
      "estab": "001",
      "ptoEmi": "001", 
      "secuencial": "000000001",
      "dirEstablecimiento": "string"
    }
  ],
  "logoConfig": {
    "useCustomLogo": boolean,
    "logoFile": File | null
  }
}
```

## Próximas Mejoras

1. **Integración con BCE**: Validación automática de RUC
2. **Previsualización de facturas**: Con logo y datos configurados
3. **Importación masiva**: De establecimientos desde archivo
4. **Backup/Restauración**: De configuraciones
5. **Configuración avanzada**: Más opciones tributarias

## Consideraciones de Desarrollo

- El componente es **standalone** (no requiere módulo)
- Usa **formularios reactivos** para mejor validación
- Implementa **OnDestroy** para limpieza de subscripciones
- **ViewEncapsulation.None** para estilos globales
- **Debounce** en validaciones para mejor rendimiento