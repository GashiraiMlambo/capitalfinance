import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService, EodStatus } from '../../../core/services/state.service';

@Component({
  selector: 'app-rbz-reporting',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporting.component.html',
  styleUrl: './reporting.component.scss',})
export class RbzReportingComponent implements OnInit, OnDestroy {
  stateService = inject(StateService);

  eodState = computed(() => this.stateService.eodStatus());

  pendingCount = computed(() => {
    return this.stateService.transactions().filter(t => t.status === 'Pending').length;
  });

  completedCount = computed(() => {
    return this.stateService.transactions().filter(t => t.status === 'Completed').length;
  });

  totalVolume = computed(() => {
    const txns = this.stateService.transactions().filter(t => t.status === 'Completed');
    return txns.reduce((sum, t) => sum + t.amount, 0);
  });

  consoleLogs = signal<string[]>([
    '[SYS] Terminal listening on RBZ Exchange Gateway port 9443.',
    '[SYS] Type command or trigger EOD batch process to compile daily reporting ledger.',
    '[SYS] Status: Awaiting EOD reconciliation command.'
  ]);

  private logTimer: any;

  ngOnInit() {
    // If EOD status is already Completed or In Progress, update console logs
    if (this.eodState().status === 'Completed') {
      this.consoleLogs.set([
        '[SYS] EOD transmission initiated.',
        '[SYS] Connected to RBZ central server gateway.',
        '[SYS] Compiling transaction vouchers...',
        `[SYS] Transmitted ${this.stateService.transactions().length} rows successfully.`,
        '[SYS] EOD batch transmission verified by RBZ gateway. Status 200 OK.',
        '[SYS] EOD Batch ID: BATCH-' + Date.now().toString().substring(8),
        '[SYS] Status: Idle.'
      ]);
    }
  }

  ngOnDestroy() {
    if (this.logTimer) clearInterval(this.logTimer);
  }

  canSubmitEod(): boolean {
    const role = this.stateService.currentUser()?.role;
    return role === 'Compliance Officer' || role === 'Branch Manager';
  }

  triggerEodReconciliation() {
    if (this.pendingCount() > 0) {
      alert('Cannot trigger EOD process. Please clear all pending overrides first.');
      return;
    }

    this.stateService.triggerEOD();
    
    // Simulate console printing line by line
    this.consoleLogs.set(['[SYS] EOD reconciliation sequence started.']);
    
    const lines = [
      '[SYS] Testing secure TLS handshake with RBZ endpoint...',
      '[SYS] Handshake verified. Cipher suite: TLS_AES_256_GCM_SHA384',
      '[SYS] Local transaction ledger locked. Fetching EOD records...',
      `[SYS] Found ${this.completedCount()} Completed exchange vouchers.`,
      '[SYS] Constructing XML ISO-20022 message payload...',
      '[SYS] Signing payload with bank private keys...',
      '[SYS] Transmitting batch chunks [1/2]...',
      '[SYS] Transmitting batch chunks [2/2]...',
      '[SYS] Awaiting central clearance acknowledgement...',
      '[SYS] Transaction hash: 0x93e2b34a5d8ee9c8d32b1239c84918e',
      `[SYS] Transmission SUCCESS. ${this.completedCount()} rows uploaded.`,
      '[SYS] EOD batch transmission verified by RBZ gateway. Status 200 OK.',
      '[SYS] Terminal released. Ledger reporting cycle closed.'
    ];

    let index = 0;
    this.logTimer = setInterval(() => {
      if (index < lines.length) {
        this.consoleLogs.update(logs => [...logs, lines[index]]);
        index++;
      } else {
        clearInterval(this.logTimer);
      }
    }, 400);
  }
}
