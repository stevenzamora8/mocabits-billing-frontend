import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlansService, PlanDisplay } from '../../../services/plans.service';
import { AuthService } from '../../../services/auth.service';
import { AlertComponent } from '../../../components/alert/alert.component';

@Component({
  selector: 'app-plan-selection',
  imports: [CommonModule, AlertComponent],
  templateUrl: './plan-selection.component.html',
  styleUrl: './plan-selection.component.css'
})
export class PlanSelectionComponent implements OnInit {
  selectedPlan: string | null = null;
  isLoading: boolean = false;
  isLoadingPlans: boolean = true;
  error: string | null = null;

  plans: PlanDisplay[] = [];

  // Alert component properties
  alertMessage = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' | 'confirm' = 'info';
  pendingAction: (() => void) | null = null;

  constructor(
    private router: Router,
    private plansService: PlansService,
    private authService: AuthService
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
        this.plansService.getSetupStatus().subscribe({
          next: (status: { hasActivePlan: boolean; hasCompanyInfo: boolean }) => {
            console.log('User setup status after plan assignment:', status);
            this.isLoading = false;

            // Después de asignar un plan, ir al dashboard
            this.router.navigate(['/dashboard']);
          },
          error: (error: any) => {
            console.error('Error getting user setup status after plan assignment:', error);
            this.isLoading = false;
            // En caso de error, ir al dashboard por defecto
            this.router.navigate(['/dashboard']);
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
        this.plansService.getSetupStatus().subscribe({
          next: (status: { hasActivePlan: boolean; hasCompanyInfo: boolean }) => {
            console.log('User setup status after free plan assignment:', status);
            this.isLoading = false;

            // Después de asignar un plan, ir al dashboard
            this.router.navigate(['/dashboard']);
          },
          error: (error: any) => {
            console.error('Error getting user setup status after free plan assignment:', error);
            this.isLoading = false;
            // En caso de error, ir al dashboard por defecto
            this.router.navigate(['/dashboard']);
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
  retryLoadPlans() {
    this.loadPlans();
  }

  /**
   * Mostrar confirmación con AlertComponent
   */
  showConfirmation(message: string, action: () => void): void {
    this.alertMessage = message;
    this.alertType = 'confirm';
    this.pendingAction = action;
  }

  /**
   * Manejar confirmación del AlertComponent
   */
  onAlertConfirmed(): void {
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.clearAlert();
  }

  /**
   * Manejar cancelación del AlertComponent
   */
  onAlertCancelled(): void {
    this.clearAlert();
  }

  /**
   * Limpiar alert
   */
  clearAlert(): void {
    this.alertMessage = '';
    this.alertType = 'info';
    this.pendingAction = null;
  }

  /**
   * Cerrar sesión y redirigir al login
   */
  logout(): void {
    this.showConfirmation(
      '¿Está seguro que desea cerrar sesión?',
      () => {
        // Llamar al logout con el nuevo endpoint REST
        this.authService.logout().subscribe({
          next: (response) => {
            console.log('Plan Selection - Logout successful:', response);
            
            // Limpiar datos específicos del plan selection
            localStorage.removeItem('selectedPlan');
            localStorage.removeItem('companySetup');
            localStorage.removeItem('setupCompleted');
            
            // Redirigir al login
            this.router.navigate(['/auth/login']);
          },
          error: (error) => {
            console.error('Plan Selection - Logout error:', error);
            
            // Limpiar datos locales incluso si falla el logout en el servidor
            localStorage.removeItem('selectedPlan');
            localStorage.removeItem('companySetup');
            localStorage.removeItem('setupCompleted');
            
            // Redirigir al login por seguridad
            this.router.navigate(['/auth/login']);
          }
        });
      }
    );
  }
}
