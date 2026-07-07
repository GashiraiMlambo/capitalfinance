import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StateService, SavingsAccount, Customer } from '../../core/services/state.service';

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './savings.component.html',
  styleUrl: './savings.component.scss',})
export class SavingsComponent implements OnInit {
  stateService = inject(StateService);
  fb = inject(FormBuilder);

  activeTab = signal<'accounts' | 'open' | 'shares'>('accounts');
  selectedAccount = signal<SavingsAccount | null>(null);

  // Search/Filters
  searchQuery = '';
  filterType = 'ALL';

  // Forms
  openForm!: FormGroup;
  sharesForm!: FormGroup;
  sharesTotalCost = signal<number>(0);

  // Posting transaction
  transType = 'DEPOSIT';
  transAmount: number | null = null;

  ngOnInit() {
    this.initForms();
  }

  initForms() {
    this.openForm = this.fb.group({
      customerId: ['', Validators.required],
      productType: ['Voluntary Savings', Validators.required],
      initialDeposit: [50, [Validators.required, Validators.min(10)]],
      interestRate: [3, Validators.required]
    });

    this.sharesForm = this.fb.group({
      customerId: ['', Validators.required],
      action: ['BUY', Validators.required],
      sharesQuantity: [10, [Validators.required, Validators.min(1)]]
    });
  }

  onProductChange() {
    const prod = this.openForm.value.productType;
    if (prod === 'Voluntary Savings') {
      this.openForm.patchValue({ interestRate: 3 });
    } else if (prod === 'Fixed Deposit') {
      this.openForm.patchValue({ interestRate: 8 });
    } else if (prod === 'Group Savings') {
      this.openForm.patchValue({ interestRate: 4 });
    } else if (prod === 'Share Capital') {
      this.openForm.patchValue({ interestRate: 0 });
    }
  }

  submitOpenSavings() {
    const vals = this.openForm.value;
    
    // Call StateService to register savings account
    this.stateService.openSavingsAccount({
      customerId: vals.customerId,
      productType: vals.productType,
      initialDeposit: vals.initialDeposit,
      interestRate: vals.interestRate
    });

    // Reset Form
    this.openForm.reset({ productType: 'Voluntary Savings', initialDeposit: 50, interestRate: 3 });
    
    // Go to portfolio
    this.activeTab.set('accounts');
  }

  updateSharesValuation() {
    const qty = this.sharesForm.value.sharesQuantity;
    if (qty && qty > 0) {
      this.sharesTotalCost.set(qty * 10); // $10 per share
    } else {
      this.sharesTotalCost.set(0);
    }
  }

  executeSharesTrade() {
    const vals = this.sharesForm.value;
    const qty = vals.sharesQuantity;
    const cost = qty * 10;
    const customer = this.stateService.customers().find(c => c.id === vals.customerId);

    if (!customer) return;

    if (vals.action === 'BUY') {
      // Add shares to Share Capital
      this.stateService.postJournalEntry({
        description: `Purchase of cooperative shares - ${customer.name}`,
        referenceNo: `REF-SHARE-BUY-${vals.customerId}`,
        debits: [{ accountCode: '1000', amount: cost }],  // cash +
        credits: [{ accountCode: '3000', amount: cost }]  // share capital equity +
      });

      // Update customer savings balance or registry
      this.stateService.customers.update(custs => {
        return custs.map(c => {
          if (c.id === customer.id) {
            return {
              ...c,
              savingsBalance: c.savingsBalance + cost
            };
          }
          return c;
        });
      });

      this.stateService.addAuditLog(`Member ${customer.name} purchased ${qty} Share Capital units`);
    } else {
      // Sell shares
      this.stateService.postJournalEntry({
        description: `Redemption/Sale of cooperative shares - ${customer.name}`,
        referenceNo: `REF-SHARE-SELL-${vals.customerId}`,
        debits: [{ accountCode: '3000', amount: cost }],  // share capital equity -
        credits: [{ accountCode: '1000', amount: cost }]  // cash -
      });

      this.stateService.customers.update(custs => {
        return custs.map(c => {
          if (c.id === customer.id) {
            return {
              ...c,
              savingsBalance: Math.max(0, c.savingsBalance - cost)
            };
          }
          return c;
        });
      });

      this.stateService.addAuditLog(`Member ${customer.name} sold/redeemed ${qty} Share Capital units`);
    }

    this.sharesForm.reset({ action: 'BUY', sharesQuantity: 10 });
    this.sharesTotalCost.set(0);
    this.activeTab.set('accounts');
  }

