                                                                                                                                                                                                                                                                                                                                                            import { Injectable, signal, computed } from '@angular/core';

// Interfaces for our banking system
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  idType: string;
  idNumber: string;
  kycStatus: 'Approved' | 'Pending' | 'Rejected';
  gender: string;
  dob: string;
  branchId: string;
  walletBalance: number;
  savingsBalance: number;
  loanBalance: number;
  registeredAt: string;
  documents: { type: string; url: string; status: 'Verified' | 'Pending' | 'Rejected' }[];
  notes: { date: string; author: string; content: string }[];
  timeline: { date: string; title: string; desc: string; icon: string }[];
}

export interface RepaymentPeriod {
  period: number;
  dueDate: string;
  principal: number;
  interest: number;
  total: number;
  paidAmount: number;
  status: 'Unpaid' | 'Paid' | 'Overdue';
}

export interface Loan {
  id: string;
  customerId: string;
  customerName: string;
  productType: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  status: 'Pending' | 'Approved' | 'Disbursed' | 'Repaying' | 'Closed' | 'Restructured' | 'Written Off';
  outstandingBalance: number;
  paidAmount: number;
  disbursementDate?: string;
  repaymentSchedule: RepaymentPeriod[];
  guarantors: { name: string; phone: string; amount: number }[];
  collateral: { type: string; valuation: number; desc: string }[];
  restructuredCount: number;
}

export interface SavingsAccount {
  id: string;
  accountNumber: string;
  customerId: string;
  customerName: string;
  accountType: 'Ordinary Savings' | 'Fixed Deposit' | 'Group Savings' | 'Goal Savings' | 'Voluntary Savings' | 'Share Capital';
  productType: string;
  balance: number;
  interestRate: number;
  status: 'Active' | 'Dormant' | 'Locked';
  targetAmount?: number;
  maturityDate?: string;
  lockedUntil?: string;
  registeredAt: string;
}

export interface ShareCapital {
  customerId: string;
  customerName: string;
  sharesCount: number;
  amount: number;
  certificates: string[];
  dividendHistory: { date: string; amount: number; rate: number }[];
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  accountId: string;
  accountType: 'Wallet' | 'Savings' | 'Loan' | 'Shares';
  type: 'Deposit' | 'Withdrawal' | 'Transfer' | 'Repayment' | 'Interest' | 'Shares Purchase' | 'Disbursement';
  amount: number;
  date: string;
  description: string;
  referenceNumber: string;
}

export interface Collector {
  id: string;
  name: string;
  branchId: string;
  status: string;
  assignedZone: string;
  currentGps: { latitude: number; longitude: number };
  collectionsToday: number;
  targetCollections: number;
  recoveryRate: number;
  recoveryRatePct: number;
  phone: string;
  gpsLog: { lat: number; lng: number; time: string };
  visits: { customerName: string; address: string; time: string; status: 'Pending' | 'Completed' | 'Missed' }[];
  promises: { customerName: string; amount: number; dueDate: string; status: 'Pending' | 'Honored' | 'Broken' }[];
}

export interface PromiseToPay {
  id: string;
  customerName: string;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Honored' | 'Broken';
}

export interface CollateralAsset {
  id: string;
  customerId: string;
  customerName: string;
  assetType: 'Vehicle' | 'Land' | 'Building' | 'Equipment' | 'Gold' | 'Livestock';
  description: string;
  valuationAmount: number;
  insuranceCompany?: string;
  policyNumber?: string;
  valuationDate: string;
  status: 'Pending' | 'Verified' | 'Released';
}

export interface AccountLedger {
  code: string;
  name: string;
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  type: 'Debit' | 'Credit';
  balance: number;
}

export type LedgerAccount = AccountLedger;

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  referenceNo: string;
  debits: { accountCode: string; amount: number }[];
  credits: { accountCode: string; amount: number }[];
  status: 'Draft' | 'Posted';
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  manager: string;
  managerName?: string;
  cashPosition: number;
  performanceRating: number;
  usersCount: number;
  employeeCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'CreditOfficer' | 'CollectionOfficer';
  branchId: string;
  active: boolean;
  avatar: string;
}

export interface WorkflowApproval {
  id: string;
  type: 'Loan Application' | 'Restructuring' | 'Write Off' | 'Limit Override';
  targetId: string;
  targetName: string;
  requesterName?: string;
  description?: string;
  tierAssigned?: string;
  amount: number;
  requestedBy: string;
  requestedDate: string;
  currentLevelIndex: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvalLevels: {
    role: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    approvedBy?: string;
    actionDate?: string;
    comments?: string;
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role?: string;
  action: string;
  ipAddress: string;
}

export interface Integration {
  id: string;
  name: string;
  type: 'Payment Gateway' | 'Mobile Money' | 'Bank' | 'SMS Gateway' | 'Credit Bureau' | 'Gov API';
  status: 'Connected' | 'Degraded' | 'Disconnected';
  latencyMs: number;
  lastSync: string;
}

export interface RiskAlert {
  id: string;
  customerId: string;
  customerName: string;
  riskType: 'Delinquency' | 'Fraud Alert' | 'AML Flag' | 'Multiple Loans';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  date: string;
  status: 'Active' | 'Resolved' | 'Under Investigation';
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Current user state
  currentUser = signal<User | null>({
    id: 'USR-001',
    name: 'Sarah Jenkins',
    email: 's.jenkins@ccfinance.co.zw',
    role: 'Admin',
    branchId: 'BR-101',
    active: true,
    avatar: 'assets/avatars/admin.png'
  });

  // Notification lists
  notifications = signal<{ id: string; title: string; body: string; date: string; type: string; read: boolean }[]>([
    { id: '1', title: 'New Loan Application', body: 'Sarah Connor submitted a business loan application for $25,000.', date: '2026-06-29T05:10:00Z', type: 'loan', read: false },
    { id: '2', title: 'Payment Gateway Offline', body: 'Paygate API connection timed out. Automatic retries enabled.', date: '2026-06-29T04:30:00Z', type: 'system', read: false },
    { id: '3', title: 'Guarantor Limit Exceeded', body: 'Guarantor John Doe has reached 90% of his maximum guaranteed limit.', date: '2026-06-29T02:15:00Z', type: 'risk', read: true }
  ]);

