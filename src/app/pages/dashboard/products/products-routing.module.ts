import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/products-list.component').then(m => m.ProductsListComponent),
    title: 'Dashboard - Productos'
  },
  {
    path: 'create',
    loadComponent: () => import('./create/products-create.component').then(m => m.ProductsCreateComponent),
    title: 'Dashboard - Crear Producto'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule {}
