import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="reports-wrapper anim-fade-in">
      <div class="page-actions-header">
        <h2>Reporting Suite & Compliance Audits</h2>
      </div>

      <div class="grid-container cols-3 mt-4">
        <!-- Loan reports -->
        <div class="card-banking report-selector-card">
          <div class="icon-wrap info">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 2V9l-3 2-3-2M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/></svg>
          </div>
          <h4>Portfolio Performance Reports</h4>
          <p class="desc">Generate active loans aging, repayment logs, restructuring rates, and portfolio-at-risk audits.</p>
          <div class="btn-group-v">
            <button class="btn-secondary" (click)="simulateExport('Loans Aging Report', 'PDF')">Download PDF Report</button>
            <button class="btn-secondary" (click)="simulateExport('Loans Aging Report', 'Excel')">Export CSV Spreadsheet</button>
          </div>
        </div>

        <!-- Savings reports -->
        <div class="card-banking report-selector-card">
          <div class="icon-wrap success">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
          <h4>Savings & Deposit Registers</h4>
          <p class="desc">Generate reports on voluntary savings ledger sheets, lock-in maturities, and dividend yields.</p>
          <div class="btn-group-v">
            <button class="btn-secondary" (click)="simulateExport('Savings Deposit Summary', 'PDF')">Download PDF Report</button>
            <button class="btn-secondary" (click)="simulateExport('Savings Deposit Summary', 'Excel')">Export CSV Spreadsheet</button>
          </div>
        </div>

        <!-- Financial Accounting reports -->
        <div class="card-banking report-selector-card">
          <div class="icon-wrap warning">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h4>Accounting Ledger Reports</h4>
          <p class="desc">Print Trial Balance sheets, Balance Sheets (Assets/Liabilities), and Income Statements (P&L profit charts).</p>
          <div class="btn-group-v">
            <button class="btn-secondary" (click)="simulateExport('General Trial Balance', 'PDF')">Download PDF Report</button>
            <button class="btn-secondary" (click)="simulateExport('General Trial Balance', 'Excel')">Export CSV Spreadsheet</button>
          </div>
        </div>
      </div>

      <!-- SIMULATED DOWNLOAD TOAST -->
      <div class="toast-download-mock" *ngIf="showToast()">
        <div class="toast-body">
          <svg class="spinner" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          <span>Compiling data source & generating <strong>{{ exportFormat() }}</strong> for {{ currentReportName() }}...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-actions-header {
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 10px;
      h2 { font-size: 20px; font-family: 'Outfit', sans-serif; }
    }

    .report-selector-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 30px 24px;
      
      .icon-wrap {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        
        &.info { background: var(--primary-light); color: var(--primary); }
        &.success { background: var(--success-light); color: var(--success); }
        &.warning { background: var(--warning-light); color: var(--warning); }
      }

      h4 { font-size: 16px; margin-bottom: 10px; }
      .desc { font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 24px; flex-grow: 1; }
    }

    .btn-group-v {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
      button { width: 100%; justify-content: center; }
    }

    .toast-download-mock {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      padding: 16px 20px;
      z-index: 2000;
      animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      
      .toast-body {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13.5px;
      }
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .spinner {
      animation: spin 1s linear infinite;
      color: var(--primary);
    }
  `]
})
export class ReportsComponent {
  stateService = inject(StateService);

  showToast = signal<boolean>(false);
  currentReportName = signal<string>('');
  exportFormat = signal<string>('');

  simulateExport(reportName: string, format: string) {
    this.currentReportName.set(reportName);
    this.exportFormat.set(format);
    this.showToast.set(true);

    this.stateService.addAuditLog(`Generated report compilation request: ${reportName} (${format})`);

    setTimeout(() => {
      this.showToast.set(false);
      alert(`Report download completed successfully. Check your browser downloads folder for the simulated "${reportName}.${format.toLowerCase() === 'pdf' ? 'pdf' : 'csv'}" file.`);
    }, 2500);
  }
}
