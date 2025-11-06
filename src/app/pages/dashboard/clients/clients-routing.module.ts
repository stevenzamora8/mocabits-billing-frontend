import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./clients.component').then(m => m.ClientsComponent),
    title: 'Dashboard - Lista de Clientes'
  },
  {
    path: 'create',
    loadComponent: () => import('./create-client/create-client.component').then(m => m.CreateClientComponent),
    title: 'Dashboard - Crear Cliente'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./create-client/create-client.component').then(m => m.CreateClientComponent),
    title: 'Dashboard - Editar Cliente'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }
