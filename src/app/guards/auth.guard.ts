import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(): boolean {
    const selectedPlan = localStorage.getItem('selectedPlan');
    const setupCompleted = localStorage.getItem('setupCompleted');
    
    // Si no ha seleccionado plan, redirigir al login
    if (!selectedPlan) {
      this.router.navigate(['/login']);
      return false;
    }
    
    // Si ha seleccionado plan pero no ha completado la configuración, redirigir a setup
    if (selectedPlan && !setupCompleted) {
      this.router.navigate(['/setup']);
      return false;
    }
    
    // Si tiene plan y configuración completa, permitir acceso
    return true;
  }
}
