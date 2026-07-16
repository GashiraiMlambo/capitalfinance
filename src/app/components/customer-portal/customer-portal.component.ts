import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FilterByTypePipe } from '../../pipes/filter-by-type.pipe';
import { FilterByStatusPipe } from '../../pipes/filter-by-status.pipe';
import { countries } from '../../services/countries';
import { StateService, User, Customer, Transaction, ExchangeRate } from '../../core/services/state.service';

@Component({
  selector: 'app-customer-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FilterByTypePipe, FilterByStatusPipe],
  templateUrl: './customer-portal.component.html',
  styleUrls: ['./customer-portal.component.css']
})
export class CustomerPortalComponent implements OnInit {
  stateService = inject(StateService);
  router = inject(Router);
  fb = inject(FormBuilder);

  // Theme & Stage Management (Defaults to Light mode for customer management activity)
  isDarkMode = false;
  portalStage: 'LOGIN' | 'OTP' | 'DASHBOARD' = 'LOGIN';
  activeView: string = 'home';

  // Customer Management Dashboard States
  activeCustomerTab = signal<'list' | 'register'>('list');
  wizardStep = signal<number>(1);
  selectedCustomer = signal<Customer | null>(null);
  drawerTab = signal<'profile' | 'kyc' | 'notes' | 'timeline'>('profile');
  searchQuery = '';
  filterKyc = 'ALL';
  sortField = 'name';
  newNoteContent = '';
  uploadedFiles = signal<{ name: string; size: string }[]>([]);
  personalForm!: FormGroup;
  isFormAutosaving = signal<boolean>(false);

  // Auth Forms
  loginSurname = '';
  loginPassword = '';
  authError = '';
  isOtpSent = false;
  otpPhoneTarget = '';
  otpInput = '';
  mockOtpCode = '123456';
  matchedUser: User | null = null;

  // Dropdowns
  showProfileMenu = false;
  showNotifMenu = false;
  showRoleDropdown = false;

  // Role List
  adminRoles = [
    'Teller',
    'Compliance Officer',
    'Branch Manager',
    'System Admin',
    'Field Agent'
  ];

  // System Configurations (Editable by System Admin)
  sysConfigFeePct = 0.5;
  sysConfigMinFee = 10;
  sysConfigTaxPct = 0.25;

  // Teller Desk Data
  tellerSearchPin = '';
  tellerFoundTxn: Transaction | null = null;
  tellerSearchError = '';
  tellerDepositCustomerId = 'CUST-001';
  tellerDepositAmount: number | null = null;
  tellerKycCustomerId = 'CUST-002';
  tellerKycChecklist = { idVerified: false, addressVerified: false, selfieVerified: false };

  // Compliance Desk Data
  complianceSearchName = '';
  complianceVettingResult = '';
  complianceVettingStatus: 'idle' | 'searching' | 'match' | 'clear' = 'idle';

  // Branch Manager Desk Data
  managerRefundRequests = [
    { id: 'REF-RQ-001', customerId: 'CUST-001', customerName: 'Noah Chimboza', amount: 500, status: 'Pending Approval', reason: 'Unused pre-funding balance' },
    { id: 'REF-RQ-002', customerId: 'CUST-002', customerName: 'Josephat Chimuka', amount: 200, status: 'Pending Approval', reason: 'Duplicate deposit' }
  ];

  // Field Desk Data
  fieldOnboardingName = '';
  fieldOnboardingNationality = 'Zimbabwean';
  fieldOnboardingId = '';
  fieldOnboardingPhone = '';
  fieldOnboardingAddress = '';
  fieldOnboardingDob = '';
  fieldOnboardingOccupation = '';
  isOfflineMode = false;
  offlineOnboardingQueue: any[] = [];
  fieldVoucherId = '';
  fieldFoundTxn: Transaction | null = null;
  fieldVoucherError = '';

  // Original UI Component Fields (Maintained for Parity/Fallbacks)
  customer: Customer = {
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
    registeredAt: '2026-01-10T09:00:00Z',
    timeline: [
      { date: '2026-07-05', title: 'Remittance Sent', desc: 'Sent $450 USD to Bulawayo', icon: 'send' },
      { date: '2026-06-20', title: 'KYC Verified', desc: 'National ID and proof of residence checked', icon: 'shield' }
    ]
  };

  // Calculator Inputs
  calcSendAmount = 1000;
  calcCurrencyPair = 'USD/ZWG';
  calcRate = 25.50;
  calcFee = 10.00;
  calcNetPayout = 25490.00;
  calcIsLoading = false;

  // Fee Calculator Inputs
  feeCalcReceivingCountry = 'Zimbabwe';
  feeCalcCurrency = 'USD';
  feeCalcAmount = 1000;
  feeCalcRate = 1.0;
  feeCalcFee = 25.00;
  feeCalcTaxes = 5.00;
  feeCalcDelivery = 'Instant (Within 10 mins)';
  feeCalcPayout = 970.00;

