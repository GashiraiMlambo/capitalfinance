import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StateService, Loan, Customer, RepaymentPeriod } from '../../core/services/state.service';

interface CalculatorSchedule {
  period: number;
  dueDate: string;
  principal: number;
  interest: number;
  total: number;
  balance: number;
}

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './loans.component.html',
  styleUrl: './loans.component.scss',})
export class LoansComponent implements OnInit {
  stateService = inject(StateService);
  fb = inject(FormBuilder);

  activeTab = signal<'active' | 'calculator' | 'products'>('active');
  selectedLoan = signal<Loan | null>(null);

  // Search / filters
  searchQuery = '';
  filterStatus = 'ALL';

  // Calculator & Application
  calcForm!: FormGroup;
  calculatorSchedule = signal<CalculatorSchedule[]>([]);
  totalInterestCost = signal<number>(0);

  // Repayment form
  repayAmount: number | null = null;

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.calcForm = this.fb.group({
      customerId: ['', Validators.required],
      productType: ['SME Expansion Loan', Validators.required],
      amount: [10000, [Validators.required, Validators.min(1000)]],
      termMonths: [12, [Validators.required, Validators.min(1)]],
      interestRate: [12, [Validators.required, Validators.min(1)]]
    });
  }

  onProductChange() {
    const prod = this.calcForm.value.productType;
    if (prod === 'SME Expansion Loan') {
      this.calcForm.patchValue({ interestRate: 12, termMonths: 12 });
    } else if (prod === 'Agri-Business Finance') {
      this.calcForm.patchValue({ interestRate: 8, termMonths: 18 });
    } else if (prod === 'Micro-Retail Finance') {
      this.calcForm.patchValue({ interestRate: 15, termMonths: 12 });
    } else if (prod === 'Solar Clean Energy') {
      this.calcForm.patchValue({ interestRate: 6, termMonths: 36 });
    }
  }

  calculateAmortization() {
    const vals = this.calcForm.value;
    const amount = vals.amount;
    const annualRate = vals.interestRate;
    const termMonths = vals.termMonths;

    const monthlyRate = (annualRate / 100) / 12;
    const totalPayment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
    
    let remaining = amount;
    const schedule: CalculatorSchedule[] = [];
    let cumulativeInterest = 0;

    for (let i = 1; i <= termMonths; i++) {
      const interest = remaining * monthlyRate;
      const principal = totalPayment - interest;
      remaining -= principal;
      cumulativeInterest += interest;

      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        period: i,
        dueDate: dueDate.toISOString().split('T')[0],
        principal: Math.round(principal * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        total: Math.round(totalPayment * 100) / 100,
        balance: Math.max(0, Math.round(remaining * 100) / 100)
      });
    }

    this.calculatorSchedule.set(schedule);
    this.totalInterestCost.set(cumulativeInterest);
  }

  submitLoanApplication() {
    const vals = this.calcForm.value;
    
    this.stateService.applyForLoan({
      customerId: vals.customerId,
      productType: vals.productType,
      amount: vals.amount,
      termMonths: vals.termMonths,
      interestRate: vals.interestRate,
      guarantors: [],
      collateral: []
    });

    // Reset Calculator
    this.calcForm.reset({ productType: 'SME Expansion Loan', amount: 10000, termMonths: 12, interestRate: 12 });
    this.calculatorSchedule.set([]);
    this.totalInterestCost.set(0);

    // Switch to active view to show pending loan
    this.activeTab.set('active');
    this.filterStatus = 'Pending';
  }

  filteredLoans = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    const status = this.filterStatus;
    let list = [...this.stateService.loans()];

    if (query) {
      list = list.filter(l => 
        l.customerName.toLowerCase().includes(query) || 
        l.id.toLowerCase().includes(query)
      );
    }

    if (status !== 'ALL') {
      list = list.filter(l => l.status === status);
    }

    return list;
  });

  selectLoan(loan: Loan) {
    this.selectedLoan.set(loan);
    this.repayAmount = null;
  }

  closeLoanDetails() {
    this.selectedLoan.set(null);
  }

  submitRepayment() {
    const loan = this.selectedLoan();
    if (!loan || !this.repayAmount || this.repayAmount <= 0) return;

    this.stateService.makeRepayment(loan.id, this.repayAmount);

    // Update locally selected loan to refresh UI
    this.selectedLoan.update(l => {
      if (!l) return null;
      const outstanding = Math.max(0, l.outstandingBalance - this.repayAmount!);
      const paid = l.paidAmount + this.repayAmount!;
      return {
        ...l,
        outstandingBalance: outstanding,
        paidAmount: paid,
        status: outstanding <= 0 ? 'Closed' : l.status
      } as Loan;
    });

    this.repayAmount = null;
  }

  triggerRestructuring(loanId: string) {
    // Restructure loan: extend terms, set restructured status
    this.stateService.loans.update(loans => {
      return loans.map(l => {
        if (l.id !== loanId) return l;
        this.stateService.addAuditLog(`Restructured loan ${loanId} for ${l.customerName}`);
        return {
          ...l,
          status: 'Restructured',
          restructuredCount: l.restructuredCount + 1
        };
      });
    });

    this.selectedLoan.update(l => {
      if (!l) return null;
      return {
        ...l,
        status: 'Restructured',
        restructuredCount: l.restructuredCount + 1
      };
    });
  }

  triggerWriteOff(loanId: string) {
    this.stateService.loans.update(loans => {
      return loans.map(l => {
        if (l.id !== loanId) return l;
        
        // Journal entry write off
        this.stateService.postJournalEntry({
          description: `Write off loan portfolio ${loanId} - ${l.customerName}`,
          referenceNo: `REF-WO-${loanId}`,
          debits: [{ accountCode: '1200', amount: l.outstandingBalance }], // Provision for loan losses +
          credits: [{ accountCode: '1100', amount: l.outstandingBalance }]  // Loan Portfolio assets -
        });

        // Set customer loan balance to 0
        this.stateService.customers.update(custs => {
          return custs.map(c => {
            if (c.id === l.customerId) {
              return {
                ...c,
                loanBalance: Math.max(0, c.loanBalance - l.outstandingBalance)
              };
            }
            return c;
          });
        });

        this.stateService.addAuditLog(`Wrote off outstanding loan ${loanId} ($${l.outstandingBalance})`);

        return {
          ...l,
          status: 'Written Off',
          outstandingBalance: 0
        };
      });
    });

    this.selectedLoan.update(l => {
      if (!l) return null;
      return {
        ...l,
        status: 'Written Off',
        outstandingBalance: 0
      } as Loan;
    });
  }
}
