import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BrandService } from '../../../services/brand.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css']
})
export class AuthLayoutComponent implements OnInit, OnDestroy {
  // Propiedades de branding con valores por defecto
  brandName: string = 'MocaBits';
  brandSubtitle: string = 'Sistema de Facturación Inteligente';
  brandDescription: string = 'Sistema de Facturación Electrónica Empresarial';
  brandTagline: string = 'Facturación Inteligente • Gestión Simplificada';
  brandVersion: string = 'v1.0.0';
  currentYear: number = new Date().getFullYear();
  useCustomLogo: boolean = false;
  customLogoPath: string = '';

  currentRoute: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private brandService: BrandService
  ) {
    // Inicializar inmediatamente en el constructor
    this.loadBrandingConfig();
  }

  ngOnInit(): void {
    // Cargar configuración de branding nuevamente para asegurar
    this.loadBrandingConfig();

    // Detectar la ruta actual para mostrar la ilustración correspondiente
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        if (url.includes('/login')) {
          this.currentRoute = 'login';
        } else if (url.includes('/forgot-password')) {
          this.currentRoute = 'forgot-password';
        } else if (url.includes('/create-user')) {
          this.currentRoute = 'create-user';
        } else if (url.includes('/reset-password')) {
          this.currentRoute = 'reset-password';
        }
      });

    // Establecer la ruta inicial
    const currentUrl = this.router.url;
    if (currentUrl.includes('/login')) {
      this.currentRoute = 'login';
    } else if (currentUrl.includes('/forgot-password')) {
      this.currentRoute = 'forgot-password';
    } else if (currentUrl.includes('/create-user')) {
      this.currentRoute = 'create-user';
    } else if (currentUrl.includes('/reset-password')) {
      this.currentRoute = 'reset-password';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga la configuración de branding desde el servicio
   */
  private loadBrandingConfig(): void {
    try {
      // Obtener valores del servicio
      const name = this.brandService.getBrandName();
      const subtitle = this.brandService.getBrandSubtitle();
      const description = this.brandService.getBrandDescription();
      const tagline = this.brandService.getBrandTagline();
      const version = this.brandService.getBrandVersion();
      const useCustom = this.brandService.useCustomLogo();
      const customPath = this.brandService.getCustomLogoPath() || '';

      // Asignar solo si los valores no están vacíos
      if (name) this.brandName = name;
      if (subtitle) this.brandSubtitle = subtitle;
      if (description) this.brandDescription = description;
      if (tagline) this.brandTagline = tagline;
      if (version) this.brandVersion = version;
      
      this.useCustomLogo = useCustom;
      this.customLogoPath = customPath;

      console.log('Branding loaded:', {
        brandName: this.brandName,
        brandTagline: this.brandTagline,
        brandVersion: this.brandVersion
      });
    } catch (error) {
      console.error('Error loading branding config:', error);
      // Los valores por defecto ya están asignados en las propiedades
    }
  }
}