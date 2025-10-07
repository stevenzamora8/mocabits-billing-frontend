import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanSelectionComponent } from './plan-selection/plan-selection.component';
import { SetupComponent } from './setup/setup.component';
import { AuthGuard } from '../../guards/auth.guard';
import { SetupGuard } from '../../guards/setup.guard';
import { PlanSelectionGuard } from '../../guards/plan-selection.guard';

const routes: Routes = [
  {
    path: 'plan-selection',
    component: PlanSelectionComponent,
    canActivate: [AuthGuard, PlanSelectionGuard],
    title: 'MocaBits - Seleccionar Plan'
  },
  {
    path: 'setup',
    component: SetupComponent,
    canActivate: [AuthGuard, SetupGuard],
    title: 'MocaBits - Configuración Inicial'
  },
  {
    path: '',
    redirectTo: 'plan-selection',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingRoutingModule { }