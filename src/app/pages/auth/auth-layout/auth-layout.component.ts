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
  // Propiedades de branding
  brandName: string = '';
  brandSubtitle: string = '';
  brandDescription: string = '';
  brandTagline: string = '';
  brandVersion: string = '';
  currentYear: number = new Date().getFullYear();
  useCustomLogo: boolean = false;
  customLogoPath: string = '';

  currentRoute: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private brandService: BrandService
  ) {}

  ngOnInit(): void {
    // Cargar configuración de branding
    this.brandName = this.brandService.getBrandName();
    this.brandSubtitle = this.brandService.getBrandSubtitle();
    this.brandDescription = this.brandService.getBrandDescription();
    this.brandTagline = this.brandService.getBrandTagline();
    this.brandVersion = this.brandService.getBrandVersion();
    this.useCustomLogo = this.brandService.useCustomLogo();
    this.customLogoPath = this.brandService.getCustomLogoPath() || '';

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
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}