  // Dropdowns lists
  feeCalcCountriesList = ['Zimbabwe', 'South Africa', 'Malawi', 'Zambia', 'Mozambique', 'Botswana'];
  feeCalcCurrenciesList = ['USD', 'ZAR', 'ZWG'];
  countriesList = countries;
  currencies = [
    { code: 'USD', name: 'US Dollar', flag: 'us' },
    { code: 'ZWG', name: 'Zimbabwe Gold', flag: 'zw' },
    { code: 'ZAR', name: 'South African Rand', flag: 'za' }
  ];

  // Currency Exchange view state
  exFromCurrency = 'USD';
  exToCurrency = 'ZWG';
  exAmount: number | null = null;
  exPaymentMethod = 'online';
  exIsLoading = false;
  exResult: { rate: number; convertedAmount: number; fee: number; net: number } | null = null;
  exConfirmed = false;
  exReceiptId = '';

  // Transfer Money view state
  transferRecipientId = '';
  transferAmount: number | null = null;
  transferCurrency = 'USD';
  transferNote = '';
  transferPaymentMethod = 'online';
  transferIsLoading = false;
  transferConfirmed = false;
  transferReceiptId = '';
  transferError = '';

  // General list getters to read from StateService
  get transactions(): Transaction[] {
    return this.stateService.transactions();
  }

  get customers(): Customer[] {
    return this.stateService.customers();
  }

  get exchangeRates(): ExchangeRate[] {
    return this.stateService.rates();
  }

  get incomingTransfers(): Transaction[] {
    return this.transactions.filter(t => t.customerId === this.customer.id && t.direction === 'Local');
  }

  get notificationList() {
    return this.stateService.notifications();
  }

  get sysStaffUsers(): User[] {
    return this.stateService.users();
  }

