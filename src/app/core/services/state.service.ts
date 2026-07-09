import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Teller' | 'Branch Manager' | 'Compliance Officer' | 'System Admin' | 'Field Agent' | 'Customer (Self-Service)' | string;
  branchId: string;
  active: boolean;
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  nationality: string;
  nationalId: string;
  phone: string;
  email?: any;
  address: string;
  dob: string;
  occupation: string;
  kycStatus: 'Verified' | 'Pending' | 'Flagged' | 'Expired' | 'Approved' | 'Rejected';
  photo?: string;
  documents: { type: string; url: string; status: 'Verified' | 'Pending' | 'Rejected' }[];
  notes?: any;
  registeredAt: string;
  timeline: { date: string; title: string; desc: string; icon: string }[];
  
  // Legacy Fields for Backward Compatibility
  savingsBalance?: number | any;
  walletBalance?: number | any;
  creditScore?: number | any;
  idNumber?: string | any;
  idType?: string | any;
  gender?: string | any;
  loanBalance?: number | any;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
}

export interface ExchangeRate {
  pair: string;
  buyRate: number;
  sellRate: number;
  spread: number; // percentage
  lastUpdated: string;
  status: 'Live' | 'Pending Approval' | 'Archived';
  proposedBuyRate?: number;
  proposedSellRate?: number;
  justification?: string;
  proposedBy?: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'Exchange' | 'Remittance';
  currencyPair: string; // e.g. USD/ZWG, ZAR/ZWG
  direction: 'Buy' | 'Sell' | 'Local' | 'International';
  amount: number; // foreign or send amount
  amountLocal: number; // ZWG amount or recipient amount
  rate: number;
  fee: number;
  payoutMethod: 'Cash' | 'EcoCash' | 'Bank Transfer' | 'ZIPIT' | 'Cash Pickup' | 'Bank Deposit' | 'Mobile Wallet';
  recipientName?: string;
  recipientPhone?: string;
  recipientAccount?: string;
  recipientId?: string;
  recipientIdType?: string;
  recipientAddress?: string;
  purpose?: string;
  sourceOfFunds?: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Reversed';
  notes?: string;
  timestamp: string;
  branchId: string;
  tellerId: string;
  payoutPin?: string;
  flagReason?: string;
  vettingResult?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  user: string;
  role: string;
  action: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  ipAddress: string;
}

export interface BranchLiquidity {
  currency: string;
  balance: number;
  reserved: number;
  threshold: number;
}

export interface TellerSession {
  tellerId: string;
  tellerName: string;
  branchName: string;
  sessionStart: string;
  txnTodayCount: number;
  txnTodayValueUsd: number;
}

export interface EodStatus {
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
  timestamp?: string;
  botLogs: string[];
  submittedCount: number;
}

export interface SavingsAccount {
  accountNumber: string;
  customerId: string;
  customerName: string;
  productType: string;
  interestRate: number;
  balance: number;
  lockedUntil?: string;
  status: 'Active' | 'Locked';
}

export type RepaymentPeriod = number;

export interface JournalEntry {
  referenceNo: string;
  description: string;
  date: string;
  debits: { accountCode: string; amount: number }[];
  credits: { accountCode: string; amount: number }[];
}

export interface Collector {
  id: string;
  name: string;
  collectionsToday: number;
  status: string;
  assignedZone: string;
  currentGps: { latitude: number; longitude: number };
  recoveryRatePct: number;
}

export interface PromiseToPay {
  id: string;
  customerId: string;
  customerName: string;
  loanId: string;
  amount: number;
  promisedDate: string;
  status: string;
}

export interface RepaymentSchedule {
  period: number;
  dueDate: string;
  total: number;
  paidAmount: number;
  status: string;
}

export interface Loan {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  interestRate: number;
  repaymentPeriod: number;
  status: string;
  outstandingBalance: number;
  productType: string;
  paidAmount: number;
  repaymentSchedule: RepaymentSchedule[];
  restructuredCount: number;
  disbursementDate?: string;
}

export interface Guarantor {
  id: string;
  customerId?: string;
  customerName?: string;
  guarantorName?: string;
  relationship?: string;
  maxLiability?: number;
  status?: string;
  name: string;
  phone: string;
  employerName: string;
  totalGuaranteedAmount: number;
  activeLoansGuaranteedCount: number;
  maxExposureLimit: number;
}

