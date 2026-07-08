import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StateService, Customer } from '../../../core/services/state.service';

interface LocalRemitDraft {
  id: string;
  senderName: string;
  recipientName: string;
  amount: number;
  direction: 'Local' | 'International';
  timestamp: string;
  formData: any;
}

@Component({
  selector: 'app-remittance',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './remittance.component.html',
  styleUrl: './remittance.component.scss',})
export class RemittanceComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  stateService = inject(StateService);
  router = inject(Router);

  remitForm!: FormGroup;

  searchQuery = '';
  showLookupDropdown = signal(false);
  selectedSender = signal<Customer | null>(null);

  isOnline = signal<boolean>(true);
  amlFlagged = signal<boolean>(false);

  // Computed signals for role and limits
  userRole = computed(() => {
    return this.stateService.currentUser()?.role || 'Teller';
  });

  isFieldAgent = computed(() => {
    return this.userRole() === 'Field Agent';
  });

  limitLabel = computed(() => {
    return this.isFieldAgent() ? 'Single Agent Limit:' : 'Single Teller Limit:';
  });

  limitValue = computed(() => {
    return this.isFieldAgent() ? '$2,000.00 USD' : '$5,000.00 USD';
  });

  // Transfer Calculation Signals
  usdToZwgRate = signal<number>(24.50);
  remitFee = signal<number>(5.00); // Flat fee in USD
  chargedLocalAmount = signal<number>(0);

  // Local drafts list
  localDrafts = signal<LocalRemitDraft[]>([]);

  ngOnInit() {
    this.remitForm = this.fb.group({
      recipientName: ['', Validators.required],
      recipientPhone: ['', Validators.required],
      direction: ['Local', Validators.required],
      payoutMethod: ['Cash Pickup', Validators.required],
      recipientAccount: [''],
      amount: [null, [Validators.required, Validators.min(5)]],
      sourceOfFunds: ['Salary', Validators.required],
      purpose: ['Family Support', Validators.required]
    });

    // Detect Online/Offline status
    this.isOnline.set(navigator.onLine);
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    this.loadDraftsFromStorage();
    this.updateCalculator();
    this.setupAccountValidation();
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
  }

  setupAccountValidation() {
    this.remitForm.get('payoutMethod')?.valueChanges.subscribe(method => {
      const accountControl = this.remitForm.get('recipientAccount');
      if (method === 'Cash Pickup') {
        accountControl?.clearValidators();
      } else {
        accountControl?.setValidators([Validators.required]);
      }
      accountControl?.updateValueAndValidity();
    });
  }

  handleOnline() {
    this.isOnline.set(true);
    this.syncLocalDraftsToServer();
  }

  handleOffline() {
    this.isOnline.set(false);
  }

  // Filter onboarded customers
  filteredCustomers = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return [];
    return this.stateService.customers().filter(
      c => c.name.toLowerCase().includes(q) || c.nationalId.toLowerCase().includes(q)
    );
  });

  selectSender(c: Customer) {
    this.selectedSender.set(c);
    this.searchQuery = c.name;
    this.showLookupDropdown.set(false);
  }

  isKycBlocked(): boolean {
    const cust = this.selectedSender();
    if (!cust) return false;
    return cust.kycStatus === 'Flagged' || cust.kycStatus === 'Expired';
  }

  showLimitWarning(): boolean {
    const amount = this.remitForm.get('amount')?.value;
    const limit = this.isFieldAgent() ? 2000 : 5000;
    return amount > limit;
  }

  runAmlVetting() {
    const rName = this.remitForm.get('recipientName')?.value || '';
    // Flag if name contains 'kofi' to simulate sanctions screening
    if (rName.toLowerCase().includes('kofi')) {
      this.amlFlagged.set(true);
    } else {
      this.amlFlagged.set(false);
    }
  }

  updateCalculator() {
    const amount = this.remitForm.get('amount')?.value || 0;
    const direction = this.remitForm.get('direction')?.value;

    // Use current USD/ZWG buy rate from state
    const ratesList = this.stateService.rates();
    const usdZwg = ratesList.find(r => r.pair === 'USD/ZWG');
    const rateVal = usdZwg ? usdZwg.buyRate : 24.50;
    this.usdToZwgRate.set(rateVal);

    // Fee structure: Local is flat $5 USD; International is $10 + 1% of principal
    const fee = direction === 'Local' ? 5.00 : (10.00 + amount * 0.01);
    this.remitFee.set(Math.round(fee * 100) / 100);

    // Calculate total equivalence charged in local currency ZWG
    const principalZwg = amount * rateVal;
    const feeZwg = fee * rateVal;
    
    this.chargedLocalAmount.set(principalZwg + feeZwg);
  }

  submitRemittance() {
    const sender = this.selectedSender();
    if (!sender || this.isKycBlocked()) return;

    const formVal = this.remitForm.value;

    // Generate payout verification pin
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const pin = `REM-${randCode}-${sender.name.substring(0,3).toUpperCase()}`;

    const txnPackage = {
      customerId: sender.id,
      customerName: sender.name,
      type: 'Remittance' as const,
      currencyPair: 'USD/ZWG',
      direction: formVal.direction === 'Local' ? ('Local' as const) : ('International' as const),
      amount: formVal.amount,
      amountLocal: this.chargedLocalAmount(),
      rate: this.usdToZwgRate(),
      fee: this.remitFee(),
      payoutMethod: formVal.payoutMethod,
      recipientName: formVal.recipientName,
      recipientPhone: formVal.recipientPhone,
      recipientAccount: formVal.recipientAccount || undefined,
      purpose: formVal.purpose,
      sourceOfFunds: formVal.sourceOfFunds,
      payoutPin: pin,
      notes: ''
    };

    if (this.isOnline()) {
      const createdTxn = this.stateService.createTransaction(txnPackage);
      alert(`Remittance Created! Status: ${createdTxn.status}. Payout PIN generated: ${pin}`);
      this.router.navigate([`/teller/transaction/${createdTxn.id}/receipt`]);
    } else {
      this.saveLocalDraft(true);
      alert('Offline. Saved to local remittance drafts database. Will upload on reconnect.');
    }
  }

  // LOCAL STORAGE DRAFTS
  loadDraftsFromStorage() {
    const cached = localStorage.getItem('cc_remit_drafts');
    if (cached) {
      this.localDrafts.set(JSON.parse(cached));
    }
  }

  saveLocalDraft(silent = false) {
    const sender = this.selectedSender();
    if (!sender) return;

    const draftId = `DRF-REM-${Date.now()}`;
    const newDraft: LocalRemitDraft = {
      id: draftId,
      senderName: sender.name,
      recipientName: this.remitForm.value.recipientName || 'Unknown',
      amount: this.remitForm.value.amount || 0,
      direction: this.remitForm.value.direction,
      timestamp: new Date().toISOString(),
      formData: {
        sender,
        fields: this.remitForm.value,
        chargedLocalAmount: this.chargedLocalAmount(),
        fee: this.remitFee(),
        rate: this.usdToZwgRate()
      }
    };

    this.localDrafts.update(prev => {
      const updated = [newDraft, ...prev];
      localStorage.setItem('cc_remit_drafts', JSON.stringify(updated));
      return updated;
    });

    if (!silent) {
      alert('Remittance draft persisted successfully.');
    }
  }

  restoreDraft(d: LocalRemitDraft) {
    const data = d.formData;
    this.selectedSender.set(data.sender);
    this.searchQuery = data.sender.name;

    this.remitForm.patchValue({
      recipientName: data.fields.recipientName,
      recipientPhone: data.fields.recipientPhone,
      direction: data.fields.direction,
      payoutMethod: data.fields.payoutMethod,
      recipientAccount: data.fields.recipientAccount,
      amount: data.fields.amount,
      sourceOfFunds: data.fields.sourceOfFunds,
      purpose: data.fields.purpose
    });

    this.updateCalculator();
    this.runAmlVetting();
    this.deleteDraft(d.id);
  }

  deleteDraft(id: string) {
    this.localDrafts.update(prev => {
      const updated = prev.filter(d => d.id !== id);
      localStorage.setItem('cc_remit_drafts', JSON.stringify(updated));
      return updated;
    });
  }

  syncLocalDraftsToServer() {
    const drafts = this.localDrafts();
    if (drafts.length === 0) return;

    drafts.forEach(d => {
      const data = d.formData;
      const randCode = Math.floor(1000 + Math.random() * 9000);
      const pin = `REM-${randCode}-${data.sender.name.substring(0,3).toUpperCase()}`;

      const txnPackage = {
        customerId: data.sender.id,
        customerName: data.sender.name,
        type: 'Remittance' as const,
        currencyPair: 'USD/ZWG',
        direction: data.fields.direction === 'Local' ? ('Local' as const) : ('International' as const),
        amount: data.fields.amount,
        amountLocal: data.chargedLocalAmount,
        rate: data.rate,
        fee: data.fee,
        payoutMethod: data.fields.payoutMethod,
        recipientName: data.fields.recipientName,
        recipientPhone: data.fields.recipientPhone,
        recipientAccount: data.fields.recipientAccount,
        purpose: data.fields.purpose,
        sourceOfFunds: data.fields.sourceOfFunds,
        payoutPin: pin,
        notes: 'Synced from offline device buffer.'
      };
      this.stateService.createTransaction(txnPackage);
    });

    this.localDrafts.set([]);
    localStorage.removeItem('cc_remit_drafts');
    this.stateService.addAuditLog(`Synced ${drafts.length} offline remittance drafts to server.`);
    alert(`Connection restored! Synchronized ${drafts.length} queued remittances to the core ledger.`);
  }
}
