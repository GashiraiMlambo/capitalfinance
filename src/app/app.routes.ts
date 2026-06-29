import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'portal',
    loadComponent: () => import('./layout/portal-layout/portal-layout').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/customers').then(m => m.CustomersComponent)
      },
      {
        path: 'loans',
        loadComponent: () => import('./features/loans/loans').then(m => m.LoansComponent)
      },
      {
        path: 'savings',
        loadComponent: () => import('./features/savings/savings').then(m => m.SavingsComponent)
      },
      {
        path: 'wallet',
        loadComponent: () => import('./features/wallet/wallet').then(m => m.WalletComponent)
      },
      {
        path: 'collections',
        loadComponent: () => import('./features/collections/collections').then(m => m.CollectionsComponent)
      },
      {
        path: 'guarantors',
        loadComponent: () => import('./features/guarantors/guarantors').then(m => m.GuarantorsComponent)
      },
      {
        path: 'collateral',
        loadComponent: () => import('./features/collateral/collateral').then(m => m.CollateralComponent)
      },
      {
        path: 'accounting',
        loadComponent: () => import('./features/accounting/accounting').then(m => m.AccountingComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports').then(m => m.ReportsComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications').then(m => m.NotificationsComponent)
      },
      {
        path: 'branches',
        loadComponent: () => import('./features/branches/branches').then(m => m.BranchesComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/users').then(m => m.UsersComponent)
      },
      {
        path: 'workflows',
        loadComponent: () => import('./features/workflows/workflows').then(m => m.WorkflowsComponent)
      },
      {
        path: 'risk',
        loadComponent: () => import('./features/risk/risk').then(m => m.RiskComponent)
      },
      {
        path: 'integrations',
        loadComponent: () => import('./features/integrations/integrations').then(m => m.IntegrationsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings').then(m => m.SettingsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
