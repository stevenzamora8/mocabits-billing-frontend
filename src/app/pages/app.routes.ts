import { Routes } from '@angular/router';
import { SetupGuard } from '../guards/setup.guard';
import { AuthGuard } from '../guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  { 
    path: 'plan-selection', 
    loadComponent: () => import('./plan-selection/plan-selection.component').then(m => m.PlanSelectionComponent),
    canActivate: [AuthGuard],
    title: 'MocaBits - Seleccionar Plan'
  },
  { 
    path: 'setup', 
    loadComponent: () => import('./setup/setup.component').then(m => m.SetupComponent),
    canActivate: [AuthGuard, SetupGuard],
    title: 'MocaBits - Configuración Inicial'
  },
  { 
    path: 'setup-direct', 
    loadComponent: () => import('./setup/setup.component').then(m => m.SetupComponent),
    title: 'MocaBits - Configuración Inicial (Directo)'
  },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    title: 'MocaBits - Dashboard'
  },
  { 
    path: 'reset-password/:uid', 
    loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    title: 'MocaBits - Restablecer Contraseña'
  },
  { path: '**', redirectTo: '/auth' }
];
