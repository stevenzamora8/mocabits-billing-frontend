import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OnboardingRoutingModule } from './onboarding-routing.module';
import { PlanSelectionComponent } from './plan-selection/plan-selection.component';
import { SetupComponent } from './setup/setup.component';
import { UiAlertComponent } from '../../shared/components/ui/alert/alert.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OnboardingRoutingModule,
    PlanSelectionComponent,
    SetupComponent,
    UiAlertComponent
  ]
})
export class OnboardingModule { }