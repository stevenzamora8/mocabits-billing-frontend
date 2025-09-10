import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { DashboardService, NavigationItem, UserData } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentPlan: string = 'Gratis';
  userName: string = 'José Martínez';
  userEmail: string = 'jose.martinez@mocabits.com';
  isSidebarCollapsed: boolean = false;
  isUserModalOpen: boolean = false;
  isMobileOrTablet: boolean = false;
  
  // User stats
  totalInvoices: number = 25;
  totalClients: number = 12;
  totalRevenue: number = 2450.00;
  memberSince: string = 'Enero 2024';
  lastActivity: string = 'Hace 2 horas';

  navigationItems: NavigationItem[] = [];
  currentUser: UserData | null = null;
  
  // Breadcrumb navigation
  breadcrumbs: { label: string; path: string; active: boolean }[] = [];
  
  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    console.log('DashboardComponent ngOnInit called');
    
    // Detectar tamaño de pantalla inicial
    this.checkScreenSize();
    
    // Cargar estado del sidebar desde localStorage
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    if (savedSidebarState !== null) {
      this.isSidebarCollapsed = savedSidebarState === 'true';
    } else {
      // Si no hay estado guardado, colapsar en móviles por defecto
      this.isSidebarCollapsed = this.isMobileOrTablet;
    }
    
    this.subscriptions.add(
      this.dashboardService.currentUser$.subscribe(user => {
        console.log('DashboardComponent received user:', user);
        this.currentUser = user;
        this.userName = user.name;
        this.userEmail = user.email;
        this.currentPlan = user.plan;
        this.totalInvoices = user.totalInvoices;
        this.totalClients = user.totalClients;
        this.totalRevenue = user.totalRevenue;
        this.memberSince = user.memberSince;
        this.lastActivity = user.lastActivity;
      })
    );

    this.subscriptions.add(
      this.dashboardService.navigationItems$.subscribe(items => {
        console.log('DashboardComponent received navigation items:', items);
        console.log('Number of navigation items:', items.length);
        this.navigationItems = items;
      })
    );

    // Listen to route changes to update active navigation
    this.subscriptions.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          console.log('NavigationEnd event:', event.url);
          this.dashboardService.updateActiveNavigation(event.url);
          this.generateBreadcrumbs(event.url);
          
          // En móviles/tablets, cerrar el sidebar al navegar a una nueva ruta
          if (this.isMobileOrTablet && !this.isSidebarCollapsed) {
            this.isSidebarCollapsed = true;
            localStorage.setItem('sidebarCollapsed', 'true');
          }
        })
    );

    // Initial update
    console.log('Initial router URL:', this.router.url);
    this.dashboardService.updateActiveNavigation(this.router.url);
    this.generateBreadcrumbs(this.router.url);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private checkScreenSize() {
    if (typeof window !== 'undefined') {
      this.isMobileOrTablet = window.innerWidth <= 1024;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
    
    // Si estamos en móvil/tablet y el sidebar está abierto, mantenerlo consistente
    if (this.isMobileOrTablet && !this.isSidebarCollapsed) {
      // No hacer nada, mantener el estado actual
    } else if (!this.isMobileOrTablet && this.isSidebarCollapsed) {
      // En desktop, si estaba colapsado, mantenerlo así
    }
  }

  private generateBreadcrumbs(url: string) {
    const segments = url.split('/').filter(segment => segment !== '');
    this.breadcrumbs = [];

    // Always start with Dashboard
    this.breadcrumbs.push({
      label: 'Dashboard',
      path: '/dashboard',
      active: segments.length === 1
    });

    if (segments.length > 1) {
      const currentPath = '/' + segments.join('/');
      
      // Map all available routes to user-friendly names
      const routeLabels: { [key: string]: string } = {
        '/dashboard/home': 'Inicio',
        '/dashboard/clients': 'Clientes',
        '/dashboard/invoices': 'Facturas',
        '/dashboard/products': 'Productos',
        '/dashboard/company': 'Mi Empresa',
        '/dashboard/settings': 'Configuración'
      };

      const currentLabel = routeLabels[currentPath] || 
        segments[segments.length - 1].charAt(0).toUpperCase() + 
        segments[segments.length - 1].slice(1);

      this.breadcrumbs.push({
        label: currentLabel,
        path: currentPath,
        active: true
      });
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  toggleSidebar() {
    // En móviles/tablets, el sidebar debe cerrarse al hacer clic fuera o al navegar
    if (this.isMobileOrTablet) {
      this.isSidebarCollapsed = true;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
    
    // Guardar el estado en localStorage para persistencia
    localStorage.setItem('sidebarCollapsed', this.isSidebarCollapsed.toString());
  }

  logout() {
    this.dashboardService.logout();
    this.router.navigate(['/login']);
  }

  managePlan() {
    this.isUserModalOpen = false;
    this.router.navigate(['/plan-selection']);
  }

  toggleUserModal() {
    this.isUserModalOpen = !this.isUserModalOpen;
  }

  closeUserModal() {
    this.isUserModalOpen = false;
  }

  editProfile() {
    this.isUserModalOpen = false;
    // Aquí se implementaría la navegación al perfil de usuario
    console.log('Editando perfil...');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const userButton = target.closest('.user-profile-btn');
    const userCard = target.closest('.user-dropdown-card');
    
    if (!userButton && !userCard && this.isUserModalOpen) {
      this.closeUserModal();
    }
  }
}