export interface Collateral {
  id: string;
  customerId?: string;
  customerName?: string;
  type: string;
  description: string;
  marketValue: number;
  valuedBy: string;
  valuationDate: string;
  isInsured: boolean;
  lienRegistered: boolean;
  status?: string;
}

export interface Integration {
  id: string;
  name: string;
  status: string;
  type: string;
  latencyMs: number;
}

export interface LedgerAccount {
  code: string;
  name: string;
  category: string;
  balance: number;
  type: 'Debit' | 'Credit';
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Pre-configured mock staff & customers
  users = signal<User[]>([
    { id: 'USR-001', name: 'Tawanda Chiimbira', email: 'teller@ccfinance.co.zw', role: 'Teller', branchId: 'BR-101', active: true, avatar: 'assets/avatars/teller.png' },
    { id: 'USR-002', name: 'George Chikopa', email: 'manager@ccfinance.co.zw', role: 'Branch Manager', branchId: 'BR-101', active: true, avatar: 'assets/avatars/manager.png' },
    { id: 'USR-003', name: 'Tedias Chikore', email: 'compliance@ccfinance.co.zw', role: 'Compliance Officer', branchId: 'BR-ALL', active: true, avatar: 'assets/avatars/compliance.png' },
    { id: 'USR-004', name: 'Chemunofira Chikosi', email: 'admin@ccfinance.co.zw', role: 'System Admin', branchId: 'BR-ALL', active: true, avatar: 'assets/avatars/admin.png' },
    { id: 'USR-005', name: 'Magret Chimbewa', email: 'agent@ccfinance.co.zw', role: 'Field Agent', branchId: 'BR-102', active: true, avatar: 'assets/avatars/agent.png' },
    { id: 'USR-006', name: 'Noah Chimboza', email: 'customer@ccfinance.co.zw', role: 'Customer (Self-Service)', branchId: 'BR-PORTAL', active: true, avatar: 'assets/avatars/customer.png' }
  ]);

  savingsAccounts = signal<SavingsAccount[]>([
    { accountNumber: 'SAV-1002394', customerId: 'CUST-001', customerName: 'Noah Chimboza', productType: 'Voluntary Savings', interestRate: 3, balance: 1450, status: 'Active' },
    { accountNumber: 'SAV-3392019', customerId: 'CUST-002', customerName: 'Josephat Chimuka', productType: 'Fixed Deposit', interestRate: 8, balance: 5000, lockedUntil: '2026-12-28', status: 'Locked' }
  ]);

  currentUser = signal<User | null>({
    id: 'USR-001',
    name: 'Tawanda Chiimbira',
    email: 'teller@ccfinance.co.zw',
    role: 'Teller',
    branchId: 'BR-101',
    active: true,
    avatar: 'assets/avatars/teller.png'
  });

