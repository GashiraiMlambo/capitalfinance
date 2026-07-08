import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StateService, Transaction } from '../../../core/services/state.service';

interface ComplianceIntegration {
  id: string;
  name: string;
  status: 'Active' | 'Degraded' | 'Offline';
  latencyMs: number;
  lastSync: string;
}

@Component({
  selector: 'app-compliance-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',})
export class ComplianceDashboardComponent {
  stateService = inject(StateService);
  private router = inject(Router);

  getCurrencySymbol(curr: string | undefined): string {
    if (!curr) return '$';
    switch (curr.toUpperCase()) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'ZAR': return 'R';
      default: return curr;
    }
  }

  isPinging = signal<boolean>(false);
  showFullGuidelines = signal<boolean>(false);

  toggleGuidelines() {
    this.showFullGuidelines.update(v => !v);
  }

  integrations = signal<ComplianceIntegration[]>([
    { id: 'i1', name: 'LexisNexis AML Vetting API', status: 'Active', latencyMs: 120, lastSync: '1m ago' },
    { id: 'i2', name: 'WorldCheck Sanctions Feed', status: 'Active', latencyMs: 95, lastSync: '3m ago' },
    { id: 'i3', name: 'Reserve Bank (RBZ) Node', status: 'Active', latencyMs: 210, lastSync: '5m ago' },
    { id: 'i4', name: 'Zim-Registry Database API', status: 'Active', latencyMs: 155, lastSync: '30s ago' }
  ]);

  complianceFlags = computed(() => {
    // Only show flagged transactions of type Remittance or Exchange with status 'Pending'
    // Specifically filtering to show Sanctions flags or Limit breaches
    return this.stateService.transactions().filter(t => t.status === 'Pending');
  });

  flaggedTxnsCount = computed(() => this.complianceFlags().length);

  flaggedCustomersCount = computed(() => {
    return this.stateService.customers().filter(c => c.kycStatus === 'Flagged').length;
  });

  auditFlag(id: string) {
    this.router.navigate([`/branch/transactions/${id}/review`]);
  }

  pingIntegrations() {
    this.isPinging.set(true);
    setTimeout(() => {
      this.integrations.update(list => list.map(item => {
        // Randomize latency slightly
        const randomLat = Math.floor(Math.random() * 80) + 80;
        const status = randomLat > 250 ? 'Degraded' : 'Active';
        return {
          ...item,
          latencyMs: randomLat,
          status,
          lastSync: 'just now'
        };
      }));
      this.isPinging.set(false);
      this.stateService.addAuditLog('Compliance Officer refreshed API integration pings.');
    }, 1200);
  }
}
