import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): boolean {
    const isAuthenticated = this.authService.isAuthenticated();

    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      console.log('AuthGuard - User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Usuario autenticado, permitir acceso
    return true;
  }
}
