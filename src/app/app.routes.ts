import { Routes } from '@angular/router';
import { SetupGuard } from './guards/setup.guard';
import { AuthGuard } from './guards/auth.guard';
import { PlanSelectionGuard } from './guards/plan-selection.guard';
import { DashboardGuard } from './guards/dashboard.guard';

export const routes: Routes = [
  {
    path: 'test-simple',
    loadComponent: () => import('./pages/auth/reset-password-form/reset-password-form.component').then(m => m.ResetPasswordFormComponent),
    title: 'Test Simple'
  },
  {
    path: 'reset-password/:uid',
    loadComponent: () => import('./pages/auth/reset-password-form/reset-password-form.component').then(m => m.ResetPasswordFormComponent),
    title: 'MocaBits - Restablecer Contraseña'
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'plan-selection',
    loadComponent: () => import('./pages/plan-selection/plan-selection.component').then(m => m.PlanSelectionComponent),
    canActivate: [AuthGuard, PlanSelectionGuard],
    title: 'MocaBits - Seleccionar Plan'
  },
  {
    path: 'setup',
    loadComponent: () => import('./pages/setup/setup.component').then(m => m.SetupComponent),
    canActivate: [AuthGuard, SetupGuard],
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
    canActivate: [AuthGuard, DashboardGuard],
    title: 'MocaBits - Dashboard'
  },
  { path: '**', redirectTo: '/auth/login' }
];
