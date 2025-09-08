import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Plan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  invoices: number;
  invoicesLabel: string;
  features: string[];
  popular?: boolean;
  color: string;
  gradient: string;
}

@Component({
  selector: 'app-plan-selection',
  imports: [CommonModule],
  templateUrl: './plan-selection.component.html',
  styleUrl: './plan-selection.component.css'
})
export class PlanSelectionComponent {
  selectedPlan: string | null = null;
  isLoading: boolean = false;

  plans: Plan[] = [
    {
      id: 'free',
      name: 'Básico',
      price: 0,
      priceLabel: 'Gratis',
      invoices: 10,
      invoicesLabel: '10 facturas al año',
      features: [
        'Facturación básica',
        'Plantillas predefinidas',
        'Soporte por email',
        'Almacenamiento 1GB'
      ],
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      id: 'starter',
      name: 'Iniciador',
      price: 9.99,
      priceLabel: '$9.99/año',
      invoices: 50,
      invoicesLabel: '50 facturas al año',
      features: [
        'Todo lo del plan Básico',
        'Facturas ilimitadas',
        'Personalización de marca',
        'Reportes básicos',
        'Almacenamiento 10GB'
      ],
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    },
    {
      id: 'professional',
      name: 'Profesional',
      price: 19.99,
      priceLabel: '$19.99/año',
      invoices: 200,
      invoicesLabel: '200 facturas al año',
      features: [
        'Todo lo del plan Iniciador',
        'Facturación automática',
        'Reportes avanzados',
        'API de integración',
        'Soporte prioritario',
        'Almacenamiento 50GB'
      ],
      popular: true,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: 49.99,
      priceLabel: '$49.99/año',
      invoices: -1,
      invoicesLabel: 'Facturas ilimitadas',
      features: [
        'Todo lo del plan Profesional',
        'Usuarios ilimitados',
        'Personalización completa',
        'Soporte 24/7',
        'Manager dedicado',
        'Almacenamiento ilimitado',
        'Backup automático'
      ],
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    }
  ];

  constructor(private router: Router) {}

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
    this.selectedPlan = 'free';
    localStorage.setItem('selectedPlan', 'Básico');
    this.onContinue();
  }
}
