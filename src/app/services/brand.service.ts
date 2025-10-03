import { Injectable } from '@angular/core';
import { BRAND_CONFIG, BrandConfig } from '../config/brand.config';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private config: BrandConfig = BRAND_CONFIG;

  constructor() {
    // Aplicar variables CSS dinámicamente
    this.applyCSSVariables();
    console.log('BrandService initialized with config:', this.config);
  }

  /**
   * Obtiene la configuración completa de la marca
   */
  getBrandConfig(): BrandConfig {
    return this.config;
  }

  /**
   * Obtiene el nombre de la marca
   */
  getBrandName(): string {
    return this.config.name;
  }

  /**
   * Obtiene el subtítulo de la marca
   */
  getBrandSubtitle(): string {
    return this.config.subtitle;
  }

  /**
   * Obtiene el tagline de la marca
   */
  getBrandTagline(): string {
    return this.config.tagline;
  }

  /**
   * Obtiene la descripción de la marca
   */
  getBrandDescription(): string {
    return this.config.description;
  }

  /**
   * Obtiene la versión de la aplicación
   */
  getBrandVersion(): string {
    return this.config.version;
  }

  /**
   * Verifica si debe usar imagen personalizada para el logo
   */
  useCustomLogo(): boolean {
    return this.config.logo.useCustomImage;
  }

  /**
   * Obtiene la ruta de la imagen del logo personalizado
   */
  getCustomLogoPath(): string | undefined {
    return this.config.logo.imagePath;
  }

  /**
   * Obtiene la configuración del SVG temporal
   */
  getSvgConfig() {
    return this.config.logo.svgConfig;
  }

  /**
   * Aplica las variables CSS basadas en la configuración
   */
  private applyCSSVariables(): void {
    const root = document.documentElement;
    
    // Aplicar variables de texto
    root.style.setProperty('--brand-name', `'${this.config.name}'`);
    root.style.setProperty('--brand-subtitle', `'${this.config.subtitle}'`);
    root.style.setProperty('--brand-tagline', `'${this.config.tagline}'`);
    root.style.setProperty('--brand-description', `'${this.config.description}'`);
    root.style.setProperty('--brand-version', `'${this.config.version}'`);

    // Aplicar variables de color del logo si existe configuración SVG
    if (this.config.logo.svgConfig) {
      root.style.setProperty('--logo-primary-color', this.config.logo.svgConfig.primaryColor);
      root.style.setProperty('--logo-secondary-color', this.config.logo.svgConfig.secondaryColor);
      root.style.setProperty('--logo-accent-color', this.config.logo.svgConfig.accentColor);
      root.style.setProperty('--logo-text-color', this.config.logo.svgConfig.textColor);
    }
  }

  /**
   * Actualiza la configuración dinámicamente (útil para testing o cambios en runtime)
   */
  updateBrandConfig(newConfig: Partial<BrandConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.applyCSSVariables();
  }
}