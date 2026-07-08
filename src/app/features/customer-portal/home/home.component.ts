import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StateService, Transaction, ExchangeRate } from '../../../core/services/state.service';

interface TrackingState {
  searched: boolean;
  txn: Transaction | null;
  step: number; // 1 to 4
  error: string;
}

@Component({
  selector: 'app-portal-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',})
export class PortalHomeComponent implements OnInit {
  stateService = inject(StateService);
  private route = inject(ActivatedRoute);

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

  trackingPin = '';
  calcAmount = 100;
  calcPair = 'USD/ZWG';

  // Signals
  calcResult = signal<number>(0);
  calcRate = signal<number>(24.50);
  isHistoryView = signal<boolean>(false);
  isCalculating = signal<boolean>(false);
  trackingResult = signal<TrackingState>({ searched: false, txn: null, step: 0, error: '' });

  customerName = computed(() => {
    const user = this.stateService.currentUser();
    return user ? user.name : 'Valued Customer';
  });

  kycStatus = computed(() => {
    // Lookup matching customer details from StateService based on user's name
    const user = this.stateService.currentUser();
    if (!user) return 'Pending';
    const match = this.stateService.customers().find(c => c.name === user.name);
    return match ? match.kycStatus : 'Verified';
  });

  myTxns = computed(() => {
    const name = this.customerName();
    // Return all transactions where the customerName matches the user's name
    return this.stateService.transactions().filter(t => t.customerName === name);
  });

  ngOnInit() {
    this.route.url.subscribe(url => {
      const path = url.map(s => s.path).join('/');
      this.isHistoryView.set(path.includes('transactions'));
    });
    this.runCalculation();
  }

  runCalculation() {
    this.isCalculating.set(true);
    setTimeout(() => {
      const rateObj = this.stateService.rates().find(r => r.pair === this.calcPair);
      if (!rateObj) {
        this.isCalculating.set(false);
        return;
      }

      this.calcRate.set(rateObj.buyRate);
      const amt = this.calcAmount || 0;
      const equiv = amt * rateObj.buyRate;
      const fee = Math.max(10, equiv * 0.005);
      this.calcResult.set(equiv - fee);
      this.isCalculating.set(false);
    }, 450);
  }

  trackTransaction() {
    const pin = this.trackingPin.trim();
    if (!pin) {
      this.trackingResult.set({ searched: true, txn: null, step: 0, error: 'Please enter a valid PIN code.' });
      return;
    }

    const match = this.stateService.transactions().find(t => t.payoutPin === pin || t.id === pin);
    if (!match) {
      this.trackingResult.set({ searched: true, txn: null, step: 0, error: 'No transaction matches that reference or PIN.' });
      return;
    }

    let step = 1;
    if (match.status === 'Completed') {
      step = 4;
    } else if (match.status === 'Pending') {
      step = 2;
    } else if (match.status === 'Failed') {
      step = 1;
    } else {
      step = 3;
    }

    this.trackingResult.set({
      searched: true,
      txn: match,
      step,
      error: ''
    });
  }
}
