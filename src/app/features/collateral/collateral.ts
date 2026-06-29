import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-collateral',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="collateral-wrapper anim-fade-in">
      <div class="page-actions-header">
        <h2>Collateral Valuations & Asset Registries</h2>
        <button class="btn-primary" (click)="showRegisterModal.set(true)">Register Collateral</button>
      </div>

      <!-- Collateral List Table -->
      <div class="table-container mt-4">
        <table class="table-enterprise">
          <thead>
            <tr>
              <th>Asset Code</th>
              <th>Asset Category</th>
              <th>Description</th>
              <th>Estimated Market Value</th>
              <th>Valued By</th>
              <th>Verification Date</th>
              <th>Insurance Status</th>
              <th>Lien Registered</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let col of stateService.collaterals()">
              <td><strong>{{ col.id }}</strong></td>
              <td>
                <span class="chip-status status-info">{{ col.type }}</span>
              </td>
              <td>{{ col.description }}</td>
              <td><strong>$ {{ col.marketValue | number:'1.2-2' }}</strong></td>
              <td>{{ col.valuedBy }}</td>
              <td>{{ col.valuationDate | date:'mediumDate' }}</td>
              <td>
                <span class="chip-status" [class]="col.isInsured ? 'status-approved' : 'status-rejected'">
                  {{ col.isInsured ? 'Insured' : 'Uninsured' }}
                </span>
              </td>
              <td>
                <span class="chip-status" [class]="col.lienRegistered ? 'status-approved' : 'status-pending'">
                  {{ col.lienRegistered ? 'Registered' : 'None' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- REGISTER COLLATERAL MODAL -->
      <div class="modal-overlay" *ngIf="showRegisterModal()" (click)="showRegisterModal.set(false)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Register New Collateral Asset</h3>
          <p class="section-desc">Add asset records used to guarantee credit extensions.</p>

          <form (submit)="submitCollateral(); $event.preventDefault()">
            <div class="form-group">
              <label>Asset Category *</label>
              <select class="form-control" [(ngModel)]="cType" name="ctype" required>
                <option value="Vehicle">Vehicle (Car/Truck)</option>
                <option value="Real Estate">Real Estate (Land/Building)</option>
                <option value="Precious Metals">Precious Metals (Gold/Silver)</option>
                <option value="Business Inventory">Business Stock / Inventory</option>
              </select>
            </div>

            <div class="form-group">
              <label>Asset Description *</label>
              <textarea class="form-control" rows="2" [(ngModel)]="cDescription" name="cdesc" required placeholder="e.g. Toyota Hilux 2018 Registration Plate XYZ-123"></textarea>
            </div>

            <div class="grid-container cols-2">
              <div class="form-group">
                <label>Market Value ($) *</label>
                <input type="number" class="form-control" [(ngModel)]="cValue" name="cval" required />
              </div>
              <div class="form-group">
                <label>Valued By *</label>
                <input type="text" class="form-control" [(ngModel)]="cValuer" name="cvaler" required />
              </div>
            </div>

            <div class="grid-container cols-2 font-medium">
              <div class="form-group mb-0">
                <div class="toggle-group mt-2">
                  <input type="checkbox" [(ngModel)]="cInsured" name="cins" id="cins" />
                  <label for="cins">Asset is Insured</label>
                </div>
              </div>
              <div class="form-group mb-0">
                <div class="toggle-group mt-2">
                  <input type="checkbox" [(ngModel)]="cLien" name="clien" id="clien" />
                  <label for="clien">Register Lien / Legal Title</label>
                </div>
              </div>
            </div>

            <div class="btn-group mt-4">
              <button type="button" class="btn-secondary" (click)="showRegisterModal.set(false)">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="!cType || !cDescription || cValue <= 0 || !cValuer">
                Save Asset Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .collateral-wrapper {
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

    .toggle-group {
      display: flex;
      align-items: center;
      gap: 10px;
      input { width: 16px; height: 16px; }
      label { margin-bottom: 0; cursor: pointer; }
    }
    .mb-0 { margin-bottom: 0; }
  `]
})
export class CollateralComponent {
  stateService = inject(StateService);

  showRegisterModal = signal<boolean>(false);

  // Form State
  cType = 'Vehicle';
  cDescription = '';
  cValue = 0;
  cValuer = '';
  cInsured = true;
  cLien = true;

  submitCollateral() {
    if (!this.cType || !this.cDescription || this.cValue <= 0 || !this.cValuer) return;

    this.stateService.collaterals.update(prev => [
      ...prev,
      {
        id: `COL-${Date.now().toString().slice(-4)}`,
        type: this.cType as any,
        description: this.cDescription,
        marketValue: this.cValue,
        valuedBy: this.cValuer,
        valuationDate: new Date().toISOString().split('T')[0],
        isInsured: this.cInsured,
        lienRegistered: this.cLien
      }
    ]);

    this.stateService.addAuditLog(`Registered collateral valuation entry for ${this.cDescription}`);

    // Reset Form
    this.cType = 'Vehicle';
    this.cDescription = '';
    this.cValue = 0;
    this.cValuer = '';
    this.cInsured = true;
    this.cLien = true;
    this.showRegisterModal.set(false);
  }
}
