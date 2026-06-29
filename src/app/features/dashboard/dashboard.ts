import { Component, signal, computed, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StateService } from '../../core/services/state.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe, NgApexchartsModule],
  template: `
    <div class="dashboard-wrapper anim-fade-in">
      <!-- SUMMARY METRIC CARDS -->
      <div class="grid-container cols-4">
        <div class="card-banking card-gradient-primary">
          <div class="metric-header">
            <span class="text-muted">LOAN PORTFOLIO</span>
            <div class="metric-icon bg-white-op">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
          </div>
          <div class="metric-value">$ {{ stateService.loanPortfolioValue() | number:'1.2-2' }}</div>
          <div class="metric-footer">
            <span class="trend positive">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 10l7-7 7 7M12 3v18"/></svg>
              +12.4%
            </span>
            <span class="footer-label">from last month</span>
          </div>
        </div>

        <div class="card-banking">
          <div class="metric-header">
            <span class="text-muted">TOTAL SAVINGS DEPOSITS</span>
            <div class="metric-icon primary">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
            </div>
          </div>
          <div class="metric-value">$ {{ stateService.totalSavings() | number:'1.2-2' }}</div>
          <div class="metric-footer">
            <span class="trend positive">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 10l7-7 7 7M12 3v18"/></svg>
              +8.1%
            </span>
            <span class="footer-label">from last month</span>
          </div>
        </div>

        <div class="card-banking">
          <div class="metric-header">
            <span class="text-muted">COLLECTIONS TODAY</span>
            <div class="metric-icon success">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
            </div>
          </div>
          <div class="metric-value">$ {{ totalCollectionsToday() | number:'1.2-2' }}</div>
          <div class="metric-footer">
            <span class="trend positive">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 10l7-7 7 7M12 3v18"/></svg>
              92%
            </span>
            <span class="footer-label">target recovery rate</span>
          </div>
        </div>

        <div class="card-banking">
          <div class="metric-header">
            <span class="text-muted">PORTFOLIO AT RISK (PAR)</span>
            <div class="metric-icon danger">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
          </div>
          <div class="metric-value">
            $ {{ stateService.portfolioAtRiskValue() | number:'1.2-2' }} 
            <span class="metric-sub-val">({{ stateService.portfolioAtRiskPct() | number:'1.1-1' }}%)</span>
          </div>
          <div class="metric-footer">
            <span class="trend negative">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 14l-7 7-7-7M12 3v18"/></svg>
              +0.4%
            </span>
            <span class="footer-label">risk index change</span>
          </div>
        </div>
      </div>

      <!-- QUICK ACTIONS -->
      <div class="quick-actions-bar">
        <h3>Quick Administrative Actions</h3>
        <div class="actions-buttons">
          <button class="btn-secondary" (click)="navigate('/portal/customers')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            Register Customer
          </button>
          <button class="btn-secondary" (click)="navigate('/portal/loans')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Apply for Loan
          </button>
          <button class="btn-secondary" (click)="navigate('/portal/accounting')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            Post Journal Entry
          </button>
          <button class="btn-secondary" (click)="navigate('/portal/savings')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Open Savings Account
          </button>
        </div>
      </div>

      <!-- APEX CHARTS ROW -->
      <div class="grid-container cols-2">
        <div class="card-banking">
          <h3>Loan Underwriting & Portfolio Trends</h3>
          <apx-chart
            [series]="loanTrendChart.series"
            [chart]="loanTrendChart.chart"
            [xaxis]="loanTrendChart.xaxis"
            [stroke]="loanTrendChart.stroke"
            [colors]="loanTrendChart.colors"
            [dataLabels]="loanTrendChart.dataLabels"
          ></apx-chart>
        </div>

        <div class="card-banking">
          <h3>Branch Cash Distribution</h3>
          <apx-chart
            [series]="branchPerfChart.series"
            [chart]="branchPerfChart.chart"
            [xaxis]="branchPerfChart.xaxis"
            [plotOptions]="branchPerfChart.plotOptions"
            [colors]="branchPerfChart.colors"
            [dataLabels]="branchPerfChart.dataLabels"
          ></apx-chart>
        </div>
      </div>

      <div class="grid-container cols-2">
        <div class="card-banking">
          <h3>Revenue vs Profitability Growth</h3>
          <apx-chart
            [series]="revProfitChart.series"
            [chart]="revProfitChart.chart"
            [xaxis]="revProfitChart.xaxis"
            [stroke]="revProfitChart.stroke"
            [colors]="revProfitChart.colors"
            [dataLabels]="revProfitChart.dataLabels"
          ></apx-chart>
        </div>

        <div class="card-banking">
          <h3>Loan Risk Concentration</h3>
          <apx-chart
            [series]="riskChart.series"
            [chart]="riskChart.chart"
            [labels]="riskChart.labels"
            [colors]="riskChart.colors"
            [legend]="riskChart.legend"
          ></apx-chart>
        </div>
      </div>

      <!-- WORKFLOW, UPCOMING PAYMENTS, RECENT ACTIVITIES -->
      <div class="grid-container cols-3">
        <!-- System Health & Integrations -->
        <div class="card-banking">
          <h3>Gateway Integrations</h3>
          <div class="integrations-list">
            <div class="integration-item" *ngFor="let integration of stateService.integrations()">
              <div class="info">
                <span class="name">{{ integration.name }}</span>
                <span class="type">{{ integration.type }}</span>
              </div>
              <div class="status-latency">
                <span class="chip-status" [class]="'status-' + integration.status.toLowerCase()">
                  {{ integration.status }}
                </span>
                <span class="latency" *ngIf="integration.status !== 'Disconnected'">{{ integration.latencyMs }}ms</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Repayments -->
        <div class="card-banking">
          <h3>Upcoming Repayments</h3>
          <div class="upcoming-list">
            <div class="repayment-item" *ngFor="let rep of upcomingRepayments()">
              <div class="customer-info">
                <span class="name">{{ rep.customerName }}</span>
                <span class="loan-id">{{ rep.loanId }} - Period {{ rep.period }}</span>
              </div>
              <div class="payment-info">
                <span class="amount">$ {{ rep.amount | number:'1.2-2' }}</span>
                <span class="due-date">Due: {{ rep.dueDate | date:'mediumDate' }}</span>
              </div>
            </div>
            <div class="empty-state" *ngIf="upcomingRepayments().length === 0">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/></svg>
              <p>No upcoming payments</p>
            </div>
          </div>
        </div>

        <!-- Audit Trail -->
        <div class="card-banking">
          <h3>Recent System Audit Logs</h3>
          <div class="audit-list">
            <div class="audit-item" *ngFor="let log of stateService.auditLogs().slice(0, 5)">
              <div class="log-info">
                <span class="action">{{ log.action }}</span>
                <span class="user-ip">{{ log.userName }} ({{ log.ipAddress }})</span>
              </div>
              <span class="time">{{ log.timestamp | date:'shortTime' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      font-family: 'Outfit', sans-serif;
    }

    // Card Metrics Styles
    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .text-muted {
        font-size: 11px;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.08em;
      }
    }

    .metric-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.primary { background-color: var(--primary-light); color: var(--primary); }
      &.success { background-color: var(--success-light); color: var(--success); }
      &.danger { background-color: var(--danger-light); color: var(--danger); }
      
      &.bg-white-op {
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
      }
    }

    .metric-value {
      font-size: 28px;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }

    .metric-sub-val {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-muted);
    }

    .metric-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;

      .trend {
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        
        &.positive { color: var(--success); }
        &.negative { color: var(--danger); }
      }

      .footer-label {
        color: var(--text-muted);
      }
    }

    // Quick Actions Bar
    .quick-actions-bar {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      box-shadow: var(--shadow-sm);

      h3 { margin-bottom: 0; }

      .actions-buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
    }

    // Lists in Bottom Row
    .integrations-list, .upcoming-list, .audit-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 280px;
      overflow-y: auto;
    }

    .integration-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
      background: var(--bg-base);

      .info {
        display: flex;
        flex-direction: column;
        
        .name { font-weight: 600; font-size: 13px; color: var(--text-main); }
        .type { font-size: 11px; color: var(--text-muted); }
      }

      .status-latency {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        
        .latency { font-size: 10px; color: var(--text-muted); }
      }
    }

    .repayment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-light);

      .customer-info {
        display: flex;
        flex-direction: column;
        
        .name { font-weight: 600; font-size: 13px; }
        .loan-id { font-size: 11px; color: var(--text-muted); }
      }

      .payment-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        
        .amount { font-weight: 700; color: var(--primary); }
        .due-date { font-size: 11px; color: var(--text-muted); }
      }
    }

    .audit-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-light);
      gap: 10px;

      .log-info {
        display: flex;
        flex-direction: column;
        
        .action { font-size: 12.5px; font-weight: 500; }
        .user-ip { font-size: 10.5px; color: var(--text-muted); }
      }

      .time {
        font-size: 11px;
        color: var(--text-muted);
        flex-shrink: 0;
      }
    }
  `]
})
export class DashboardComponent {
  stateService = inject(StateService);
  private router = inject(Router);

