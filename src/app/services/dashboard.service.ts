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
    const savedPlan = localStorage.getItem('selectedPlan');
    if (savedPlan) {
      const currentUser = this.currentUserSubject.value;
      this.currentUserSubject.next({
        ...currentUser,
        plan: savedPlan
      });
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
