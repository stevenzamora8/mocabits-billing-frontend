import { Routes } from '@angular/router';
import { SetupGuard } from './guards/setup.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'MocaBits - Iniciar Sesión'
  },
  { 
    path: 'forgot-password', 
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    title: 'MocaBits - Recuperar Contraseña'
  },
  { 
    path: 'create-user', 
    loadComponent: () => import('./pages/create-user/create-user.component').then(m => m.CreateUserComponent),
    title: 'MocaBits - Crear Cuenta'
  },
  { 
    path: 'plan-selection', 
    loadComponent: () => import('./pages/plan-selection/plan-selection.component').then(m => m.PlanSelectionComponent),
    title: 'MocaBits - Seleccionar Plan'
  },
  { 
    path: 'setup', 
    loadComponent: () => import('./pages/setup/setup.component').then(m => m.SetupComponent),
    canActivate: [SetupGuard],
    title: 'MocaBits - Configuración Inicial'
  },
  { 
    path: 'setup-direct', 
    loadComponent: () => import('./pages/setup/setup.component').then(m => m.SetupComponent),
    title: 'MocaBits - Configuración Inicial (Directo)'
  },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule),
    title: 'MocaBits - Dashboard'
  },
  { path: '**', redirectTo: '/login' }
];
