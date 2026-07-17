import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StateService, Customer } from '../../core/services/state.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',})
export class DashboardComponent implements OnInit {
  stateService = inject(StateService);
  private router = inject(Router);

  activeRole = signal<'Admin' | 'Operations' | 'Risk' | 'Accounting'>('Admin');
  kycActionSuccessMsg = signal<string>('');

  // Tracks RBZ lookup status per customer ID in dashboard
  rbzStatus = signal<Record<string, { loading: boolean; success: boolean; data: any }>>({});

  ngOnInit() {
    const role = this.stateService.currentUser()?.role || 'Admin';
    if (role === 'Teller' || role === 'Field Agent') {
      this.activeRole.set('Operations');
    } else if (role === 'Compliance Officer') {
      this.activeRole.set('Risk');
    } else if (role === 'Branch Manager') {
      this.activeRole.set('Admin');
    } else {
      this.activeRole.set('Admin');
    }
  }

  approvedCustomersCount = computed(() => {
    return this.stateService.customers().filter(c => c.kycStatus === 'Approved').length;
  });

  pendingKycCount = computed(() => {
    return this.stateService.customers().filter(c => c.kycStatus === 'Pending').length;
  });

  rejectedKycCount = computed(() => {
    return this.stateService.customers().filter(c => c.kycStatus === 'Rejected').length;
  });

  pendingKycCustomers = computed(() => {
    return this.stateService.customers().filter(c => c.kycStatus === 'Pending');
  });

  vaultCashBalance = computed(() => {
    return this.stateService.chartOfAccounts().find(a => a.code === '1000')?.balance || 0;
  });

  customerSavingsLiability = computed(() => {
    return this.stateService.chartOfAccounts().find(a => a.code === '2000')?.balance || 0;
  });

  paidInShareCapital = computed(() => {
    return this.stateService.chartOfAccounts().find(a => a.code === '3000')?.balance || 0;
  });

  navigate(path: string) {
    this.router.navigate([path]);
  }

  runRbzCheck(custId: string, name: string, idNum: string) {
    this.rbzStatus.update(prev => ({
      ...prev,
      [custId]: { loading: true, success: false, data: null }
    }));

    setTimeout(() => {
      const isSanctionedOrSuspicious = idNum.includes('7839219') || name.toLowerCase().includes('chimuka');
      
      this.rbzStatus.update(prev => ({
        ...prev,
        [custId]: {
          loading: false,
          success: !isSanctionedOrSuspicious,
          data: { name, amlStatus: isSanctionedOrSuspicious ? 'Flagged' : 'Clear' }
        }
      }));

      this.stateService.addAuditLog(`Dashboard queried RBZ API registry check for ID ${idNum}. Match: ${!isSanctionedOrSuspicious}`);
    }, 1000);
  }

  approveKycQuick(customerId: string) {
    const cust = this.stateService.customers().find(c => c.id === customerId);
    if (!cust) return;

    this.stateService.customers.update(custs => {
      return custs.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            kycStatus: 'Approved',
            timeline: [
              { date: new Date().toISOString().split('T')[0], title: 'KYC Verified', desc: 'Identity credentials audited and approved by Risk Officer.', icon: 'shield-check' },
              ...c.timeline
            ]
          };
        }
        return c;
      });
    });

    this.stateService.addAuditLog(`Risk team verified and approved customer: ${cust.name} (${cust.id})`);
    this.kycActionSuccessMsg.set(`Customer ${cust.name} successfully approved!`);
    setTimeout(() => this.kycActionSuccessMsg.set(''), 4000);
  }

  rejectKycQuick(customerId: string) {
    const cust = this.stateService.customers().find(c => c.id === customerId);
    if (!cust) return;

    this.stateService.customers.update(custs => {
      return custs.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            kycStatus: 'Rejected',
            timeline: [
              { date: new Date().toISOString().split('T')[0], title: 'KYC Rejected', desc: 'Identity credentials rejected due to risk profile or blurry scan.', icon: 'shield-alert' },
              ...c.timeline
            ]
          };
        }
        return c;
      });
    });

    this.stateService.addAuditLog(`Risk team rejected customer: ${cust.name} (${cust.id})`);
    this.kycActionSuccessMsg.set(`Customer ${cust.name} successfully marked as Rejected/Blocked.`);
    setTimeout(() => this.kycActionSuccessMsg.set(''), 4000);
  }

  // APEX CHARTS CONFIGURATIONS
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

  opsFlowChart: any = {
    series: [
      { name: 'Counter Deposits ($)', data: [15000, 22000, 18000, 29000, 31000, 42000] },
      { name: 'Cash Payouts ($)', data: [9000, 14000, 12000, 21000, 24000, 33000] }
    ],
    chart: { type: 'area', height: 250, toolbar: { show: false } },
    xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#10B981', '#EF4444'],
    dataLabels: { enabled: false }
  };
}
