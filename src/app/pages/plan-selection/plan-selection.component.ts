import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlansService, PlanDisplay } from '../../services/plans.service';

@Component({
  selector: 'app-plan-selection',
  imports: [CommonModule],
  templateUrl: './plan-selection.component.html',
  styleUrl: './plan-selection.component.css'
})
export class PlanSelectionComponent implements OnInit {
  selectedPlan: string | null = null;
  isLoading: boolean = false;
  isLoadingPlans: boolean = true;
  error: string | null = null;

  plans: PlanDisplay[] = [];

  constructor(
    private router: Router,
    private plansService: PlansService
  ) {}

  ngOnInit() {
    this.loadPlans();
  }

  private loadPlans() {
    this.isLoadingPlans = true;
    this.error = null;

    this.plansService.getPlansForDisplay().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.isLoadingPlans = false;
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        this.error = error.message || 'Error al cargar los planes. Inténtalo más tarde.';
        this.isLoadingPlans = false;
      }
    });
  }

  get selectedPlanName(): string {
    return this.plans.find(p => p.id === this.selectedPlan)?.name || 'plan seleccionado';
  }

  selectPlan(planId: string) {
    this.selectedPlan = planId;
  }

  onContinue() {
    if (!this.selectedPlan) {
      return;
    }

    this.isLoading = true;
    const selectedPlanData = this.plans.find(p => p.id === this.selectedPlan);

    if (!selectedPlanData) {
      this.error = 'Plan seleccionado no encontrado.';
      this.isLoading = false;
      return;
    }

    // Extraer el ID numérico del plan (remover el prefijo 'plan-')
    const planId = parseInt(selectedPlanData.id.replace('plan-', ''));

    // Asignar el plan al usuario
    this.plansService.assignPlanToUser(planId).subscribe({
      next: (userPlan) => {
        console.log('Plan assigned successfully:', userPlan);

        // Guardar información del plan seleccionado en localStorage
        localStorage.setItem('selectedPlan', selectedPlanData.name);
        localStorage.setItem('selectedPlanId', selectedPlanData.id);
        localStorage.setItem('selectedPlanPrice', selectedPlanData.price.toString());

        this.isLoading = false;
        // Redirigir a setup después de asignar el plan
        this.router.navigate(['/setup']);
      },
      error: (error) => {
        console.error('Error assigning plan:', error);
        this.error = error.message || 'Error al asignar el plan. Inténtalo más tarde.';
        this.isLoading = false;
      }
    });
  }

  onSkip() {
    // Asignar automáticamente el plan gratuito (precio 0)
    const freePlan = this.plans.find(p => p.price === 0);

    if (!freePlan) {
      this.error = 'No se encontró el plan gratuito.';
      return;
    }

    this.isLoading = true;
    this.selectedPlan = freePlan.id;

    // Extraer el ID numérico del plan gratuito
    const planId = parseInt(freePlan.id.replace('plan-', ''));

    // Asignar el plan gratuito al usuario
    this.plansService.assignPlanToUser(planId).subscribe({
      next: (userPlan) => {
        console.log('Free plan assigned successfully:', userPlan);

        // Guardar información del plan gratuito en localStorage
        localStorage.setItem('selectedPlan', freePlan.name);
        localStorage.setItem('selectedPlanId', freePlan.id);
        localStorage.setItem('selectedPlanPrice', freePlan.price.toString());

        this.isLoading = false;
        this.router.navigate(['/setup']);
      },
      error: (error) => {
        console.error('Error assigning free plan:', error);
        this.error = error.message || 'Error al asignar el plan gratuito. Inténtalo más tarde.';
        this.isLoading = false;
      }
    });
  }

  retryLoadPlans() {
    this.loadPlans();
  }
}
