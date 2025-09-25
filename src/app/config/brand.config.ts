/**
 * CONFIGURACIÓN DE BRANDING - MOCABITS
 * 
 * Este archivo centraliza toda la información de marca de la aplicación.
 * Cuando compres tu logo personalizado, solo necesitas actualizar este archivo.
 */

export interface BrandConfig {
  name: string;
  subtitle: string;
  tagline: string;
  description: string;
  version: string;
  logo: {
    useCustomImage: boolean;
    imagePath?: string;
    svgConfig?: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      textColor: string;
    };
  };
}

export const BRAND_CONFIG: BrandConfig = {
  // INFORMACIÓN BÁSICA DE LA MARCA
  name: 'MocaBits',
  subtitle: 'Sistema de Facturación Inteligente',
  tagline: 'Facturación Inteligente • Gestión Simplificada',
  description: 'Sistema de Facturación Electrónica Empresarial',
  version: 'v1.0.0',

  // CONFIGURACIÓN DEL LOGO
  logo: {
    // Cambiar a true cuando tengas tu logo personalizado
    useCustomImage: false,
    
    // Ruta de tu logo personalizado (descomenta cuando lo tengas)
    // imagePath: '/assets/images/logo.png',
    
    // Configuración del SVG temporal (se usa cuando useCustomImage = false)
    svgConfig: {
      primaryColor: '#1e3a8a',
      secondaryColor: '#3b82f6', 
      accentColor: '#374151',
      textColor: 'white'
    }
  }
};

/**
 * INSTRUCCIONES PARA USAR TU LOGO PERSONALIZADO:
 * 
 * 1. Coloca tu logo en: src/assets/images/logo.png
 * 2. Cambia useCustomImage a true
 * 3. Descomenta y ajusta imagePath si es necesario
 * 4. Actualiza name, subtitle, tagline según tu marca
 * 
 * FORMATOS RECOMENDADOS PARA EL LOGO:
 * - PNG con fondo transparente
 * - SVG (ideal para escalabilidad)
 * - Tamaño mínimo: 100x100px
 * - Formato cuadrado o circular preferiblemente
 */