  ngOnInit(): void {
    // 1. Sync from localStorage to StateService if present
    this.restoreStateFromStorage();

    // 2. Resolve Active user / Stage
    const savedRole = localStorage.getItem('ccf_active_user_role');
    if (savedRole) {
      const foundUser = this.stateService.users().find(u => u.role === savedRole);
      if (foundUser) {
        this.stateService.currentUser.set(foundUser);
        this.portalStage = 'DASHBOARD';
        this.updateActiveViewForRole(savedRole);
      }
    } else {
      const currentUser = this.stateService.currentUser();
      if (currentUser) {
        this.portalStage = 'DASHBOARD';
        this.updateActiveViewForRole(currentUser.role);
      } else {
        this.portalStage = 'LOGIN';
      }
    }

    // Load configurations
    const savedFeePct = localStorage.getItem('ccf_sys_config_fee_pct');
    if (savedFeePct) this.sysConfigFeePct = Number(savedFeePct);
    const savedMinFee = localStorage.getItem('ccf_sys_config_min_fee');
    if (savedMinFee) this.sysConfigMinFee = Number(savedMinFee);
    const savedTaxPct = localStorage.getItem('ccf_sys_config_tax_pct');
    if (savedTaxPct) this.sysConfigTaxPct = Number(savedTaxPct);

    // Initialize forms
    this.personalForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      gender: ['', Validators.required],
      dob: ['', Validators.required],
      idType: ['National ID', Validators.required],
      idNumber: ['', Validators.required],
      branchId: ['BR-101', Validators.required],
      address: ['', Validators.required]
    });

    const draft = localStorage.getItem('customer-registration-draft');
    if (draft) {
      try {
        this.personalForm.patchValue(JSON.parse(draft));
      } catch (e) {}
    }

    // Initial calculations
    this.runCalculator();
    this.runFeeCalculator();
  }

  // Restore State Helper
  restoreStateFromStorage(): void {
    const savedCustomers = localStorage.getItem('ccf_customers');
    if (savedCustomers) {
      this.stateService.customers.set(JSON.parse(savedCustomers));
    } else {
      localStorage.setItem('ccf_customers', JSON.stringify(this.stateService.customers()));
    }

    const savedTxns = localStorage.getItem('ccf_transactions');
    if (savedTxns) {
      this.stateService.transactions.set(JSON.parse(savedTxns));
    } else {
      localStorage.setItem('ccf_transactions', JSON.stringify(this.stateService.transactions()));
    }

    const savedRates = localStorage.getItem('ccf_rates');
    if (savedRates) {
      this.stateService.rates.set(JSON.parse(savedRates));
    } else {
      localStorage.setItem('ccf_rates', JSON.stringify(this.stateService.rates()));
    }

    const savedSavings = localStorage.getItem('ccf_savings_accounts');
    if (savedSavings) {
      this.stateService.savingsAccounts.set(JSON.parse(savedSavings));
    } else {
      localStorage.setItem('ccf_savings_accounts', JSON.stringify(this.stateService.savingsAccounts()));
    }
  }

  saveStateToStorage(): void {
    localStorage.setItem('ccf_customers', JSON.stringify(this.stateService.customers()));
    localStorage.setItem('ccf_transactions', JSON.stringify(this.stateService.transactions()));
    localStorage.setItem('ccf_rates', JSON.stringify(this.stateService.rates()));
    localStorage.setItem('ccf_savings_accounts', JSON.stringify(this.stateService.savingsAccounts()));
  }

  // Toast System
  displayToast(msg: string, type: 'success' | 'warning' | 'error' | 'info' = 'info'): void {
    this.stateService.showToast(msg, type);
  }

  // Auth Operations
  handleLoginSubmit(): void {
    this.authError = '';
    const query = this.loginSurname.trim().toLowerCase();
    
    if (!query) {
      this.authError = 'Please enter your registered email or name.';
      return;
    }

    // Authenticate Admin / User
    const matched = this.stateService.users().find(
      u => u.email.toLowerCase() === query || 
           u.name.toLowerCase().includes(query)
    );

    if (matched) {
      this.matchedUser = matched;
      this.isOtpSent = true;
      this.otpPhoneTarget = matched.email;
      this.portalStage = 'OTP';
      this.displayToast(`OTP Verification Code: ${this.mockOtpCode}`, 'info');
      this.stateService.addAuditLog(`OTP challenge generated for ${matched.name} (${matched.role})`);
    } else {
      this.authError = 'User credentials not recognized. Please check your inputs.';
    }
  }

  handleOtpSubmit(): void {
    if (this.otpInput === this.mockOtpCode || this.otpInput === '123456' || (this.otpInput.length === 6 && !isNaN(Number(this.otpInput)))) {
      if (this.matchedUser) {
        this.stateService.currentUser.set(this.matchedUser);
        localStorage.setItem('ccf_active_user_role', this.matchedUser.role);
        
        // Sync active customer info if Customer role
        if (this.matchedUser.role === 'Customer (Self-Service)') {
          const custProfile = this.stateService.customers().find(c => c.name.toLowerCase().includes('noah')) || this.customer;
          this.customer = custProfile;
        }

        this.portalStage = 'DASHBOARD';
        this.updateActiveViewForRole(this.matchedUser.role);
        this.displayToast(`Welcome back, ${this.matchedUser.name}!`, 'success');
        this.stateService.addAuditLog(`Successful staff login - Role: ${this.matchedUser.role}`);
      }
    } else {
      this.displayToast('Invalid security code. Please try again.', 'error');
    }
  }

  cancelOtpStage(): void {
    this.portalStage = 'LOGIN';
    this.isOtpSent = false;
    this.otpInput = '';
    this.matchedUser = null;
  }

  handleLogout(): void {
    this.stateService.currentUser.set(null);
    localStorage.removeItem('ccf_active_user_role');
    this.portalStage = 'LOGIN';
    this.isOtpSent = false;
    this.otpInput = '';
    this.matchedUser = null;
    this.displayToast('Logged out successfully.', 'info');
  }

  // Role Switcher dropdown logic
  toggleRoleDropdown(): void {
    this.showRoleDropdown = !this.showRoleDropdown;
  }

  selectRole(role: string): void {
    this.showRoleDropdown = false;
    const foundUser = this.stateService.users().find(u => u.role === role);
    if (foundUser) {
      this.stateService.currentUser.set(foundUser);
      localStorage.setItem('ccf_active_user_role', role);
      this.displayToast(`Role switched to: ${role}`, 'success');
      this.stateService.addAuditLog(`Switched role session to ${role}`);
      
      // Update local customer profile if Customer role
      if (role === 'Customer (Self-Service)') {
        const custProfile = this.stateService.customers().find(c => c.name.toLowerCase().includes('noah')) || this.customer;
        this.customer = custProfile;
      }
      
      this.updateActiveViewForRole(role);
    }
  }

  updateActiveViewForRole(role: string): void {
    switch (role) {
      case 'Teller':
        this.activeView = 'teller';
        break;
      case 'Compliance Officer':
        this.activeView = 'compliance';
        break;
      case 'Branch Manager':
        this.activeView = 'branch';
        break;
      case 'System Admin':
        this.activeView = 'system';
        break;
      case 'Field Agent':
        this.activeView = 'field';
        break;
      case 'Customer (Self-Service)':
      default:
        this.activeView = 'home';
        break;
    }
  }

  // CUSTOMER REGISTRY DESK & Stepper METHODS
  setCustomerTab(tab: 'list' | 'register') {
    this.activeCustomerTab.set(tab);
    if (tab === 'register') {
      this.wizardStep.set(1);
    }
  }

  goToStep(step: number) {
    this.wizardStep.set(step);
  }

  triggerAutoSave() {
    this.isFormAutosaving.set(true);
    localStorage.setItem('customer-registration-draft', JSON.stringify(this.personalForm.value));
    setTimeout(() => {
      this.isFormAutosaving.set(false);
    }, 1000);
  }

  formatIdNumber(raw: string): string {
    let clean = raw.replace(/[^a-zA-Z0-9]/g, '');
    let s1 = clean.substring(0, 2);
    let rest = clean.substring(2);
    if (!rest) return s1;

    let s2 = '';
    let letterIndex = -1;
    for (let i = 0; i < rest.length; i++) {
      let char = rest[i];
      if (/[a-zA-Z]/.test(char)) {
        letterIndex = i;
        break;
      }
      if (s2.length < 7) {
        s2 += char;
      }
    }

    if (letterIndex === -1) {
      return `${s1}-${s2}`;
    }

    let s3 = rest[letterIndex].toUpperCase();
    let afterLetter = rest.substring(letterIndex + 1).replace(/[^0-9]/g, '');
    let s4 = afterLetter.substring(0, 2);

    if (!s4 && afterLetter.length === 0) {
      return `${s1}-${s2}-${s3}`;
    }
    return `${s1}-${s2}-${s3}-${s4}`;
  }

  onIdInput(event: any) {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatIdNumber(input.value);
    this.personalForm.get('idNumber')?.setValue(formatted, { emitEvent: false });
    input.value = formatted;
    this.triggerAutoSave();
  }

  onFileUploaded(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newFile = {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      };
      this.uploadedFiles.update(prev => [...prev, newFile]);
      this.triggerAutoSave();
    }
  }

  removeUploadedFile(name: string) {
    this.uploadedFiles.update(prev => prev.filter(f => f.name !== name));
    this.triggerAutoSave();
  }

  submitCustomer() {
    const formVals = this.personalForm.value;
    const documents = this.uploadedFiles().map(f => ({
      type: f.name.toLowerCase().includes('passport') ? 'Passport Scan' : 'ID Card Scan',
      url: f.name,
      status: 'Pending' as const
    }));

    const registered = this.stateService.registerCustomer({
      name: formVals.name,
      email: formVals.email,
      phone: formVals.phone,
      address: formVals.address,
      idType: formVals.idType,
      idNumber: formVals.idNumber,
      kycStatus: 'Pending',
      gender: formVals.gender,
      dob: formVals.dob,
      branchId: formVals.branchId,
      documents: documents,
      notes: [],
      timeline: [
        { date: new Date().toISOString().split('T')[0], title: 'Registered Customer', desc: 'Customer folder initialized', icon: 'user' }
      ]
    });

    localStorage.removeItem('customer-registration-draft');
    this.personalForm.reset({ idType: 'National ID', branchId: 'BR-101' });
    this.uploadedFiles.set([]);
    this.saveStateToStorage();

    this.setCustomerTab('list');
    this.selectCustomer(registered);
    this.displayToast(`Registered customer ${registered.name} successfully!`, 'success');
  }

  selectCustomer(cust: Customer) {
    this.selectedCustomer.set(cust);
    this.drawerTab.set('profile');
    this.newNoteContent = '';
  }

  closeCustomerDetails() {
    this.selectedCustomer.set(null);
  }

  addCustomerNote() {
    const cust = this.selectedCustomer();
    if (!cust || !this.newNoteContent.trim()) return;

    const newNote = {
      date: new Date().toISOString().split('T')[0],
      author: this.stateService.currentUser()?.name || 'Staff',
      content: this.newNoteContent
    };

    this.stateService.customers.update(custs => {
      return custs.map(c => {
        if (c.id === cust.id) {
          return {
            ...c,
            notes: [newNote, ...(c.notes || [])]
          };
        }
        return c;
      });
    });

    this.selectedCustomer.update(c => {
      if (!c) return null;
      return {
        ...c,
        notes: [newNote, ...(c.notes || [])]
      };
    });

    this.saveStateToStorage();
    this.stateService.addAuditLog(`Added customer note for ${cust.name}`);
    this.newNoteContent = '';
  }

  get filteredCustomersList(): Customer[] {
    const query = this.searchQuery.toLowerCase().trim();
    const status = this.filterKyc;
    const sort = this.sortField;
    let list = [...this.stateService.customers()];

    if (query) {
      list = list.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.id.toLowerCase().includes(query) || 
        c.idNumber.toLowerCase().includes(query) || 
        c.email.toLowerCase().includes(query)
      );
    }

    if (status !== 'ALL') {
      list = list.filter(c => c.kycStatus === status);
    }

    list.sort((a, b) => {
      if (sort === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sort === 'date') {
        return new Date(b.registeredAt || '').getTime() - new Date(a.registeredAt || '').getTime();
      } else if (sort === 'balance') {
        return (b.savingsBalance || 0) - (a.savingsBalance || 0);
      }
      return 0;
    });

    return list;
  }

  // TELLER OPERATION METHODS
  tellerLookupPin(): void {
    this.tellerSearchError = '';
    this.tellerFoundTxn = null;
    const searchVal = this.tellerSearchPin.trim().toUpperCase();
    if (!searchVal) {
      this.tellerSearchError = 'Please enter a valid payout PIN or Voucher ID.';
      return;
    }

    const found = this.transactions.find(
      t => t.payoutPin?.toUpperCase() === searchVal || t.id.toUpperCase() === searchVal
    );

    if (found) {
      this.tellerFoundTxn = found;
    } else {
      this.tellerSearchError = 'No transaction record matched this search entry.';
    }
  }

  tellerReleasePayout(txnId: string): void {
    this.stateService.approveTransaction(txnId, 'In-person Teller cash payout released.');
    this.saveStateToStorage();
    this.displayToast('Cash payout released successfully!', 'success');
    
    // Refresh search lookup
    if (this.tellerFoundTxn && this.tellerFoundTxn.id === txnId) {
      this.tellerFoundTxn = this.transactions.find(t => t.id === txnId) || null;
    }
  }

  tellerProcessDeposit(): void {
    const amount = this.tellerDepositAmount;
    const custId = this.tellerDepositCustomerId;
    if (!amount || amount <= 0) {
      this.displayToast('Please enter a valid deposit amount.', 'warning');
      return;
    }

    // Find pre-funded account in StateService
    const savAcc = this.stateService.savingsAccounts().find(a => a.customerId === custId);
    if (savAcc) {
      this.stateService.savingsAccounts.update(prev => prev.map(a => {
        if (a.accountNumber === savAcc.accountNumber) {
          this.stateService.addAuditLog(`Teller processed pre-funded wallet deposit of $${amount} for Customer ID ${custId}`);
          return { ...a, balance: a.balance + amount };
        }
        return a;
      }));
      this.saveStateToStorage();
      this.displayToast(`Cash deposit of $${amount} processed successfully.`, 'success');
      this.tellerDepositAmount = null;
    } else {
      this.displayToast('Unable to locate pre-funded account for this customer.', 'error');
    }
  }

  tellerSubmitKycVerification(): void {
    if (!this.tellerKycChecklist.idVerified || !this.tellerKycChecklist.addressVerified || !this.tellerKycChecklist.selfieVerified) {
      this.displayToast('Checklist incomplete. All items must be physically verified.', 'warning');
      return;
    }

    const custId = this.tellerKycCustomerId;
    const customerProfile = this.stateService.customers().find(c => c.id === custId);
    if (customerProfile) {
      this.stateService.customers.update(prev => prev.map(c => {
        if (c.id === custId) {
          this.stateService.addAuditLog(`Teller completed physical documents check for ${c.name}`);
          return { ...c, kycStatus: 'Verified' };
        }
        return c;
      }));
      this.saveStateToStorage();
      this.displayToast(`Physical KYC check verified and submitted for ${customerProfile.name}.`, 'success');
      // Reset checklist
      this.tellerKycChecklist = { idVerified: false, addressVerified: false, selfieVerified: false };
    }
  }

  // COMPLIANCE QUEUE METHODS
  complianceApproveDoc(custId: string, docType: string): void {
    this.stateService.customers.update(prev => prev.map(c => {
      if (c.id === custId) {
        const updatedDocs = c.documents.map(d => {
          if (d.type === docType) return { ...d, status: 'Verified' as const };
          return d;
        });

        // Automatically set KYC status to Verified if all documents are now approved
        const allApproved = updatedDocs.every(d => d.status === 'Verified');
        const nextKyc = allApproved ? 'Verified' as const : c.kycStatus;

        this.stateService.addAuditLog(`Compliance Officer verified document [${docType}] for customer ID ${custId}`);
        return { ...c, documents: updatedDocs, kycStatus: nextKyc };
      }
      return c;
    }));
    this.saveStateToStorage();
    this.displayToast(`Approved document: ${docType}`, 'success');
  }

  complianceRejectDoc(custId: string, docType: string): void {
    this.stateService.customers.update(prev => prev.map(c => {
      if (c.id === custId) {
        const updatedDocs = c.documents.map(d => {
          if (d.type === docType) return { ...d, status: 'Rejected' as const };
          return d;
        });

        this.stateService.addAuditLog(`Compliance Officer rejected document [${docType}] for customer ID ${custId}`);
        return { ...c, documents: updatedDocs, kycStatus: 'Flagged' as const };
      }
      return c;
    }));
    this.saveStateToStorage();
    this.displayToast(`Document ${docType} rejected. Status flagged.`, 'warning');
  }

  complianceUpdateKycStatus(custId: string, nextStatus: any): void {
    this.stateService.customers.update(prev => prev.map(c => {
      if (c.id === custId) {
        this.stateService.addAuditLog(`Compliance manual KYC status update to [${nextStatus}] for customer ID ${custId}`);
        return { ...c, kycStatus: nextStatus };
      }
      return c;
    }));
    this.saveStateToStorage();
    this.displayToast(`Customer KYC status manually set to ${nextStatus}.`, 'success');
  }

  complianceScreenName(): void {
    const searchVal = this.complianceSearchName.trim().toLowerCase();
    if (!searchVal) {
      this.complianceVettingStatus = 'idle';
      this.complianceVettingResult = '';
      return;
    }

    this.complianceVettingStatus = 'searching';
    this.complianceVettingResult = '';

    setTimeout(() => {
      const matchFound = ['kofi', 'edward', 'chimunasha', 'munofira', 'warlord', 'sanctioned'].some(
        name => searchVal.includes(name)
      );

      if (matchFound) {
        this.complianceVettingStatus = 'match';
        this.complianceVettingResult = `AML SANCTIONS ALERT: High confidence match found in PEP & OFAC list. Individual flagged for trade restrictions. Action required: Freeze active transactions and lock wallet account.`;
        this.stateService.addAuditLog(`Compliance screening match detected for query: "${this.complianceSearchName}"`, 'CRITICAL');
      } else {
        this.complianceVettingStatus = 'clear';
        this.complianceVettingResult = `SCREENING CLEAR: Candidate checked against LexisNexis PEP list and WorldCheck sanctions data. No watchlist triggers identified.`;
        this.stateService.addAuditLog(`Compliance screening query clear: "${this.complianceSearchName}"`, 'INFO');
      }
    }, 600);
  }

  complianceReleaseHold(txnId: string): void {
    this.stateService.approveTransaction(txnId, 'Sanctions screening manually cleared by Compliance.');
    this.saveStateToStorage();
    this.displayToast(`Transaction ${txnId} hold released successfully.`, 'success');
  }

  complianceDeclineTxn(txnId: string): void {
    this.stateService.rejectTransaction(txnId, 'Compliance rejected. Suspicious source of funds / AML risk.');
    this.saveStateToStorage();
    this.displayToast(`Transaction ${txnId} rejected and cancelled.`, 'error');
  }

  // BRANCH MANAGER METHODS
  managerApproveRefund(req: any): void {
    const savAcc = this.stateService.savingsAccounts().find(a => a.customerId === req.customerId);
    if (savAcc) {
      if (savAcc.balance < req.amount) {
        this.displayToast('Insufficient customer wallet balance to execute this refund.', 'warning');
        return;
      }

      this.stateService.savingsAccounts.update(prev => prev.map(a => {
        if (a.accountNumber === savAcc.accountNumber) {
          return { ...a, balance: a.balance - req.amount };
        }
        return a;
      }));
      this.saveStateToStorage();
      
      req.status = 'Approved';
      this.stateService.addAuditLog(`Branch Manager approved refund request ${req.id} for customer ${req.customerName}`);
      this.displayToast(`Approved refund of $${req.amount}. Wallet balance updated.`, 'success');
    } else {
      this.displayToast('Pre-funded wallet profile not located.', 'error');
    }
  }

  managerDeclineRefund(req: any): void {
    req.status = 'Declined';
    this.stateService.addAuditLog(`Branch Manager declined refund request ${req.id}`);
    this.displayToast(`Refund request ${req.id} declined.`, 'info');
  }

  managerApproveOverride(txnId: string): void {
    this.stateService.approveTransaction(txnId, 'Branch Manager daily limit override approved.');
    this.saveStateToStorage();
    this.displayToast(`Daily limit override approved for ${txnId}.`, 'success');
  }

  managerDeclineOverride(txnId: string): void {
    this.stateService.rejectTransaction(txnId, 'Branch Manager rejected daily limit override.');
    this.saveStateToStorage();
    this.displayToast(`Daily limit override declined for ${txnId}.`, 'warning');
  }

  managerReplenishVault(curr: string): void {
    this.stateService.branchLiquidity.update(prev => prev.map(l => {
      if (l.currency === curr) {
        this.stateService.addAuditLog(`Branch Manager replenished cash vault liquidity for ${curr}`);
        return { ...l, balance: l.balance + 15000 };
      }
      return l;
    }));
    this.saveStateToStorage();
    this.displayToast(`Vault replenished (+15,000 ${curr}) successfully.`, 'success');
  }

  // SYSTEM ADMIN METHODS
  saveRateUpdate(rate: ExchangeRate, newBuy: number, newSell: number, newSpread: number): void {
    this.stateService.rates.update(prev => prev.map(r => {
      if (r.pair === rate.pair) {
        this.stateService.addAuditLog(`System Admin updated Forex rates for ${rate.pair} (Buy: ${newBuy}, Sell: ${newSell}, Spread: ${newSpread}%)`);
        return {
          ...r,
          buyRate: newBuy,
          sellRate: newSell,
          spread: newSpread,
          lastUpdated: new Date().toISOString()
        };
      }
      return r;
    }));
    this.saveStateToStorage();
    this.displayToast(`Rates saved for pair ${rate.pair}`, 'success');
    this.runCalculator();
  }

  sysSaveConfig(): void {
    localStorage.setItem('ccf_sys_config_fee_pct', String(this.sysConfigFeePct));
    localStorage.setItem('ccf_sys_config_min_fee', String(this.sysConfigMinFee));
    localStorage.setItem('ccf_sys_config_tax_pct', String(this.sysConfigTaxPct));
    this.stateService.addAuditLog(`System Admin modified configuration parameters (Fee: ${this.sysConfigFeePct}%, Min: ${this.sysConfigMinFee} ZWG, Tax: ${this.sysConfigTaxPct}%)`);
    this.displayToast('System configurations updated successfully.', 'success');
    this.runCalculator();
  }

  sysOverride2fa(userId: string): void {
    this.stateService.addAuditLog(`System Admin bypassed 2FA challenge and unlocked account for staff user ID ${userId}`);
    this.displayToast(`2FA and password requirements reset for user ID: ${userId}`, 'success');
  }

  // FIELD AGENT METHODS
  fieldOnboardSubmit(): void {
    if (!this.fieldOnboardingName || !this.fieldOnboardingId || !this.fieldOnboardingPhone) {
      this.displayToast('Please specify Customer Name, National ID and Phone number.', 'warning');
      return;
    }

    const payload = {
      name: this.fieldOnboardingName,
      nationality: this.fieldOnboardingNationality,
      nationalId: this.fieldOnboardingId,
      phone: this.fieldOnboardingPhone,
      address: this.fieldOnboardingAddress || 'Masvingo Rural District, Ward 4',
      dob: this.fieldOnboardingDob || '1990-01-01',
      occupation: this.fieldOnboardingOccupation || 'Smallholder Farmer',
      kycStatus: 'Pending' as const,
      documents: [
        { type: 'National ID Scan', url: 'field_id_scan.png', status: 'Pending' as const }
      ]
    };

    if (this.isOfflineMode) {
      this.offlineOnboardingQueue.push(payload);
      this.displayToast('Device is offline. Customer registration cached locally.', 'warning');
    } else {
      const newCust = this.stateService.onboardCustomer(payload);
      this.saveStateToStorage();
      this.displayToast(`Customer onboarded successfully. Generated ID: ${newCust.id}`, 'success');
    }

    // Reset onboarding form
    this.fieldOnboardingName = '';
    this.fieldOnboardingId = '';
    this.fieldOnboardingPhone = '';
    this.fieldOnboardingAddress = '';
    this.fieldOnboardingDob = '';
    this.fieldOnboardingOccupation = '';
  }

  fieldToggleOfflineMode(): void {
    this.isOfflineMode = !this.isOfflineMode;
    this.displayToast(
      this.isOfflineMode ? 'Offline mode enabled. Client caching active.' : 'Device is online. Ready to sync database.',
      this.isOfflineMode ? 'warning' : 'success'
    );
  }

  fieldSyncQueue(): void {
    if (this.isOfflineMode) {
      this.displayToast('Unable to connect to server. Device is in offline mode.', 'error');
      return;
    }
    if (this.offlineOnboardingQueue.length === 0) {
      this.displayToast('No cached client profiles to synchronize.', 'info');
      return;
    }

    let synced = 0;
    this.offlineOnboardingQueue.forEach(cust => {
      this.stateService.onboardCustomer(cust);
      synced++;
    });

    this.offlineOnboardingQueue = [];
    this.saveStateToStorage();
    this.displayToast(`Database sync complete: ${synced} rural client profiles synchronized.`, 'success');
  }

  fieldLookupVoucher(): void {
    this.fieldVoucherError = '';
    this.fieldFoundTxn = null;
    const pin = this.fieldVoucherId.trim().toUpperCase();
    if (!pin) {
      this.fieldVoucherError = 'Please specify a payout voucher code.';
      return;
    }

    const found = this.transactions.find(
      t => t.payoutPin?.toUpperCase() === pin || t.id.toUpperCase() === pin
    );

    if (found) {
      this.fieldFoundTxn = found;
    } else {
      this.fieldVoucherError = 'Voucher PIN reference not recognized.';
    }
  }

  fieldReleasePayout(txnId: string): void {
    this.stateService.approveTransaction(txnId, 'Field Agent mobile voucher payout released.');
    this.saveStateToStorage();
    this.displayToast('Voucher cash payout cleared successfully.', 'success');

    if (this.fieldFoundTxn && this.fieldFoundTxn.id === txnId) {
      this.fieldFoundTxn = this.transactions.find(t => t.id === txnId) || null;
    }
  }

  // ORIGINAL CALCULATOR OPERATIONS (Linked with configurations)
  runCalculator(): void {
    this.calcIsLoading = true;
    setTimeout(() => {
      const activeRate = this.exchangeRates.find(r => r.pair === this.calcCurrencyPair)?.buyRate || 25.50;
      this.calcRate = activeRate;
      const rawPayout = this.calcSendAmount * activeRate;
      
      // Calculate based on sys Configs
      const calculatedFee = rawPayout * (this.sysConfigFeePct / 100);
      this.calcFee = Math.max(this.sysConfigMinFee, calculatedFee);
      
      const taxVal = rawPayout * (this.sysConfigTaxPct / 100);
      this.calcNetPayout = Math.max(0, rawPayout - this.calcFee - taxVal);
      this.calcIsLoading = false;
    }, 450);
  }

  runFeeCalculator(): void {
    // Basic mock calculation for fee calculator
    const multiplierMap: Record<string, number> = { 'USD': 1.0, 'ZAR': 18.2, 'ZWG': 25.5 };
    const selectedRate = multiplierMap[this.feeCalcCurrency] || 1.0;
    this.feeCalcRate = selectedRate;
    this.feeCalcFee = Math.max(10, this.feeCalcAmount * 0.02);
    this.feeCalcTaxes = this.feeCalcAmount * 0.005;
    this.feeCalcPayout = (this.feeCalcAmount - this.feeCalcFee - this.feeCalcTaxes) * selectedRate;
  }

  // EXCHANGING & TRANSFERS OPERATIONS
  previewExchange(): void {
    if (!this.exAmount || this.exAmount <= 0) {
      this.displayToast('Please specify a valid exchange amount.', 'warning');
      return;
    }

    this.exIsLoading = true;
    setTimeout(() => {
      const isFromUsd = this.exFromCurrency === 'USD';
      const factor = isFromUsd ? 25.00 : (1 / 25.00);
      const converted = this.exAmount! * factor;
      const feeVal = converted * 0.005;
      this.exResult = {
        rate: factor,
        convertedAmount: converted,
        fee: feeVal,
        net: converted - feeVal
      };
      this.exIsLoading = false;
    }, 500);
  }

  confirmExchange(): void {
    if (!this.exResult || !this.exAmount) return;

    this.exIsLoading = true;
    setTimeout(() => {
      this.exConfirmed = true;
      this.exReceiptId = 'EXC-' + Math.floor(1000 + Math.random() * 9000);
      
      // Post to StateService transactions
      this.stateService.createTransaction({
        customerId: this.customer.id,
        customerName: this.customer.name,
        type: 'Exchange',
        currencyPair: `${this.exFromCurrency}/${this.exToCurrency}`,
        direction: 'Buy',
        amount: this.exAmount!,
        amountLocal: this.exResult!.net,
        rate: this.exResult!.rate,
        fee: this.exResult!.fee,
        payoutMethod: this.exPaymentMethod === 'online' ? 'EcoCash' : 'Cash',
        status: this.exPaymentMethod === 'online' ? 'Completed' : 'Pending'
      });

      this.saveStateToStorage();
      this.exIsLoading = false;
      this.displayToast('Currency exchange transaction completed.', 'success');
    }, 700);
  }

  resetExchange(): void {
    this.exConfirmed = false;
    this.exResult = null;
    this.exAmount = null;
  }

  submitTransfer(): void {
    this.transferError = '';
    if (!this.transferRecipientId) {
      this.transferError = 'Please specify a recipient code or phone number.';
      return;
    }
    if (!this.transferAmount || this.transferAmount <= 0) {
      this.transferError = 'Please specify a valid transfer amount.';
      return;
    }

    this.transferIsLoading = true;
    setTimeout(() => {
      this.transferConfirmed = true;
      this.transferReceiptId = 'TRF-' + Math.floor(1000 + Math.random() * 9000);

      this.stateService.createTransaction({
        customerId: this.customer.id,
        customerName: this.customer.name,
        type: 'Remittance',
        currencyPair: `${this.transferCurrency}/ZWG`,
        direction: 'International',
        amount: this.transferAmount!,
        amountLocal: this.transferAmount! * 25.0,
        rate: 25.0,
        fee: 15,
        payoutMethod: 'Mobile Wallet',
        recipientName: this.transferRecipientId,
        recipientPhone: '+263 77 000 0000',
        purpose: 'Transfer',
        status: 'Completed'
      });

      this.saveStateToStorage();
      this.transferIsLoading = false;
      this.displayToast('Remittance transfer completed successfully.', 'success');
    }, 800);
  }

  resetTransfer(): void {
    this.transferConfirmed = false;
    this.transferAmount = null;
    this.transferRecipientId = '';
    this.transferNote = '';
  }

  swapExCurrencies(): void {
    const temp = this.exFromCurrency;
    this.exFromCurrency = this.exToCurrency;
    this.exToCurrency = temp;
    this.exResult = null;
  }

  // UTILITY METHODS
  getFlagUrl(curr: string): string {
    const map: Record<string, string> = { 'USD': 'us', 'ZWG': 'zw', 'ZAR': 'za', 'EUR': 'eu', 'GBP': 'gb' };
    return `https://flagcdn.com/w20/${map[curr] || 'us'}.png`;
  }

  getCurrencySymbol(pair: string): string {
    return pair.startsWith('ZAR') ? 'R' : '$';
  }

  get exComputedRate(): number {
    return this.exFromCurrency === 'USD' ? 25.00 : (1 / 25.00);
  }

  setChartView(view: string): void {
    // Used in SVGs / Charts, simple mock toggle
    this.displayToast(`Switched chart scope to ${view}`, 'info');
  }

  // File Download / PDF / Clipboard actions
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.displayToast('Reference code copied to clipboard.', 'success');
    });
  }

  downloadReceipt(type: string, id: string, amount: number | null, curr: string, target: string): void {
    this.displayToast(`Downloading receipt details for ${type} ${id}...`, 'success');
  }

  generatePdfReport(): void {
    this.displayToast('Exporting transaction ledger to PDF...', 'success');
  }

  // Notification actions
  readAllNotifications(): void {
    this.stateService.notifications.set([]);
    this.displayToast('Clear all alerts.', 'success');
  }

  removeNotification(id: string): void {
    this.stateService.notifications.update(prev => prev.filter(n => n.id !== id));
  }
}