  guarantors = signal<any[]>([
    {
      id: 'G-101',
      name: 'Robert Wright',
      phone: '+263 77 987 6543',
      employerName: 'Harare City Council',
      totalGuaranteedAmount: 5000,
      activeLoansGuaranteedCount: 1,
      maxExposureLimit: 15000
    }
  ]);

  collaterals = signal<any[]>([
    {
      id: 'COL-101',
      type: 'Vehicle',
      description: 'Toyota Hilux 2018 (Reg: ABW-4829)',
      marketValue: 18000,
      valuedBy: 'Alliance Valuations',
      valuationDate: '2026-01-05',
      isInsured: true,
      lienRegistered: true
    },
    {
      id: 'COL-102',
      type: 'Real Estate',
      description: '5 Hectares farmland in Ejura, Ashanti',
      marketValue: 35000,
      valuedBy: 'Ashanti Land Registry',
      valuationDate: '2025-06-01',
      isInsured: false,
      lienRegistered: true
    }
  ]);


  // Master lists
  customers = signal<Customer[]>([
    {
      id: 'CUST-001',
      name: 'Alexander Wright',
      email: 'a.wright@gmail.com',
      phone: '+263 77 123 4567',
      address: '74 Borrowdale Rd, Harare, Zimbabwe',
      idType: 'National ID',
      idNumber: '63-123456-A-45',
      kycStatus: 'Approved',
      gender: 'Male',
      dob: '1985-05-12',
      branchId: 'BR-101',
      walletBalance: 250.50,
      savingsBalance: 5450.00,
      loanBalance: 8200.00,
      registeredAt: '2025-01-10T09:00:00Z',
      documents: [
        { type: 'National ID Scan', url: 'id.pdf', status: 'Verified' },
        { type: 'Proof of Residence', url: 'utility_bill.pdf', status: 'Verified' },
        { type: 'Business License', url: 'business_cert.pdf', status: 'Verified' }
      ],
      notes: [
        { date: '2026-02-15', author: 'Sarah Jenkins', content: 'Client visited office. Business expansion is progressing well.' }
      ],
      timeline: [
        { date: '2026-01-10', title: 'Loan Disbursed', desc: 'Disbursed $10,000 Business Expansion Loan', icon: 'check-circle' },
        { date: '2025-01-10', title: 'Account Opened', desc: 'Opened Ordinary Savings and Wallet accounts', icon: 'user' }
      ]
    },
    {
      id: 'CUST-002',
      name: 'Sarah Connor',
      email: 'sconnor@cyberdyne.net',
      phone: '+263 78 888 9999',
      address: '42 Sector Road, Bulawayo, Zimbabwe',
      idType: 'Passport',
      idNumber: 'PP-7839219',
      kycStatus: 'Pending',
      gender: 'Female',
      dob: '1989-11-23',
      branchId: 'BR-101',
      walletBalance: 12.00,
      savingsBalance: 120.00,
      loanBalance: 0,
      registeredAt: '2026-06-28T14:20:00Z',
      documents: [
        { type: 'Passport Scan', url: 'passport.jpg', status: 'Pending' },
        { type: 'Proof of Address', url: 'lease.pdf', status: 'Verified' }
      ],
      notes: [
        { date: '2026-06-28', author: 'Markus Vance', content: 'Applied for micro loan. Uploaded passport is slightly blurry.' }
      ],
      timeline: [
        { date: '2026-06-28', title: 'KYC Uploaded', desc: 'Uploaded Passport scan & Proof of Residence', icon: 'file' },
        { date: '2026-06-28', title: 'Registered', desc: 'Customer self-registered online', icon: 'user-plus' }
      ]
    },
    {
      id: 'CUST-003',
      name: 'Kofi Mensah',
      email: 'k.mensah@ghana-tech.com',
      phone: '+233 24 555 1234',
      address: 'Ring Road Central, Accra, Ghana',
      idType: 'Ghana Card',
      idNumber: 'GHA-0023412-8',
      kycStatus: 'Approved',
      gender: 'Male',
      dob: '1978-04-03',
      branchId: 'BR-102',
      walletBalance: 1450.75,
      savingsBalance: 12300.00,
      loanBalance: 15400.00,
      registeredAt: '2024-05-15T08:30:00Z',
      documents: [
        { type: 'Ghana Card Scan', url: 'gh_card.pdf', status: 'Verified' }
      ],
      notes: [
        { date: '2026-04-20', author: 'Daniel Boateng', content: 'Inquired about agricultural loan restructure due to delayed harvests.' }
      ],
      timeline: [
        { date: '2025-06-15', title: 'Loan Refinanced', desc: 'Approved restructured payment plan', icon: 'refresh-cw' }
      ]
    },
    {
      id: 'CUST-004',
      name: 'Fatima Al-Sayed',
      email: 'fatima.s@outlook.com',
      phone: '+254 71 234 5678',
      address: 'Kilimani, Nairobi, Kenya',
      idType: 'National ID',
      idNumber: 'ID-88392019',
      kycStatus: 'Approved',
      gender: 'Female',
      dob: '1992-07-31',
      branchId: 'BR-103',
      walletBalance: 3200.00,
      savingsBalance: 45000.00,
      loanBalance: 0,
      registeredAt: '2023-11-20T11:15:00Z',
      documents: [
        { type: 'ID Card', url: 'id.jpg', status: 'Verified' }
      ],
      notes: [],
      timeline: []
    }
  ]);

