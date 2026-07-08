import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StateService, Transaction, User, BranchLiquidity } from '../../../core/services/state.service';

@Component({
  selector: 'app-branch-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',})
export class BranchDashboardComponent {
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

  isReadOnly = computed(() => {
    const role = this.stateService.currentUser()?.role;
    return role === 'Compliance Officer';
  });

  showVaultBalances = signal<boolean>(false);

  toggleVaultBalances() {
    this.showVaultBalances.update(v => !v);
  }

  hasPendingReviews = computed(() => this.pendingOverrideCount() > 0);

  pendingTransactions = computed(() => {
    return this.stateService.transactions().filter(t => t.status === 'Pending');
  });

  pendingOverrideCount = computed(() => {
    return this.pendingTransactions().length;
  });

  branchTotalVolumeUsd = computed(() => {
    const txns = this.stateService.transactions().filter(t => t.status === 'Completed');
    return txns.reduce((sum, t) => sum + t.amount, 0);
  });

  branchTotalProfitZwg = computed(() => {
    const txns = this.stateService.transactions().filter(t => t.status === 'Completed');
    // Aggregate profit from service fee + rate spread (approximated as 1% of transaction local size)
    return txns.reduce((sum, t) => sum + t.fee + (t.amountLocal * 0.01), 0);
  });

  activeTellersCount = computed(() => {
    return this.stateService.users().filter(u => u.role === 'Teller' && u.active).length;
  });

  tellersList = computed(() => {
    return this.stateService.users().filter(u => u.role === 'Teller');
  });

  lowLiquidityCurrencies = computed(() => {
    return this.stateService.branchLiquidity().filter(l => l.balance < l.threshold);
  });

  getTellerTxnCount(tellerId: string): number {
    return this.stateService.transactions().filter(t => t.tellerId === tellerId && t.status === 'Completed').length;
  }

  getTellerTxnVolume(tellerId: string): number {
    const txns = this.stateService.transactions().filter(t => t.tellerId === tellerId && t.status === 'Completed');
    return txns.reduce((sum, t) => sum + t.amount, 0);
  }

  getLiquidityPercentage(balance: number, threshold: number): number {
    const maxVal = threshold * 3;
    return Math.min(100, (balance / maxVal) * 100);
  }

  getLiquiditySeverityClass(balance: number, threshold: number): string {
    if (balance < threshold) {
      return 'critical-liq';
    } else if (balance <= threshold * 1.6) {
      return 'warning-liq';
    } else {
      return 'healthy-liq';
    }
  }

  reviewOverride(id: string) {
    this.router.navigate([`/branch/transactions/${id}/review`]);
  }
}
