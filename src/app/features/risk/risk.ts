import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-risk',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="risk-wrapper anim-fade-in">
      <div class="page-actions-header">
        <h2>Risk Management & Credit Supervision</h2>
      </div>

      <!-- RISK MATRICES -->
      <div class="grid-container cols-4 mt-4">
        <div class="card-banking border-left-danger">
          <span class="text-muted">PAR % INDEX</span>
          <div class="metric-val text-danger">{{ stateService.portfolioAtRiskPct() | number:'1.1-1' }} %</div>
          <p class="desc">Portfolio-at-Risk (Loans over 30 days past due)</p>
        </div>
        <div class="card-banking">
          <span class="text-muted">PAR 1-30 DAYS</span>
          <div class="metric-val text-warning">$ 1,500.00</div>
          <p class="desc">Early arrears monitoring cycle</p>
        </div>
        <div class="card-banking">
          <span class="text-muted">PAR 31-90 DAYS</span>
          <div class="metric-val text-danger">$ {{ stateService.portfolioAtRiskValue() | number:'1.2-2' }}</div>
          <p class="desc">Non-performing loan (NPL) exposure</p>
        </div>
        <div class="card-banking">
          <span class="text-muted">PROVISIONING COVER</span>
          <div class="metric-val text-success">150.00 %</div>
          <p class="desc">Ledger provisioning against loan losses</p>
        </div>
      </div>

      <div class="grid-container cols-2 mt-4">
        <!-- Watchlist customers -->
        <div class="card-banking">
          <h3>Arrears Watchlist & Overdue Accounts</h3>
          <p class="desc-text text-muted">Accounts flagged with active repayment delays.</p>

          <div class="table-container mt-2">
            <table class="table-enterprise">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Loan ID</th>
                  <th>Overdue Since</th>
                  <th>Days Overdue</th>
                  <th>Total Arrears</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let loan of overdueLoans()">
                  <td>{{ loan.customerName }}</td>
                  <td><code>{{ loan.id }}</code></td>
                  <td>{{ loan.disbursementDate }}</td>
                  <td>45 Days</td>
                  <td><strong class="text-danger">$ {{ loan.outstandingBalance | number:'1.2-2' }}</strong></td>
                  <td>
                    <span class="chip-status status-rejected">Under Watch</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Fraud alert logs -->
        <div class="card-banking">
          <h3>System Credit Bureau Query Log</h3>
          <p class="desc-text text-muted font-medium">Bureaus queries fired during customer underwriting.</p>

          <div class="table-container mt-2">
            <table class="table-enterprise">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Subject Client</th>
                  <th>Credit Score</th>
                  <th>Status</th>
                  <th>Response Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Jun 29 09:30 AM</td>
                  <td>Jenny Jenkins</td>
                  <td><strong>740</strong> (Excellent)</td>
                  <td><span class="chip-status status-approved">Approved</span></td>
                  <td>Success</td>
                </tr>
                <tr>
                  <td>Jun 28 02:45 PM</td>
                  <td>Simon Jenkins</td>
                  <td><strong>610</strong> (Fair)</td>
                  <td><span class="chip-status status-pending">Review Required</span></td>
                  <td>Success</td>
                </tr>
                <tr>
                  <td>Jun 25 11:15 AM</td>
                  <td>Marcus Aurelius</td>
                  <td><strong>520</strong> (Poor)</td>
                  <td><span class="chip-status status-rejected">Auto Reject</span></td>
                  <td>Success</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .risk-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-actions-header {
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 10px;
      h2 { font-size: 20px; font-family: 'Outfit', sans-serif; }
    }

    .text-muted {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-val {
      font-size: 24px;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
      margin: 8px 0;
    }

    .desc {
      font-size: 12px;
      color: var(--text-muted);
    }

    .desc-text {
      font-size: 13px;
      margin-bottom: 16px;
    }

    .border-left-danger {
      border-left: 4px solid var(--danger);
    }
  `]
})
export class RiskComponent {
  stateService = inject(StateService);

  overdueLoans = computed(() => {
    return this.stateService.loans().filter(l => l.status === 'Repaying' || l.status === 'Restructured');
  });
}