  totalCollectionsToday = computed(() => {
    return this.stateService.collectors().reduce((sum, c) => sum + c.collectionsToday, 0);
  });

  upcomingRepayments = computed(() => {
    const list: { customerName: string; loanId: string; period: number; dueDate: string; amount: number }[] = [];
    this.stateService.loans().forEach(loan => {
      loan.repaymentSchedule.forEach(p => {
        if (p.status === 'Unpaid' || p.status === 'Overdue') {
          list.push({
            customerName: loan.customerName,
            loanId: loan.id,
            period: p.period,
            dueDate: p.dueDate,
            amount: p.total
          });
        }
      });
    });
    // Sort by due date soonest
    return list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5);
  });

  navigate(path: string) {
    this.router.navigate([path]);
  }

  // APEX CHARTS CONFIGURATIONS
  loanTrendChart: any = {
    series: [
      { name: 'Approved Loans ($)', data: [12000, 18000, 25000, 15000, 32000, 28000, 39000] },
      { name: 'Disbursed Loans ($)', data: [10000, 15000, 22000, 14000, 28000, 26000, 35000] }
    ],
    chart: { type: 'area', height: 260, toolbar: { show: false }, zoom: { enabled: false } },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#0F0CE8', '#10B981'],
    dataLabels: { enabled: false }
  };

  branchPerfChart: any = {
    series: [
      { name: 'Cash Reserves', data: [1250000, 450000, 680000] }
    ],
    chart: { type: 'bar', height: 260, toolbar: { show: false } },
    xaxis: { categories: ['Harare H.O.', 'Accra Branch', 'Nairobi Branch'] },
    plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
    colors: ['#0F0CE8'],
    dataLabels: { enabled: false }
  };

  revProfitChart: any = {
    series: [
      { name: 'Revenues ($)', data: [5000, 8000, 12000, 9500, 14200, 16800, 20650] },
      { name: 'Operating Net Profit ($)', data: [2500, 4200, 6800, 5100, 8200, 9900, 12800] }
    ],
    chart: { type: 'line', height: 260, toolbar: { show: false } },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] },
    stroke: { curve: 'straight', width: 3 },
    colors: ['#0EA5E9', '#10B981'],
    dataLabels: { enabled: false }
  };

  riskChart: any = {
    series: [68, 22, 10], // Repaying, Restructured, Overdue
    chart: { type: 'donut', height: 260 },
    labels: ['Performing Loans', 'Restructured', 'Overdue/Under Watch'],
    colors: ['#10B981', '#F59E0B', '#EF4444'],
    legend: { position: 'bottom' }
  };
}
