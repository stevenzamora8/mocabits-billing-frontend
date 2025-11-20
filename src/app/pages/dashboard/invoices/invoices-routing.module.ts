import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoicesComponent } from './invoices.component';
import { InvoicesListComponent } from './invoices-list/invoices-list.component';
import { InvoicesCreateComponent } from './invoices-create/invoices-create.component';

const routes: Routes = [
  {
    path: '',
    component: InvoicesComponent,
    children: [
      {
        path: '',
        redirectTo: 'create',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: InvoicesListComponent
      },
      {
        path: 'create',
        component: InvoicesCreateComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoicesRoutingModule { }