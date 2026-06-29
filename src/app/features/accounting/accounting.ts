import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StateService, LedgerAccount, JournalEntry } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-accounting',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="accounting-wrapper anim-fade-in">
      <div class="page-actions-header">
        <h2>General Ledger & Financial Accounting</h2>
        <div class="tabs-banking">
          <div class="tab-item" [class.active]="activeTab() === 'chart'" (click)="activeTab.set('chart')">Chart of Accounts</div>
          <div class="tab-item" [class.active]="activeTab() === 'journal'" (click)="activeTab.set('journal')">Post Journal Entry</div>
          <div class="tab-item" [class.active]="activeTab() === 'ledger'" (click)="activeTab.set('ledger')">Ledger Audit Log</div>
          <div class="tab-item" [class.active]="activeTab() === 'statements'" (click)="activeTab.set('statements')">Financial Statements</div>
        </div>
      </div>

      <!-- TAB 1: CHART OF ACCOUNTS -->
      <div class="tab-content" *ngIf="activeTab() === 'chart'">
        <div class="table-container">
          <table class="table-enterprise">
            <thead>
              <tr>
                <th>Account Code</th>
                <th>Account Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Current Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let acc of stateService.ledgerAccounts()">
                <td><strong>{{ acc.code }}</strong></td>
                <td>{{ acc.name }}</td>
                <td>
                  <span class="chip-status status-info">{{ acc.category }}</span>
                </td>
                <td>{{ acc.type }}</td>
                <td>
                  <strong [class.text-danger]="acc.type === 'Debit' && acc.balance < 0" [class.text-success]="acc.type === 'Credit'">
                    $ {{ acc.balance | number:'1.2-2' }}
                  </strong>
                </td>
                <td><span class="chip-status status-approved">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: POST JOURNAL ENTRY -->
      <div class="tab-content" *ngIf="activeTab() === 'journal'">
        <div class="card-banking max-w-700">
          <h3>Post Manual General Ledger Entry</h3>
          <p class="section-desc">Create double-entry records. Total Debits must exactly equal Total Credits to maintain ledger integrity.</p>

          <form [formGroup]="entryForm" (ngSubmit)="submitJournalEntry()">
            <div class="grid-container cols-2">
              <div class="form-group">
                <label>Description / Narration *</label>
                <input type="text" class="form-control" formControlName="description" placeholder="e.g. Adjusting accrued interest" />
              </div>
              <div class="form-group">
                <label>Reference Number *</label>
                <input type="text" class="form-control" formControlName="referenceNo" placeholder="REF-MAN-10293" />
              </div>
            </div>

            <!-- DEBITS SECTION -->
            <div class="ledger-posting-section">
              <h5>Debit Transactions (Increase Assets/Expenses)</h5>
              <div class="grid-container cols-2 align-center">
                <div class="form-group mb-0">
                  <label>Debit Account</label>
                  <select class="form-control" [(ngModel)]="debitAccount" [ngModelOptions]="{standalone: true}">
                    <option value="">Choose Account</option>
                    <option *ngFor="let acc of stateService.ledgerAccounts()" [value]="acc.code">{{ acc.code }} - {{ acc.name }}</option>
                  </select>
                </div>
                <div class="form-group mb-0">
                  <label>Debit Amount ($)</label>
                  <input type="number" class="form-control" placeholder="0.00" [(ngModel)]="debitAmount" [ngModelOptions]="{standalone: true}" />
                </div>
              </div>
            </div>

            <!-- CREDITS SECTION -->
            <div class="ledger-posting-section mt-4">
              <h5>Credit Transactions (Increase Liabilities/Equity/Revenue)</h5>
              <div class="grid-container cols-2 align-center">
                <div class="form-group mb-0">
                  <label>Credit Account</label>
                  <select class="form-control" [(ngModel)]="creditAccount" [ngModelOptions]="{standalone: true}">
                    <option value="">Choose Account</option>
                    <option *ngFor="let acc of stateService.ledgerAccounts()" [value]="acc.code">{{ acc.code }} - {{ acc.name }}</option>
                  </select>
                </div>
                <div class="form-group mb-0">
                  <label>Credit Amount ($)</label>
                  <input type="number" class="form-control" placeholder="0.00" [(ngModel)]="creditAmount" [ngModelOptions]="{standalone: true}" />
                </div>
              </div>
            </div>

            <!-- Validation warning -->
            <div class="validation-bar mt-4" [class.valid]="debitAmount > 0 && debitAmount === creditAmount">
              <span>Debit: <strong>$ {{ debitAmount | number:'1.2-2' }}</strong></span>
              <span class="divider-v">|</span>
              <span>Credit: <strong>$ {{ creditAmount | number:'1.2-2' }}</strong></span>
              <span class="indicator-text" *ngIf="debitAmount !== creditAmount">Out of Balance</span>
              <span class="indicator-text" *ngIf="debitAmount > 0 && debitAmount === creditAmount">Balanced</span>
            </div>

            <button type="submit" class="btn-primary w-full mt-4" [disabled]="entryForm.invalid || !debitAccount || !creditAccount || debitAmount <= 0 || debitAmount !== creditAmount">
              Commit Ledger Transaction
            </button>
          </form>
        </div>
      </div>

      <!-- TAB 3: LEDGER AUDIT LOG -->
      <div class="tab-content" *ngIf="activeTab() === 'ledger'">
        <div class="table-container">
          <table class="table-enterprise">
            <thead>
              <tr>
                <th>Entry ID</th>
                <th>Timestamp</th>
                <th>Reference No</th>
                <th>Description</th>
                <th>Debits Details</th>
                <th>Credits Details</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let entry of stateService.journalEntries()">
                <td><strong>{{ entry.id }}</strong></td>
                <td>{{ entry.date | date:'medium' }}</td>
                <td><code>{{ entry.referenceNo }}</code></td>
                <td>{{ entry.description }}</td>
                <td>
                  <div *ngFor="let deb of entry.debits" class="entry-line">
                    <span class="acct">{{ deb.accountCode }}</span>: 
                    <strong class="text-success">$ {{ deb.amount | number:'1.2-2' }}</strong>
                  </div>
                </td>
                <td>
                  <div *ngFor="let cred of entry.credits" class="entry-line">
                    <span class="acct">{{ cred.accountCode }}</span>: 
                    <strong class="text-danger">$ {{ cred.amount | number:'1.2-2' }}</strong>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 4: FINANCIAL STATEMENTS -->
      <div class="tab-content" *ngIf="activeTab() === 'statements'">
        <div class="grid-container cols-2">
          <!-- Balance Sheet -->
          <div class="card-banking">
            <h3>Balance Sheet (Asset & Liabilities)</h3>
            <p class="section-desc">Report of the institution's assets, liabilities, and equity capital holdings.</p>
            
            <div class="statement-table">
              <div class="statement-row header"><span>ASSETS</span></div>
              <div class="statement-row" *ngFor="let acc of getAccountsByCategory('Assets')">
                <span>{{ acc.name }}</span>
                <strong>$ {{ acc.balance | number:'1.2-2' }}</strong>
              </div>
              <div class="statement-row total">
                <span>Total Assets</span>
                <strong>$ {{ sumAccounts('Assets') | number:'1.2-2' }}</strong>
              </div>

              <div class="statement-row header mt-4"><span>LIABILITIES & EQUITY</span></div>
              <div class="statement-row" *ngFor="let acc of getAccountsByCategory('Liabilities')">
                <span>{{ acc.name }}</span>
                <strong>$ {{ acc.balance | number:'1.2-2' }}</strong>
              </div>
              <div class="statement-row" *ngFor="let acc of getAccountsByCategory('Equity')">
                <span>{{ acc.name }}</span>
                <strong>$ {{ acc.balance | number:'1.2-2' }}</strong>
              </div>
              <div class="statement-row total">
                <span>Total Liabilities & Equity</span>
                <strong>$ {{ (sumAccounts('Liabilities') + sumAccounts('Equity')) | number:'1.2-2' }}</strong>
              </div>
            </div>
          </div>

          <!-- Income Statement -->
          <div class="card-banking">
            <h3>Income Statement (P&L)</h3>
            <p class="section-desc">Summary of operating revenues earned and expenses incurred during the active fiscal cycle.</p>
            
            <div class="statement-table">
              <div class="statement-row header"><span>REVENUES</span></div>
              <div class="statement-row" *ngFor="let acc of getAccountsByCategory('Revenue')">
                <span>{{ acc.name }}</span>
                <strong>$ {{ acc.balance | number:'1.2-2' }}</strong>
              </div>
              <div class="statement-row total">
                <span>Total Revenues</span>
                <strong>$ {{ sumAccounts('Revenue') | number:'1.2-2' }}</strong>
              </div>

              <div class="statement-row header mt-4"><span>OPERATING EXPENSES</span></div>
              <div class="statement-row" *ngFor="let acc of getAccountsByCategory('Expense')">
                <span>{{ acc.name }}</span>
                <strong>$ {{ acc.balance | number:'1.2-2' }}</strong>
              </div>
              <div class="statement-row total">
                <span>Total Expenses</span>
                <strong>$ {{ sumAccounts('Expense') | number:'1.2-2' }}</strong>
              </div>

              <div class="statement-row total net-income mt-4">
                <span>Net Operating Income</span>
                <strong class="text-success">$ {{ (sumAccounts('Revenue') - sumAccounts('Expense')) | number:'1.2-2' }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .accounting-wrapper {
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

    .max-w-700 {
      max-width: 700px;
      margin: 0 auto;
    }

    .section-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    .ledger-posting-section {
      background: var(--bg-base);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 16px;
      
      h5 { margin-bottom: 12px; font-size: 13px; color: var(--text-muted); }
    }

    .align-center {
      align-items: center;
    }

    .validation-bar {
      background: var(--danger-light);
      border: 1px solid var(--danger);
      border-radius: var(--radius-md);
      color: var(--danger);
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 16px;
      font-weight: 500;
      justify-content: center;

      .divider-v { color: var(--border); }
      .indicator-text { text-transform: uppercase; font-size: 11px; font-weight: 700; }

      &.valid {
        background: var(--success-light);
        border-color: var(--success);
        color: var(--success);
      }
    }

    .w-full { width: 100%; justify-content: center; }
    .mt-4 { margin-top: 16px; }
    .mb-0 { margin-bottom: 0; }

    .entry-line {
      font-size: 12px;
      margin-bottom: 4px;
      
      .acct { font-family: monospace; }
    }

    // Financial statements layout
    .statement-table {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .statement-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 12px;
      font-size: 13.5px;
      border-bottom: 1px solid var(--border-light);

      &.header {
        background: var(--primary-light);
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
        color: var(--primary);
        border-bottom: 2px solid var(--primary);
        padding: 8px 12px;
        margin-top: 8px;
      }

      &.total {
        font-weight: 700;
        border-top: 1px solid var(--text-main);
        border-bottom: 2px double var(--text-main);
        background: var(--bg-base);
        padding: 8px 12px;
      }

      &.net-income {
        background: var(--success-light);
        border-bottom-color: var(--success);
      }
    }
  `]
})
export class AccountingComponent implements OnInit {
  stateService = inject(StateService);
  fb = inject(FormBuilder);

  activeTab = signal<'chart' | 'journal' | 'ledger' | 'statements'>('chart');
  entryForm!: FormGroup;

  // Manual input variables
  debitAccount = '';
  debitAmount = 0;
  creditAccount = '';
  creditAmount = 0;

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.entryForm = this.fb.group({
      description: ['', Validators.required],
      referenceNo: ['', Validators.required]
    });
  }

  submitJournalEntry() {
    if (!this.debitAccount || !this.creditAccount || this.debitAmount !== this.creditAmount) return;

    this.stateService.postJournalEntry({
      description: this.entryForm.value.description,
      referenceNo: this.entryForm.value.referenceNo,
      debits: [{ accountCode: this.debitAccount, amount: this.debitAmount }],
      credits: [{ accountCode: this.creditAccount, amount: this.creditAmount }]
    });

    // Reset Form
    this.entryForm.reset();
    this.debitAccount = '';
    this.debitAmount = 0;
    this.creditAccount = '';
    this.creditAmount = 0;

    // Go to ledger log
    this.activeTab.set('ledger');
  }

  getAccountsByCategory(cat: 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expense'): LedgerAccount[] {
    return this.stateService.ledgerAccounts().filter(a => a.category === cat);
  }

  sumAccounts(cat: 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expense'): number {
    return this.getAccountsByCategory(cat).reduce((sum, a) => sum + a.balance, 0);
  }
}
