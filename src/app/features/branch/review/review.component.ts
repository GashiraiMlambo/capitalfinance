import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StateService, Transaction } from '../../../core/services/state.service';

@Component({
  selector: 'app-branch-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss',})
export class BranchReviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  stateService = inject(StateService);

  transactionId = signal<string>('');
  reviewNotes = '';

  transaction = computed(() => {
    const id = this.transactionId();
    return this.stateService.transactions().find(t => t.id === id);
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.transactionId.set(id);
      }
    });
  }

  isReadOnly(): boolean {
    const role = this.stateService.currentUser()?.role;
    // Let compliance also review, but if they are simple read-only, block them.
    // In our spec, Compliance can approve sanctions, Manager approves limits.
    // Let's check: if role is Teller or Field Agent or Customer, they are completely blocked (guarded by routes).
    // Let's only allow managers and compliance officers and admins.
    return role !== 'Branch Manager' && role !== 'Compliance Officer' && role !== 'System Admin';
  }

  approveOverride() {
    if (!this.reviewNotes.trim()) return;
    const id = this.transactionId();
    
    this.stateService.approveTransaction(id, this.reviewNotes);
    alert('Transaction approved and released successfully! Redirecting to receipt.');
    
    this.router.navigate([`/teller/transaction/${id}/receipt`]);
  }

  rejectOverride() {
    if (!this.reviewNotes.trim()) return;
    const id = this.transactionId();

    this.stateService.rejectTransaction(id, this.reviewNotes);
    alert('Transaction flagged override rejected. Status set to Failed.');

    this.router.navigate(['/branch/dashboard']);
  }
}
