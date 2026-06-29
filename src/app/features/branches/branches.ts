import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="branches-wrapper anim-fade-in">
      <div class="page-actions-header">
        <h2>Institutional Branch Offices & Positions</h2>
      </div>

      <div class="grid-container cols-3 mt-4">
        <div class="card-banking branch-card" *ngFor="let br of stateService.branches()">
          <div class="header">
            <h4>{{ br.name }}</h4>
            <span class="code">Code: {{ br.id }}</span>
          </div>

          <p class="manager text-muted">Branch Manager: <strong>{{ br.managerName }}</strong></p>
          <div class="divider"></div>

          <div class="branch-stats">
            <div class="stat">
              <span class="label">Vault Cash Reserves</span>
              <span class="value">$ {{ br.cashPosition | number:'1.2-2' }}</span>
            </div>
            <div class="stat">
              <span class="label">Active Employees</span>
              <span class="value">{{ br.employeeCount }} staff</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .branches-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-actions-header {
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 10px;
      h2 { font-size: 20px; font-family: 'Outfit', sans-serif; }
    }

    .branch-card {
      display: flex;
      flex-direction: column;
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        
        .code { font-family: monospace; font-size: 12px; color: var(--text-muted); }
      }

      .manager { font-size: 13px; margin-bottom: 12px; }
    }

    .divider {
      height: 1px;
      background: var(--border-light);
      margin: 12px 0;
    }

    .branch-stats {
      display: flex;
      justify-content: space-between;
      
      .stat {
        display: flex;
        flex-direction: column;
        
        .label { font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 600; }
        .value { font-size: 13.5px; font-weight: 700; color: var(--text-main); }
      }
    }
  `]
})
export class BranchesComponent {
  stateService = inject(StateService);
}
