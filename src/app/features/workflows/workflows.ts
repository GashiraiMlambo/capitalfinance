import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, WorkflowApproval } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-workflows',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="workflows-wrapper anim-fade-in">
      <div class="page-actions-header">
        <h2>Credit Committee Workflows & Credit Scoring</h2>
        <div class="tabs-banking">
          <div class="tab-item" [class.active]="activeTab() === 'approvals'" (click)="activeTab.set('approvals')">Pending Approvals</div>
          <div class="tab-item" [class.active]="activeTab() === 'scoring'" (click)="activeTab.set('scoring')">Scoring Engine Configs</div>
        </div>
      </div>

      <!-- TAB 1: PENDING APPROVALS LIST -->
      <div class="tab-content" *ngIf="activeTab() === 'approvals'">
        <div class="table-container">
          <table class="table-enterprise">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Request Type</th>
                <th>Requester</th>
                <th>Subject Details</th>
                <th>Assigned Tier</th>
                <th>Approval Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let task of stateService.workflowApprovals()">
                <td><strong>{{ task.id }}</strong></td>
                <td>
                  <span class="chip-status status-info">{{ task.type }}</span>
                </td>
                <td>{{ task.requesterName }}</td>
                <td>
                  <div class="subject-cell">
                    <span class="main">{{ task.description }}</span>
                    <span class="sub">ID: {{ task.targetId }}</span>
                  </div>
                </td>
                <td>{{ task.tierAssigned }}</td>
                <td>
                  <span class="chip-status" [class]="'status-' + task.status.toLowerCase()">
                    {{ task.status }}
                  </span>
                </td>
                <td>
                  <div class="row-actions" *ngIf="task.status === 'Pending'">
                    <button class="btn-primary" (click)="approveTask(task)">Approve</button>
                    <button class="btn-danger" (click)="rejectTask(task.id)">Reject</button>
                  </div>
                  <span *ngIf="task.status !== 'Pending'" class="text-muted">Completed</span>
                </td>
              </tr>
              <tr *ngIf="stateService.workflowApprovals().length === 0">
                <td colspan="7" class="text-center">
                  <div class="empty-state">
                    <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806a3.42 3.42 0 014.438 0a3.42 3.42 0 001.946.806a3.42 3.42 0 013.138 3.138a3.42 3.42 0 00.806 1.946a3.42 3.42 0 010 4.438a3.42 3.42 0 00-.806 1.946a3.42 3.42 0 01-3.138 3.138a3.42 3.42 0 00-1.946.806a3.42 3.42 0 01-4.438 0a3.42 3.42 0 00-1.946-.806a3.42 3.42 0 01-3.138-3.138a3.42 3.42 0 00-.806-1.946a3.42 3.42 0 010-4.438a3.42 3.42 0 00.806-1.946a3.42 3.42 0 013.138-3.138z"/></svg>
                    <p>No active workflow tickets in the registry</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: SCORING ENGINE CONFIGS -->
      <div class="tab-content" *ngIf="activeTab() === 'scoring'">
        <div class="card-banking max-w-700">
          <h3>Automated Scoring Matrix Configuration</h3>
          <p class="section-desc">Adjust thresholds utilized by the AI loan underwriting engine to flag risk levels.</p>

          <form (submit)="saveScoringConfigs(); $event.preventDefault()">
            <div class="grid-container cols-2">
              <div class="form-group">
                <label>Minimum Credit Bureau Score (0 - 900)</label>
                <input type="number" class="form-control" [(ngModel)]="minCreditScore" name="minScore" />
              </div>
              <div class="form-group">
                <label>Maximum Debt-To-Income Ratio (%)</label>
                <input type="number" class="form-control" [(ngModel)]="maxDti" name="maxDti" />
              </div>
            </div>

            <div class="grid-container cols-2">
              <div class="form-group">
                <label>Minimum Collateral Coverage Ratio (%)</label>
                <input type="number" class="form-control" [(ngModel)]="minCollateralCover" name="minColl" />
              </div>
              <div class="form-group font-medium">
                <label>Verification Rules</label>
                <div class="toggle-group mt-2">
                  <input type="checkbox" [(ngModel)]="autoKycCheck" name="autoKyc" id="autoKyc" />
                  <label for="autoKyc" class="checkbox-lbl">Enforce Automated KYC Checks</label>
                </div>
              </div>
            </div>

            <button type="submit" class="btn-primary w-full mt-4">
              Save Scoring Criteria Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .workflows-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-actions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 10px;

      h2 { font-size: 20px; font-family: 'Outfit', sans-serif; }
      .tabs-banking { margin-bottom: 0; border: none; }
    }

    .subject-cell {
      display: flex;
      flex-direction: column;
      .sub { font-size: 11px; color: var(--text-muted); font-family: monospace; }
    }

    .row-actions {
      display: flex;
      gap: 8px;
    }

    .max-w-700 {
      max-width: 700px;
      margin: 0 auto;
    }

    .section-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    .w-full { width: 100%; justify-content: center; }
    .mt-4 { margin-top: 16px; }
    .mt-2 { margin-top: 8px; }

    .toggle-group {
      display: flex;
      align-items: center;
      gap: 10px;
      
      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
      
      .checkbox-lbl {
        margin-bottom: 0;
        cursor: pointer;
      }
    }
  `]
})
export class WorkflowsComponent {
  stateService = inject(StateService);

  activeTab = signal<'approvals' | 'scoring'>('approvals');

  // Scoring engine configs local state
  minCreditScore = 580;
  maxDti = 45;
  minCollateralCover = 120;
  autoKycCheck = true;

  approveTask(task: WorkflowApproval) {
    // Approve task in state service
    this.stateService.approveWorkflow(task.id);
  }

  rejectTask(id: string) {
    this.stateService.workflowApprovals.update(tasks => {
      return tasks.map(t => {
        if (t.id === id) {
          this.stateService.addAuditLog(`Rejected workflow approval ID ${id} (${t.type})`);
          return { ...t, status: 'Rejected' as const };
        }
        return t;
      });
    });
  }

  saveScoringConfigs() {
    this.stateService.addAuditLog(`Updated automated credit scoring matrix parameters`);
    alert('Scoring engine criteria parameters updated successfully.');
  }
}
