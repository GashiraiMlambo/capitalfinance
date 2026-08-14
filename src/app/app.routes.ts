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
      },
      {
        path: 'verify-customer',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Verify Customer', category: 'COMPLIANCE', description: 'Perform real-time customer verification and identity validation.' }
      },
      {
        path: 'blacklist',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Blacklist', category: 'COMPLIANCE', description: 'Manage AML blacklists, PEP lists, and restricted entity watchlist.' }
      },
      {
        path: 'sanctions-screening',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Sanctions Screening', category: 'COMPLIANCE', description: 'Real-time sanctions screening matrix against OFAC, EU, & local regulators.' }
      },
      {
        path: 'transaction-monitoring',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Transaction Monitoring', category: 'COMPLIANCE', description: 'Rule-based threshold monitoring & suspicious transaction reporting (STR).' }
      }
    ]
  },

  // 5. Transactions Category Routes
  {
    path: 'transactions',
    loadComponent: () => import('./layout/portal-layout/portal-layout').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'mobile-money',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Mobile Money', category: 'TRANSACTIONS', description: 'Manage EcoCash, OneMoney & Mobile Wallet disbursements.' }
      },
      {
        path: 'banking',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Banking Operations', category: 'TRANSACTIONS', description: 'RTGS, ZIPIT & Commercial bank settlement channels.' }
      },
      {
        path: 'account-transfers',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Account Transfers', category: 'TRANSACTIONS', description: 'Internal account transfers and inter-branch settlement ledger.' }
      },
      {
        path: 'interbranch-transfer',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Inter-branch Transfer', category: 'TRANSACTIONS', description: 'Inter-branch liquidity transfers & vault balancing.' }
      },
      {
        path: 'bill-payments',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Bill Payments', category: 'TRANSACTIONS', description: 'ZETDC tokens, City Council & utility bill payments.' }
      },
      {
        path: 'merchant-payments',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Merchant & DSTV Pay', category: 'TRANSACTIONS', description: 'DSTV subscriptions & retail merchant collections.' }
      }
    ]
  },

  // 6. Reports Category Routes
  {
    path: 'reports',
    loadComponent: () => import('./layout/portal-layout/portal-layout').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'teller-summary',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Daily Teller Summary', category: 'REPORTS', description: 'Daily balancing report and teller till reconciliation.' }
      },
      {
        path: 'accounts',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Accounts Report', category: 'REPORTS', description: 'Account balances, GL summaries and currency position statements.' }
      },
      {
        path: 'general-ledger',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'General Ledger Summary', category: 'REPORTS', description: 'Comprehensive general ledger journal trial balances.' }
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Customer Reports', category: 'REPORTS', description: 'Customer transaction activity and risk segmentation metrics.' }
      },
      {
        path: 'agents',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Agent Reports', category: 'REPORTS', description: 'Agent outlet volumes, remittance commissions, and payouts.' }
      },
      {
        path: 'cashbook',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Cashbook Reports', category: 'REPORTS', description: 'Vault cashbook, opening/closing balance records.' }
      }
    ]
  },

  // 7. Customers Category Routes
  {
    path: 'customers',
    loadComponent: () => import('./layout/portal-layout/portal-layout').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'members',
        loadComponent: () => import('./features/teller/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'companies',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Companies', category: 'CUSTOMERS', description: 'Corporate entity accounts and authorized signatories.' }
      },
      {
        path: 'configurations',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Customer Configurations', category: 'CUSTOMERS', description: 'Tier limits, KYC thresholds, and verification rules.' }
      }
    ]
  },

  // 8. Transaction Management Category Routes
  {
    path: 'transaction-management',
    loadComponent: () => import('./layout/portal-layout/portal-layout').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'confirmation',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Payment Confirmation', category: 'TRANSACTION MANAGEMENT', description: 'Confirm payout vouchers and authorization tokens.' }
      },
      {
        path: 'processing',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Payment Processing', category: 'TRANSACTION MANAGEMENT', description: 'Engine processing queue and partner API triggers.' }
      },
      {
        path: 'error-transactions',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Error Transaction', category: 'TRANSACTION MANAGEMENT', description: 'Exceptions, failed API webhooks, and retry queue.' }
      },
      {
        path: 'refund-transactions',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Refund Transaction', category: 'TRANSACTION MANAGEMENT', description: 'Transaction reversals and customer refund approvals.' }
      },
      {
        path: 'cancel-transactions',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Cancel Transaction', category: 'TRANSACTION MANAGEMENT', description: 'Pending cancellation requests and compliance approval.' }
      },
      {
        path: 'resend-notifications',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Resend Notification', category: 'TRANSACTION MANAGEMENT', description: 'Re-trigger SMS OTPs, Email vouchers & receipt notifications.' }
      }
    ]
  },

  // 9. User Management Category Routes
  {
    path: 'user-management',
    loadComponent: () => import('./layout/portal-layout/portal-layout').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'roles',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Roles & Permissions', category: 'USER MANAGEMENT', description: 'Role-based access matrix, teller privileges & approval limits.' }
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users.component').then(m => m.UserManagementComponent)
      }
    ]
  },

  // 10. System Configurations Category Routes
  {
    path: 'system',
    loadComponent: () => import('./layout/portal-layout/portal-layout').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'countries',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Countries', category: 'SYSTEM CONFIGURATIONS', description: 'Operating countries, ISO codes, and FX tax rules.' }
      },
      {
        path: 'currencies',
        loadComponent: () => import('./features/branch/rates/rates.component').then(m => m.RateManagementComponent)
      },
      {
        path: 'payment-methods',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Payment Methods', category: 'SYSTEM CONFIGURATIONS', description: 'Cash, Mobile Money, Card, and Bank Transfer channels.' }
      },
      {
        path: 'corridors',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Corridors', category: 'SYSTEM CONFIGURATIONS', description: 'Remittance corridors (South Africa, UK, US, Zimbabwe).' }
      },
      {
        path: 'geographies',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Geographies', category: 'SYSTEM CONFIGURATIONS', description: 'Provinces, districts, and regional branch zones.' }
      },
      {
        path: 'accounts',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Accounts', category: 'SYSTEM CONFIGURATIONS', description: 'Chart of Accounts, General Ledger codes, and Vault setup.' }
      },
      {
        path: 'settlement-vaults',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Settlement Vaults', category: 'SYSTEM CONFIGURATIONS', description: 'Central bank settlement vaults and float reserves.' }
      },
      {
        path: 'service-network',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Service Network', category: 'SYSTEM CONFIGURATIONS', description: 'Branches, till outlets, and agent collection points.' }
      },
      {
        path: 'agent-outlets',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Agent Outlets', category: 'SYSTEM CONFIGURATIONS', description: 'Sub-agent kiosks, terminal IDs, and payout limits.' }
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Transactions Config', category: 'SYSTEM CONFIGURATIONS', description: 'Transaction limits, fee percentages, and commission sharing.' }
      },
      {
        path: 'fee-structures',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Commission & Fees', category: 'SYSTEM CONFIGURATIONS', description: 'Tiered transaction fee matrix and agent split rules.' }
      },
      {
        path: 'compliance-config',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Compliance Configuration', category: 'SYSTEM CONFIGURATIONS', description: 'AML thresholds, KYC level requirements, and alert parameters.' }
      },
      {
        path: 'str-rules',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'STR Escalation Rules', category: 'SYSTEM CONFIGURATIONS', description: 'Automated FIU escalation triggers and compliance workflows.' }
      },
      {
        path: 'partners',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Partners', category: 'SYSTEM CONFIGURATIONS', description: 'MTO correspondent partners (Western Union, WorldRemit, Mukuru).' }
      },
      {
        path: 'webhooks',
        loadComponent: () => import('./features/generic-feature/generic-feature.component').then(m => m.GenericFeatureComponent),
        data: { title: 'Webhook Subscriptions', category: 'SYSTEM CONFIGURATIONS', description: 'Real-time API webhook endpoints and payload logs.' }
      }
    ]
  },

  // 11. Integrations Standalone Route
  {
    path: 'integrations',
    loadComponent: () => import('./layout/portal-layout/portal-layout').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/integrations/integrations.component').then(m => m.IntegrationsComponent)
      }
    ]
  },

  // 12. Branches Route
  {
    path: 'branches',
    loadComponent: () => import('./layout/portal-layout/portal-layout').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/branches/branches.component').then(m => m.BranchesComponent)
      }
    ]
  },

  // 13. Customer Self-Service Portal
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

  // 14. Admin Operations
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
