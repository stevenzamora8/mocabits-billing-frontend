import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { DashboardService, NavigationItem, UserData } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentPlan: string = 'Gratis';
  userName: string = 'José Martínez';
  userEmail: string = 'jose.martinez@mocabits.com';
  isSidebarCollapsed: boolean = false;
  isUserModalOpen: boolean = false;
  
  // User stats
  totalInvoices: number = 25;
  totalClients: number = 12;
  totalRevenue: number = 2450.00;
  memberSince: string = 'Enero 2024';
  lastActivity: string = 'Hace 2 horas';

  navigationItems: NavigationItem[] = [];
  currentUser: UserData | null = null;
  
  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.dashboardService.currentUser$.subscribe(user => {
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
        this.navigationItems = items;
      })
    );

    // Listen to route changes to update active navigation
    this.subscriptions.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          this.dashboardService.updateActiveNavigation(event.url);
        })
    );

    // Initial update
    this.dashboardService.updateActiveNavigation(this.router.url);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
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
