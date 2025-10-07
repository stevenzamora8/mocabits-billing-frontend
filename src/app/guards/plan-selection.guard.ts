import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { PlansService } from '../services/plans.service';

@Injectable({
  providedIn: 'root'
})
export class PlanSelectionGuard implements CanActivate {

  constructor(private router: Router, private plansService: PlansService) {}

  canActivate(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('PlanSelectionGuard - Checking user access to plan selection...');
      
      // Verificar el estado real del usuario desde el backend
      this.plansService.getSetupStatus().subscribe({
        next: (status: { hasActivePlan: boolean; hasCompanyInfo: boolean }) => {
          console.log('PlanSelectionGuard - User setup status:', status);

          if (!status.hasCompanyInfo) {
            // No tiene info de compañía, redirigir a setup (PRIMERO)
            console.log('PlanSelectionGuard - ❌ User missing company info - REDIRECT to setup');
            this.router.navigate(['/onboarding/setup']);
            resolve(false);
          } else if (!status.hasActivePlan) {
            // Tiene compañía pero no plan activo, permitir acceso a selección de planes (SEGUNDO)
            console.log('PlanSelectionGuard - ✅ User has company but missing plan - ALLOW access to plan selection');
            resolve(true);
          } else {
            // Tiene ambos completos, redirigir al dashboard (FINAL)
            console.log('PlanSelectionGuard - ❌ User has both complete - REDIRECT to dashboard');
            this.router.navigate(['/dashboard']);
            resolve(false);
          }
        },
        error: (error: any) => {
          console.error('PlanSelectionGuard - Error getting user setup status:', error);
          console.log('PlanSelectionGuard - ❌ API Error - REDIRECT to setup for safety');
          
          // En caso de error, redirigir al setup para que el usuario pueda completar la configuración
          this.router.navigate(['/onboarding/setup']);
          resolve(false);
        }
      });
    });
  }
}