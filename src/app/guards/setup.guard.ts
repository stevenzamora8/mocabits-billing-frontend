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
        next: (status) => {
          console.log('SetupGuard - User setup status:', status);

          if (!status.hasActivePlan) {
            // No tiene plan activo, redirigir a selección de planes
            this.router.navigate(['/plan-selection']);
            resolve(false);
          } else if (!status.hasCompanyInfo) {
            // Tiene plan pero no info de compañía, permitir acceso a setup
            resolve(true);
          } else {
            // Tiene plan y compañía completa, redirigir al dashboard
            this.router.navigate(['/dashboard']);
            resolve(false);
          }
        },
        error: (error) => {
          console.error('SetupGuard - Error getting user setup status:', error);
          // En caso de error, permitir acceso por defecto (para evitar bloqueos)
          resolve(true);
        }
      });
    });
  }
}
