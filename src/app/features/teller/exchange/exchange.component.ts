import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StateService, Customer, ExchangeRate } from '../../../core/services/state.service';

interface LocalDraft {
  id: string;
  customerName: string;
  pair: string;
  direction: 'Buy' | 'Sell';
  amount: number;
  timestamp: string;
  formData: any;
}

@Component({
  selector: 'app-exchange',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './exchange.component.html',
  styleUrl: './exchange.component.scss',})
export class ExchangeComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  stateService = inject(StateService);
  router = inject(Router);

  exchangeForm!: FormGroup;
  
  searchQuery = signal('');
  showLookupDropdown = signal(false);
  selectedCustomer = signal<Customer | null>(null);

  isOnline = signal<boolean>(true);

  // Dynamic Calculator Signals
  destinationAmount = signal<number>(0);
  selectedRate = signal<ExchangeRate>({ pair: 'USD/ZWG', buyRate: 24.50, sellRate: 25.80, spread: 5.3, lastUpdated: '', status: 'Live' });
  selectedRateFee = signal<number>(0);

  // Local drafts list
  localDrafts = signal<LocalDraft[]>([]);

  getCurrencySymbol(curr: string | undefined): string {
    if (!curr) return '$';
    switch (curr.toUpperCase()) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'ZAR': return 'R';
      default: return curr;
    }
  }

  ngOnInit() {
    this.exchangeForm = this.fb.group({
      direction: ['Buy', Validators.required],
      pair: ['USD/ZWG', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      sourceOfFunds: ['Salary', Validators.required],
      purpose: ['Travel', Validators.required],
      payoutMethod: ['Cash', Validators.required]
    });

    // Detect Online/Offline status
    this.isOnline.set(navigator.onLine);
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Load drafts
    this.loadDraftsFromStorage();
    this.updateCalculator();
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
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
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) {
      return this.stateService.customers();
    }
    return this.stateService.customers().filter(
      c => c.name.toLowerCase().includes(q) || c.nationalId.toLowerCase().includes(q)
    );
  });

  selectCustomer(c: Customer) {
    this.selectedCustomer.set(c);
    this.searchQuery.set(c.name);
    this.showLookupDropdown.set(false);
  }

  hideDropdown() {
    setTimeout(() => {
      this.showLookupDropdown.set(false);
    }, 200);
  }

  isKycBlocked(): boolean {
    const cust = this.selectedCustomer();
    if (!cust) return false;
    return cust.kycStatus === 'Flagged' || cust.kycStatus === 'Expired';
  }

  showThresholdWarning(): boolean {
    const amount = this.exchangeForm.get('amount')?.value;
    return amount > 5000;
  }

  updateCalculator() {
    const amount = this.exchangeForm.get('amount')?.value || 0;
    const pair = this.exchangeForm.get('pair')?.value;
    const direction = this.exchangeForm.get('direction')?.value;

    const rateObj = this.stateService.rates().find(r => r.pair === pair);
    if (!rateObj) return;

    this.selectedRate.set(rateObj);

    // Dynamic fee logic: 0.5% of ZWG equivalence, min 10 ZWG
    const rateVal = direction === 'Buy' ? rateObj.buyRate : rateObj.sellRate;
    const zwgEquiv = amount * rateVal;
    const calculatedFee = Math.max(10, zwgEquiv * 0.005);

    this.selectedRateFee.set(calculatedFee);
    
    // Total payout to give/receive in local currency
    const payout = direction === 'Buy' ? (zwgEquiv - calculatedFee) : (zwgEquiv + calculatedFee);
    this.destinationAmount.set(Math.max(0, payout));
  }

  submitExchange() {
    const customer = this.selectedCustomer();
    if (!customer || this.isKycBlocked()) return;

    const formVal = this.exchangeForm.value;

    // Build the transaction package
    const txnPackage = {
      customerId: customer.id,
      customerName: customer.name,
      type: 'Exchange' as const,
      currencyPair: formVal.pair,
      direction: formVal.direction === 'Buy' ? 'Buy' as const : 'Sell' as const,
      amount: formVal.amount,
      amountLocal: this.destinationAmount(),
      rate: formVal.direction === 'Buy' ? this.selectedRate().buyRate : this.selectedRate().sellRate,
      fee: this.selectedRateFee(),
      payoutMethod: formVal.payoutMethod,
      purpose: formVal.purpose,
      sourceOfFunds: formVal.sourceOfFunds,
      notes: ''
    };

    if (this.isOnline()) {
      const createdTxn = this.stateService.createTransaction(txnPackage);
      this.stateService.showToast(`Transaction Submitted! Status: ${createdTxn.status}`, 'success');
      this.router.navigate([`/teller/transaction/${createdTxn.id}/receipt`]);
    } else {
      // Save locally as draft and prompt teller
      this.saveLocalDraft(true);
      this.stateService.showToast('Network offline. Transaction saved to Local Drafts Queue and will be synced upon network reconnection.', 'warning');
    }
  }

  // LOCAL STORAGE DRAFTS RESILIENCE (Requirement 3)
  loadDraftsFromStorage() {
    const cached = localStorage.getItem('cc_exchange_drafts');
    if (cached) {
      this.localDrafts.set(JSON.parse(cached));
    }
  }

  saveLocalDraft(silent = false) {
    const customer = this.selectedCustomer();
    if (!customer) return;

    const draftId = `DRF-${Date.now()}`;
    const newDraft: LocalDraft = {
      id: draftId,
      customerName: customer.name,
      pair: this.exchangeForm.value.pair,
      direction: this.exchangeForm.value.direction,
      amount: this.exchangeForm.value.amount || 0,
      timestamp: new Date().toISOString(),
      formData: {
        customer,
        fields: this.exchangeForm.value,
        destinationAmount: this.destinationAmount(),
        fee: this.selectedRateFee(),
        rate: this.selectedRate()
      }
    };

    this.localDrafts.update(prev => {
      const updated = [newDraft, ...prev];
      localStorage.setItem('cc_exchange_drafts', JSON.stringify(updated));
      return updated;
    });

    if (!silent) {
      this.stateService.showToast('Draft form successfully persisted locally.', 'info');
    }
  }

  restoreDraft(d: LocalDraft) {
    const data = d.formData;
    this.selectedCustomer.set(data.customer);
    this.searchQuery.set(data.customer.name);
    
    this.exchangeForm.patchValue({
      direction: data.fields.direction,
      pair: data.fields.pair,
      amount: data.fields.amount,
      sourceOfFunds: data.fields.sourceOfFunds,
      purpose: data.fields.purpose,
      payoutMethod: data.fields.payoutMethod
    });

    this.updateCalculator();
    // Delete draft after restoring
    this.deleteDraft(d.id);
  }

  deleteDraft(id: string) {
    this.localDrafts.update(prev => {
      const updated = prev.filter(d => d.id !== id);
      localStorage.setItem('cc_exchange_drafts', JSON.stringify(updated));
      return updated;
    });
  }

  syncLocalDraftsToServer() {
    const drafts = this.localDrafts();
    if (drafts.length === 0) return;

    // Process drafts sequentially
    drafts.forEach(d => {
      const data = d.formData;
      const txnPackage = {
        customerId: data.customer.id,
        customerName: data.customer.name,
        type: 'Exchange' as const,
        currencyPair: data.fields.pair,
        direction: data.fields.direction === 'Buy' ? 'Buy' as const : 'Sell' as const,
        amount: data.fields.amount,
        amountLocal: data.destinationAmount,
        rate: data.fields.direction === 'Buy' ? data.rate.buyRate : data.rate.sellRate,
        fee: data.fee,
        payoutMethod: data.fields.payoutMethod,
        purpose: data.fields.purpose,
        sourceOfFunds: data.fields.sourceOfFunds,
        notes: 'Synced automatically from offline cache.'
      };
      this.stateService.createTransaction(txnPackage);
    });

    // Clear drafts queue
    this.localDrafts.set([]);
    localStorage.removeItem('cc_exchange_drafts');
    this.stateService.addAuditLog(`Synced ${drafts.length} offline exchange drafts to server.`);
    this.stateService.showToast(`Network Restored. Successfully synced ${drafts.length} offline drafts to the banking ledger!`, 'success');
  }
}
