import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface DashboardStats {
  totalInvoices: number;
  monthlyRevenue: number;
  activeClients: number;
  pendingPayments: number;
}

interface RecentActivity {
  id: string;
  type: 'invoice' | 'payment' | 'client';
  description: string;
  amount?: number;
  date: Date;
  status: 'success' | 'pending' | 'warning';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  stats: DashboardStats = {
    totalInvoices: 0,
    monthlyRevenue: 0,
    activeClients: 0,
    pendingPayments: 0
  };

  recentActivities: RecentActivity[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadRecentActivities();
  }

  private loadDashboardData() {
    // Simular datos del dashboard
    this.stats = {
      totalInvoices: 24,
      monthlyRevenue: 15670,
      activeClients: 12,
      pendingPayments: 3
    };
  }

  private loadRecentActivities() {
    // Simular actividades recientes
    this.recentActivities = [
      {
        id: '1',
        type: 'invoice',
        description: 'Factura #001 creada para Cliente ABC',
        amount: 1250,
        date: new Date(2025, 8, 7),
        status: 'success'
      },
      {
        id: '2',
        type: 'payment',
        description: 'Pago recibido de Cliente XYZ',
        amount: 850,
        date: new Date(2025, 8, 6),
        status: 'success'
      },
      {
        id: '3',
        type: 'client',
        description: 'Nuevo cliente registrado',
        date: new Date(2025, 8, 5),
        status: 'success'
      },
      {
        id: '4',
        type: 'invoice',
        description: 'Factura #002 pendiente de pago',
        amount: 450,
        date: new Date(2025, 8, 4),
        status: 'warning'
      }
    ];
  }

  createInvoice() {
    this.router.navigate(['/dashboard/invoices/create']);
  }

  viewClients() {
    this.router.navigate(['/dashboard/clients']);
  }

  viewProducts() {
    this.router.navigate(['/dashboard/products']);
  }

  viewReports() {
    console.log('Ver reportes');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'invoice': return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      case 'payment': return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1';
      case 'client': return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
      default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }
}
