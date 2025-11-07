import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface NavigationItem {
  path: string;
  icon: string;
  label: string;
  active: boolean;
}

export interface UserData {
  name: string;
  email: string;
  plan: string;
  totalInvoices: number;
  totalClients: number;
  totalRevenue: number;
  memberSince: string;
  lastActivity: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private currentUserSubject = new BehaviorSubject<UserData>({
    name: 'José Martínez',
    email: 'jose.martinez@mocabits.com',
    plan: 'Gratis',
    totalInvoices: 25,
    totalClients: 12,
    totalRevenue: 2450.00,
    memberSince: 'Enero 2024',
    lastActivity: 'Hace 2 horas'
  });

  private navigationItemsSubject = new BehaviorSubject<NavigationItem[]>([
    {
      path: '/dashboard/home',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
      label: 'Inicio',
      active: false
    },
    {
      path: '/dashboard/clients',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      label: 'Clientes',
      active: false
    },
    {
      path: '/dashboard/invoices',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      label: 'Facturas',
      active: false
    },
    {
      path: '/dashboard/products',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10',
      label: 'Productos',
      active: false
    },
    {
      path: '/dashboard/company',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      label: 'Mi Empresa',
      active: false
    },
    {
      path: '/dashboard/settings',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      label: 'Configuración',
      active: false
    }
  ]);

  constructor(private authService: AuthService) {
    this.loadUserData();
  }

  // Observables
  get currentUser$(): Observable<UserData> {
    return this.currentUserSubject.asObservable();
  }

  get navigationItems$(): Observable<NavigationItem[]> {
    return this.navigationItemsSubject.asObservable();
  }

  // Getters
  get currentUser(): UserData {
    return this.currentUserSubject.value;
  }

  get navigationItems(): NavigationItem[] {
    return this.navigationItemsSubject.value;
  }

  // Methods
  loadUserData(): void {
    // Cargar datos del usuario desde localStorage (guardados al hacer login)
    const savedUser = localStorage.getItem('user');
    const savedPlan = localStorage.getItem('selectedPlan');
    
    let userData: Partial<UserData> = {};
    
    if (savedUser) {
      try {
        const userInfo = JSON.parse(savedUser);
        console.log('DashboardService - Loaded user from localStorage:', userInfo);
        
        // Mapear datos del usuario desde la respuesta del login
        userData = {
          name: this.extractUserName(userInfo),
          email: userInfo.email || userInfo.username || 'usuario@ejemplo.com',
          // Mantener valores por defecto para campos no disponibles en el login
          totalInvoices: 0,
          totalClients: 0,
          totalRevenue: 0,
          memberSince: this.formatMemberSince(userInfo.createdAt || userInfo.created_at),
          lastActivity: 'Ahora'
        };
      } catch (error) {
        console.warn('DashboardService - Error parsing user data from localStorage:', error);
      }
    }
    
    // Aplicar plan seleccionado si existe
    if (savedPlan) {
      userData.plan = savedPlan;
    } else {
      userData.plan = 'Gratis'; // Plan por defecto
    }
    
    // Actualizar el usuario con los datos cargados
    const currentUser = this.currentUserSubject.value;
    this.currentUserSubject.next({
      ...currentUser,
      ...userData
    });
    
    console.log('DashboardService - User data updated:', this.currentUserSubject.value);
  }

  /**
   * Extrae el nombre del usuario desde los datos guardados
   */
  private extractUserName(userInfo: any): string {
    // Intentar diferentes campos para el nombre
    if (userInfo.firstName && userInfo.lastName) {
      return `${userInfo.firstName} ${userInfo.lastName}`;
    }
    
    if (userInfo.first_name && userInfo.last_name) {
      return `${userInfo.first_name} ${userInfo.last_name}`;
    }
    
    if (userInfo.name) {
      return userInfo.name;
    }
    
    if (userInfo.fullName) {
      return userInfo.fullName;
    }
    
    // Si no hay nombre disponible, usar parte del email
    if (userInfo.email) {
      const emailPart = userInfo.email.split('@')[0];
      return emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
    }
    
    return 'Usuario';
  }

  /**
   * Formatea la fecha de registro del usuario
   */
  private formatMemberSince(createdAt?: string): string {
    if (!createdAt) {
      return new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }
    
    try {
      const date = new Date(createdAt);
      return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    } catch (error) {
      return new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }
  }

  updateActiveNavigation(currentPath: string): void {
    const items = this.navigationItems.map(item => ({
      ...item,
      active: currentPath.startsWith(item.path)
    }));
    this.navigationItemsSubject.next(items);
  }

  updateUserStats(stats: Partial<UserData>): void {
    const currentUser = this.currentUserSubject.value;
    this.currentUserSubject.next({
      ...currentUser,
      ...stats
    });
  }

  /**
   * Actualiza los datos del usuario (llamar después de login exitoso)
   */
  refreshUserData(): void {
    this.loadUserData();
  }

  /**
   * Actualiza los datos del usuario con información específica
   */
  updateUserData(userData: Partial<UserData>): void {
    const currentUser = this.currentUserSubject.value;
    this.currentUserSubject.next({
      ...currentUser,
      ...userData
    });
  }

  logout(): void {
    // Limpiar tokens de autenticación usando AuthService (método local)
    this.authService.logoutLocal();
    
    // Limpiar datos del dashboard
    localStorage.removeItem('selectedPlan');
    
    // Reset user data
    this.currentUserSubject.next({
      name: 'Usuario',
      email: '',
      plan: 'Gratis',
      totalInvoices: 0,
      totalClients: 0,
      totalRevenue: 0,
      memberSince: '',
      lastActivity: ''
    });
  }

  /**
   * Logout with server notification
   * Returns Observable for components that need to handle the async operation
   */
  logoutWithServer(): Observable<any> {
    return this.authService.logout().pipe(
      tap(() => {
        // Limpiar datos del dashboard
        localStorage.removeItem('selectedPlan');
        
        // Reset user data
        this.currentUserSubject.next({
          name: 'Usuario',
          email: '',
          plan: 'Gratis',
          totalInvoices: 0,
          totalClients: 0,
          totalRevenue: 0,
          memberSince: '',
          lastActivity: ''
        });
      })
    );
  }
}
