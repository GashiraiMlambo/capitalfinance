import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-workflows',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './workflows.component.html',
  styleUrl: './workflows.component.scss',})
export class WorkflowsComponent {
  stateService = inject(StateService);

  activeTab = signal<'approvals' | 'scoring'>('approvals');

  // Scoring engine configs local state
  minCreditScore = 580;
  maxDti = 45;
  minCollateralCover = 120;
  autoKycCheck = true;

  workflowApprovals = computed(() => {
    return this.stateService.transactions()
      .filter(t => t.status === 'Pending')
      .map(t => ({
        id: t.id,
        type: t.type === 'Exchange' ? 'FX Exchange' : 'Remittance',
        requesterName: 'John Doe (Teller)',
        description: `${t.direction} ${t.amount} USD (${t.flagReason})`,
        targetId: t.customerId,
        tierAssigned: t.flagReason === 'Sanctions hit' ? 'Compliance' : 'Branch Manager',
        status: t.status
      }));
  });

  approveTask(task: any) {
    this.stateService.approveTransaction(task.id, 'Approved via central workflows console.');
    alert(`Task ${task.id} approved.`);
  }

  rejectTask(id: string) {
    this.stateService.rejectTransaction(id, 'Rejected via central workflows console.');
    alert(`Task ${id} rejected.`);
  }

  saveScoringConfigs() {
    this.stateService.addAuditLog(`Updated automated credit scoring matrix parameters`);
    alert('Scoring engine criteria parameters updated successfully.');
  }
}
