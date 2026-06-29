import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StateService, Loan, Customer, RepaymentPeriod } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface CalculatorSchedule {
  period: number;
  dueDate: string;
  principal: number;
  interest: number;
  total: number;
  balance: number;
}

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="loans-wrapper anim-fade-in">
      <div class="page-actions-header">
        <h2>Credit & Underwriting Management</h2>
        <div class="tabs-banking">
          <div class="tab-item" [class.active]="activeTab() === 'active'" (click)="activeTab.set('active')">Active Loans</div>
          <div class="tab-item" [class.active]="activeTab() === 'calculator'" (click)="activeTab.set('calculator')">Loan Calculator & Apply</div>
          <div class="tab-item" [class.active]="activeTab() === 'products'" (click)="activeTab.set('products')">Loan Products</div>
        </div>
      </div>

      <!-- TAB 1: ACTIVE LOANS & REPAYMENTS -->
      <div class="tab-content" *ngIf="activeTab() === 'active'">
        <!-- Filter bar -->
        <div class="directory-filter-bar card-banking">
          <div class="search-box">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" placeholder="Search loans by client name or loan ID..." [(ngModel)]="searchQuery" />
          </div>
          <div class="filters">
            <select class="form-control" [(ngModel)]="filterStatus">
              <option value="ALL">All Statuses</option>
              <option value="Repaying">Repaying</option>
              <option value="Restructured">Restructured</option>
              <option value="Pending">Pending Approvals</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <!-- Loans Directory Table -->
        <div class="table-container">
          <div class="table-responsive">
            <table class="table-enterprise">
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Client</th>
                  <th>Product</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Outstanding</th>
                  <th>Paid Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let loan of filteredLoans()" (click)="selectLoan(loan)">
                  <td><strong>{{ loan.id }}</strong></td>
                  <td>{{ loan.customerName }}</td>
                  <td>{{ loan.productType }}</td>
                  <td>$ {{ loan.amount | number:'1.2-2' }}</td>
                  <td>{{ loan.interestRate }}%</td>
                  <td><strong class="text-danger">$ {{ loan.outstandingBalance | number:'1.2-2' }}</strong></td>
                  <td>$ {{ loan.paidAmount | number:'1.2-2' }}</td>
                  <td>
                    <span class="chip-status" [class]="'status-' + loan.status.toLowerCase()">
                      {{ loan.status }}
                    </span>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button class="btn-secondary" (click)="selectLoan(loan); $event.stopPropagation()">
                        Folder Details
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredLoans().length === 0">
                  <td colspan="9" class="text-center">
                    <div class="empty-state">
                      <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806a3.42 3.42 0 014.438 0a3.42 3.42 0 001.946.806a3.42 3.42 0 013.138 3.138a3.42 3.42 0 00.806 1.946a3.42 3.42 0 010 4.438a3.42 3.42 0 00-.806 1.946a3.42 3.42 0 01-3.138 3.138a3.42 3.42 0 00-1.946.806a3.42 3.42 0 01-4.438 0a3.42 3.42 0 00-1.946-.806a3.42 3.42 0 01-3.138-3.138a3.42 3.42 0 00-.806-1.946a3.42 3.42 0 010-4.438a3.42 3.42 0 00.806-1.946a3.42 3.42 0 013.138-3.138z"/></svg>
                      <p>No credit files found matching criteria</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: LOAN CALCULATOR & APPLY -->
      <div class="tab-content" *ngIf="activeTab() === 'calculator'">
        <div class="grid-container cols-2">
          <!-- Calculator Form -->
          <div class="card-banking">
            <h3>Underwriting Simulation</h3>
            <p class="section-desc">Test parameters and calculate amortization schedules before submitting approval tasks.</p>
            
            <form [formGroup]="calcForm" (ngSubmit)="calculateAmortization()">
              <div class="form-group">
                <label>Select Customer *</label>
                <select class="form-control" formControlName="customerId">
                  <option value="">Select Borrower</option>
                  <option *ngFor="let c of stateService.customers()" [value]="c.id">{{ c.name }} ({{ c.id }})</option>
                </select>
              </div>

              <div class="form-group">
                <label>Loan Product *</label>
                <select class="form-control" formControlName="productType" (change)="onProductChange()">
                  <option value="SME Expansion Loan">SME Expansion Loan (12% Int, Max 18m)</option>
                  <option value="Agri-Business Finance">Agri-Business Finance (8% Int, Max 24m)</option>
                  <option value="Micro-Retail Finance">Micro-Retail Finance (15% Int, Max 12m)</option>
                  <option value="Solar Clean Energy">Solar Clean Energy (6% Int, Max 36m)</option>
                </select>
              </div>

              <div class="grid-container cols-2">
                <div class="form-group">
                  <label>Principal Amount ($) *</label>
                  <input type="number" class="form-control" formControlName="amount" placeholder="e.g. 10000" />
                </div>
                <div class="form-group">
                  <label>Term (Months) *</label>
                  <input type="number" class="form-control" formControlName="termMonths" placeholder="e.g. 12" />
                </div>
              </div>

              <div class="form-group">
                <label>Annual Interest Rate (%) *</label>
                <input type="number" class="form-control" formControlName="interestRate" placeholder="12" />
              </div>

              <div class="btn-group">
                <button type="submit" class="btn-secondary" [disabled]="calcForm.invalid">Simulate Schedule</button>
                <button type="button" class="btn-primary" [disabled]="calcForm.invalid || calculatorSchedule().length === 0" (click)="submitLoanApplication()">
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>

          <!-- Calculator Results Projection -->
          <div class="card-banking schedule-preview-card">
            <h3>Projected Amortization Schedule</h3>
            <div class="schedule-summary-row" *ngIf="calculatorSchedule().length > 0">
              <div class="summary-metric">
                <span class="label">Monthly Installment</span>
                <span class="value">$ {{ calculatorSchedule()[0].total | number:'1.2-2' }}</span>
              </div>
              <div class="summary-metric">
                <span class="label">Total Interest Cost</span>
                <span class="value">$ {{ totalInterestCost() | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="table-container schedule-preview-table-wrapper" *ngIf="calculatorSchedule().length > 0">
              <table class="table-enterprise">
                <thead>
                  <tr>
                    <th>Mo</th>
                    <th>Due Date</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Total</th>
                    <th>Remaining Bal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of calculatorSchedule()">
                    <td>{{ s.period }}</td>
                    <td>{{ s.dueDate | date:'mediumDate' }}</td>
                    <td>$ {{ s.principal | number:'1.2-2' }}</td>
                    <td>$ {{ s.interest | number:'1.2-2' }}</td>
                    <td><strong>$ {{ s.total | number:'1.2-2' }}</strong></td>
                    <td>$ {{ s.balance | number:'1.2-2' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="empty-state" *ngIf="calculatorSchedule().length === 0">
              <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <p>Run a simulation on the left to generate schedule projection</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: LOAN PRODUCTS CATALOG -->
      <div class="tab-content" *ngIf="activeTab() === 'products'">
        <div class="grid-container cols-3">
          <div class="card-banking card-gradient-primary">
            <h4>SME Expansion Loan</h4>
            <p class="desc mt-2 opacity-80">Targeted at medium enterprises seeking expansion capital, machinery purchases, and working capital.</p>
            <div class="divider bg-white-op"></div>
            <div class="spec-row"><span>Interest Rate:</span> <strong>12% p.a.</strong></div>
            <div class="spec-row"><span>Maximum Term:</span> <strong>18 Months</strong></div>
            <div class="spec-row"><span>Collateral Req:</span> <strong>Vehicles or Property</strong></div>
          </div>

          <div class="card-banking">
            <h4>Agri-Business Finance</h4>
            <p class="desc mt-2 text-muted">Specifically calibrated for farmers and agricultural collectives. Includes seasonal payment structures.</p>
            <div class="divider"></div>
            <div class="spec-row"><span>Interest Rate:</span> <strong>8% p.a.</strong></div>
            <div class="spec-row"><span>Maximum Term:</span> <strong>24 Months</strong></div>
            <div class="spec-row"><span>Collateral Req:</span> <strong>Farmland or Machinery</strong></div>
          </div>

          <div class="card-banking">
            <h4>Micro-Retail Finance</h4>
            <p class="desc mt-2 text-muted">Quick funding options for market stalls, micro retailers, and trading cooperatives.</p>
            <div class="divider"></div>
            <div class="spec-row"><span>Interest Rate:</span> <strong>15% p.a.</strong></div>
            <div class="spec-row"><span>Maximum Term:</span> <strong>12 Months</strong></div>
            <div class="spec-row"><span>Collateral Req:</span> <strong>Group Guarantor or Stock</strong></div>
          </div>
        </div>
      </div>

      <!-- LOAN DETAILS MODAL / DRAWER -->
      <div class="modal-overlay" *ngIf="selectedLoan()" (click)="closeLoanDetails()">
        <div class="drawer-content" (click)="$event.stopPropagation()">
          <div class="drawer-header">
            <h3>Loan Folder</h3>
            <button class="btn-close" (click)="closeLoanDetails()">&times;</button>
          </div>

          <div class="drawer-body" *ngIf="selectedLoan() as loan">
            <div class="customer-banner">
              <div class="avatar-placeholder">{{ loan.customerName[0] }}</div>
              <div class="meta">
                <h4>{{ loan.customerName }}</h4>
                <span>{{ loan.id }} • <span class="chip-status" [class]="'status-' + loan.status.toLowerCase()">{{ loan.status }}</span></span>
              </div>
            </div>

            <div class="drawer-section">
              <h5>Credit Overview</h5>
              <div class="financial-widgets">
                <div class="widget bg-light">
                  <span class="label">Principal Amount</span>
                  <span class="value">$ {{ loan.amount | number:'1.2-2' }}</span>
                </div>
                <div class="widget bg-light">
                  <span class="label">Oustanding</span>
                  <span class="value text-danger">$ {{ loan.outstandingBalance | number:'1.2-2' }}</span>
                </div>
                <div class="widget bg-light">
                  <span class="label">Paid Amount</span>
                  <span class="value text-success">$ {{ loan.paidAmount | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>

            <!-- Repayment Interface -->
            <div class="drawer-section border-box" *ngIf="loan.status === 'Repaying' || loan.status === 'Restructured' || loan.status === 'Disbursed'">
              <h5>Post Customer Repayment</h5>
              <div class="repay-form">
                <div class="form-group mb-0">
                  <input type="number" class="form-control" placeholder="Repayment Amount ($)" [(ngModel)]="repayAmount" />
                </div>
                <button class="btn-primary" (click)="submitRepayment()">Post Repayment</button>
              </div>
            </div>

            <!-- Restructure / Write Off Actions -->
            <div class="drawer-section border-box" *ngIf="loan.status === 'Repaying' || loan.status === 'Restructured'">
              <h5>Portfolio Mitigation</h5>
              <div class="btn-group mt-2">
                <button class="btn-secondary" (click)="triggerRestructuring(loan.id)">Restructure Loan</button>
                <button class="btn-danger" (click)="triggerWriteOff(loan.id)">Write Off Loan</button>
              </div>
            </div>

            <!-- Repayment Schedule List -->
            <div class="drawer-section">
              <h5>Repayment Amortization Log</h5>
              <div class="table-container mt-2 max-h-240">
                <table class="table-enterprise">
                  <thead>
                    <tr>
                      <th>Mo</th>
                      <th>Due Date</th>
                      <th>Due</th>
                      <th>Paid</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let sch of loan.repaymentSchedule">
                      <td>{{ sch.period }}</td>
                      <td>{{ sch.dueDate | date:'shortDate' }}</td>
                      <td>$ {{ sch.total | number:'1.2-2' }}</td>
                      <td>$ {{ sch.paidAmount | number:'1.2-2' }}</td>
                      <td>
                        <span class="chip-status" [class]="'status-' + sch.status.toLowerCase()">
                          {{ sch.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loans-wrapper {
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

    .row-actions {
      display: flex;
      gap: 8px;
    }

    .text-center { text-align: center; }

    .section-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    // Schedule projection list styles
    .schedule-preview-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      
      .schedule-summary-row {
        display: flex;
        gap: 24px;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border-light);

        .summary-metric {
          display: flex;
          flex-direction: column;
          
          .label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
          .value { font-size: 20px; font-weight: 700; color: var(--primary); }
        }
      }

      .schedule-preview-table-wrapper {
        flex-grow: 1;
        max-height: 280px;
        overflow-y: auto;
      }
    }

    .btn-group {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      button { flex: 1; justify-content: center; }
    }

    .spec-row {
      display: flex;
      justify-content: space-between;
      font-size: 13.5px;
      padding: 6px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);

      span { color: var(--text-muted); }
    }

    .card-gradient-primary .spec-row {
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }

    .divider {
      height: 1px;
      background: var(--border-light);
      margin: 12px 0;
      
      &.bg-white-op {
        background: rgba(255, 255, 255, 0.15);
      }
    }

    .mt-2 { margin-top: 8px; }
    .opacity-80 { opacity: 0.8; }
    
    // Details drawer classes
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

    .financial-widgets {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 10px;

      .widget {
        padding: 10px;
        border-radius: var(--radius-md);
        display: flex;
        flex-direction: column;
        
        .label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; }
        .value { font-size: 13px; font-weight: 700; }
        
        &.bg-light { background: var(--bg-base); }
      }
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

    .repay-form {
      display: flex;
      gap: 10px;
      margin-top: 8px;
      
      .form-group { flex-grow: 1; }
      button { flex-shrink: 0; }
    }

    .max-h-240 {
      max-height: 240px;
      overflow-y: auto;
    }
  `]
})
export class LoansComponent implements OnInit {
  stateService = inject(StateService);
  fb = inject(FormBuilder);

  activeTab = signal<'active' | 'calculator' | 'products'>('active');
  selectedLoan = signal<Loan | null>(null);

  // Search / filters
  searchQuery = '';
  filterStatus = 'ALL';

  // Calculator & Application
  calcForm!: FormGroup;
  calculatorSchedule = signal<CalculatorSchedule[]>([]);
  totalInterestCost = signal<number>(0);

  // Repayment form
  repayAmount: number | null = null;

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.calcForm = this.fb.group({
      customerId: ['', Validators.required],
      productType: ['SME Expansion Loan', Validators.required],
      amount: [10000, [Validators.required, Validators.min(1000)]],
      termMonths: [12, [Validators.required, Validators.min(1)]],
      interestRate: [12, [Validators.required, Validators.min(1)]]
    });
  }

  onProductChange() {
    const prod = this.calcForm.value.productType;
    if (prod === 'SME Expansion Loan') {
      this.calcForm.patchValue({ interestRate: 12, termMonths: 12 });
    } else if (prod === 'Agri-Business Finance') {
      this.calcForm.patchValue({ interestRate: 8, termMonths: 18 });
    } else if (prod === 'Micro-Retail Finance') {
      this.calcForm.patchValue({ interestRate: 15, termMonths: 12 });
    } else if (prod === 'Solar Clean Energy') {
      this.calcForm.patchValue({ interestRate: 6, termMonths: 36 });
    }
  }

  calculateAmortization() {
    const vals = this.calcForm.value;
    const amount = vals.amount;
    const annualRate = vals.interestRate;
    const termMonths = vals.termMonths;

    const monthlyRate = (annualRate / 100) / 12;
    const totalPayment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
    
    let remaining = amount;
    const schedule: CalculatorSchedule[] = [];
    let cumulativeInterest = 0;

    for (let i = 1; i <= termMonths; i++) {
      const interest = remaining * monthlyRate;
      const principal = totalPayment - interest;
      remaining -= principal;
      cumulativeInterest += interest;

      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        period: i,
        dueDate: dueDate.toISOString().split('T')[0],
        principal: Math.round(principal * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        total: Math.round(totalPayment * 100) / 100,
        balance: Math.max(0, Math.round(remaining * 100) / 100)
      });
    }

    this.calculatorSchedule.set(schedule);
    this.totalInterestCost.set(cumulativeInterest);
  }

  submitLoanApplication() {
    const vals = this.calcForm.value;
    
    this.stateService.applyForLoan({
      customerId: vals.customerId,
      productType: vals.productType,
      amount: vals.amount,
      termMonths: vals.termMonths,
      interestRate: vals.interestRate,
      guarantors: [],
      collateral: []
    });

    // Reset Calculator
    this.calcForm.reset({ productType: 'SME Expansion Loan', amount: 10000, termMonths: 12, interestRate: 12 });
    this.calculatorSchedule.set([]);
    this.totalInterestCost.set(0);

    // Switch to active view to show pending loan
    this.activeTab.set('active');
    this.filterStatus = 'Pending';
  }

  filteredLoans = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    const status = this.filterStatus;
    let list = [...this.stateService.loans()];

    if (query) {
      list = list.filter(l => 
        l.customerName.toLowerCase().includes(query) || 
        l.id.toLowerCase().includes(query)
      );
    }

    if (status !== 'ALL') {
      list = list.filter(l => l.status === status);
    }

    return list;
  });

  selectLoan(loan: Loan) {
    this.selectedLoan.set(loan);
    this.repayAmount = null;
  }

  closeLoanDetails() {
    this.selectedLoan.set(null);
  }

  submitRepayment() {
    const loan = this.selectedLoan();
    if (!loan || !this.repayAmount || this.repayAmount <= 0) return;

    this.stateService.makeRepayment(loan.id, this.repayAmount);

    // Update locally selected loan to refresh UI
    this.selectedLoan.update(l => {
      if (!l) return null;
      const outstanding = Math.max(0, l.outstandingBalance - this.repayAmount!);
      const paid = l.paidAmount + this.repayAmount!;
      return {
        ...l,
        outstandingBalance: outstanding,
        paidAmount: paid,
        status: outstanding <= 0 ? 'Closed' : l.status
      } as Loan;
    });

    this.repayAmount = null;
  }

  triggerRestructuring(loanId: string) {
    // Restructure loan: extend terms, set restructured status
    this.stateService.loans.update(loans => {
      return loans.map(l => {
        if (l.id !== loanId) return l;
        this.stateService.addAuditLog(`Restructured loan ${loanId} for ${l.customerName}`);
        return {
          ...l,
          status: 'Restructured',
          restructuredCount: l.restructuredCount + 1
        };
      });
    });

    this.selectedLoan.update(l => {
      if (!l) return null;
      return {
        ...l,
        status: 'Restructured',
        restructuredCount: l.restructuredCount + 1
      };
    });
  }

  triggerWriteOff(loanId: string) {
    this.stateService.loans.update(loans => {
      return loans.map(l => {
        if (l.id !== loanId) return l;
        
        // Journal entry write off
        this.stateService.postJournalEntry({
          description: `Write off loan portfolio ${loanId} - ${l.customerName}`,
          referenceNo: `REF-WO-${loanId}`,
          debits: [{ accountCode: '1200', amount: l.outstandingBalance }], // Provision for loan losses +
          credits: [{ accountCode: '1100', amount: l.outstandingBalance }]  // Loan Portfolio assets -
        });

        // Set customer loan balance to 0
        this.stateService.customers.update(custs => {
          return custs.map(c => {
            if (c.id === l.customerId) {
              return {
                ...c,
                loanBalance: Math.max(0, c.loanBalance - l.outstandingBalance)
              };
            }
            return c;
          });
        });

        this.stateService.addAuditLog(`Wrote off outstanding loan ${loanId} ($${l.outstandingBalance})`);

        return {
          ...l,
          status: 'Written Off',
          outstandingBalance: 0
        };
      });
    });

    this.selectedLoan.update(l => {
      if (!l) return null;
      return {
        ...l,
        status: 'Written Off',
        outstandingBalance: 0
      } as Loan;
    });
  }
}
