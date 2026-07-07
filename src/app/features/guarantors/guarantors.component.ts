import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-guarantors',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './guarantors.component.html',
  styleUrl: './guarantors.component.scss',})
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
