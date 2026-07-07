import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-collateral',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './collateral.component.html',
  styleUrl: './collateral.component.scss',})
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
