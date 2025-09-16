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

    // Guardar el plan seleccionado en localStorage
    if (selectedPlanData) {
      localStorage.setItem('selectedPlan', selectedPlanData.name);
      localStorage.setItem('selectedPlanId', selectedPlanData.id);
      localStorage.setItem('selectedPlanPrice', selectedPlanData.price.toString());
    }

    // Simular procesamiento
    setTimeout(() => {
      console.log('Plan selected:', selectedPlanData);
      this.isLoading = false;
      // Redirigir a setup en lugar de dashboard
      this.router.navigate(['/setup']);
    }, 1500);
  }

  onSkip() {
    // Permitir continuar sin seleccionar plan (asignar plan gratuito por defecto)
    const freePlan = this.plans.find(p => p.price === 0);
    if (freePlan) {
      this.selectedPlan = freePlan.id;
      localStorage.setItem('selectedPlan', freePlan.name);
      localStorage.setItem('selectedPlanId', freePlan.id);
      localStorage.setItem('selectedPlanPrice', freePlan.price.toString());
    }
    this.onContinue();
  }

  retryLoadPlans() {
    this.loadPlans();
  }
}