  loans = signal<Loan[]>([
    {
      id: 'LOAN-001',
      customerId: 'CUST-001',
      customerName: 'Alexander Wright',
      productType: 'SME Expansion Loan',
      amount: 15000,
      interestRate: 12,
      termMonths: 12,
      status: 'Repaying',
      outstandingBalance: 8200,
      paidAmount: 6800,
      disbursementDate: '2026-01-10',
      guarantors: [{ name: 'Robert Wright', phone: '+263 77 987 6543', amount: 5000 }],
      collateral: [{ type: 'Vehicle', valuation: 18000, desc: 'Toyota Hilux 2018 (Reg: ABW-4829)' }],
      restructuredCount: 0,
      repaymentSchedule: [
        { period: 1, dueDate: '2026-02-10', principal: 1250, interest: 150, total: 1400, paidAmount: 1400, status: 'Paid' },
        { period: 2, dueDate: '2026-03-10', principal: 1250, interest: 150, total: 1400, paidAmount: 1400, status: 'Paid' },
        { period: 3, dueDate: '2026-04-10', principal: 1250, interest: 150, total: 1400, paidAmount: 1400, status: 'Paid' },
        { period: 4, dueDate: '2026-05-10', principal: 1250, interest: 150, total: 1400, paidAmount: 1400, status: 'Paid' },
        { period: 5, dueDate: '2026-06-10', principal: 1250, interest: 150, total: 1400, paidAmount: 1200, status: 'Paid' }, // Partial payment counted as paid
        { period: 6, dueDate: '2026-07-10', principal: 1250, interest: 150, total: 1400, paidAmount: 0, status: 'Unpaid' },
        { period: 7, dueDate: '2026-08-10', principal: 1250, interest: 150, total: 1400, paidAmount: 0, status: 'Unpaid' },
        { period: 8, dueDate: '2026-09-10', principal: 1250, interest: 150, total: 1400, paidAmount: 0, status: 'Unpaid' },
        { period: 9, dueDate: '2026-10-10', principal: 1250, interest: 150, total: 1400, paidAmount: 0, status: 'Unpaid' },
        { period: 10, dueDate: '2026-11-10', principal: 1250, interest: 150, total: 1400, paidAmount: 0, status: 'Unpaid' },
        { period: 11, dueDate: '2026-12-10', principal: 1250, interest: 150, total: 1400, paidAmount: 0, status: 'Unpaid' },
        { period: 12, dueDate: '2027-01-10', principal: 1250, interest: 150, total: 1400, paidAmount: 0, status: 'Unpaid' }
      ]
    },
    {
      id: 'LOAN-002',
      customerId: 'CUST-003',
      customerName: 'Kofi Mensah',
      productType: 'Agri-Business Finance',
      amount: 20000,
      interestRate: 8,
      termMonths: 18,
      status: 'Restructured',
      outstandingBalance: 15400,
      paidAmount: 4600,
      disbursementDate: '2025-06-15',
      guarantors: [{ name: 'Ghana Cocoa Board Coop', phone: 'Coop Line', amount: 15000 }],
      collateral: [{ type: 'Land', valuation: 35000, desc: '5 Hectares farmland in Ejura, Ashanti' }],
      restructuredCount: 1,
      repaymentSchedule: [
        { period: 1, dueDate: '2025-07-15', principal: 1111, interest: 133, total: 1244, paidAmount: 1244, status: 'Paid' },
        { period: 2, dueDate: '2025-08-15', principal: 1111, interest: 133, total: 1244, paidAmount: 1244, status: 'Paid' },
        { period: 3, dueDate: '2025-09-15', principal: 1111, interest: 133, total: 1244, paidAmount: 1244, status: 'Paid' },
        { period: 4, dueDate: '2025-10-15', principal: 1111, interest: 133, total: 1244, paidAmount: 868, status: 'Paid' }, // restructured point
        { period: 5, dueDate: '2025-11-15', principal: 900, interest: 100, total: 1000, paidAmount: 0, status: 'Overdue' }
      ]
    }
  ]);

  savingsAccounts = signal<SavingsAccount[]>([
    { id: 'SAV-001', accountNumber: 'SAV-001', customerId: 'CUST-001', customerName: 'Alexander Wright', accountType: 'Ordinary Savings', productType: 'Voluntary Savings', balance: 5450.00, interestRate: 2.5, status: 'Active', registeredAt: '2025-01-10T09:00:00Z' },
    { id: 'SAV-002', accountNumber: 'SAV-002', customerId: 'CUST-002', customerName: 'Sarah Connor', accountType: 'Ordinary Savings', productType: 'Voluntary Savings', balance: 120.00, interestRate: 2.5, status: 'Active', registeredAt: '2026-06-28T14:20:00Z' },
    { id: 'SAV-003', accountNumber: 'SAV-003', customerId: 'CUST-003', customerName: 'Kofi Mensah', accountType: 'Group Savings', productType: 'Group Savings', balance: 12300.00, interestRate: 4.0, status: 'Active', registeredAt: '2024-05-15T08:30:00Z' },
    { id: 'SAV-004', accountNumber: 'SAV-004', customerId: 'CUST-004', customerName: 'Fatima Al-Sayed', accountType: 'Fixed Deposit', productType: 'Fixed Deposit', balance: 45000.00, interestRate: 7.5, status: 'Locked', lockedUntil: '2026-11-20', maturityDate: '2026-11-20', registeredAt: '2023-11-20T11:15:00Z' }
  ]);

  shareCapitals = signal<ShareCapital[]>([
    { customerId: 'CUST-001', customerName: 'Alexander Wright', sharesCount: 500, amount: 5000, certificates: ['CERT-2025-0912'], dividendHistory: [{ date: '2025-12-31', amount: 250, rate: 5 }] },
    { customerId: 'CUST-004', customerName: 'Fatima Al-Sayed', sharesCount: 2000, amount: 20000, certificates: ['CERT-2024-0104', 'CERT-2025-0012'], dividendHistory: [{ date: '2025-12-31', amount: 1000, rate: 5 }] }
  ]);

