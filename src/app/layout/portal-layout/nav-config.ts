import { NavCategory } from './portal-layout';

export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'transactions',
    title: 'TRANSACTIONS',
    items: [
      {
        title: 'Remittances',
        type: 'dropdown',
        expanded: false,
        roles: ['Branch Manager', 'Teller'],
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>',
        children: [
          { title: 'New Remittance', path: '/teller/remittance/new' },
          { title: 'Remittance History', path: '/admin/transactions' },
          { title: 'Inbound & Outbound Corridors', path: '/system/corridors' }
        ]
      },
      {
        title: 'Mobile Money',
        type: 'link',
        roles: ['Branch Manager', 'Teller'],
        path: '/transactions/mobile-money',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>'
      },
      {
        title: 'Banking',
        type: 'link',
        roles: ['Branch Manager', 'Teller'],
        path: '/transactions/banking',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>'
      },
      {
        title: 'Account Transfers',
        type: 'dropdown',
        expanded: false,
        roles: ['Branch Manager', 'Teller'],
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>',
        children: [
          { title: 'Internal Account Transfer', path: '/transactions/account-transfers' },
          { title: 'Inter-branch Transfer', path: '/transactions/interbranch-transfer' }
        ]
      },
      {
        title: 'FX Switches',
        type: 'link',
        roles: ['Branch Manager', 'Teller'],
        path: '/teller/exchange/new',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>'
      },
      {
        title: 'Bill Payments',
        type: 'dropdown',
        expanded: false,
        roles: ['Branch Manager', 'Teller'],
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
        children: [
          { title: 'Utility Payments & ZETDC', path: '/transactions/bill-payments' },
          { title: 'DSTV & Merchant Pay', path: '/transactions/merchant-payments' }
        ]
      }
    ]
  },
  {
    id: 'reports',
    title: 'REPORTS',
    items: [
      {
        title: 'Transactions',
        type: 'dropdown',
        expanded: false,
        roles: ['Branch Manager', 'Teller', 'Compliance Officer'],
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        children: [
          { title: 'Transaction Audit Ledger', path: '/reports/transactions' },
          { title: 'Daily Teller Summary', path: '/reports/teller-summary' }
        ]
      },
      {
        title: 'Accounts',
        type: 'dropdown',
        expanded: false,
        roles: ['Branch Manager'],
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
        children: [
          { title: 'Account Balances Report', path: '/reports/accounts' },
          { title: 'General Ledger Summary', path: '/reports/general-ledger' }
        ]
      },
      {
        title: 'Customers',
        type: 'link',
        roles: ['Branch Manager', 'Compliance Officer'],
        path: '/reports/customers',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/></svg>'
      },
      {
        title: 'Agents',
        type: 'link',
        roles: ['Branch Manager'],
        path: '/reports/agents',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
      },
      {
        title: 'Cashbook',
        type: 'link',
        roles: ['Branch Manager', 'Teller'],
        path: '/reports/cashbook',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>'
      },
      {
        title: 'Compliance',
        type: 'dropdown',
        expanded: false,
        roles: ['Branch Manager', 'Compliance Officer'],
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        children: [
          { title: 'RBZ FIU Compliance', path: '/compliance/rbz-reporting' },
          { title: 'AML Audit Log', path: '/admin/audit-log' }
        ]
      }
    ]
  },
  {
    id: 'customers',
    title: 'CUSTOMERS',
    items: [
      {
        title: 'Members',
        type: 'link',
        roles: ['Branch Manager', 'Teller', 'Compliance Officer'],
        path: '/teller/customers',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
      },
      {
        title: 'Companies',
        type: 'link',
        roles: ['Branch Manager', 'Teller', 'Compliance Officer'],
        path: '/customers/companies',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 21h18M3 7v14M21 7v14M6 10h4M6 14h4M6 18h4M14 10h4M14 14h4M14 18h4M9 3h6v4H9z"/></svg>'
      },
      {
        title: 'Customer Configurations',
        type: 'dropdown',
        expanded: false,
        roles: ['Branch Manager', 'Compliance Officer'],
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
        children: [
          { title: 'Customer Tier Limits', path: '/customers/configurations' },
          { title: 'KYC Requirements Matrix', path: '/compliance/kyc' }
        ]
      }
    ]
  },
  {
    id: 'transaction_management',
    title: 'TRANSACTION MANAGEMENT',
    items: [
      {
        title: 'Payment Confirmation',
        type: 'link',
        roles: ['Branch Manager', 'Compliance Officer'],
        path: '/transaction-management/confirmation',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
      },
      {
        title: 'Payment Processing',
        type: 'link',
        roles: ['Branch Manager'],
        path: '/transaction-management/processing',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>'
      },
      {
        title: 'Error Transaction',
        type: 'link',
        roles: ['Branch Manager', 'Compliance Officer'],
        path: '/transaction-management/error-transactions',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>'
      },
      {
        title: 'Refund Transaction',
        type: 'link',
        roles: ['Branch Manager', 'Compliance Officer'],
        path: '/transaction-management/refund-transactions',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 11l-4 4 4 4m-4-4h11a4 4 0 000-8h-1"/></svg>'
      },
      {
        title: 'Cancel Transaction',
        type: 'link',
        roles: ['Branch Manager', 'Compliance Officer'],
        path: '/transaction-management/cancel-transactions',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>'
      },
      {
        title: 'Resend Notification',
        type: 'link',
        roles: ['Branch Manager', 'Compliance Officer'],
        path: '/transaction-management/resend-notifications',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
      }
    ]
  },
  {
    id: 'compliance',
    title: 'COMPLIANCE',
    items: [
      {
        title: 'Verify Customer',
        type: 'link',
        roles: ['Branch Manager', 'Compliance Officer'],
        path: '/compliance/verify-customer',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>'
      },
      {
        title: 'Blacklist',
        type: 'link',
        roles: ['Branch Manager', 'Compliance Officer'],
        path: '/compliance/blacklist',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="23" y2="14"/><line x1="23" y1="8" x2="17" y2="14"/></svg>'
      },
      {
        title: 'Sanctions Screening',
        type: 'link',
        roles: ['Branch Manager', 'Compliance Officer'],
        path: '/compliance/sanctions-screening',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/></svg>'
      },
      {
        title: 'Transaction Monitoring',
        type: 'link',
        roles: ['Branch Manager', 'Compliance Officer'],
        path: '/compliance/transaction-monitoring',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'
      }
    ]
  },
  {
    id: 'user_management',
    title: 'USER MANAGEMENT',
    items: [
      {
        title: 'Roles & Permissions',
        type: 'link',
        roles: ['Branch Manager'],
        path: '/user-management/roles',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>'
      },
      {
        title: 'Users',
        type: 'link',
        roles: ['Branch Manager'],
        path: '/admin/users',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
      }
    ]
  },
  {
    id: 'system_configurations',
    title: 'SYSTEM CONFIGURATIONS',
    items: [
      {
        title: 'Countries',
        type: 'link',
        roles: ['Branch Manager'],
        path: '/system/countries',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>'
      },
      {
        title: 'Currencies',
        type: 'link',
        roles: ['Branch Manager'],
        path: '/branch/rates',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>'
      },
      {
        title: 'Payment Methods',
        type: 'link',
        roles: ['Branch Manager'],
        path: '/system/payment-methods',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>'
      },
      {
        title: 'Corridors',
        type: 'link',
        roles: ['Branch Manager'],
        path: '/system/corridors',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>'
      },
      {
        title: 'Geographies',
        type: 'dropdown',
        expanded: false,
        roles: ['Branch Manager'],
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
        children: [
          { title: 'Provinces & Districts', path: '/system/geographies' },
          { title: 'Branch Locations', path: '/branches' }
        ]
      },
      {
        title: 'Accounts',
        type: 'dropdown',
        expanded: false,
        roles: ['Branch Manager'],
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10M7 12h10M7 17h6"/></svg>',
        children: [
          { title: 'Chart of Accounts', path: '/system/accounts' },
          { title: 'Settlement Vaults', path: '/system/settlement-vaults' }
        ]
      },
      {
        title: 'Service Network',
        type: 'dropdown',
        expanded: false,
        roles: ['Branch Manager'],
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4m0 0H5v4m7-4h7v4"/></svg>',
        children: [
          { title: 'Branch Outlets', path: '/branches' },
          { title: 'Agent Outlets', path: '/system/agent-outlets' }
        ]
      },
      {
        title: 'Transactions',
        type: 'dropdown',
        expanded: false,
        roles: ['Branch Manager'],
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
        children: [
          { title: 'Transaction Limits', path: '/system/transaction-limits' },
          { title: 'Commission & Fees', path: '/system/fee-structures' }
        ]
      },
      {
        title: 'Compliance',
        type: 'dropdown',
        expanded: false,
        roles: ['Branch Manager', 'Compliance Officer'],
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        children: [
          { title: 'AML Threshold Rules', path: '/system/compliance-config' },
          { title: 'STR Escalation Rules', path: '/system/str-rules' }
        ]
      },
      {
        title: 'Partners',
        type: 'link',
        roles: ['Branch Manager'],
        path: '/system/partners',
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/></svg>'
      },
      {
        title: 'Integrations',
        type: 'dropdown',
        expanded: false,
        roles: ['Branch Manager'],
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
        children: [
          { title: 'API Gateway Connections', path: '/integrations' },
          { title: 'Webhook Subscriptions', path: '/system/webhooks' }
        ]
      }
    ]
  }
];
