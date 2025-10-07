import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { PlansService } from '../services/plans.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardGuard implements CanActivate {

  constructor(private router: Router, private plansService: PlansService) {}

  canActivate(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('DashboardGuard - Checking user access to dashboard...');
      
      // Verificar el estado real del usuario desde el backend
      this.plansService.getSetupStatus().subscribe({
        next: (status: { hasActivePlan: boolean; hasCompanyInfo: boolean }) => {
          console.log('DashboardGuard - User setup status:', status);

          // VALIDAR: Usuario debe tener AMBOS requisitos completados
          if (status.hasActivePlan && status.hasCompanyInfo) {
            console.log('DashboardGuard - ✅ User has both plan and company info - ALLOW access to dashboard');
            resolve(true);
          } else if (!status.hasCompanyInfo) {
            console.log('DashboardGuard - ❌ User missing company info - REDIRECT to setup');
            this.router.navigate(['/onboarding/setup']);
            resolve(false);
          } else if (!status.hasActivePlan) {
            console.log('DashboardGuard - ❌ User missing active plan - REDIRECT to plan selection');
            this.router.navigate(['/onboarding/plan-selection']);
            resolve(false);
          } else {
            console.log('DashboardGuard - ❌ Unknown state - REDIRECT to setup for safety');
            this.router.navigate(['/onboarding/setup']);
            resolve(false);
          }
        },
        error: (error: any) => {
          console.error('DashboardGuard - Error getting user setup status:', error);
          console.log('DashboardGuard - ❌ API Error - REDIRECT to setup for safety');
          
          // En caso de error, redirigir al setup para que el usuario pueda completar la configuración
          this.router.navigate(['/onboarding/setup']);
          resolve(false);
        }
      });
    });
  }
}