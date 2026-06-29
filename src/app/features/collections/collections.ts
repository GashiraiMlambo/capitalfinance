import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, Collector, PromiseToPay } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="collections-wrapper anim-fade-in">
      <!-- SUMMARY CARDS -->
      <div class="grid-container cols-3">
        <div class="card-banking">
          <div class="lbl">TOTAL COLLECTED TODAY</div>
          <div class="val text-success">$ {{ totalCollectedToday() | number:'1.2-2' }}</div>
        </div>
        <div class="card-banking">
          <div class="lbl">ACTIVE COLLECTORS IN FIELD</div>
          <div class="val">{{ activeCollectorsCount() }} / {{ stateService.collectors().length }}</div>
        </div>
        <div class="card-banking">
          <div class="lbl">PENDING PROMISES-TO-PAY (PTP)</div>
          <div class="val text-warning">{{ pendingPtpCount() }}</div>
        </div>
      </div>

      <div class="page-actions-header mt-4">
        <h2>Field Collections & Debt Recovery</h2>
        <div class="tabs-banking">
          <div class="tab-item" [class.active]="activeTab() === 'collectors'" (click)="activeTab.set('collectors')">Collectors Directory</div>
          <div class="tab-item" [class.active]="activeTab() === 'ptp'" (click)="activeTab.set('ptp')">Promise-to-Pay Ledger</div>
          <div class="tab-item" [class.active]="activeTab() === 'visit'" (click)="activeTab.set('visit')">Log Field Collections</div>
        </div>
      </div>

      <!-- TAB 1: COLLECTORS DIRECTORY -->
      <div class="tab-content" *ngIf="activeTab() === 'collectors'">
        <div class="table-container">
          <table class="table-enterprise">
            <thead>
              <tr>
                <th>Collector ID</th>
                <th>Name</th>
                <th>Assigned Zone</th>
                <th>GPS Location</th>
                <th>Collections Today</th>
                <th>Recovery Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let col of stateService.collectors()">
                <td><strong>{{ col.id }}</strong></td>
                <td>{{ col.name }}</td>
                <td>{{ col.assignedZone }}</td>
                <td>
                  <code class="gps-coords">{{ col.currentGps.latitude }}, {{ col.currentGps.longitude }}</code>
                </td>
                <td><strong>$ {{ col.collectionsToday | number:'1.2-2' }}</strong></td>
                <td><strong>{{ col.recoveryRatePct }}%</strong></td>
                <td>
                  <span class="chip-status" [class]="col.status === 'Active' ? 'status-approved' : 'status-pending'">
                    {{ col.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: PROMISE-TO-PAY LEDGER -->
      <div class="tab-content" *ngIf="activeTab() === 'ptp'">
        <div class="directory-filter-bar card-banking">
          <h3>PTP Log Book</h3>
          <button class="btn-primary" (click)="showPtpForm.set(true)">Record Promise-to-Pay</button>
        </div>

        <div class="table-container mt-2">
          <table class="table-enterprise">
            <thead>
              <tr>
                <th>PTP ID</th>
                <th>Client Name</th>
                <th>Loan Reference</th>
                <th>Amount Promised</th>
                <th>Promise Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ptp of stateService.promiseToPays()">
                <td><strong>{{ ptp.id }}</strong></td>
                <td>{{ ptp.customerName }}</td>
                <td><code>{{ ptp.loanId }}</code></td>
                <td><strong>$ {{ ptp.amount | number:'1.2-2' }}</strong></td>
                <td>{{ ptp.promisedDate | date:'mediumDate' }}</td>
                <td>
                  <span class="chip-status" [class]="'status-' + ptp.status.toLowerCase()">
                    {{ ptp.status }}
                  </span>
                </td>
                <td>
                  <div class="row-actions" *ngIf="ptp.status === 'Pending'">
                    <button class="btn-secondary" (click)="fulfillPtp(ptp.id)">Fulfill</button>
                    <button class="btn-danger" (click)="breakPtp(ptp.id)">Mark Broken</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 3: LOG FIELD VISIT -->
      <div class="tab-content" *ngIf="activeTab() === 'visit'">
        <div class="card-banking max-w-600">
          <h3>Record Field Collection Visit</h3>
          <p class="section-desc">Submit payments gathered directly in the field by collectors. Updates cash positions instantly.</p>

          <form (submit)="postFieldCollection(); $event.preventDefault()">
            <div class="form-group">
              <label>Select Field Collector *</label>
              <select class="form-control" [(ngModel)]="visitCollectorId" name="collector">
                <option value="">Select Staff</option>
                <option *ngFor="let col of stateService.collectors()" [value]="col.id">{{ col.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Select Borrower *</label>
              <select class="form-control" [(ngModel)]="visitCustomerId" name="customer">
                <option value="">Choose Client</option>
                <option *ngFor="let cust of stateService.customers()" [value]="cust.id">{{ cust.name }} ({{ cust.id }})</option>
              </select>
            </div>

            <div class="grid-container cols-2">
              <div class="form-group">
                <label>Amount Collected ($) *</label>
                <input type="number" class="form-control" [(ngModel)]="visitAmount" name="amount" />
              </div>
              <div class="form-group">
                <label>GPS Coordinates *</label>
                <input type="text" class="form-control" [(ngModel)]="visitGps" name="gps" placeholder="-17.8252, 31.0335" />
              </div>
            </div>

            <div class="form-group">
              <label>Field Report Notes</label>
              <textarea class="form-control" rows="3" [(ngModel)]="visitNotes" name="notes" placeholder="e.g. Paid cash, promised balance next week..."></textarea>
            </div>

            <button type="submit" class="btn-primary w-full" [disabled]="!visitCollectorId || !visitCustomerId || !visitAmount || visitAmount <= 0">
              Submit Field Report
            </button>
          </form>
        </div>
      </div>

      <!-- PTP RECORDING MODAL -->
      <div class="modal-overlay" *ngIf="showPtpForm()" (click)="showPtpForm.set(false)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Record New Promise-to-Pay (PTP)</h3>
          <p class="section-desc">Register a formal verbal commitment from an overdue client.</p>

          <form (submit)="submitPtp(); $event.preventDefault()">
            <div class="form-group">
              <label>Select Client *</label>
              <select class="form-control" [(ngModel)]="ptpCustomerId" name="ptpCust">
                <option value="">Select Client</option>
                <option *ngFor="let c of stateService.customers()" [value]="c.id">{{ c.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Associated Overdue Loan *</label>
              <select class="form-control" [(ngModel)]="ptpLoanId" name="ptpLoan">
                <option value="">Select Credit ID</option>
                <option *ngFor="let l of stateService.loans()" [value]="l.id">{{ l.id }} - {{ l.customerName }}</option>
              </select>
            </div>

            <div class="grid-container cols-2">
              <div class="form-group">
                <label>Promised Amount ($) *</label>
                <input type="number" class="form-control" [(ngModel)]="ptpAmount" name="ptpAmt" />
              </div>
              <div class="form-group">
                <label>Promise Settlement Date *</label>
                <input type="date" class="form-control" [(ngModel)]="ptpDate" name="ptpDt" />
              </div>
            </div>

            <div class="btn-group mt-4">
              <button type="button" class="btn-secondary" (click)="showPtpForm.set(false)">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="!ptpCustomerId || !ptpLoanId || !ptpAmount || !ptpDate">
                Record Promise
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .collections-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .lbl {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .val {
      font-size: 24px;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
    }

    .gps-coords {
      font-family: monospace;
      background: var(--bg-base);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
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
      padding: 12px 16px;
    }

    .row-actions {
      display: flex;
      gap: 8px;
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
    .mt-4 { margin-top: 16px; }
  `]
})
export class CollectionsComponent {
  stateService = inject(StateService);

  activeTab = signal<'collectors' | 'ptp' | 'visit'>('collectors');
  showPtpForm = signal<boolean>(false);

  // Field visit form variables
  visitCollectorId = '';
  visitCustomerId = '';
  visitAmount = 0;
  visitGps = '-17.8252, 31.0335';
  visitNotes = '';

  // PTP form variables
  ptpCustomerId = '';
  ptpLoanId = '';
  ptpAmount = 0;
  ptpDate = '';

  totalCollectedToday = computed(() => {
    return this.stateService.collectors().reduce((sum, c) => sum + c.collectionsToday, 0);
  });

  activeCollectorsCount = computed(() => {
    return this.stateService.collectors().filter(c => c.status === 'Active').length;
  });

  pendingPtpCount = computed(() => {
    return this.stateService.promiseToPays().filter(p => p.status === 'Pending').length;
  });

  postFieldCollection() {
    if (!this.visitCollectorId || !this.visitCustomerId || this.visitAmount <= 0) return;

    const colName = this.stateService.collectors().find(c => c.id === this.visitCollectorId)?.name || 'Collector';
    const custName = this.stateService.customers().find(c => c.id === this.visitCustomerId)?.name || 'Client';

    // 1. Post Journal Entry
    this.stateService.postJournalEntry({
      description: `Field collection posted by ${colName} for client ${custName}`,
      referenceNo: `REF-COL-FIELD-${Date.now().toString().slice(-6)}`,
      debits: [{ accountCode: '1000', amount: this.visitAmount }], // Cash +
      credits: [{ accountCode: '1100', amount: this.visitAmount }]  // Loan assets - (assumes loan repayment)
    });

    // 2. Update collector metrics
    this.stateService.collectors.update(cols => {
      return cols.map(c => {
        if (c.id === this.visitCollectorId) {
          return {
            ...c,
            collectionsToday: c.collectionsToday + this.visitAmount
          };
        }
        return c;
      });
    });

    // 3. Update customer loan balance
    this.stateService.customers.update(custs => {
      return custs.map(c => {
        if (c.id === this.visitCustomerId) {
          return {
            ...c,
            loanBalance: Math.max(0, c.loanBalance - this.visitAmount)
          };
        }
        return c;
      });
    });

    this.stateService.addAuditLog(`Collector ${colName} posted field receipt of $${this.visitAmount} for ${custName}`);

    // Reset Form
    this.visitCollectorId = '';
    this.visitCustomerId = '';
    this.visitAmount = 0;
    this.visitNotes = '';

    // Redirect to collectors list
    this.activeTab.set('collectors');
  }

  submitPtp() {
    if (!this.ptpCustomerId || !this.ptpLoanId || this.ptpAmount <= 0 || !this.ptpDate) return;

    const custName = this.stateService.customers().find(c => c.id === this.ptpCustomerId)?.name || 'Client';

    this.stateService.promiseToPays.update(prev => [
      {
        id: `PTP-${Date.now().toString().slice(-4)}`,
        customerId: this.ptpCustomerId,
        customerName: custName,
        loanId: this.ptpLoanId,
        amount: this.ptpAmount,
        promisedDate: this.ptpDate,
        status: 'Pending'
      },
      ...prev
    ]);

    this.stateService.addAuditLog(`Recorded PTP promise of $${this.ptpAmount} on ${this.ptpDate} for ${custName}`);

    // Reset PTP Form
    this.ptpCustomerId = '';
    this.ptpLoanId = '';
    this.ptpAmount = 0;
    this.ptpDate = '';
    this.showPtpForm.set(false);
  }

  fulfillPtp(id: string) {
    this.stateService.promiseToPays.update(prev => {
      return prev.map(p => {
        if (p.id === id) {
          this.stateService.addAuditLog(`PTP fulfilled: ${id} for ${p.customerName}`);
          return { ...p, status: 'Fulfilled' };
        }
        return p;
      });
    });
  }

  breakPtp(id: string) {
    this.stateService.promiseToPays.update(prev => {
      return prev.map(p => {
        if (p.id === id) {
          this.stateService.addAuditLog(`PTP broken: ${id} for ${p.customerName}`);
          return { ...p, status: 'Broken' };
        }
        return p;
      });
    });
  }
}
