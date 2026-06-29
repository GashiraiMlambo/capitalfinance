import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StateService, SavingsAccount, Customer } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="savings-wrapper anim-fade-in">
      <div class="page-actions-header">
        <h2>Savings & Share Capital Management</h2>
        <div class="tabs-banking">
          <div class="tab-item" [class.active]="activeTab() === 'accounts'" (click)="activeTab.set('accounts')">Savings Portfolio</div>
          <div class="tab-item" [class.active]="activeTab() === 'open'" (click)="activeTab.set('open')">Open Savings Account</div>
          <div class="tab-item" [class.active]="activeTab() === 'shares'" (click)="activeTab.set('shares')">Share Capital Market</div>
        </div>
      </div>

      <!-- TAB 1: SAVINGS ACCOUNTS DIRECTORY -->
      <div class="tab-content" *ngIf="activeTab() === 'accounts'">
        <div class="directory-filter-bar card-banking">
          <div class="search-box">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" placeholder="Search by client or account number..." [(ngModel)]="searchQuery" />
          </div>
          <div class="filters">
            <select class="form-control" [(ngModel)]="filterType">
              <option value="ALL">All Products</option>
              <option value="Voluntary Savings">Voluntary Savings</option>
              <option value="Fixed Deposit">Fixed Deposit</option>
              <option value="Group Savings">Group Savings</option>
              <option value="Share Capital">Share Capital</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <div class="table-responsive">
            <table class="table-enterprise">
              <thead>
                <tr>
                  <th>Account No</th>
                  <th>Client</th>
                  <th>Product Type</th>
                  <th>Interest Rate</th>
                  <th>Current Balance</th>
                  <th>Locked Until</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let acc of filteredAccounts()" (click)="selectAccount(acc)">
                  <td><strong>{{ acc.accountNumber }}</strong></td>
                  <td>{{ acc.customerName }}</td>
                  <td>{{ acc.productType }}</td>
                  <td>{{ acc.interestRate }}%</td>
                  <td><strong class="text-success">$ {{ acc.balance | number:'1.2-2' }}</strong></td>
                  <td>{{ acc.lockedUntil ? (acc.lockedUntil | date:'mediumDate') : 'N/A' }}</td>
                  <td>
                    <span class="chip-status" [class]="'status-' + acc.status.toLowerCase()">
                      {{ acc.status }}
                    </span>
                  </td>
                  <td>
                    <button class="btn-secondary" (click)="selectAccount(acc); $event.stopPropagation()">
                      Deposit / Withdraw
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: OPEN SAVINGS ACCOUNT FORM -->
      <div class="tab-content" *ngIf="activeTab() === 'open'">
        <div class="card-banking max-w-600">
          <h3>Open Institutional Account</h3>
          <p class="section-desc">Create a new ledger-backed savings or deposit product for a verified member.</p>
          
          <form [formGroup]="openForm" (ngSubmit)="submitOpenSavings()">
            <div class="form-group">
              <label>Select Customer *</label>
              <select class="form-control" formControlName="customerId">
                <option value="">Choose Client</option>
                <option *ngFor="let c of stateService.customers()" [value]="c.id">{{ c.name }} ({{ c.id }})</option>
              </select>
            </div>

            <div class="form-group">
              <label>Savings Product *</label>
              <select class="form-control" formControlName="productType" (change)="onProductChange()">
                <option value="Voluntary Savings">Voluntary Savings (3% Interest, No lock-in)</option>
                <option value="Fixed Deposit">Fixed Deposit (8% Interest, 6-Month Lock)</option>
                <option value="Group Savings">Group Savings (4% Interest, Group-collateralized)</option>
                <option value="Share Capital">Cooperative Share Capital (Dividend Eligible)</option>
              </select>
            </div>

            <div class="grid-container cols-2">
              <div class="form-group">
                <label>Opening Deposit Amount ($) *</label>
                <input type="number" class="form-control" formControlName="initialDeposit" />
              </div>
              <div class="form-group">
                <label>Interest Rate (%) *</label>
                <input type="number" class="form-control" formControlName="interestRate" readonly />
              </div>
            </div>

            <button type="submit" class="btn-primary w-full" [disabled]="openForm.invalid">
              Establish Savings Account
            </button>
          </form>
        </div>
      </div>

      <!-- TAB 3: SHARE CAPITAL MARKET -->
      <div class="tab-content" *ngIf="activeTab() === 'shares'">
        <div class="grid-container cols-2">
          <!-- Buy/Sell shares -->
          <div class="card-banking">
            <h3>Buy or Sell Share Capital</h3>
            <p class="section-desc">Cooperative members can purchase share capital certificates which yield dividends. Current valuation is fixed at <strong>$ 10.00 / Share</strong>.</p>
            
            <form [formGroup]="sharesForm" (ngSubmit)="executeSharesTrade()">
              <div class="form-group">
                <label>Customer Account *</label>
                <select class="form-control" formControlName="customerId">
                  <option value="">Select Member</option>
                  <option *ngFor="let c of stateService.customers()" [value]="c.id">{{ c.name }} ({{ c.id }})</option>
                </select>
              </div>

              <div class="grid-container cols-2">
                <div class="form-group">
                  <label>Trade Action *</label>
                  <select class="form-control" formControlName="action">
                    <option value="BUY">Buy Shares (Capital Increase)</option>
                    <option value="SELL">Sell Shares (Liquidate)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Number of Shares *</label>
                  <input type="number" class="form-control" formControlName="sharesQuantity" (input)="updateSharesValuation()" />
                </div>
              </div>

              <div class="valuation-indicator" *ngIf="sharesTotalCost() > 0">
                Estimated Settlement Value: <strong>$ {{ sharesTotalCost() | number:'1.2-2' }}</strong>
              </div>

              <button type="submit" class="btn-primary w-full mt-2" [disabled]="sharesForm.invalid">
                Execute Trade Settlement
              </button>
            </form>
          </div>

          <!-- Dividend distributions history -->
          <div class="card-banking">
            <h3>Cooperative Dividend Distribution Registry</h3>
            <p class="section-desc">Audit history of profit dividend distributions declared by the credit committee.</p>
            
            <div class="table-container max-h-320">
              <table class="table-enterprise">
                <thead>
                  <tr>
                    <th>Declaration Date</th>
                    <th>Rate Per Share</th>
                    <th>Total Disbursed</th>
                    <th>Authorizer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Jan 15, 2026</td>
                    <td>$ 0.45</td>
                    <td>$ 22,500.00</td>
                    <td>Credit Board</td>
                  </tr>
                  <tr>
                    <td>Jul 10, 2025</td>
                    <td>$ 0.38</td>
                    <td>$ 19,000.00</td>
                    <td>Credit Board</td>
                  </tr>
                  <tr>
                    <td>Jan 12, 2025</td>
                    <td>$ 0.40</td>
                    <td>$ 20,000.00</td>
                    <td>General Assembly</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- DEPOSIT / WITHDRAWAL DRAWER -->
      <div class="modal-overlay" *ngIf="selectedAccount()" (click)="closeAccountDetails()">
        <div class="drawer-content" (click)="$event.stopPropagation()">
          <div class="drawer-header">
            <h3>Savings Ledger Control</h3>
            <button class="btn-close" (click)="closeAccountDetails()">&times;</button>
          </div>

          <div class="drawer-body" *ngIf="selectedAccount() as acc">
            <div class="customer-banner">
              <div class="avatar-placeholder">{{ acc.customerName[0] }}</div>
              <div class="meta">
                <h4>{{ acc.customerName }}</h4>
                <span>{{ acc.accountNumber }} • {{ acc.productType }}</span>
              </div>
            </div>

            <div class="current-bal-widget">
              <span class="lbl">Ledger Balance</span>
              <span class="val">$ {{ acc.balance | number:'1.2-2' }}</span>
            </div>

            <div class="drawer-section border-box">
              <h5>Post Savings Transaction</h5>
              <div class="grid-container cols-2 mt-2">
                <div class="form-group">
                  <label>Transaction Type</label>
                  <select class="form-control" [(ngModel)]="transType">
                    <option value="DEPOSIT">Deposit Funds</option>
                    <option value="WITHDRAW" [disabled]="acc.status === 'Locked'">Withdraw Funds</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Amount ($)</label>
                  <input type="number" class="form-control" placeholder="0.00" [(ngModel)]="transAmount" />
                </div>
              </div>
              
              <button class="btn-primary w-full mt-2" (click)="postSavingsTransaction()">
                Confirm Ledger Entry
              </button>
            </div>

            <!-- Lock status warning -->
            <div class="warning-alert mt-4" *ngIf="acc.status === 'Locked'">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <span>This account is LOCKED for deposits until {{ acc.lockedUntil | date:'mediumDate' }}. Withdrawals are prohibited.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .savings-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-actions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 10px;

      h2 { font-size: 20px; font-family: 'Outfit', sans-serif; }
      .tabs-banking { margin-bottom: 0; border: none; }
    }

    .directory-filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding: 16px;
      margin-bottom: 16px;

      .search-box {
        position: relative;
        display: flex;
        align-items: center;
        width: 320px;

        svg { position: absolute; left: 12px; color: var(--text-muted); }
        input {
          width: 100%;
          background: var(--bg-base);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 8px 12px 8px 38px;
          outline: none;
          color: var(--text-main);
          
          &:focus { border-color: var(--primary); }
        }
      }

      .filters {
        display: flex;
        gap: 12px;
        select { min-width: 180px; }
      }
    }

    .max-w-600 {
      max-width: 600px;
      margin: 0 auto;
    }

    .section-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    .w-full { width: 100%; justify-content: center; }
    .mt-2 { margin-top: 8px; }
    .mt-4 { margin-top: 16px; }

    .valuation-indicator {
      background: var(--primary-light);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 12px;
      margin-bottom: 16px;
      font-size: 13.5px;
      color: var(--text-main);
    }

    .max-h-320 {
      max-height: 320px;
      overflow-y: auto;
    }

    // Drawer internals
    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 12px;

      .btn-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--text-muted);
        &:hover { color: var(--text-main); }
      }
    }

    .customer-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid var(--border-light);

      .avatar-placeholder {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--primary-gradient);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 20px;
      }

      .meta {
        h4 { font-size: 16px; }
        span { font-size: 12px; color: var(--text-muted); }
      }
    }

    .current-bal-widget {
      background: var(--primary-gradient);
      color: white;
      padding: 18px;
      border-radius: var(--radius-lg);
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-primary);

      .lbl { font-size: 11px; text-transform: uppercase; opacity: 0.8; font-weight: 600; }
      .val { font-size: 24px; font-weight: 700; font-family: 'Outfit', sans-serif; }
    }

    .drawer-section {
      margin-top: 20px;
      h5 { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }

      &.border-box {
        background: var(--bg-base);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: 14px;
      }
    }

    .warning-alert {
      background: var(--warning-light);
      border: 1px solid var(--warning);
      border-radius: var(--radius-md);
      color: var(--warning);
      padding: 12px;
      display: flex;
      gap: 10px;
      font-size: 12.5px;
      line-height: 1.4;
      svg { flex-shrink: 0; }
    }
  `]
})
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