  transactions = signal<Transaction[]>([
    { id: 'TXN-901', customerId: 'CUST-001', customerName: 'Alexander Wright', accountId: 'SAV-001', accountType: 'Savings', type: 'Deposit', amount: 500, date: '2026-06-28T10:15:00Z', description: 'Cash deposit via Teller', referenceNumber: 'REF88392019' },
    { id: 'TXN-902', customerId: 'CUST-001', customerName: 'Alexander Wright', accountId: 'LOAN-001', accountType: 'Loan', type: 'Repayment', amount: 1400, date: '2026-06-10T14:00:00Z', description: 'Loan repayment via mobile money', referenceNumber: 'REF99302198' },
    { id: 'TXN-903', customerId: 'CUST-003', customerName: 'Kofi Mensah', accountId: 'SAV-003', accountType: 'Savings', type: 'Interest', amount: 41, date: '2026-06-25T00:00:00Z', description: 'Monthly interest credit', referenceNumber: 'REF-INT-290' },
    { id: 'TXN-904', customerId: 'CUST-004', customerName: 'Fatima Al-Sayed', accountId: 'SAV-004', accountType: 'Savings', type: 'Shares Purchase', amount: 10000, date: '2026-06-20T11:00:00Z', description: 'Purchase of additional shares', referenceNumber: 'REF12984920' }
  ]);

  collectors = signal<Collector[]>([
    {
      id: 'COLL-001',
      name: 'Daniel Boateng',
      branchId: 'BR-101',
      status: 'Active',
      assignedZone: 'Harare CBD',
      currentGps: { latitude: -17.8292, longitude: 31.0522 },
      collectionsToday: 4200,
      targetCollections: 5000,
      recoveryRate: 84,
      recoveryRatePct: 84,
      phone: '+263 77 444 3322',
      gpsLog: { lat: -17.8292, lng: 31.0522, time: '2026-06-29T05:30:00Z' },
      visits: [
        { customerName: 'Sarah Connor', address: '42 Sector Road, Bulawayo', time: '10:30 AM', status: 'Pending' },
        { customerName: 'Alexander Wright', address: '74 Borrowdale Rd, Harare', time: '02:00 PM', status: 'Pending' }
      ],
      promises: [
        { customerName: 'John Doe', amount: 500, dueDate: '2026-06-30', status: 'Pending' }
      ]
    },
    {
      id: 'COLL-002',
      name: 'Markus Vance',
      branchId: 'BR-101',
      status: 'Active',
      assignedZone: 'Chitungwiza',
      currentGps: { latitude: -18.0123, longitude: 31.0789 },
      collectionsToday: 1500,
      targetCollections: 2000,
      recoveryRate: 75,
      recoveryRatePct: 75,
      phone: '+263 78 111 2222',
      gpsLog: { lat: -17.8492, lng: 31.0822, time: '2026-06-29T05:15:00Z' },
      visits: [],
      promises: []
    }
  ]);

  promiseToPays = signal<any[]>([
    { id: 'PTP-001', customerName: 'Alexander Wright', amount: 500, dueDate: '2026-06-30', status: 'Pending' },
    { id: 'PTP-002', customerName: 'Sarah Connor', amount: 150, dueDate: '2026-06-25', status: 'Honored' }
  ]);

  collateralAssets = signal<CollateralAsset[]>([
    { id: 'COL-101', customerId: 'CUST-001', customerName: 'Alexander Wright', assetType: 'Vehicle', description: 'Toyota Hilux 2018 (Reg: ABW-4829)', valuationAmount: 18000, insuranceCompany: 'Alliance Insurance', policyNumber: 'AL-8839219', valuationDate: '2026-01-05', status: 'Verified' },
    { id: 'COL-102', customerId: 'CUST-003', customerName: 'Kofi Mensah', assetType: 'Land', description: '5 Hectares farmland in Ejura, Ashanti', valuationAmount: 35000, insuranceCompany: undefined, policyNumber: undefined, valuationDate: '2025-06-01', status: 'Verified' }
  ]);

  branches = signal<Branch[]>([
    { id: 'BR-101', name: 'Harare Head Office', code: 'HRE-01', manager: 'Sarah Jenkins', managerName: 'Sarah Jenkins', cashPosition: 1250000, performanceRating: 4.8, usersCount: 15, employeeCount: 15 },
    { id: 'BR-102', name: 'Accra Branch', code: 'ACC-02', manager: 'Daniel Boateng', managerName: 'Daniel Boateng', cashPosition: 450000, performanceRating: 4.2, usersCount: 8, employeeCount: 8 },
    { id: 'BR-103', name: 'Nairobi Branch', code: 'NBO-03', manager: 'Esther Mwangi', managerName: 'Esther Mwangi', cashPosition: 680000, performanceRating: 4.5, usersCount: 10, employeeCount: 10 }
  ]);

  users = signal<User[]>([
    { id: 'USR-001', name: 'Sarah Jenkins', email: 's.jenkins@ccfinance.co.zw', role: 'Admin', branchId: 'BR-101', active: true, avatar: 'assets/avatars/admin.png' },
    { id: 'USR-002', name: 'Daniel Boateng', email: 'd.boateng@ccfinance.co.zw', role: 'Manager', branchId: 'BR-102', active: true, avatar: 'assets/avatars/manager.png' },
    { id: 'USR-003', name: 'Markus Vance', email: 'm.vance@ccfinance.co.zw', role: 'CreditOfficer', branchId: 'BR-101', active: true, avatar: 'assets/avatars/officer.png' },
    { id: 'USR-004', name: 'Alice Smith', email: 'a.smith@ccfinance.co.zw', role: 'CollectionOfficer', branchId: 'BR-101', active: true, avatar: 'assets/avatars/collector.png' }
  ]);

  workflowApprovals = signal<WorkflowApproval[]>([
    {
      id: 'WF-001',
      type: 'Loan Application',
      targetId: 'LOAN-NEW-001',
      targetName: 'Sarah Connor',
      requesterName: 'Customer Portal',
      description: 'Business loan application for Sarah Connor',
      tierAssigned: 'CreditOfficer',
      amount: 5000,
      requestedBy: 'Customer Portal',
      requestedDate: '2026-06-28',
      currentLevelIndex: 0,
      status: 'Pending',
      approvalLevels: [
        { role: 'CreditOfficer', status: 'Pending' },
        { role: 'Manager', status: 'Pending' }
      ]
    }
  ]);

