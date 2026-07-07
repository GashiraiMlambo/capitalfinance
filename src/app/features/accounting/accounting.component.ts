import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StateService, LedgerAccount, JournalEntry } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-accounting',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './accounting.component.html',
  styleUrl: './accounting.component.scss',})
export class AccountingComponent implements OnInit {
  stateService = inject(StateService);
  fb = inject(FormBuilder);

  activeTab = signal<'chart' | 'journal' | 'payroll' | 'ledger' | 'statements'>('chart');
  entryForm!: FormGroup;
  payrollSuccessMsg = signal<string>('');

  // Manual input variables
  debitAccount = '';
  debitAmount = 0;
  creditAccount = '';
  creditAmount = 0;

  workers = signal<any[]>([
    { name: 'Daniel Boateng', email: 'd.boateng@ccfinance.co.zw', role: 'Operations', salary: 1800, paidThisMonth: false, lastPayDate: '' },
    { name: 'Markus Vance', email: 'm.vance@ccfinance.co.zw', role: 'Risk', salary: 2200, paidThisMonth: false, lastPayDate: '' },
    { name: 'Alice Smith', email: 'a.smith@ccfinance.co.zw', role: 'Accounting', salary: 2000, paidThisMonth: false, lastPayDate: '' },
    { name: 'Sarah Jenkins', email: 's.jenkins@ccfinance.co.zw', role: 'Admin', salary: 3500, paidThisMonth: false, lastPayDate: '' }
  ]);

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.entryForm = this.fb.group({
      description: ['', Validators.required],
      referenceNo: ['', Validators.required]
    });
  }

  submitJournalEntry() {
    if (!this.debitAccount || !this.creditAccount || this.debitAmount !== this.creditAmount) return;

    this.stateService.postJournalEntry({
      description: this.entryForm.value.description,
      referenceNo: this.entryForm.value.referenceNo,
      debits: [{ accountCode: this.debitAccount, amount: this.debitAmount }],
      credits: [{ accountCode: this.creditAccount, amount: this.creditAmount }]
    });

    // Reset Form
    this.entryForm.reset();
    this.debitAccount = '';
    this.debitAmount = 0;
    this.creditAccount = '';
    this.creditAmount = 0;

    // Go to ledger log
    this.activeTab.set('ledger');
  }

  paySalary(worker: any) {
    if (worker.paidThisMonth) return;

    // Post double entry: Debit 5000 (Salaries expense), Credit 1000 (Cash)
    this.stateService.postJournalEntry({
      description: `Payroll Salary Settlement for ${worker.name} (${worker.role})`,
      referenceNo: `PAY-${Date.now().toString().slice(-6)}`,
      debits: [{ accountCode: '5000', amount: worker.salary }],
      credits: [{ accountCode: '1000', amount: worker.salary }]
    });

    // Update worker state
    this.workers.update(prev => 
      prev.map(w => w.name === worker.name ? { ...w, paidThisMonth: true, lastPayDate: new Date().toISOString().split('T')[0] } : w)
    );

    this.stateService.addAuditLog(`Processed monthly payroll salary of $${worker.salary} for ${worker.name}`);
    this.payrollSuccessMsg.set(`Salary payout of $${worker.salary.toFixed(2)} successfully posted and settled for ${worker.name}.`);
    
    setTimeout(() => this.payrollSuccessMsg.set(''), 4000);
  }

  getAccountsByCategory(cat: 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expense'): LedgerAccount[] {
    return this.stateService.ledgerAccounts().filter(a => a.category === cat);
  }

  sumAccounts(cat: 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expense'): number {
    return this.getAccountsByCategory(cat).reduce((sum, a) => sum + a.balance, 0);
  }
}