  customers = signal<Customer[]>([
    {
      id: 'CUST-001',
      name: 'Noah Chimboza',
      nationality: 'Zimbabwean',
      nationalId: '63-123456-A-45',
      phone: '+263 77 123 4567',
      email: 'n.chimboza@gmail.com',
      address: '74 Borrowdale Rd, Harare, Zimbabwe',
      dob: '1985-05-12',
      occupation: 'Retail Merchant',
      kycStatus: 'Verified',
      documents: [
        { type: 'National ID Scan', url: 'national_id.png', status: 'Verified' },
        { type: 'Proof of Residence', url: 'utility_bill.png', status: 'Verified' }
      ],
      notes: [{ date: '2026-01-10', author: 'System', content: 'Customer is a regular retail merchant. All documents verified via local registry.' }],
      registeredAt: '2026-01-10T09:00:00Z',
      timeline: [
        { date: '2026-07-05', title: 'Remittance Sent', desc: 'Sent $450 USD to Bulawayo', icon: 'send' },
        { date: '2026-06-20', title: 'KYC Verified', desc: 'National ID and proof of residence checked', icon: 'shield' }
      ]
    },
    {
      id: 'CUST-002',
      name: 'Josephat Chimuka',
      nationality: 'Zimbabwean',
      nationalId: '42-998822-B-12',
      phone: '+263 78 888 9999',
      email: 'ssakhe@cyberdyne.net',
      address: '42 Sector Road, Bulawayo, Zimbabwe',
      dob: '1989-11-23',
      occupation: 'Security Consultant',
      kycStatus: 'Pending',
      documents: [
        { type: 'Passport Scan', url: 'passport.jpg', status: 'Pending' }
      ],
      notes: [{ date: '2026-06-28', author: 'System', content: 'Uploaded document is slightly blurry. Pending physical validation.' }],
      registeredAt: '2026-06-28T14:20:00Z',
      timeline: [
        { date: '2026-06-28', title: 'Onboarded', desc: 'Self-registered via Field Agent', icon: 'user-plus' }
      ]
    },
    {
      id: 'CUST-003',
      name: 'Edward Chimunasha',
      nationality: 'Ghanaian',
      nationalId: 'GHA-0023412-8',
      phone: '+233 24 555 1234',
      email: 'e.chimunasha@gmail.com',
      address: 'Ring Road Central, Accra, Ghana',
      dob: '1978-04-03',
      occupation: 'Software Engineer',
      kycStatus: 'Flagged',
      documents: [
        { type: 'Ghana Card', url: 'ghana_card.png', status: 'Verified' }
      ],
      notes: [{ date: '2026-05-15', author: 'System', content: 'Sanctions match trigger: Name matches a flagged individual in LexisNexis database. Under compliance review.' }],
      registeredAt: '2026-05-15T08:30:00Z',
      timeline: [
        { date: '2026-07-01', title: 'Flagged by AML', desc: 'Flagged due to sanctions match screening', icon: 'alert-triangle' }
      ]
    },
    {
      id: 'CUST-004',
      name: 'Cephas Chingosho',
      nationality: 'Kenyan',
      nationalId: 'ID-88392019',
      phone: '+254 71 234 5678',
      email: 'c.chingosho@outlook.com',
      address: 'Kilimani, Nairobi, Kenya',
      dob: '1992-07-31',
      occupation: 'Diplomat',
      kycStatus: 'Expired',
      documents: [
        { type: 'Diplomatic Passport', url: 'diplomatic_passport.png', status: 'Verified' }
      ],
      notes: [{ date: '2026-02-20', author: 'System', content: 'Passport expired on June 30, 2026. Needs update.' }],
      registeredAt: '2026-02-20T11:15:00Z',
      timeline: [
        { date: '2026-06-30', title: 'KYC Expired', desc: 'Passport validity date exceeded', icon: 'calendar' }
      ]
    },
    {
      id: 'CUST-005',
      name: 'Chipo Chingwaru',
      nationality: 'Zimbabwean',
      nationalId: '63-998877-K-45',
      phone: '+263 77 999 8888',
      email: 'c.chingwaru@gmail.com',
      address: '15 Samora Machel Ave, Harare, Zimbabwe',
      dob: '1990-08-15',
      occupation: 'Accountant',
      kycStatus: 'Verified',
      documents: [
        { type: 'National ID Scan', url: 'national_id.png', status: 'Verified' },
        { type: 'Proof of Residence', url: 'utility_bill.png', status: 'Verified' }
      ],
      notes: [{ date: '2026-07-08', author: 'System', content: 'Onboarded and fully verified.' }],
      registeredAt: '2026-07-08T10:00:00Z',
      timeline: [
        { date: '2026-07-08', title: 'KYC Verified', desc: 'All documents checked and approved', icon: 'shield' }
      ]
    }
  ]);

  rates = signal<ExchangeRate[]>([
    { pair: 'USD/ZWG', buyRate: 24.50, sellRate: 25.80, spread: 5.3, lastUpdated: '2026-07-07T12:00:00Z', status: 'Live' },
    { pair: 'GBP/ZWG', buyRate: 31.20, sellRate: 32.90, spread: 5.4, lastUpdated: '2026-07-07T12:00:00Z', status: 'Live' },
    { pair: 'ZAR/ZWG', buyRate: 1.30, sellRate: 1.42, spread: 9.2, lastUpdated: '2026-07-07T12:00:00Z', status: 'Live' },
    { pair: 'EUR/ZWG', buyRate: 26.80, sellRate: 28.20, spread: 5.2, lastUpdated: '2026-07-07T12:00:00Z', status: 'Live' },
    { pair: 'GBP/USD', buyRate: 1.28, sellRate: 1.32, spread: 3.1, lastUpdated: '2026-07-07T12:00:00Z', status: 'Live' },
    { pair: 'EUR/USD', buyRate: 1.09, sellRate: 1.13, spread: 3.6, lastUpdated: '2026-07-07T12:00:00Z', status: 'Live' },
    { pair: 'USD/ZAR', buyRate: 18.20, sellRate: 18.90, spread: 3.8, lastUpdated: '2026-07-07T12:00:00Z', status: 'Live' },
    { pair: 'GBP/ZAR', buyRate: 23.30, sellRate: 24.50, spread: 5.1, lastUpdated: '2026-07-07T12:00:00Z', status: 'Live' },
    { pair: 'EUR/ZAR', buyRate: 19.80, sellRate: 20.80, spread: 5.0, lastUpdated: '2026-07-07T12:00:00Z', status: 'Live' }
  ]);

