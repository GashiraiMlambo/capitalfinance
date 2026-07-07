import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StateService, ExchangeRate } from '../../../core/services/state.service';

@Component({
  selector: 'app-rate-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './rates.component.html',
  styleUrl: './rates.component.scss',})
export class RateManagementComponent {
  stateService = inject(StateService);
  fb = inject(FormBuilder);

  rateForm!: FormGroup;

  constructor() {
    this.rateForm = this.fb.group({
      pair: ['USD/ZWG', Validators.required],
      proposedBuy: [null, [Validators.required, Validators.min(0.01)]],
      proposedSell: [null, [Validators.required, Validators.min(0.01)]],
      justification: ['', Validators.required]
    });
  }

  canPropose(): boolean {
    const role = this.stateService.currentUser()?.role;
    return role === 'Branch Manager' || role === 'System Admin';
  }

  isAdmin(): boolean {
    const role = this.stateService.currentUser()?.role;
    return role === 'System Admin';
  }

  pendingProposals = computed(() => {
    return this.stateService.rates().filter(r => r.status === 'Pending Approval');
  });

  submitProposal() {
    if (this.rateForm.invalid) return;

    const val = this.rateForm.value;
    this.stateService.proposeRate(val.pair, val.proposedBuy, val.proposedSell, val.justification);
    
    alert(`Rate override proposal submitted for pair ${val.pair}. Awaiting System Admin authorization.`);
    this.rateForm.reset({ pair: 'USD/ZWG' });
  }

  approveRate(pair: string) {
    this.stateService.approveRate(pair);
    alert(`Approved rates for ${pair}. Rate is now live across branch terminals.`);
  }

  rejectRate(pair: string) {
    this.stateService.rejectRate(pair);
    alert(`Proposal for ${pair} rejected.`);
  }
}
