import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StateService, Transaction, ExchangeRate } from '../../../core/services/state.service';

@Component({
  selector: 'app-teller-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',})
export class TellerDashboardComponent implements OnInit {
  stateService = inject(StateService);
  router = inject(Router);

  searchQuery = '';
  filterType = 'ALL';
  filterStatus = 'ALL';
  showAllBranchTxns = false;

  isRefreshingRates = signal<boolean>(false);
  tickerAlert = signal<boolean>(false);

  // Pagination
  currentPage = signal<number>(1);
  pageSize = 5;

  ngOnInit() {
    // Periodically update the rates to simulate Middle Office feed updates
    setInterval(() => {
      this.refreshRatesTick();
    }, 45000);
  }

  refreshRatesTick() {
    this.isRefreshingRates.set(true);
    setTimeout(() => {
      // Small randomized adjustments
      this.stateService.rates.update(prev => prev.map(r => {
        const rand = (Math.random() - 0.5) * 0.15;
        const buy = Math.round((r.buyRate + rand) * 100) / 100;
        const sell = Math.round((r.sellRate + rand) * 100) / 100;
        return {
          ...r,
          buyRate: buy,
          sellRate: sell,
          lastUpdated: new Date().toISOString()
        };
      }));
      this.isRefreshingRates.set(false);
      this.tickerAlert.set(true);
      // Automatically close alert banner after 5s
      setTimeout(() => this.tickerAlert.set(false), 5000);
    }, 1500);
  }

  manualSyncRates() {
    this.refreshRatesTick();
    this.stateService.addAuditLog('Teller manually synced middle office exchange rates');
  }

  canToggleScope(): boolean {
    const role = this.stateService.currentUser()?.role;
    return role === 'Branch Manager' || role === 'System Admin' || role === 'Compliance Officer';
  }

  sessionStats = computed(() => {
    return this.stateService.tellerSession();
  });

  filteredTransactions = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    const type = this.filterType;
    const status = this.filterStatus;
    const allBranch = this.showAllBranchTxns;
    const curUser = this.stateService.currentUser();

    return this.stateService.transactions().filter(t => {
      // Scope filter: Tellers only see their own transactions, managers can toggle all branch
      if (!allBranch && curUser && curUser.role === 'Teller' && t.tellerId !== curUser.id) {
        return false;
      }

      // Search match
      const matchesSearch = !query || 
        t.customerName.toLowerCase().includes(query) || 
        t.customerId.toLowerCase().includes(query) || 
        t.id.toLowerCase().includes(query);

      // Type match
      const matchesType = type === 'ALL' || t.type === type;

      // Status match
      const matchesStatus = status === 'ALL' || t.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  });

  paginatedTransactions = computed(() => {
    const list = this.filteredTransactions();
    const start = (this.currentPage() - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredTransactions().length / this.pageSize) || 1;
  });

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  viewReceipt(id: string) {
    this.router.navigate([`/teller/transaction/${id}/receipt`]);
  }
}
