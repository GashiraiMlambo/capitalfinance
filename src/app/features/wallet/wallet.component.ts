import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StateService, Customer } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss',})
export class WalletComponent implements OnInit {
  stateService = inject(StateService);
  fb = inject(FormBuilder);

  activeTab = signal<'deposit' | 'withdraw' | 'transactions'>('deposit');
  withdrawForm!: FormGroup;
  depositForm!: FormGroup;

  selectedKycStatus = signal<string>('');
  selectedWithdrawKycStatus = signal<string>('');
  selectedWithdrawBalance = signal<number>(0);

  successDepositMsg = signal<string>('');
  successWithdrawMsg = signal<string>('');

  recentDeposits = signal<{ timestamp: string; customerName: string; amount: number; method: string }[]>([]);
  recentWithdrawals = signal<{ timestamp: string; customerName: string; amount: number; method: string }[]>([]);

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.withdrawForm = this.fb.group({
      customerId: ['', Validators.required],
      method: ['Cash', Validators.required],
      amount: [50, [Validators.required, Validators.min(1)]],
      remarks: ['']
    });

    this.depositForm = this.fb.group({
      customerId: ['', Validators.required],
      method: ['Cash', Validators.required],
      amount: [100, [Validators.required, Validators.min(1)]],
      remarks: ['']
    });
  }

  onDepositCustomerChange() {
    const id = this.depositForm.value.customerId;
    const cust = this.stateService.customers().find(c => c.id === id);
    this.selectedKycStatus.set(cust ? cust.kycStatus : '');
  }

  onWithdrawCustomerChange() {
    const id = this.withdrawForm.value.customerId;
    const cust = this.stateService.customers().find(c => c.id === id);
    this.selectedWithdrawKycStatus.set(cust ? cust.kycStatus : '');
    this.selectedWithdrawBalance.set(cust ? cust.walletBalance : 0);

    if (cust) {
      this.withdrawForm.get('amount')?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(cust.walletBalance)
      ]);
      this.withdrawForm.get('amount')?.updateValueAndValidity();
    }
  }

  executeDeposit() {
    const vals = this.depositForm.value;
    const amount = vals.amount;
    const cust = this.stateService.customers().find(c => c.id === vals.customerId);

    if (!cust || cust.kycStatus !== 'Approved') return;

    // Mutate state
    this.stateService.customers.update(custs => {
      return custs.map(c => {
        if (c.id === cust.id) {
          return { 
            ...c, 
            walletBalance: c.walletBalance + amount,
            savingsBalance: c.savingsBalance + amount,
            timeline: [
              { date: new Date().toISOString().split('T')[0], title: 'Cash Deposit Recorded', desc: `Deposited $${amount.toFixed(2)} via ${vals.method}. Recorded by ${this.stateService.currentUser()?.name || 'Operations'}.`, icon: 'arrow-down-left' },
              ...c.timeline
            ]
          };
        }
        return c;
      });
    });

    // Post double entry ledger entry
    this.stateService.postJournalEntry({
      description: `Cash deposit recorded for client ${cust.name}. Method: ${vals.method}. Remarks: ${vals.remarks || 'None'}`,
      referenceNo: `DEP-${Date.now().toString().slice(-6)}`,
      debits: [{ accountCode: '1001', amount: amount }],  // Debit Cash/Asset Account
      credits: [{ accountCode: '2000', amount: amount }]  // Credit Savings/Liability Account
    });

    this.stateService.addAuditLog(`Recorded cash deposit of $${amount} for customer ${cust.name} (${cust.id})`);

    // Add to session deposits audit
    this.recentDeposits.update(prev => [
      { timestamp: new Date().toISOString(), customerName: cust.name, amount: amount, method: vals.method },
      ...prev
    ]);

    // Success state
    this.successDepositMsg.set(`Deposit of $${amount.toFixed(2)} successfully credited to ${cust.name}'s savings wallet.`);
    this.depositForm.reset({ customerId: '', method: 'Cash', amount: 100, remarks: '' });
    this.selectedKycStatus.set('');
    
    setTimeout(() => {
      this.successDepositMsg.set('');
    }, 5000);
  }

  executeWithdraw() {
    const vals = this.withdrawForm.value;
    const amount = vals.amount;
    const cust = this.stateService.customers().find(c => c.id === vals.customerId);

    if (!cust || cust.kycStatus !== 'Approved' || cust.walletBalance < amount) return;

    // Mutate state
    this.stateService.customers.update(custs => {
      return custs.map(c => {
        if (c.id === cust.id) {
          return { 
            ...c, 
            walletBalance: c.walletBalance - amount,
            savingsBalance: c.savingsBalance - amount,
            timeline: [
              { date: new Date().toISOString().split('T')[0], title: 'Cash Withdrawal Recorded', desc: `Withdrew $${amount.toFixed(2)} via ${vals.method}. Recorded by ${this.stateService.currentUser()?.name || 'Operations'}.`, icon: 'arrow-up-right' },
              ...c.timeline
            ]
          };
        }
        return c;
      });
    });

    // Post double entry ledger entry
    this.stateService.postJournalEntry({
      description: `Cash withdrawal recorded for client ${cust.name}. Method: ${vals.method}. Remarks: ${vals.remarks || 'None'}`,
      referenceNo: `WTH-${Date.now().toString().slice(-6)}`,
      debits: [{ accountCode: '2000', amount: amount }],  // Debit Liability Account
      credits: [{ accountCode: '1001', amount: amount }]  // Credit Cash/Asset Account
    });

    this.stateService.addAuditLog(`Recorded cash withdrawal of $${amount} for customer ${cust.name} (${cust.id})`);

    // Add to session withdrawals audit
    this.recentWithdrawals.update(prev => [
      { timestamp: new Date().toISOString(), customerName: cust.name, amount: amount, method: vals.method },
      ...prev
    ]);

    // Success state
    this.successWithdrawMsg.set(`Withdrawal of $${amount.toFixed(2)} successfully debited from ${cust.name}'s savings wallet.`);
    this.withdrawForm.reset({ customerId: '', method: 'Cash', amount: 50, remarks: '' });
    this.selectedWithdrawKycStatus.set('');
    this.selectedWithdrawBalance.set(0);
    
    setTimeout(() => {
      this.successWithdrawMsg.set('');
    }, 5000);
  }
}