  auditLogs = signal<AuditLog[]>([
    { id: 'AUD-001', timestamp: '2026-06-29T05:20:00Z', userId: 'USR-001', userName: 'Sarah Jenkins', role: 'Admin', action: 'Approved Loan LOAN-001 restructuring request', ipAddress: '192.168.1.100' },
    { id: 'AUD-002', timestamp: '2026-06-29T04:15:00Z', userId: 'USR-003', userName: 'Markus Vance', role: 'CreditOfficer', action: 'Created new Customer record: CUST-002 (Sarah Connor)', ipAddress: '192.168.1.102' }
  ]);

  integrations = signal<Integration[]>([
    { id: 'INT-01', name: 'Stripe Payment Gateway', type: 'Payment Gateway', status: 'Connected', latencyMs: 45, lastSync: '2026-06-29T05:30:00Z' },
    { id: 'INT-02', name: 'EcoCash Mobile Money', type: 'Mobile Money', status: 'Connected', latencyMs: 68, lastSync: '2026-06-29T05:28:00Z' },
    { id: 'INT-03', name: 'CBZ Bank Direct Transfer API', type: 'Bank', status: 'Degraded', latencyMs: 412, lastSync: '2026-06-29T05:25:00Z' },
    { id: 'INT-04', name: 'Twilio SMS Gateway', type: 'SMS Gateway', status: 'Connected', latencyMs: 25, lastSync: '2026-06-29T05:29:00Z' },
    { id: 'INT-05', name: 'TransUnion Credit Bureau API', type: 'Credit Bureau', status: 'Connected', latencyMs: 120, lastSync: '2026-06-29T05:00:00Z' },
    { id: 'INT-06', name: 'ZIMRA Government Tax API', type: 'Gov API', status: 'Disconnected', latencyMs: 0, lastSync: '2026-06-28T23:00:00Z' }
  ]);

  riskAlerts = signal<RiskAlert[]>([
    { id: 'RSK-001', customerId: 'CUST-003', customerName: 'Kofi Mensah', riskType: 'Delinquency', severity: 'High', description: 'Loan LOAN-002 is 14 days overdue.', date: '2026-06-15', status: 'Under Investigation' },
    { id: 'RSK-002', customerId: 'CUST-002', customerName: 'Sarah Connor', riskType: 'Fraud Alert', severity: 'Critical', description: 'Multiple failed KYC document uploads detected.', date: '2026-06-28', status: 'Active' }
  ]);

  chartOfAccounts = signal<AccountLedger[]>([
    // Assets
    { code: '1000', name: 'Cash and Bank Balances', category: 'Asset', type: 'Debit', balance: 2380000 },
    { code: '1100', name: 'Loan Portfolio Outstanding', category: 'Asset', type: 'Debit', balance: 23600 },
    { code: '1200', name: 'Allowance for Loan Losses', category: 'Asset', type: 'Debit', balance: -1500 },
    // Liabilities
    { code: '2000', name: 'Customer Deposits (Savings)', category: 'Liability', type: 'Credit', balance: 62870 },
    { code: '2100', name: 'Share Capital Dividends Payable', category: 'Liability', type: 'Credit', balance: 1250 },
    // Equity
    { code: '3000', name: 'Paid-in Share Capital', category: 'Equity', type: 'Credit', balance: 25000 },
    { code: '3100', name: 'Retained Earnings', category: 'Equity', type: 'Credit', balance: 2280000 },
    // Revenues
    { code: '4000', name: 'Interest Income on Loans', category: 'Revenue', type: 'Credit', balance: 18200 },
    { code: '4100', name: 'Fee Income (Setup, Penalty)', category: 'Revenue', type: 'Credit', balance: 2450 },
    // Expenses
    { code: '5000', name: 'Personnel and Salaries', category: 'Expense', type: 'Debit', balance: 8500 },
    { code: '5100', name: 'Office rent and Utilities', category: 'Expense', type: 'Debit', balance: 4100 },
    { code: '5200', name: 'Provision for Impairment', category: 'Expense', type: 'Debit', balance: 1500 }
  ]);

  journalEntries = signal<JournalEntry[]>([
    {
      id: 'JE-001',
      date: '2026-06-28',
      description: 'Record Interest Earned on Kofi Mensah Account SAV-003',
      referenceNo: 'REF-JE-9901',
      debits: [{ accountCode: '5200', amount: 41 }],
      credits: [{ accountCode: '2000', amount: 41 }],
      status: 'Posted'
    },
    {
      id: 'JE-002',
      date: '2026-06-20',
      description: 'Record Purchase of Shares - Fatima Al-Sayed',
      referenceNo: 'REF-JE-9902',
      debits: [{ accountCode: '1000', amount: 10000 }],
      credits: [{ accountCode: '3000', amount: 10000 }],
      status: 'Posted'
    }
  ]);

  systemSettings = signal({
    institutionName: 'Central Capital Finance',
    tagline: 'Transacting made convenient',
    baseCurrency: 'USD ($)',
    interestComputation: 'Declining Balance',
    defaultPenaltyRate: 15,
    approvalTiers: [
      { name: 'Tier 1 - Credit Officer', limit: 5000 },
      { name: 'Tier 2 - Branch Manager', limit: 25000 },
      { name: 'Tier 3 - Chief Credit Officer', limit: 100000 }
    ],
    security: {
      enable2FA: true,
      sessionTimeoutMin: 15,
      passwordExpiryDays: 90
    }
  });

  ledgerAccounts = this.chartOfAccounts;

  // Computed state for Dashboard / Analytics
  totalCustomers = computed(() => this.customers().length);
  activeLoansCount = computed(() => this.loans().filter(l => l.status === 'Repaying' || l.status === 'Restructured').length);
  loanPortfolioValue = computed(() => this.loans().reduce((sum, l) => sum + l.outstandingBalance, 0));
  totalSavings = computed(() => this.savingsAccounts().reduce((sum, s) => sum + s.balance, 0));
  
