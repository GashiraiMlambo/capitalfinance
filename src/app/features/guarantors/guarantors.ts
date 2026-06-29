import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-guarantors',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="guarantors-wrapper anim-fade-in">
      <div class="page-actions-header">
        <h2>Credit Guarantors & Third-Party Exposure</h2>
        <button class="btn-primary" (click)="showRegisterModal.set(true)">Register Guarantor</button>
      </div>

      <!-- Guarantors Directory Table -->
      <div class="table-container mt-4">
        <table class="table-enterprise">
          <thead>
            <tr>
              <th>Guarantor ID</th>
              <th>Full Name</th>
              <th>Phone</th>
              <th>Employer</th>
              <th>Total Guaranteed Exposure</th>
              <th>Active Loans Supported</th>
              <th>Max Liability Limit</th>
              <th>Risk Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let g of stateService.guarantors()">
              <td><strong>{{ g.id }}</strong></td>
              <td>{{ g.name }}</td>
              <td>{{ g.phone }}</td>
              <td>{{ g.employerName }}</td>
              <td><strong class="text-danger">$ {{ g.totalGuaranteedAmount | number:'1.2-2' }}</strong></td>
              <td>{{ g.activeLoansGuaranteedCount }}</td>
              <td>$ {{ g.maxExposureLimit | number:'1.2-2' }}</td>
              <td>
                <span class="chip-status" [class]="g.totalGuaranteedAmount > g.maxExposureLimit ? 'status-rejected' : 'status-approved'">
                  {{ g.totalGuaranteedAmount > g.maxExposureLimit ? 'Over-Exposed' : 'Safe' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- REGISTER GUARANTOR MODAL -->
      <div class="modal-overlay" *ngIf="showRegisterModal()" (click)="showRegisterModal.set(false)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Register New Loan Guarantor</h3>
          <p class="section-desc">Create a guarantor folder for underwriting co-signatures.</p>

          <form (submit)="submitGuarantor(); $event.preventDefault()">
            <div class="form-group">
              <label>Full Name *</label>
              <input type="text" class="form-control" [(ngModel)]="gName" name="gname" required />
            </div>

            <div class="grid-container cols-2">
              <div class="form-group">
                <label>Phone Number *</label>
                <input type="text" class="form-control" [(ngModel)]="gPhone" name="gphone" required />
              </div>
              <div class="form-group">
                <label>Employer / Company Name</label>
                <input type="text" class="form-control" [(ngModel)]="gEmployer" name="gemp" />
              </div>
            </div>

            <div class="form-group">
              <label>Maximum Allowed Exposure Limit ($) *</label>
              <input type="number" class="form-control" [(ngModel)]="gLimit" name="glimit" required />
            </div>

            <div class="btn-group mt-4">
              <button type="button" class="btn-secondary" (click)="showRegisterModal.set(false)">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="!gName || !gPhone || gLimit <= 0">
                Register Guarantor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .guarantors-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-actions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 10px;
      h2 { font-size: 20px; font-family: 'Outfit', sans-serif; }
    }

    .section-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    .btn-group {
      display: flex;
      gap: 12px;
      button { flex: 1; justify-content: center; }
    }
  `]
})
export class GuarantorsComponent {
  stateService = inject(StateService);

  showRegisterModal = signal<boolean>(false);

  // Form State
  gName = '';
  gPhone = '';
  gEmployer = '';
  gLimit = 5000;

  submitGuarantor() {
    if (!this.gName || !this.gPhone || this.gLimit <= 0) return;

    this.stateService.guarantors.update(prev => [
      ...prev,
      {
        id: `G-${Date.now().toString().slice(-4)}`,
        name: this.gName,
        phone: this.gPhone,
        employerName: this.gEmployer || 'Self-Employed',
        totalGuaranteedAmount: 0,
        activeLoansGuaranteedCount: 0,
        maxExposureLimit: this.gLimit
      }
    ]);

    this.stateService.addAuditLog(`Registered new guarantor: ${this.gName}`);

    // Reset Form
    this.gName = '';
    this.gPhone = '';
    this.gEmployer = '';
    this.gLimit = 5000;
    this.showRegisterModal.set(false);
  }
}