  transactions = signal<Transaction[]>([
    {
      id: 'TXN-001',
      customerId: 'CUST-001',
      customerName: 'Noah Chimboza',
      type: 'Exchange',
      currencyPair: 'USD/ZWG',
      direction: 'Buy',
      amount: 500,
      amountLocal: 12250,
      rate: 24.50,
      fee: 25,
      payoutMethod: 'Cash',
      status: 'Completed',
      timestamp: '2026-07-07T10:15:00Z',
      branchId: 'BR-101',
      tellerId: 'USR-001'
    },
    {
      id: 'TXN-002',
      customerId: 'CUST-001',
      customerName: 'Noah Chimboza',
      type: 'Remittance',
      currencyPair: 'USD/ZWG',
      direction: 'International',
      amount: 1200,
      amountLocal: 29400,
      rate: 24.50,
      fee: 35,
      payoutMethod: 'Mobile Wallet',
      recipientName: 'Phineas Chivazve Chiota',
      recipientPhone: '+263 77 999 8888',
      recipientAccount: '0779998888',
      purpose: 'Family Support',
      sourceOfFunds: 'Salary',
      status: 'Completed',
      timestamp: '2026-07-07T11:00:00Z',
      branchId: 'BR-101',
      tellerId: 'USR-001',
      payoutPin: 'REM-8893-XWZ'
    },
    {
      id: 'TXN-003',
      customerId: 'CUST-003',
      customerName: 'Edward Chimunasha',
      type: 'Remittance',
      currencyPair: 'USD/ZWG',
      direction: 'International',
      amount: 6000,
      amountLocal: 147000,
      rate: 24.50,
      fee: 150,
      payoutMethod: 'Bank Deposit',
      recipientName: 'Edward Chimunasha Jr',
      recipientPhone: '+233 24 555 9999',
      recipientAccount: '990218820',
      purpose: 'Business',
      sourceOfFunds: 'Business Income',
      status: 'Pending',
      timestamp: '2026-07-07T11:30:00Z',
      branchId: 'BR-101',
      tellerId: 'USR-001',
      payoutPin: 'REM-3901-ABC',
      flagReason: 'Sanctions hit',
      vettingResult: 'Sanctions watch list match: Name matches Edward Chimunasha with 89% confidence.'
    },
    {
      id: 'TXN-004',
      customerId: 'CUST-002',
      customerName: 'Josephat Chimuka',
      type: 'Exchange',
      currencyPair: 'USD/ZWG',
      direction: 'Buy',
      amount: 15000,
      amountLocal: 367500,
      rate: 24.50,
      fee: 250,
      payoutMethod: 'Cash',
      status: 'Pending',
      timestamp: '2026-07-07T12:05:00Z',
      branchId: 'BR-101',
      tellerId: 'USR-001',
      flagReason: 'Exceeds daily KYC limit',
      vettingResult: 'Transaction amount ($15,000) exceeds Teller daily limit ($5,000). Requires Branch Manager override.'
    },
    {
      id: 'TXN-005',
      customerId: 'CUST-001',
      customerName: 'Noah Chimboza',
      type: 'Exchange',
      currencyPair: 'GBP/USD',
      direction: 'Buy',
      amount: 100,
      amountLocal: 127.36,
      rate: 1.28,
      fee: 0.64,
      payoutMethod: 'Cash',
      status: 'Completed',
      timestamp: '2026-07-07T12:15:00Z',
      branchId: 'BR-101',
      tellerId: 'USR-001'
    },
    {
      id: 'TXN-006',
      customerId: 'CUST-002',
      customerName: 'Josephat Chimuka',
      type: 'Remittance',
      currencyPair: 'USD/ZAR',
      direction: 'International',
      amount: 250,
      amountLocal: 4550,
      rate: 18.20,
      fee: 12.50,
      payoutMethod: 'Mobile Wallet',
      recipientName: 'Sipho Ndlovu',
      recipientPhone: '+27 82 123 4567',
      recipientAccount: '0821234567',
      purpose: 'Family Support',
      sourceOfFunds: 'Savings',
      status: 'Completed',
      timestamp: '2026-07-07T13:40:00Z',
      branchId: 'BR-101',
      tellerId: 'USR-001',
      payoutPin: 'REM-7734-SIP'
    }
  ]);

