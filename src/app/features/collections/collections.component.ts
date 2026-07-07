import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, Collector, PromiseToPay } from '../../core/services/state.service';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.scss',})
export class CollectionsComponent {
  stateService = inject(StateService);

  activeTab = signal<'collectors' | 'ptp' | 'visit'>('collectors');
  showPtpForm = signal<boolean>(false);

  // Field visit form variables
  visitCollectorId = '';
  visitCustomerId = '';
  visitAmount = 0;
  visitGps = '-17.8252, 31.0335';
  visitNotes = '';

  // PTP form variables
  ptpCustomerId = '';
  ptpLoanId = '';
  ptpAmount = 0;
  ptpDate = '';

  totalCollectedToday = computed(() => {
    return this.stateService.collectors().reduce((sum, c) => sum + c.collectionsToday, 0);
  });

  activeCollectorsCount = computed(() => {
    return this.stateService.collectors().filter(c => c.status === 'Active').length;
  });

  pendingPtpCount = computed(() => {
    return this.stateService.promiseToPays().filter(p => p.status === 'Pending').length;
  });

  postFieldCollection() {
    if (!this.visitCollectorId || !this.visitCustomerId || this.visitAmount <= 0) return;

    const colName = this.stateService.collectors().find(c => c.id === this.visitCollectorId)?.name || 'Collector';
    const custName = this.stateService.customers().find(c => c.id === this.visitCustomerId)?.name || 'Client';

    // 1. Post Journal Entry
    this.stateService.postJournalEntry({
      description: `Field collection posted by ${colName} for client ${custName}`,
      referenceNo: `REF-COL-FIELD-${Date.now().toString().slice(-6)}`,
      debits: [{ accountCode: '1000', amount: this.visitAmount }], // Cash +
      credits: [{ accountCode: '1100', amount: this.visitAmount }]  // Loan assets - (assumes loan repayment)
    });

    // 2. Update collector metrics
    this.stateService.collectors.update(cols => {
      return cols.map(c => {
        if (c.id === this.visitCollectorId) {
          return {
            ...c,
            collectionsToday: c.collectionsToday + this.visitAmount
          };
        }
        return c;
      });
    });

    // 3. Update customer loan balance
    this.stateService.customers.update(custs => {
      return custs.map(c => {
        if (c.id === this.visitCustomerId) {
          return {
            ...c,
            loanBalance: Math.max(0, c.loanBalance - this.visitAmount)
          };
        }
        return c;
      });
    });

    this.stateService.addAuditLog(`Collector ${colName} posted field receipt of $${this.visitAmount} for ${custName}`);

    // Reset Form
    this.visitCollectorId = '';
    this.visitCustomerId = '';
    this.visitAmount = 0;
    this.visitNotes = '';

    // Redirect to collectors list
    this.activeTab.set('collectors');
  }

  submitPtp() {
    if (!this.ptpCustomerId || !this.ptpLoanId || this.ptpAmount <= 0 || !this.ptpDate) return;

    const custName = this.stateService.customers().find(c => c.id === this.ptpCustomerId)?.name || 'Client';

    this.stateService.promiseToPays.update(prev => [
      {
        id: `PTP-${Date.now().toString().slice(-4)}`,
        customerId: this.ptpCustomerId,
        customerName: custName,
        loanId: this.ptpLoanId,
        amount: this.ptpAmount,
        promisedDate: this.ptpDate,
        status: 'Pending'
      },
      ...prev
    ]);

    this.stateService.addAuditLog(`Recorded PTP promise of $${this.ptpAmount} on ${this.ptpDate} for ${custName}`);

    // Reset PTP Form
    this.ptpCustomerId = '';
    this.ptpLoanId = '';
    this.ptpAmount = 0;
    this.ptpDate = '';
    this.showPtpForm.set(false);
  }

  fulfillPtp(id: string) {
    this.stateService.promiseToPays.update(prev => {
      return prev.map(p => {
        if (p.id === id) {
          this.stateService.addAuditLog(`PTP fulfilled: ${id} for ${p.customerName}`);
          return { ...p, status: 'Fulfilled' };
        }
        return p;
      });
    });
  }

  breakPtp(id: string) {
    this.stateService.promiseToPays.update(prev => {
      return prev.map(p => {
        if (p.id === id) {
          this.stateService.addAuditLog(`PTP broken: ${id} for ${p.customerName}`);
          return { ...p, status: 'Broken' };
        }
        return p;
      });
    });
  }
}