  portfolioAtRiskValue = computed(() => {
    // Sum outstanding balance of overdue/restructured loans
    return this.loans()
      .filter(l => l.status === 'Restructured' || l.repaymentSchedule.some(s => s.status === 'Overdue'))
      .reduce((sum, l) => sum + l.outstandingBalance, 0);
  });
  
  portfolioAtRiskPct = computed(() => {
    const portfolio = this.loanPortfolioValue();
    if (portfolio === 0) return 0;
    return (this.portfolioAtRiskValue() / portfolio) * 100;
  });

  totalCapital = computed(() => this.shareCapitals().reduce((sum, s) => sum + s.amount, 0));

  // State mutation actions
  registerCustomer(customer: Omit<Customer, 'id' | 'registeredAt' | 'walletBalance' | 'savingsBalance' | 'loanBalance'>) {
    const newId = `CUST-${String(this.customers().length + 1).padStart(3, '0')}`;
    const newCustomer: Customer = {
      ...customer,
      id: newId,
      registeredAt: new Date().toISOString(),
      walletBalance: 0,
      savingsBalance: 0,
      loanBalance: 0
    };
    this.customers.update(prev => [newCustomer, ...prev]);
    this.addAuditLog(`Registered new customer: ${newCustomer.name} (${newId})`);
    return newCustomer;
  }

  applyForLoan(loanData: { customerId: string; productType: string; amount: number; termMonths: number; interestRate: number; guarantors: any[]; collateral: any[] }) {
    const cust = this.customers().find(c => c.id === loanData.customerId);
    if (!cust) return null;

    const newWfId = `WF-${String(this.workflowApprovals().length + 1).padStart(3, '0')}`;
    const newWf: WorkflowApproval = {
      id: newWfId,
      type: 'Loan Application',
      targetId: `LOAN-TEMP-${this.loans().length + 1}`,
      targetName: cust.name,
      amount: loanData.amount,
      requestedBy: this.currentUser()?.name || 'System',
      requestedDate: new Date().toISOString().split('T')[0],
      currentLevelIndex: 0,
      status: 'Pending',
      approvalLevels: [
        { role: 'CreditOfficer', status: 'Pending' },
        { role: 'Manager', status: 'Pending' }
      ]
    };

    // We store the pending loan application context or create a pending loan
    const newLoan: Loan = {
      id: `LOAN-TEMP-${this.loans().length + 1}`,
      customerId: loanData.customerId,
      customerName: cust.name,
      productType: loanData.productType,
      amount: loanData.amount,
      interestRate: loanData.interestRate,
      termMonths: loanData.termMonths,
      status: 'Pending',
      outstandingBalance: loanData.amount,
      paidAmount: 0,
      guarantors: loanData.guarantors,
      collateral: loanData.collateral,
      restructuredCount: 0,
      repaymentSchedule: this.generateRepaymentSchedule(loanData.amount, loanData.interestRate, loanData.termMonths)
    };

    this.loans.update(prev => [newLoan, ...prev]);
    this.workflowApprovals.update(prev => [newWf, ...prev]);
    this.addAuditLog(`Created loan application for ${cust.name} - $${loanData.amount}`);
    return { loan: newLoan, workflow: newWf };
  }

  private generateRepaymentSchedule(amount: number, annualRate: number, termMonths: number): RepaymentPeriod[] {
    const monthlyRate = (annualRate / 100) / 12;
    const totalPayment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
    const schedule: RepaymentPeriod[] = [];
    let remainingPrincipal = amount;

    for (let i = 1; i <= termMonths; i++) {
      const interest = remainingPrincipal * monthlyRate;
      const principal = totalPayment - interest;
      remainingPrincipal -= principal;

      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        period: i,
        dueDate: dueDate.toISOString().split('T')[0],
        principal: Math.round(principal * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        total: Math.round(totalPayment * 100) / 100,
        paidAmount: 0,
        status: 'Unpaid'
      });
    }
    return schedule;
  }

  approveWorkflow(wfId: string, comment: string = '') {
    const u = this.currentUser();
    if (!u) return;

    this.workflowApprovals.update(wfs => {
      return wfs.map(wf => {
        if (wf.id !== wfId) return wf;

        const updatedLevels = [...wf.approvalLevels];
        const currentLevel = updatedLevels[wf.currentLevelIndex];

        if (currentLevel && currentLevel.role === u.role) {
          updatedLevels[wf.currentLevelIndex] = {
            ...currentLevel,
            status: 'Approved',
            approvedBy: u.name,
            actionDate: new Date().toISOString().split('T')[0],
            comments: comment
          };

          const nextIndex = wf.currentLevelIndex + 1;
          const isFinished = nextIndex >= updatedLevels.length;

          // If fully approved, trigger the side effects (e.g. loan disbursement)
          if (isFinished) {
            this.handleWorkflowCompletion(wf);
          }

          return {
            ...wf,
            approvalLevels: updatedLevels,
            currentLevelIndex: isFinished ? wf.currentLevelIndex : nextIndex,
            status: isFinished ? 'Approved' : 'Pending'
          } as WorkflowApproval;
        }
        return wf;
      });
    });
  }

  rejectWorkflow(wfId: string, comment: string = '') {
    const u = this.currentUser();
    if (!u) return;

    this.workflowApprovals.update(wfs => {
      return wfs.map(wf => {
        if (wf.id !== wfId) return wf;

        const updatedLevels = [...wf.approvalLevels];
        const currentLevel = updatedLevels[wf.currentLevelIndex];

        if (currentLevel && currentLevel.role === u.role) {
          updatedLevels[wf.currentLevelIndex] = {
            ...currentLevel,
            status: 'Rejected',
            approvedBy: u.name,
            actionDate: new Date().toISOString().split('T')[0],
            comments: comment
          };

          this.handleWorkflowRejection(wf);

          return {
            ...wf,
            approvalLevels: updatedLevels,
            status: 'Rejected'
          } as WorkflowApproval;
        }
        return wf;
      });
    });
  }