  auditLogs = signal<AuditLog[]>([
    { id: 'AUD-001', timestamp: '2026-07-07T10:15:00Z', userId: 'USR-001', userName: 'Tawanda Chiimbira', user: 'Tawanda Chiimbira', role: 'Teller', action: 'Created currency exchange TXN-001', severity: 'INFO', ipAddress: '192.168.1.50' },
    { id: 'AUD-002', timestamp: '2026-07-07T11:00:00Z', userId: 'USR-001', userName: 'Tawanda Chiimbira', user: 'Tawanda Chiimbira', role: 'Teller', action: 'Created remittance transaction TXN-002', severity: 'INFO', ipAddress: '192.168.1.50' }
  ]);

  branchLiquidity = signal<BranchLiquidity[]>([
    { currency: 'USD', balance: 45000, reserved: 15000, threshold: 10000 },
    { currency: 'ZWG', balance: 250000, reserved: 45000, threshold: 50000 },
    { currency: 'ZAR', balance: 85000, reserved: 12000, threshold: 20000 },
    { currency: 'GBP', balance: 8000, reserved: 2000, threshold: 5000 },
    { currency: 'EUR', balance: 12000, reserved: 3000, threshold: 5000 }
  ]);

  eodStatus = signal<EodStatus>({
    status: 'Pending',
    submittedCount: 0,
    botLogs: [
      '[17:00:00] EOD Scheduler triggered automatic daily reconciliation.',
      '[17:00:02] Fetching approved transactions for 2026-07-07.',
      '[17:00:05] Found 2 completed transactions ready for RBZ submission.',
      '[17:00:10] Waiting for compliance officer validation.'
    ]
  });

  notifications = signal<{ id: string; title: string; body: string; date: string; type: string; read: boolean }[]>([
    { id: 'n1', title: 'Rate Changed', body: 'USD/ZWG buy rate changed from 24.40 to 24.50', date: '2026-07-07T12:00:00Z', type: 'rate', read: false },
    { id: 'n2', title: 'Compliance Warning', body: 'KYC Limit override requested for customer Josephat Chimuka', date: '2026-07-07T12:05:00Z', type: 'override', read: false }
  ]);

  // Teller Session Stats
  tellerSession = computed<TellerSession>(() => {
    const txns = this.transactions().filter(t => t.tellerId === 'USR-001' && t.status === 'Completed');
    const totalVal = txns.reduce((sum, t) => sum + (t.type === 'Exchange' ? t.amount : t.amount), 0);
    return {
      tellerId: 'USR-001',
      tellerName: 'Tawanda Chiimbira',
      branchName: 'Harare CBD Branch',
      sessionStart: '2026-07-07T08:00:00Z',
      txnTodayCount: txns.length,
      txnTodayValueUsd: totalVal
    };
  });

