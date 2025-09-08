import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SetupGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const setupCompleted = localStorage.getItem('setupCompleted');
    const planSelected = localStorage.getItem('selectedPlan');

    // Si no ha seleccionado plan, redirigir a plan selection
    if (!planSelected) {
      this.router.navigate(['/plan-selection']);
      return false;
    }

    // Si ha seleccionado plan pero no ha completado setup, permitir acceso a setup
    if (planSelected && !setupCompleted) {
      return true;
    }

    // Si ya completó setup, redirigir al dashboard
    if (setupCompleted) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
