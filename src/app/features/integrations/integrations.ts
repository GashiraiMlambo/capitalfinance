import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="integrations-wrapper anim-fade-in">
      <div class="page-actions-header">
        <h2>Institutional Integrations & API Connections</h2>
      </div>

      <div class="grid-container cols-3 mt-4">
        <div class="card-banking integration-card" *ngFor="let entry of stateService.integrations()">
          <div class="card-header">
            <h4>{{ entry.name }}</h4>
            <span class="chip-status" [class]="'status-' + entry.status.toLowerCase()">
              {{ entry.status }}
            </span>
          </div>

          <p class="desc text-muted">{{ entry.type }} Gateway</p>
          <div class="divider"></div>

          <div class="connection-stats">
            <div class="stat">
              <span class="label">API Latency</span>
              <span class="value">{{ entry.status === 'Connected' ? entry.latencyMs + ' ms' : 'N/A' }}</span>
            </div>
            <div class="stat">
              <span class="label">Auth Protocol</span>
              <span class="value">OAuth 2.0 / MTLS</span>
            </div>
          </div>

          <div class="actions mt-4">
            <button class="btn-secondary w-full" *ngIf="entry.status === 'Connected'" (click)="toggleConnection(entry.id, 'Disconnected')">
              Disconnect Gateway
            </button>
            <button class="btn-primary w-full" *ngIf="entry.status === 'Disconnected'" (click)="toggleConnection(entry.id, 'Connected')">
              Establish Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .integrations-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-actions-header {
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 10px;
      h2 { font-size: 20px; font-family: 'Outfit', sans-serif; }
    }

    .integration-card {
      display: flex;
      flex-direction: column;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      
      .desc { font-size: 12.5px; margin-bottom: 12px; }
    }

    .divider {
      height: 1px;
      background: var(--border-light);
      margin: 12px 0;
    }

    .connection-stats {
      display: flex;
      justify-content: space-between;
      
      .stat {
        display: flex;
        flex-direction: column;
        
        .label { font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 600; }
        .value { font-size: 13px; font-weight: 700; color: var(--text-main); }
      }
    }

    .w-full { width: 100%; justify-content: center; }
    .mt-4 { margin-top: 16px; }
  `]
})
export class IntegrationsComponent {
  stateService = inject(StateService);

  toggleConnection(id: string, newStatus: 'Connected' | 'Disconnected') {
    this.stateService.integrations.update(items => {
      return items.map(item => {
        if (item.id === id) {
          this.stateService.addAuditLog(`Updated gateway integration ${item.name} connection status to ${newStatus}`);
          return {
            ...item,
            status: newStatus,
            latencyMs: newStatus === 'Connected' ? Math.floor(Math.random() * 80) + 20 : 0
          };
        }
        return item;
      });
    });
  }
}
