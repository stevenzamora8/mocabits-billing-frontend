import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { DashboardGuard } from '../../guards/dashboard.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard, DashboardGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
        title: 'Dashboard - Inicio'
      },
      {
        path: 'clients',
        loadComponent: () => import('./clients/clients.component').then(m => m.ClientsComponent),
        title: 'Dashboard - Clientes'
      },
      {
        path: 'invoices',
        loadChildren: () => import('./invoices/invoices-routing.module').then(m => m.InvoicesRoutingModule),
        title: 'Dashboard - Facturas'
      },
      {
        path: 'products',
        loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent),
        title: 'Dashboard - Productos'
      },
      {
        path: 'company',
        loadComponent: () => import('./company/company.component').then(m => m.CompanyComponent),
        title: 'Dashboard - Mi Empresa'
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
        title: 'Dashboard - Configuración'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
