import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  { 
    path: 'onboarding', 
    loadChildren: () => import('./onboarding/onboarding.module').then(m => m.OnboardingModule)
  },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    title: 'MocaBits - Dashboard'
  },
  { path: '**', redirectTo: '/auth' }
];
