import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StateService, Customer, Transaction } from '../../../core/services/state.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',})
export class CustomerProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  stateService = inject(StateService);

  customerId = signal<string>('');
  newComplianceNote = '';

  // Modal Signals
  showKycModal = signal(false);
  modalPhone = '';
  modalAddress = '';
  modalOccupation = '';
  modalDocName = '';

  customer = computed(() => {
    const id = this.customerId();
    return this.stateService.customers().find(c => c.id === id);
  });

  customerTxns = computed(() => {
    const id = this.customerId();
    return this.stateService.transactions().filter(t => t.customerId === id);
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.customerId.set(id);
      }
    });
  }

  hasComplianceAccess(): boolean {
    const role = this.stateService.currentUser()?.role;
    return role === 'Compliance Officer' || role === 'Branch Manager' || role === 'System Admin';
  }

  canFlagCustomer(): boolean {
    const role = this.stateService.currentUser()?.role;
    return role === 'Compliance Officer' || role === 'Branch Manager' || role === 'System Admin';
  }

  canUnflagCustomer(): boolean {
    const role = this.stateService.currentUser()?.role;
    return role === 'Compliance Officer' || role === 'System Admin';
  }

  canVerifyDocs(): boolean {
    const role = this.stateService.currentUser()?.role;
    return role === 'Compliance Officer' || role === 'Branch Manager' || role === 'System Admin';
  }

  flagCustomer() {
    const reason = prompt('Specify the reason for AML flagging:');
    if (reason) {
      const id = this.customerId();
      this.stateService.customers.update(prev => prev.map(c => {
        if (c.id === id) {
          this.stateService.addAuditLog(`Flagged customer profile: ${id} - Reason: ${reason}`);
          return {
            ...c,
            kycStatus: 'Flagged',
            notes: `AML Flagged: ${reason}. \n${c.notes || ''}`,
            timeline: [
              { date: new Date().toISOString().split('T')[0], title: 'AML Profile Flagged', desc: `Reason: ${reason}`, icon: 'alert-triangle' },
              ...c.timeline
            ]
          };
        }
        return c;
      }));
      alert('Customer profile flagged. Transactions temporarily locked.');
    }
  }

  unflagCustomer() {
    const confirmUnflag = confirm('Clear AML compliance flag and mark customer profile as Verified?');
    if (confirmUnflag) {
      const id = this.customerId();
      this.stateService.customers.update(prev => prev.map(c => {
        if (c.id === id) {
          this.stateService.addAuditLog(`Cleared compliance flag for: ${id}`);
          return {
            ...c,
            kycStatus: 'Verified',
            timeline: [
              { date: new Date().toISOString().split('T')[0], title: 'AML Flag Lifted', desc: 'Profile cleared by Compliance Officer', icon: 'shield' },
              ...c.timeline
            ]
          };
        }
        return c;
      }));
      alert('AML flag cleared successfully.');
    }
  }

  verifyDocument(docType: string, status: 'Verified' | 'Rejected') {
    const id = this.customerId();
    this.stateService.customers.update(prev => prev.map(c => {
      if (c.id === id) {
        const updatedDocs = c.documents.map(d => d.type === docType ? { ...d, status } : d);
        
        // Auto check if all are verified, then set KYC Verified
        const allVerified = updatedDocs.every(d => d.status === 'Verified');
        const kycStatus = allVerified ? 'Verified' : 'Pending';

        this.stateService.addAuditLog(`Document ${docType} marked ${status} for customer ${id}`);

        return {
          ...c,
          documents: updatedDocs,
          kycStatus,
          timeline: [
            { date: new Date().toISOString().split('T')[0], title: `Document ${status}`, desc: `${docType} verified by staff.`, icon: 'file-text' },
            ...c.timeline
          ]
        };
      }
      return c;
    }));
  }

  appendComplianceNote() {
    if (!this.newComplianceNote.trim()) return;
    const id = this.customerId();
    this.stateService.customers.update(prev => prev.map(c => {
      if (c.id === id) {
        this.stateService.addAuditLog(`Added compliance note to customer ${id}`);
        return {
          ...c,
          notes: `${new Date().toLocaleDateString()}: ${this.newComplianceNote}\n${c.notes || ''}`
        };
      }
      return c;
    }));
    this.newComplianceNote = '';
    alert('Compliance log updated.');
  }

  toggleKycModal() {
    const c = this.customer();
    if (c) {
      this.modalPhone = c.phone;
      this.modalAddress = c.address;
      this.modalOccupation = c.occupation;
      this.modalDocName = '';
    }
    this.showKycModal.update(v => !v);
  }

  saveKycUpdate() {
    const id = this.customerId();
    this.stateService.customers.update(prev => prev.map(c => {
      if (c.id === id) {
        const docs = [...c.documents];
        if (this.modalDocName.trim()) {
          docs.push({
            type: 'Supplemental ID',
            url: this.modalDocName,
            status: 'Pending'
          });
        }

        this.stateService.addAuditLog(`Updated profile details for customer ${id}`);
        return {
          ...c,
          phone: this.modalPhone,
          address: this.modalAddress,
          occupation: this.modalOccupation,
          documents: docs,
          kycStatus: 'Pending', // Back to pending if new document uploaded
          timeline: [
            { date: new Date().toISOString().split('T')[0], title: 'KYC Info Updated', desc: 'Updated address/phone details and uploaded documents.', icon: 'refresh' },
            ...c.timeline
          ]
        };
      }
      return c;
    }));
    this.showKycModal.set(false);
    alert('KYC details updated. Awaiting verification.');
  }
}