  filteredAccounts = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    const type = this.filterType;
    let list = [...this.stateService.savingsAccounts()];

    if (query) {
      list = list.filter(acc => 
        acc.customerName.toLowerCase().includes(query) || 
        acc.accountNumber.toLowerCase().includes(query)
      );
    }

    if (type !== 'ALL') {
      list = list.filter(acc => acc.productType === type);
    }

    return list;
  });

  selectAccount(acc: SavingsAccount) {
    this.selectedAccount.set(acc);
    this.transAmount = null;
    this.transType = 'DEPOSIT';
  }

  closeAccountDetails() {
    this.selectedAccount.set(null);
  }

  postSavingsTransaction() {
    const acc = this.selectedAccount();
    if (!acc || !this.transAmount || this.transAmount <= 0) return;

    if (this.transType === 'DEPOSIT') {
      // Post deposit
      this.stateService.savingsAccounts.update(accounts => {
        return accounts.map(a => {
          if (a.accountNumber === acc.accountNumber) {
            return { ...a, balance: a.balance + this.transAmount! };
          }
          return a;
        });
      });

      // Update customer total savings
      this.stateService.customers.update(custs => {
        return custs.map(c => {
          if (c.id === acc.customerId) {
            return { ...c, savingsBalance: c.savingsBalance + this.transAmount! };
          }
          return c;
        });
      });

      // Post Journal Entry
      this.stateService.postJournalEntry({
        description: `Deposit to savings ${acc.accountNumber} - ${acc.customerName}`,
        referenceNo: `REF-DEP-${acc.accountNumber}`,
        debits: [{ accountCode: '1000', amount: this.transAmount! }], // Cash +
        credits: [{ accountCode: '2000', amount: this.transAmount! }]  // Savings Deposits Liability +
      });

      this.stateService.addAuditLog(`Posted savings deposit of $${this.transAmount} to ${acc.accountNumber}`);
    } else {
      // Post withdrawal
      if (acc.balance < this.transAmount) {
        alert('Insufficient funds in savings account');
        return;
      }

      this.stateService.savingsAccounts.update(accounts => {
        return accounts.map(a => {
          if (a.accountNumber === acc.accountNumber) {
            return { ...a, balance: a.balance - this.transAmount! };
          }
          return a;
        });
      });

      // Update customer total savings
      this.stateService.customers.update(custs => {
        return custs.map(c => {
          if (c.id === acc.customerId) {
            return { ...c, savingsBalance: Math.max(0, c.savingsBalance - this.transAmount!) };
          }
          return c;
        });
      });

      // Post Journal Entry
      this.stateService.postJournalEntry({
        description: `Withdrawal from savings ${acc.accountNumber} - ${acc.customerName}`,
        referenceNo: `REF-WD-${acc.accountNumber}`,
        debits: [{ accountCode: '2000', amount: this.transAmount! }], // Savings Deposits Liability -
        credits: [{ accountCode: '1000', amount: this.transAmount! }]  // Cash -
      });

      this.stateService.addAuditLog(`Posted savings withdrawal of $${this.transAmount} from ${acc.accountNumber}`);
    }

    // Refresh selected account locally
    this.selectedAccount.update(a => {
      if (!a) return null;
      const change = this.transType === 'DEPOSIT' ? this.transAmount! : -this.transAmount!;
      return {
        ...a,
        balance: a.balance + change
      };
    });

    this.transAmount = null;
  }
}
