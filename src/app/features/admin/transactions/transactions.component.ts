import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StateService, Transaction } from '../../../core/services/state.service';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class AdminTransactionsComponent {
  stateService = inject(StateService);
  private router = inject(Router);

  searchQuery = signal<string>('');
  statusFilter = signal<string>('ALL');
  typeFilter = signal<string>('ALL');

  filteredTransactions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const type = this.typeFilter();
    let list = this.stateService.transactions();

    if (query) {
      list = list.filter(t =>
        t.id.toLowerCase().includes(query) ||
        t.customerName.toLowerCase().includes(query) ||
        (t.recipientName && t.recipientName.toLowerCase().includes(query)) ||
        (t.payoutPin && t.payoutPin.toLowerCase().includes(query))
      );
    }

    if (status !== 'ALL') {
      list = list.filter(t => t.status === status);
    }

    if (type !== 'ALL') {
      list = list.filter(t => t.type === type);
    }

    return list;
  });

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

  viewReceipt(id: string) {
    this.router.navigate([`/teller/transaction/${id}/receipt`]);
  }

  reviewTransaction(id: string) {
    this.router.navigate([`/admin/transactions/${id}/review`]);
  }
}
