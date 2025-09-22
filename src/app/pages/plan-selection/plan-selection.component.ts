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
      next: (userPlan: any) => {
        console.log('Plan assigned successfully:', userPlan);

        // Guardar información del plan seleccionado en localStorage
        localStorage.setItem('selectedPlan', selectedPlanData.name);
        localStorage.setItem('selectedPlanId', selectedPlanData.id);
        localStorage.setItem('selectedPlanPrice', selectedPlanData.price.toString());

        // Verificar el estado del usuario después de asignar el plan
        this.plansService.getUserSetupStatus().subscribe({
          next: (status) => {
            console.log('User setup status after plan assignment:', status);
            this.isLoading = false;

            // Después de asignar un plan, siempre ir al setup
            this.router.navigate(['/setup']);
          },
          error: (error) => {
            console.error('Error getting user setup status after plan assignment:', error);
            this.isLoading = false;
            // En caso de error, ir a setup por defecto
            this.router.navigate(['/setup']);
          }
        });
      },
      error: (error: any) => {
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
      next: (userPlan: any) => {
        console.log('Free plan assigned successfully:', userPlan);

        // Guardar información del plan gratuito en localStorage
        localStorage.setItem('selectedPlan', freePlan.name);
        localStorage.setItem('selectedPlanId', freePlan.id);
        localStorage.setItem('selectedPlanPrice', freePlan.price.toString());

        // Verificar el estado del usuario después de asignar el plan
        this.plansService.getUserSetupStatus().subscribe({
          next: (status) => {
            console.log('User setup status after free plan assignment:', status);
            this.isLoading = false;

            // Después de asignar un plan, siempre ir al setup
            this.router.navigate(['/setup']);
          },
          error: (error) => {
            console.error('Error getting user setup status after free plan assignment:', error);
            this.isLoading = false;
            // En caso de error, ir a setup por defecto
            this.router.navigate(['/setup']);
          }
        });
      },
      error: (error: any) => {
        console.error('Error assigning free plan:', error);
        this.error = error.message || 'Error al asignar el plan gratuito. Inténtalo más tarde.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Función de prueba: enviar EXACTAMENTE la misma solicitud que funciona en Postman
   */
  testPostmanRequest() {
    console.log('🧪 TEST: Ejecutando solicitud idéntica a Postman...');
    this.isLoading = true;
    this.error = null;

    this.plansService.testExactPostmanRequest().subscribe({
      next: (response) => {
        console.log('✅ TEST SUCCESS: La solicitud idéntica a Postman funcionó!', response);
        this.error = '✅ ÉXITO: La solicitud idéntica a Postman funcionó correctamente!';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ TEST FAILED: La solicitud idéntica a Postman falló:', error);
        this.error = `❌ ERROR: La solicitud idéntica a Postman falló: ${error.message}`;
        this.isLoading = false;
      }
    });
  }

  retryLoadPlans() {
    this.loadPlans();
  }
}
