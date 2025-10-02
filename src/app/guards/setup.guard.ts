import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { PlansService } from '../services/plans.service';

@Injectable({
  providedIn: 'root'
})
export class SetupGuard implements CanActivate {

  constructor(private router: Router, private plansService: PlansService) {}

  canActivate(): Promise<boolean> {
    return new Promise((resolve) => {
      // Verificar el estado real del usuario desde el backend
      this.plansService.getUserSetupStatus().subscribe({
        next: (status: { hasActivePlan: boolean; hasCompanyInfo: boolean }) => {
          console.log('SetupGuard - User setup status:', status);

          if (!status.hasCompanyInfo) {
            // No tiene info de compañía, permitir acceso a setup (PRIMERO)
            resolve(true);
          } else if (!status.hasActivePlan) {
            // Tiene compañía pero no plan activo, redirigir a selección de planes (SEGUNDO)
            this.router.navigate(['/plan-selection']);
            resolve(false);
          } else {
            // Tiene ambos completos, redirigir al dashboard (FINAL)
            this.router.navigate(['/dashboard']);
            resolve(false);
          }
        },
        error: (error: any) => {
          console.error('SetupGuard - Error getting user setup status:', error);
          // En caso de error, permitir acceso al setup por defecto (para permitir configuración inicial)
          resolve(true);
        }
      });
    });
  }
}
