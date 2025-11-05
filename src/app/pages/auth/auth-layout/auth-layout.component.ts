import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css']
})
export class AuthLayoutComponent implements OnInit {
  // ===== BRAND CONFIGURATION =====
  brandName = 'MocaBits';
  brandSubtitle = '+ que un software empresarial';
  brandDescription = 'Gestiona tu empresa con inteligencia artificial, automatización avanzada y análisis en tiempo real. La plataforma integral que necesitas para hacer crecer tu negocio.';
  brandTagline = 'Facturación Inteligente • Gestión Simplificada';
  brandVersion = 'v1.0.0';

  constructor() {}

  ngOnInit(): void {
    // Component initialization logic if needed
  }

  // ===== COMPUTED PROPERTIES =====
  get currentYear(): number {
    return new Date().getFullYear();
  }
}