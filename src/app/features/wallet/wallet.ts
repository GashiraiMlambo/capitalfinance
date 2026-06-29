import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StateService, Customer } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="wallet-wrapper anim-fade-in">
      <div class="page-actions-header">
        <h2>E-Wallet Transfers & Core Settlements</h2>
        <div class="tabs-banking">
          <div class="tab-item" [class.active]="activeTab() === 'transfers'" (click)="activeTab.set('transfers')">Client Transfers</div>
          <div class="tab-item" [class.active]="activeTab() === 'transactions'" (click)="activeTab.set('transactions')">All Transactions</div>
        </div>
      </div>

      <!-- TAB 1: CLIENT TRANSFERS -->
      <div class="tab-content" *ngIf="activeTab() === 'transfers'">
        <div class="grid-container cols-2">
          <!-- Transfer form -->
          <div class="card-banking">
            <h3>Initiate Wallet-to-Wallet Transfer</h3>
            <p class="section-desc">Transfer funds between internal customer wallets instantly. backing ledger is automatically debited and credited.</p>

            <form [formGroup]="transferForm" (ngSubmit)="executeTransfer()">
              <div class="form-group">
                <label>Source Customer (Debit) *</label>
                <select class="form-control" formControlName="sourceId" (change)="onSourceChange()">
                  <option value="">Choose Source</option>
                  <option *ngFor="let c of stateService.customers()" [value]="c.id">{{ c.name }} (Wallet: $ {{ c.walletBalance | number:'1.2-2' }})</option>
                </select>
              </div>

              <div class="form-group">
                <label>Destination Customer (Credit) *</label>
                <select class="form-control" formControlName="destId">
                  <option value="">Choose Destination</option>
                  <option *ngFor="let c of stateService.customers()" [value]="c.id">{{ c.name }} (Wallet: $ {{ c.walletBalance | number:'1.2-2' }})</option>
                </select>
              </div>

              <div class="form-group">
                <label>Transfer Amount ($) *</label>
                <input type="number" class="form-control" formControlName="amount" />
                <div class="error-message" *ngIf="transferForm.get('amount')?.touched && transferForm.get('amount')?.invalid">
                  Enter a valid amount
                </div>
              </div>

              <div class="form-group">
                <label>Remarks / Notes</label>
                <input type="text" class="form-control" formControlName="remarks" placeholder="e.g. Peer-to-peer loan repayment" />
              </div>

              <button type="submit" class="btn-primary w-full" [disabled]="transferForm.invalid || isSameCustomer()">
                Execute Cash Settlement
              </button>
            </form>
          </div>

          <!-- Quick statistics / balances -->
          <div class="card-banking">
            <h3>Client Wallet Leaderboard</h3>
            <p class="section-desc">Summary of active customer wallet positions in the institution.</p>
            
            <div class="table-container max-h-320">
              <table class="table-enterprise">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>ID</th>
                    <th>Wallet Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let cust of stateService.customers()">
                    <td>{{ cust.name }}</td>
                    <td><code>{{ cust.id }}</code></td>
                    <td><strong>$ {{ cust.walletBalance | number:'1.2-2' }}</strong></td>
                    <td><span class="chip-status status-approved">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: TRANSACTIONS LIST -->
      <div class="tab-content" *ngIf="activeTab() === 'transactions'">
        <div class="table-container">
          <table class="table-enterprise">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Source Customer</th>
                <th>Destination</th>
                <th>Amount</th>
                <th>Timestamp</th>
                <th>Remarks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <!-- Show mock transaction histories -->
              <tr>
                <td><strong>TXN-4902</strong></td>
                <td>Jenny Jenkins</td>
                <td>Simon Jenkins</td>
                <td><strong class="text-success">$ 150.00</strong></td>
                <td>Jun 29, 2026 10:15 AM</td>
                <td>Repayment share</td>
                <td><span class="chip-status status-approved">Completed</span></td>
              </tr>
              <tr>
                <td><strong>TXN-4901</strong></td>
                <td>Simon Jenkins</td>
                <td>M-Pesa Gateway</td>
                <td><strong class="text-danger">$ 400.00</strong></td>
                <td>Jun 28, 2026 04:30 PM</td>
                <td>Wallet cashout payout</td>
                <td><span class="chip-status status-approved">Completed</span></td>
              </tr>
              <tr>
                <td><strong>TXN-4899</strong></td>
                <td>Jenny Jenkins</td>
                <td>Ecocash Settlement</td>
                <td><strong class="text-success">$ 850.00</strong></td>
                <td>Jun 27, 2026 09:00 AM</td>
                <td>Wallet deposit cashin</td>
                <td><span class="chip-status status-approved">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wallet-wrapper {
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

    .section-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    .w-full { width: 100%; justify-content: center; }
    .max-h-320 { max-height: 320px; overflow-y: auto; }
  `]
})
export class WalletComponent implements OnInit {
  stateService = inject(StateService);
  fb = inject(FormBuilder);

  activeTab = signal<'transfers' | 'transactions'>('transfers');
  transferForm!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.transferForm = this.fb.group({
      sourceId: ['', Validators.required],
      destId: ['', Validators.required],
      amount: [50, [Validators.required, Validators.min(1)]],
      remarks: ['']
    });
  }

  onSourceChange() {
    const srcId = this.transferForm.value.sourceId;
    const srcCust = this.stateService.customers().find(c => c.id === srcId);
    if (srcCust) {
      this.transferForm.get('amount')?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(srcCust.walletBalance)
      ]);
      this.transferForm.get('amount')?.updateValueAndValidity();
    }
  }

  isSameCustomer() {
    return this.transferForm.value.sourceId === this.transferForm.value.destId;
  }

  executeTransfer() {
    const vals = this.transferForm.value;
    const amount = vals.amount;
    const source = this.stateService.customers().find(c => c.id === vals.sourceId);
    const dest = this.stateService.customers().find(c => c.id === vals.destId);

    if (!source || !dest || source.walletBalance < amount) return;

    // Execute transfer in memory (mutating StateService customers)
    this.stateService.customers.update(custs => {
      return custs.map(c => {
        if (c.id === source.id) {
          return { ...c, walletBalance: c.walletBalance - amount };
        }
        if (c.id === dest.id) {
          return { ...c, walletBalance: c.walletBalance + amount };
        }
        return c;
      });
    });

    // Post General Ledger entries
    // Debit Savings/Wallet Liability Account (source customer)
    // Credit Savings/Wallet Liability Account (dest customer)
    this.stateService.postJournalEntry({
      description: `Internal wallet transfer: ${source.name} -> ${dest.name}. Remarks: ${vals.remarks || 'None'}`,
      referenceNo: `REF-W2W-${Date.now().toString().slice(-6)}`,
      debits: [{ accountCode: '2000', amount: amount }], // Debit liability account
      credits: [{ accountCode: '2000', amount: amount }]  // Credit liability account
    });

    this.stateService.addAuditLog(`Executed wallet transfer from ${source.name} to ${dest.name} for $${amount}`);

    this.transferForm.reset({ sourceId: '', destId: '', amount: 50, remarks: '' });
    this.activeTab.set('transactions');
  }
}
