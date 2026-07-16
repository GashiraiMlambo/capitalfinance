import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Authentication Routes
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      }
    ]
  },

  // 1. Teller Operations
  {
    path: 'teller',
    loadComponent: () => import('./layout/portal-layout/portal-layout').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/teller/dashboard/dashboard.component').then(m => m.TellerDashboardComponent)
      },
      {
        path: 'exchange/new',
        loadComponent: () => import('./features/teller/exchange/exchange.component').then(m => m.ExchangeComponent)
      },
      {
        path: 'remittance/new',
        loadComponent: () => import('./features/teller/remittance/remittance.component').then(m => m.RemittanceComponent)
      },
      {
        path: 'transaction/:id/receipt',
        loadComponent: () => import('./features/teller/receipt/receipt.component').then(m => m.ReceiptComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/teller/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'customers/:id',
        loadComponent: () => import('./features/teller/customers/profile.component').then(m => m.CustomerProfileComponent)
      }
    ]
  },

  // 2. Customer Onboarding
  {
    path: 'onboarding',
    loadComponent: () => import('./layout/portal-layout/portal-layout').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'new',
        loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent)
      }
    ]
  },

  // 3. Branch Operations
  {
    path: 'branch',
    loadComponent: () => import('./layout/portal-layout/portal-layout').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/branch/dashboard/dashboard.component').then(m => m.BranchDashboardComponent)
      },
      {
        path: 'transactions/:id/review',
        loadComponent: () => import('./features/branch/review/review.component').then(m => m.BranchReviewComponent)
      },
      {
        path: 'rates',
        loadComponent: () => import('./features/branch/rates/rates.component').then(m => m.RateManagementComponent)
      }
    ]
  },

  // 4. Compliance Operations
  {
    path: 'compliance',
    loadComponent: () => import('./layout/portal-layout/portal-layout').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/compliance/dashboard/dashboard.component').then(m => m.ComplianceDashboardComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/compliance/transactions/transactions.component').then(m => m.ComplianceTransactionsComponent)
      },
      {
        path: 'transactions/:id',
        loadComponent: () => import('./features/branch/review/review.component').then(m => m.BranchReviewComponent)
      },
      {
        path: 'kyc',
        loadComponent: () => import('./features/compliance/kyc/kyc.component').then(m => m.KycComponent)
      },
      {
        path: 'customers/:id',
        loadComponent: () => import('./features/teller/customers/profile.component').then(m => m.CustomerProfileComponent)
      },
      {
        path: 'rbz-reporting',
        loadComponent: () => import('./features/compliance/reporting/reporting.component').then(m => m.RbzReportingComponent)
      }
    ]
  },

  // 5. Customer Self-Service Portal
  {
    path: 'portal',
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./components/customer-portal/customer-portal.component').then(m => m.CustomerPortalComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./components/customer-portal/customer-portal.component').then(m => m.CustomerPortalComponent)
      },
      {
        path: 'transactions/:id/receipt',
        loadComponent: () => import('./features/teller/receipt/receipt.component').then(m => m.ReceiptComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/customer-portal/customer-portal.component').then(m => m.CustomerPortalComponent)
      },
      {
        path: 'track',
        loadComponent: () => import('./components/customer-portal/customer-portal.component').then(m => m.CustomerPortalComponent)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },

  // 6. System Administration
  {
    path: 'admin',
    loadComponent: () => import('./layout/portal-layout/portal-layout').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/branch/dashboard/dashboard.component').then(m => m.BranchDashboardComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/admin/transactions/transactions.component').then(m => m.AdminTransactionsComponent)
      },
      {
        path: 'transactions/:id/review',
        loadComponent: () => import('./features/branch/review/review.component').then(m => m.BranchReviewComponent)
      },
      {
        path: 'rates',
        loadComponent: () => import('./features/branch/rates/rates.component').then(m => m.RateManagementComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'users/new',
        loadComponent: () => import('./features/admin/users/users.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./features/admin/users/users.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'audit-log',
        loadComponent: () => import('./features/admin/audit/audit.component').then(m => m.AuditLogComponent)
      }
    ]
  },

  // Fallbacks
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