  private handleWorkflowCompletion(wf: WorkflowApproval) {
    if (wf.type === 'Loan Application') {
      this.loans.update(loans => {
        return loans.map(l => {
          if (l.id !== wf.targetId) return l;
          
          // Disburse loan: update status and customer balances
          const finalId = `LOAN-${String(loans.length + 1).padStart(3, '0')}`;
          
          // Side effect: update customer balance
          this.customers.update(custs => {
            return custs.map(c => {
              if (c.id === l.customerId) {
                return {
                  ...c,
                  loanBalance: c.loanBalance + l.amount,
                  walletBalance: c.walletBalance + l.amount,
                  timeline: [
                    { date: new Date().toISOString().split('T')[0], title: 'Loan Disbursed', desc: `Loan ${finalId} of $${l.amount} disbursed to Wallet`, icon: 'dollar-sign' },
                    ...c.timeline
                  ]
                };
              }
              return c;
            });
          });

          // Side effect: record transactions
          this.recordTransaction({
            customerId: l.customerId,
            customerName: l.customerName,
            accountId: finalId,
            accountType: 'Loan',
            type: 'Disbursement',
            amount: l.amount,
            description: `Disbursed ${l.productType} into wallet`
          });

          // Ledger entry
          this.postJournalEntry({
            description: `Disbursed loan ${finalId} to customer ${l.customerName}`,
            referenceNo: `REF-DISB-${finalId}`,
            debits: [{ accountCode: '1100', amount: l.amount }], // Loan Portfolio Assets +
            credits: [{ accountCode: '1000', amount: l.amount }]  // Cash and Bank Balances -
          });

          return {
            ...l,
            id: finalId,
            status: 'Disbursed',
            disbursementDate: new Date().toISOString().split('T')[0]
          };
        });
      });
      this.addAuditLog(`Loan Application approved and disbursed for ${wf.targetName} ($${wf.amount})`);
    }
  }

  private handleWorkflowRejection(wf: WorkflowApproval) {
    if (wf.type === 'Loan Application') {
      this.loans.update(loans => {
        return loans.map(l => {
          if (l.id !== wf.targetId) return l;
          return {
            ...l,
            status: 'Closed' // Rejected
          };
        });
      });
      this.addAuditLog(`Loan Application rejected for ${wf.targetName} ($${wf.amount})`);
    }
  }

  postJournalEntry(entry: Omit<JournalEntry, 'id' | 'status' | 'date'> & { date?: string }) {
    const newId = `JE-${String(this.journalEntries().length + 1).padStart(3, '0')}`;
    const newEntry: JournalEntry = {
      ...entry,
      date: entry.date || new Date().toISOString().split('T')[0],
      id: newId,
      status: 'Posted'
    };

    // Update balances in Chart of Accounts
    this.chartOfAccounts.update(coa => {
      return coa.map(acc => {
        let balanceChange = 0;
        
        // Debit increases assets and expenses, decreases liabilities, equity, and revenues
        const debitMatch = entry.debits.find(d => d.accountCode === acc.code);
        if (debitMatch) {
          if (acc.category === 'Asset' || acc.category === 'Expense') {
            balanceChange += debitMatch.amount;
          } else {
            balanceChange -= debitMatch.amount;
          }
        }

        // Credit increases liabilities, equity, and revenues, decreases assets and expenses
        const creditMatch = entry.credits.find(c => c.accountCode === acc.code);
        if (creditMatch) {
          if (acc.category === 'Asset' || acc.category === 'Expense') {
            balanceChange -= creditMatch.amount;
          } else {
            balanceChange += creditMatch.amount;
          }
        }

        if (balanceChange !== 0) {
          return {
            ...acc,
            balance: acc.balance + balanceChange
          };
        }
        return acc;
      });
    });

    this.journalEntries.update(prev => [newEntry, ...prev]);
    return newEntry;
  }

  recordTransaction(txn: Omit<Transaction, 'id' | 'date' | 'referenceNumber'>) {
    const newId = `TXN-${String(this.transactions().length + 1).padStart(3, '0')}`;
    const newTxn: Transaction = {
      ...txn,
      id: newId,
      date: new Date().toISOString(),
      referenceNumber: `REF${Math.floor(10000000 + Math.random() * 90000000)}`
    };

    this.transactions.update(prev => [newTxn, ...prev]);

    // Update internal savings/wallet balances if applicable
    if (txn.accountType === 'Savings') {
      this.savingsAccounts.update(accounts => {
        return accounts.map(acc => {
          if (acc.id === txn.accountId) {
            const val = txn.type === 'Deposit' || txn.type === 'Interest' ? txn.amount : -txn.amount;
            return {
              ...acc,
              balance: acc.balance + val
            };
          }
          return acc;
        });
      });
      // also update customer savings balance
      this.customers.update(custs => {
        return custs.map(c => {
          if (c.id === txn.customerId) {
            const val = txn.type === 'Deposit' || txn.type === 'Interest' ? txn.amount : -txn.amount;
            return {
              ...c,
              savingsBalance: c.savingsBalance + val
            };
          }
          return c;
        });
      });
    }

    return newTxn;
  }

  openSavingsAccount(accData: { customerId: string; productType: string; initialDeposit: number; interestRate: number }) {
    const custName = this.customers().find(c => c.id === accData.customerId)?.name || 'Client';
    return this.addSavingsAccount({
      customerId: accData.customerId,
      customerName: custName,
      accountType: accData.productType as any,
      balance: accData.initialDeposit,
      interestRate: accData.interestRate
    });
  }

