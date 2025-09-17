import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): boolean {
    const token = this.authService.getAccessToken();

    // Verificar si el usuario está autenticado
    if (!token) {
      console.log('AuthGuard - No authentication token found, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }

    // Usuario autenticado, permitir acceso
    return true;
  }
}
