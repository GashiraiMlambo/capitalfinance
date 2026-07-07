import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../core/services/state.service';

@Component({
  selector: 'app-risk',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk.component.html',
  styleUrl: './risk.component.scss'
})
export class RiskComponent {
  stateService = inject(StateService);

  // Tracks RBZ lookup status per customer ID
  rbzStatus = signal<Record<string, { loading: boolean; success: boolean; data: any }>>({});

  overdueLoans = computed(() => {
    return this.stateService.loans().filter(l => l.status === 'Repaying' || l.status === 'Restructured');
  });

  pendingKycCustomers = computed(() => {
    return this.stateService.customers().filter(c => c.kycStatus === 'Pending');
  });

  runRbzCheck(custId: string, name: string, idNum: string) {
    // Set status to loading
    this.rbzStatus.update(prev => ({
      ...prev,
      [custId]: { loading: true, success: false, data: null }
    }));

    // Simulate Reserve Bank API delay of 1.2s
    setTimeout(() => {
      // Determine response based on customer ID or details
      const isSanctionedOrSuspicious = idNum.includes('7839219') || name.toLowerCase().includes('sakhe');
      
      const responseData = isSanctionedOrSuspicious ? {
        name: `${name.toUpperCase()} (PASSPORT DB)`,
        amlStatus: 'FLAGGED - WARNING',
        riskScore: 88,
        notes: 'AML Flag: Multiple cross-border routing attempts flagged in last 14 days.'
      } : {
        name: `${name.toUpperCase()} (ID REGISTRY)`,
        amlStatus: 'CLEAR / NO SANCTIONS',
        riskScore: 12,
        notes: ''
      };

      this.rbzStatus.update(prev => ({
        ...prev,
        [custId]: {
          loading: false,
          success: !isSanctionedOrSuspicious,
          data: responseData
        }
      }));

      this.stateService.addAuditLog(`Queried RBZ API registry check for ID ${idNum}. Match: ${!isSanctionedOrSuspicious ? 'SUCCESS' : 'WARNING'}`);
    }, 1200);
  }

  approveKyc(custId: string) {
    this.stateService.customers.update(custs => {
      return custs.map(c => {
        if (c.id === custId) {
          this.stateService.addAuditLog(`Risk verified KYC for customer ${c.name} (${c.id})`);
          return {
            ...c,
            kycStatus: 'Approved',
            timeline: [
              { date: new Date().toISOString().split('T')[0], title: 'KYC Approved', desc: 'Risk verified identity and address credentials as legit after RBZ check clearance.', icon: 'shield' },
              ...c.timeline
            ]
          };
        }
        return c;
      });
    });
  }

  rejectKyc(custId: string) {
    this.stateService.customers.update(custs => {
      return custs.map(c => {
        if (c.id === custId) {
          this.stateService.addAuditLog(`Risk rejected KYC for customer ${c.name} (${c.id})`);
          return {
            ...c,
            kycStatus: 'Rejected',
            timeline: [
              { date: new Date().toISOString().split('T')[0], title: 'KYC Rejected', desc: 'Risk rejected registration credentials and document uploads based on compliance check.', icon: 'x-circle' },
              ...c.timeline
            ]
          };
        }
        return c;
      });
    });
  }
}