  addSavingsAccount(accData: Omit<SavingsAccount, 'id' | 'registeredAt' | 'status' | 'accountNumber' | 'productType'> & { accountNumber?: string; productType?: string }) {
    const newId = `SAV-${String(this.savingsAccounts().length + 1).padStart(3, '0')}`;
    const newAcc: SavingsAccount = {
      ...accData,
      id: newId,
      accountNumber: accData.accountNumber || newId,
      productType: accData.productType || accData.accountType,
      registeredAt: new Date().toISOString(),
      status: 'Active'
    };

    this.savingsAccounts.update(prev => [...prev, newAcc]);

    // Update customer savings balance
    this.customers.update(custs => {
      return custs.map(c => {
        if (c.id === accData.customerId) {
          return {
            ...c,
            savingsBalance: c.savingsBalance + accData.balance,
            timeline: [
              { date: new Date().toISOString().split('T')[0], title: 'Savings Opened', desc: `Opened ${accData.accountType} (${newId}) with balance $${accData.balance}`, icon: 'briefcase' },
              ...c.timeline
            ]
          };
        }
        return c;
      });
    });

    this.recordTransaction({
      customerId: accData.customerId,
      customerName: accData.customerName,
      accountId: newId,
      accountType: 'Savings',
      type: 'Deposit',
      amount: accData.balance,
      description: `Initial Deposit into ${accData.accountType}`
    });

    this.postJournalEntry({
      description: `Opened Savings account ${newId} for ${accData.customerName}`,
      referenceNo: `REF-SAV-${newId}`,
      debits: [{ accountCode: '1000', amount: accData.balance }], // Bank +
      credits: [{ accountCode: '2000', amount: accData.balance }]  // Savings Liability +
    });

    this.addAuditLog(`Opened savings account ${newId} for customer ${accData.customerName}`);
    return newAcc;
  }

  makeRepayment(loanId: string, amount: number) {
    this.loans.update(loans => {
      return loans.map(l => {
        if (l.id !== loanId) return l;

        const outstanding = l.outstandingBalance - amount;
        const paid = l.paidAmount + amount;
        
        // Update customer loan balance
        this.customers.update(custs => {
          return custs.map(c => {
            if (c.id === l.customerId) {
              return {
                ...c,
                loanBalance: Math.max(0, c.loanBalance - amount),
                walletBalance: Math.max(0, c.walletBalance - amount),
                timeline: [
                  { date: new Date().toISOString().split('T')[0], title: 'Loan Repayment', desc: `Repaid $${amount} towards loan ${l.id}`, icon: 'credit-card' },
                  ...c.timeline
                ]
              };
            }
            return c;
          });
        });

        // Record transaction
        this.recordTransaction({
          customerId: l.customerId,
          customerName: l.customerName,
          accountId: l.id,
          accountType: 'Loan',
          type: 'Repayment',
          amount: amount,
          description: `Loan repayment for ${l.id}`
        });

        // Journal Entry
        this.postJournalEntry({
          description: `Repayment received on Loan ${l.id}`,
          referenceNo: `REF-REPAY-${l.id}`,
          debits: [{ accountCode: '1000', amount: amount }], // Cash +
          credits: [{ accountCode: '1100', amount: amount }]  // Loan Receivable -
        });

        return {
          ...l,
          outstandingBalance: Math.max(0, outstanding),
          paidAmount: paid,
          status: outstanding <= 0 ? 'Closed' : l.status
        } as Loan;
      });
    });
    this.addAuditLog(`Received loan repayment of $${amount} for ${loanId}`);
  }

  purchaseShares(customerId: string, sharesCount: number) {
    const cust = this.customers().find(c => c.id === customerId);
    if (!cust) return;

    const sharePrice = 10; // $10 per share
    const totalVal = sharesCount * sharePrice;

    this.shareCapitals.update(shares => {
      const existing = shares.find(s => s.customerId === customerId);
      if (existing) {
        return shares.map(s => {
          if (s.customerId === customerId) {
            return {
              ...s,
              sharesCount: s.sharesCount + sharesCount,
              amount: s.amount + totalVal,
              certificates: [...s.certificates, `CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`]
            };
          }
          return s;
        });
      } else {
        return [...shares, {
          customerId: customerId,
          customerName: cust.name,
          sharesCount: sharesCount,
          amount: totalVal,
          certificates: [`CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`],
          dividendHistory: []
        }];
      }
    });

    this.recordTransaction({
      customerId: customerId,
      customerName: cust.name,
      accountId: 'shares',
      accountType: 'Shares',
      type: 'Shares Purchase',
      amount: totalVal,
      description: `Purchased ${sharesCount} shares`
    });

    this.postJournalEntry({
      description: `Share Capital Purchase - ${cust.name}`,
      referenceNo: `REF-SH-${customerId}`,
      debits: [{ accountCode: '1000', amount: totalVal }], // cash +
      credits: [{ accountCode: '3000', amount: totalVal }]  // Paid-in Capital +
    });

    this.addAuditLog(`${cust.name} purchased ${sharesCount} shares for $${totalVal}`);
  }

  addCollateral(asset: Omit<CollateralAsset, 'id' | 'status'>) {
    const newId = `COL-${String(this.collateralAssets().length + 101).padStart(3, '0')}`;
    const newAsset: CollateralAsset = {
      ...asset,
      id: newId,
      status: 'Verified'
    };
    this.collateralAssets.update(prev => [...prev, newAsset]);
    this.addAuditLog(`Added collateral asset ${newId} for ${asset.customerName}`);
    return newAsset;
  }

  addGuarantor(guarantor: Omit<GuarantorProfile, 'exposure' | 'guaranteedLoans'>) {
    // Check if guarantor is already in the list
    // (let's assume we maintain a list of guarantors)
  }

  addAuditLog(action: string) {
    const newId = `AUD-${String(this.auditLogs().length + 1).padStart(3, '0')}`;
    const u = this.currentUser();
    const newLog: AuditLog = {
      id: newId,
      timestamp: new Date().toISOString(),
      userId: u?.id || 'SYSTEM',
      userName: u?.name || 'System Auto',
      action: action,
      ipAddress: '192.168.1.100'
    };
    this.auditLogs.update(prev => [newLog, ...prev]);
  }
}

export interface GuarantorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  maxLimit: number;
  exposure: number;
  guaranteedLoans: { loanId: string; amount: number }[];
}
