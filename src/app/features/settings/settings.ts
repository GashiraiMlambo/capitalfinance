import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="settings-wrapper anim-fade-in">
      <div class="page-actions-header">
        <h2>Institution Policy & Security Control</h2>
        <div class="tabs-banking">
          <div class="tab-item" [class.active]="activeTab() === 'general'" (click)="activeTab.set('general')">General Settings</div>
          <div class="tab-item" [class.active]="activeTab() === 'interest'" (click)="activeTab.set('interest')">Interest & Penalties</div>
          <div class="tab-item" [class.active]="activeTab() === 'audit'" (click)="activeTab.set('audit')">Institutional Audit Log</div>
        </div>
      </div>

      <!-- TAB 1: GENERAL SETTINGS -->
      <div class="tab-content" *ngIf="activeTab() === 'general'">
        <div class="card-banking max-w-600">
          <h3>Institution Profile</h3>
          <p class="section-desc">Basic details defining the institutional identity of the platform.</p>

          <form (submit)="saveSettings(); $event.preventDefault()">
            <div class="form-group">
              <label>Institution Name</label>
              <input type="text" class="form-control" [(ngModel)]="instName" name="name" />
            </div>

            <div class="grid-container cols-2">
              <div class="form-group">
                <label>Institution Currency</label>
                <select class="form-control" [(ngModel)]="instCurrency" name="currency">
                  <option value="USD">United States Dollar (USD - $)</option>
                  <option value="EUR">Euro (EUR - €)</option>
                  <option value="GHS">Ghanaian Cedi (GHS - GH₵)</option>
                  <option value="KES">Kenyan Shilling (KES - KSh)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Base Language</label>
                <select class="form-control" [(ngModel)]="instLang" name="lang">
                  <option value="en">English (EN)</option>
                  <option value="es">Español (ES)</option>
                  <option value="fr">Français (FR)</option>
                  <option value="de">Deutsch (DE)</option>
                </select>
              </div>
            </div>

            <button type="submit" class="btn-primary w-full mt-4">
              Commit Profile Changes
            </button>
          </form>
        </div>
      </div>

      <!-- TAB 2: INTEREST & PENALTIES -->
      <div class="tab-content" *ngIf="activeTab() === 'interest'">
        <div class="card-banking max-w-600">
          <h3>Credit Rule Engine Parameters</h3>
          <p class="section-desc">Define accrual methods and penalization parameters applied globally across SME and micro loans.</p>

          <form (submit)="saveSettings(); $event.preventDefault()">
            <div class="grid-container cols-2">
              <div class="form-group">
                <label>Default Overdue Penalty Rate (%)</label>
                <input type="number" class="form-control" [(ngModel)]="penaltyRate" name="penalty" />
              </div>
              <div class="form-group">
                <label>Grace Period (Days)</label>
                <input type="number" class="form-control" [(ngModel)]="gracePeriod" name="grace" />
              </div>
            </div>

            <div class="form-group">
              <label>Interest Allocation Method</label>
              <select class="form-control" [(ngModel)]="interestMethod" name="method">
                <option value="declining">Declining Balance Method</option>
                <option value="flat">Flat Rate Method</option>
              </select>
            </div>

            <button type="submit" class="btn-primary w-full mt-4">
              Commit Rules Configurations
            </button>
          </form>
        </div>
      </div>

      <!-- TAB 3: AUDIT TRAIL -->
      <div class="tab-content" *ngIf="activeTab() === 'audit'">
        <div class="table-container">
          <table class="table-enterprise">
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Timestamp</th>
                <th>Staff Account</th>
                <th>Triggered Event Action</th>
                <th>IPv4 Address</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of stateService.auditLogs()">
                <td><strong>{{ log.id }}</strong></td>
                <td>{{ log.timestamp | date:'medium' }}</td>
                <td>{{ log.userName }} ({{ log.role }})</td>
                <td>{{ log.action }}</td>
                <td><code>{{ log.ipAddress }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-wrapper {
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
    .mt-4 { margin-top: 16px; }
  `]
})
export class SettingsComponent {
  stateService = inject(StateService);

  activeTab = signal<'general' | 'interest' | 'audit'>('general');

  // Profile
  instName = 'Central Capital Finance';
  instCurrency = 'USD';
  instLang = 'en';

  // Rules
  penaltyRate = 2.5;
  gracePeriod = 7;
  interestMethod = 'declining';

  saveSettings() {
    this.stateService.addAuditLog('Updated global institutional policy rules/profile settings');
    alert('Settings committed and applied globally to underwriting engine.');
  }
}