  // Helper: add audit log
  addAuditLog(action: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') {
    const user = this.currentUser();
    const newLog: AuditLog = {
      id: `AUD-${String(this.auditLogs().length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'SYSTEM',
      userName: user?.name || 'System',
      user: user?.name || 'System',
      role: user?.role || 'System',
      action,
      severity,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 1)
    };
    this.auditLogs.update(prev => [newLog, ...prev]);
  }

  // Toast Notifications
  toasts = signal<ToastMessage[]>([]);

  showToast(message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info', duration = 4000) {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, message, type, duration };
    this.toasts.update(prev => [...prev, toast]);
    setTimeout(() => {
      this.toasts.update(prev => prev.filter(t => t.id !== id));
    }, duration);
  }

  // Mutation Actions
  onboardCustomer(cust: Omit<Customer, 'id' | 'registeredAt' | 'timeline'>) {
    const newId = `CUST-${String(this.customers().length + 1).padStart(3, '0')}`;
    const newCustomer: Customer = {
      ...cust,
      id: newId,
      registeredAt: new Date().toISOString(),
      timeline: [
        { date: new Date().toISOString().split('T')[0], title: 'Onboarded', desc: 'Customer registered successfully', icon: 'user-plus' }
      ]
    };
    this.customers.update(prev => [newCustomer, ...prev]);
    this.addAuditLog(`Onboarded new customer: ${newCustomer.name} (${newId})`);
    return newCustomer;
  }

  createTransaction(txn: Omit<Transaction, 'id' | 'timestamp' | 'branchId' | 'tellerId' | 'status'> & { status?: 'Completed' | 'Pending' | 'Failed' | 'Reversed' }) {
    const newId = `TXN-${String(this.transactions().length + 1).padStart(3, '0')}`;
    const newTxn: Transaction = {
      status: 'Completed',
      ...txn,
      id: newId,
      timestamp: new Date().toISOString(),
      branchId: this.currentUser()?.branchId || 'BR-101',
      tellerId: this.currentUser()?.id || 'USR-001'
    } as Transaction;

    // Auto-checking limits
    const limitThreshold = this.currentUser()?.role === 'Field Agent' ? 2000 : 5000;
    const operatorRoleLabel = this.currentUser()?.role || 'Teller';
    if (newTxn.amount > limitThreshold) {
      newTxn.status = 'Pending';
      newTxn.flagReason = 'Exceeds daily KYC limit';
      newTxn.vettingResult = `Transaction amount ($${newTxn.amount}) exceeds ${operatorRoleLabel} limit ($${limitThreshold.toLocaleString()}). Needs Manager review.`;
      this.notifications.update(prev => [
        { id: `notif-${Date.now()}`, title: 'Override Required', body: `Limit breach by ${newTxn.customerName} ($${newTxn.amount})`, date: new Date().toISOString(), type: 'override', read: false },
        ...prev
      ]);
    } else if (newTxn.recipientName && newTxn.recipientName.toLowerCase().includes('kofi')) {
      newTxn.status = 'Pending';
      newTxn.flagReason = 'Sanctions hit';
      newTxn.vettingResult = 'Security screening match found on recipient name. Compliance review required.';
      this.notifications.update(prev => [
        { id: `notif-${Date.now()}`, title: 'Sanctions Triggered', body: `Security flag on recipient ${newTxn.recipientName}`, date: new Date().toISOString(), type: 'compliance', read: false },
        ...prev
      ]);
    }

    this.transactions.update(prev => [newTxn, ...prev]);
    this.addAuditLog(`Created transaction ${newId} (${newTxn.type}) - Status: ${newTxn.status}`);
    return newTxn;
  }

  approveTransaction(id: string, notes: string) {
    this.transactions.update(prev => prev.map(t => {
      if (t.id === id) {
        this.addAuditLog(`Approved transaction override for ${id}. Notes: ${notes}`);
        return { ...t, status: 'Completed', notes };
      }
      return t;
    }));
  }

  rejectTransaction(id: string, notes: string) {
    this.transactions.update(prev => prev.map(t => {
      if (t.id === id) {
        this.addAuditLog(`Rejected transaction override for ${id}. Notes: ${notes}`);
        return { ...t, status: 'Failed', notes };
      }
      return t;
    }));
  }

  proposeRate(pair: string, buyRate: number, sellRate: number, justification: string) {
    const user = this.currentUser();
    this.rates.update(prev => prev.map(r => {
      if (r.pair === pair) {
        this.addAuditLog(`Proposed rate override for ${pair} (Buy: ${buyRate}, Sell: ${sellRate})`);
        return {
          ...r,
          proposedBuyRate: buyRate,
          proposedSellRate: sellRate,
          justification,
          proposedBy: user?.name || 'Manager',
          status: 'Pending Approval'
        };
      }
      return r;
    }));
  }

  approveRate(pair: string) {
    this.rates.update(prev => prev.map(r => {
      if (r.pair === pair && r.status === 'Pending Approval') {
        this.addAuditLog(`Approved rate update for ${pair}`);
        return {
          ...r,
          buyRate: r.proposedBuyRate || r.buyRate,
          sellRate: r.proposedSellRate || r.sellRate,
          status: 'Live',
          lastUpdated: new Date().toISOString(),
          proposedBuyRate: undefined,
          proposedSellRate: undefined,
          justification: undefined,
          proposedBy: undefined
        };
      }
      return r;
    }));
  }

  rejectRate(pair: string) {
    this.rates.update(prev => prev.map(r => {
      if (r.pair === pair && r.status === 'Pending Approval') {
        this.addAuditLog(`Rejected rate update for ${pair}`);
        return {
          ...r,
          status: 'Live',
          proposedBuyRate: undefined,
          proposedSellRate: undefined,
          justification: undefined,
          proposedBy: undefined
        };
      }
      return r;
    }));
  }

  addUser(user: Omit<User, 'id' | 'avatar'>) {
    const newId = `USR-${String(this.users().length + 1).padStart(3, '0')}`;
    const newUser: User = {
      ...user,
      id: newId,
      avatar: 'assets/avatars/default.png'
    };
    this.users.update(prev => [...prev, newUser]);
    this.addAuditLog(`Created user profile: ${newUser.name} (${newId}) as ${newUser.role}`);
    return newUser;
  }

  updateUserStatus(id: string, active: boolean) {
    this.users.update(prev => prev.map(u => {
      if (u.id === id) {
        this.addAuditLog(`Updated user ${u.name} status to ${active ? 'Active' : 'Suspended'}`);
        return { ...u, active };
      }
      return u;
    }));
  }

  triggerEOD() {
    this.eodStatus.update(prev => ({
      ...prev,
      status: 'In Progress',
      botLogs: [
        ...prev.botLogs,
        `[${new Date().toLocaleTimeString()}] Compliance manually initiated EOD Batch run.`,
        `[${new Date().toLocaleTimeString()}] Authenticating with RBZ RPA Gateway...`,
      ]
    }));

    setTimeout(() => {
      const completedTxns = this.transactions().filter(t => t.status === 'Completed').length;
      this.eodStatus.set({
        status: 'Completed',
        submittedCount: completedTxns,
        timestamp: new Date().toISOString(),
        botLogs: [
          `[${new Date().toLocaleTimeString()}] Connected to RBZ exchange server.`,
          `[${new Date().toLocaleTimeString()}] Uploading ${completedTxns} transaction records...`,
          `[${new Date().toLocaleTimeString()}] RBZ Gateway successfully processed exchange transactions.`,
          `[${new Date().toLocaleTimeString()}] Daily CSV export archived in S3.`,
          `[${new Date().toLocaleTimeString()}] RPA EOD bot executed successfully.`
        ]
      });
      this.addAuditLog(`EOD RPA bot run completed. Submitted ${completedTxns} transactions.`);
    }, 2500);
  }

  postJournalEntry(entry: any) {
    this.addAuditLog(`Journal Entry posted: ${entry.description || 'Legacy Ledger Entry'}`, 'INFO');
  }

  openSavingsAccount(payload: { customerId: string; productType: string; initialDeposit: number; interestRate: number }) {
    const customer = this.customers().find(c => c.id === payload.customerId);
    const newAccount: SavingsAccount = {
      accountNumber: `SAV-${Math.floor(1000000 + Math.random() * 9000000)}`,
      customerId: payload.customerId,
      customerName: customer ? customer.name : 'Unknown Client',
      productType: payload.productType,
      interestRate: payload.interestRate,
      balance: payload.initialDeposit,
      status: payload.productType === 'Fixed Deposit' ? 'Locked' : 'Active',
      lockedUntil: payload.productType === 'Fixed Deposit' ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() : undefined
    };
    this.savingsAccounts.update(prev => [...prev, newAccount]);
    this.addAuditLog(`Opened savings account ${newAccount.accountNumber} for customer ID ${payload.customerId}`);
    return newAccount;
  }

  // Missing signals for Backward Compatibility
  collectors = signal<Collector[]>([
    { id: 'COL-001', name: 'Wellington Chiranda', collectionsToday: 1200, status: 'Active', assignedZone: 'Harare CBD', currentGps: { latitude: -17.8248, longitude: 31.0530 }, recoveryRatePct: 92 },
    { id: 'COL-002', name: 'Elson Chirenje', collectionsToday: 850, status: 'Active', assignedZone: 'Bulawayo Central', currentGps: { latitude: -20.1438, longitude: 28.5779 }, recoveryRatePct: 87 }
  ]);
  promiseToPays = signal<PromiseToPay[]>([
    { id: 'PTP-001', customerId: 'CUST-001', customerName: 'Noah Chimboza', loanId: 'LND-001', amount: 450, promisedDate: '2026-07-20', status: 'Pending' }
  ]);
  loans = signal<Loan[]>([
    { id: 'LND-001', customerId: 'CUST-001', customerName: 'Noah Chimboza', amount: 5000, interestRate: 12, repaymentPeriod: 12, status: 'Repaying', outstandingBalance: 4500, productType: 'SME Expansion Loan', paidAmount: 500, restructuredCount: 0, repaymentSchedule: [{ period: 1, dueDate: '2026-07-20', total: 450, paidAmount: 450, status: 'Paid' }] }
  ]);
  collaterals = signal<Collateral[]>([]);
  guarantors = signal<Guarantor[]>([]);
  integrations = signal<Integration[]>([
    { id: 'int-1', name: 'LexisNexis AML Vetting API', status: 'Connected', type: 'Sanctions Check', latencyMs: 120 },
    { id: 'int-2', name: 'WorldCheck Sanctions Feed', status: 'Connected', type: 'Watchlist', latencyMs: 95 },
    { id: 'int-3', name: 'Reserve Bank (RBZ) Node', status: 'Connected', type: 'Regulatory Submission', latencyMs: 210 },
    { id: 'int-4', name: 'Zim-Registry Database API', status: 'Connected', type: 'ID Validation', latencyMs: 155 }
  ]);
  eodBatches = signal<any[]>([
    { date: '2026-07-06', batchId: 'BAT-10293', txnCount: 14, volumeUsd: 12500 },
    { date: '2026-07-05', batchId: 'BAT-10292', txnCount: 8, volumeUsd: 6800 },
    { date: '2026-07-04', batchId: 'BAT-10291', txnCount: 19, volumeUsd: 21000 },
    { date: '2026-07-03', batchId: 'BAT-10290', txnCount: 11, volumeUsd: 9400 }
  ]);
  chartOfAccounts = signal<LedgerAccount[]>([
    { code: '1000', name: 'Cash Vault', category: 'Asset', balance: 45000, type: 'Debit' },
    { code: '1100', name: 'Bank Clearing', category: 'Asset', balance: 80000, type: 'Debit' },
    { code: '2000', name: 'Member Savings Deposits', category: 'Liability', balance: 125000, type: 'Credit' },
    { code: '3000', name: 'Member Share Capital', category: 'Equity', balance: 150000, type: 'Credit' }
  ]);
  ledgerAccounts = signal<LedgerAccount[]>([
    { code: '1000', name: 'Cash Vault', category: 'Asset', balance: 45000, type: 'Debit' },
    { code: '1100', name: 'Bank Clearing', category: 'Asset', balance: 80000, type: 'Debit' },
    { code: '2000', name: 'Member Savings Deposits', category: 'Liability', balance: 125000, type: 'Credit' },
    { code: '3000', name: 'Member Share Capital', category: 'Equity', balance: 150000, type: 'Credit' }
  ]);
  journalEntries = signal<any[]>([
    { referenceNo: 'JE-001', description: 'Institutional Cash Settlement', date: '2026-07-07', debits: [{ accountCode: '1000', amount: 5000 }], credits: [{ accountCode: '1100', amount: 5000 }] }
  ]);
  riskAlerts = signal<any[]>([
    { severity: 'Critical', customerName: 'Edward Chimunasha', riskType: 'Sanctions List Hit', status: 'Pending Review', description: 'LexisNexis watchlist match confidence 89%.' }
  ]);
  branches = signal<any[]>([
    { id: 'BR-101', name: 'Harare CBD Branch', code: 'CBD', address: 'Harare', active: true },
    { id: 'BR-102', name: 'Bulawayo Branch', code: 'BYO', address: 'Bulawayo', active: true }
  ]);
  
  // Missing computed properties
  totalSavings = computed(() => 125000);
  portfolioAtRiskPct = computed(() => 2.4);
  portfolioAtRiskValue = computed(() => 15000);
  workflowApprovals = computed(() => {
    return this.transactions().filter(t => t.status === 'Pending' && t.flagReason?.includes('limit'));
  });

  // Missing methods
  applyForLoan(payload: any) {}
  makeRepayment(id: string, amount: number) {}
  registerCustomer(payload: any) {
    return this.onboardCustomer(payload);
  }
}
