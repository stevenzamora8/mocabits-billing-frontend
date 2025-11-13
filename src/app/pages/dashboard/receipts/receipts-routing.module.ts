import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReceiptsComponent } from './receipts.component';
import { ReceiptsListComponent } from './receipts-list/receipts-list.component';
import { ReceiptsCreateComponent } from './receipts-create/receipts-create.component';

const routes: Routes = [
  {
    path: '',
    component: ReceiptsComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: ReceiptsListComponent },
      { path: 'create', component: ReceiptsCreateComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReceiptsRoutingModule {}
