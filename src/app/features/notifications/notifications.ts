import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="notifications-wrapper anim-fade-in">
      <div class="page-actions-header">
        <h2>Institutional Communications & Bulk Campaigns</h2>
        <div class="tabs-banking">
          <div class="tab-item" [class.active]="activeTab() === 'log'" (click)="activeTab.set('log')">Notifications Log</div>
          <div class="tab-item" [class.active]="activeTab() === 'broadcast'" (click)="activeTab.set('broadcast')">Broadcast Campaign</div>
        </div>
      </div>

      <!-- TAB 1: NOTIFICATIONS LOG -->
      <div class="tab-content" *ngIf="activeTab() === 'log'">
        <div class="table-container">
          <table class="table-enterprise">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Alert Title</th>
                <th>Notification Description</th>
                <th>Module Type</th>
                <th>Timestamp</th>
                <th>Delivered</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let n of stateService.notifications()">
                <td><strong>{{ n.id }}</strong></td>
                <td>{{ n.title }}</td>
                <td>{{ n.body }}</td>
                <td>
                  <span class="chip-status status-info">{{ n.type }}</span>
                </td>
                <td>{{ n.date | date:'medium' }}</td>
                <td>
                  <span class="chip-status status-approved">Sent</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: BROADCAST CAMPAIGN -->
      <div class="tab-content" *ngIf="activeTab() === 'broadcast'">
        <div class="card-banking max-w-600">
          <h3>Broadcast Custom Notification</h3>
          <p class="section-desc">Dispatch a portal message to all registered staff members and institution auditors.</p>

          <form (submit)="dispatchBroadcast(); $event.preventDefault()">
            <div class="form-group">
              <label>Campaign Title *</label>
              <input type="text" class="form-control" [(ngModel)]="bTitle" name="btitle" placeholder="e.g. Server Maintenance Notice" required />
            </div>

            <div class="form-group">
              <label>Category / Target Module *</label>
              <select class="form-control" [(ngModel)]="bType" name="btype" required>
                <option value="system">System Notice</option>
                <option value="loan">Credit / Loans Notice</option>
                <option value="risk">Risk / Compliance Advisory</option>
              </select>
            </div>

            <div class="form-group">
              <label>Message Content *</label>
              <textarea class="form-control" rows="4" [(ngModel)]="bBody" name="bbody" placeholder="Write your broadcast message..." required></textarea>
            </div>

            <button type="submit" class="btn-primary w-full" [disabled]="!bTitle || !bBody">
              Broadcast Message
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-wrapper {
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

    .max-w-600 {
      max-width: 600px;
      margin: 0 auto;
    }

    .section-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    .w-full { width: 100%; justify-content: center; }
  `]
})
export class NotificationsComponent {
  stateService = inject(StateService);

  activeTab = signal<'log' | 'broadcast'>('log');

  // Broadcast campaign form variables
  bTitle = '';
  bType = 'system';
  bBody = '';

  dispatchBroadcast() {
    if (!this.bTitle || !this.bBody) return;

    this.stateService.notifications.update(prev => [
      {
        id: `N-${Date.now().toString().slice(-4)}`,
        title: this.bTitle,
        body: this.bBody,
        type: this.bType as any,
        date: new Date().toISOString(),
        read: false
      },
      ...prev
    ]);

    this.stateService.addAuditLog(`Broadcasted institutional message: ${this.bTitle}`);

    // Reset Form
    this.bTitle = '';
    this.bBody = '';
    this.activeTab.set('log');
  }
}
