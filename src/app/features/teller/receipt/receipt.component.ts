import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StateService, Transaction } from '../../../core/services/state.service';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt.component.html',
  styleUrl: './receipt.component.scss',})
export class ReceiptComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  stateService = inject(StateService);

  transactionId = signal<string>('');
  copied = signal<boolean>(false);

  transaction = computed(() => {
    const id = this.transactionId();
    return this.stateService.transactions().find(t => t.id === id);
  });

  sourceCurrency = computed(() => this.transaction()?.currencyPair?.split('/')?.[0] || 'USD');
  targetCurrency = computed(() => this.transaction()?.currencyPair?.split('/')?.[1] || 'ZWG');

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

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.transactionId.set(id);
      }
    });
  }

  copyPin(pin: string) {
    navigator.clipboard.writeText(pin);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  printReceipt() {
    window.print();
  }

  closeVoucher() {
    const userRole = this.stateService.currentUser()?.role;
    if (userRole === 'Customer (Self-Service)') {
      this.router.navigate(['/portal/home']);
    } else {
      this.router.navigate(['/teller/dashboard']);
    }
  }

  canReverseTransaction(): boolean {
    const userRole = this.stateService.currentUser()?.role;
    const status = this.transaction()?.status;
    return (userRole === 'Branch Manager' || userRole === 'System Admin') && status === 'Completed';
  }

  reverseTransaction() {
    const confirmRev = confirm('Are you sure you want to REVERSE this transaction? This will debit/credit the branch ledger and flag the transaction status as Reversed.');
    if (confirmRev) {
      const id = this.transactionId();
      this.stateService.transactions.update(prev => prev.map(t => {
        if (t.id === id) {
          this.stateService.addAuditLog(`Reversed transaction: ${id}`);
          return { ...t, status: 'Reversed' };
        }
        return t;
      }));
      alert('Transaction reversed successfully.');
    }
  }
}
