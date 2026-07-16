import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StateService, Customer } from '../../../core/services/state.service';

@Component({
  selector: 'app-compliance-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kyc.component.html',
  styleUrl: './kyc.component.scss'
})
export class KycComponent {
  stateService = inject(StateService);
  private router = inject(Router);

  searchQuery = signal<string>('');

  kycQueue = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    // Filter to customers that are Pending or Flagged
    let list = this.stateService.customers().filter(c => c.kycStatus === 'Pending' || c.kycStatus === 'Flagged');

    if (query) {
      list = list.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.idNumber.toLowerCase().includes(query) ||
        c.phone.includes(query)
      );
    }

    return list;
  });

  approveDocument(customerId: string, docType: string) {
    this.stateService.customers.update(prev => prev.map(c => {
      if (c.id === customerId) {
        const updatedDocs = c.documents.map(d => {
          if (d.type === docType) return { ...d, status: 'Verified' as const };
          return d;
        });

        const allApproved = updatedDocs.every(d => d.status === 'Verified');
        const nextKyc = allApproved ? 'Verified' as const : c.kycStatus;

        this.stateService.addAuditLog(`Compliance Officer verified document [${docType}] for customer ID ${customerId}`, 'INFO');
        return { ...c, documents: updatedDocs, kycStatus: nextKyc };
      }
      return c;
    }));
    this.stateService.showToast(`Document ${docType} has been verified.`, 'success');
  }

  rejectDocument(customerId: string, docType: string) {
    this.stateService.customers.update(prev => prev.map(c => {
      if (c.id === customerId) {
        const updatedDocs = c.documents.map(d => {
          if (d.type === docType) return { ...d, status: 'Rejected' as const };
          return d;
        });

        this.stateService.addAuditLog(`Compliance Officer rejected document [${docType}] for customer ID ${customerId}`, 'WARNING');
        return { ...c, documents: updatedDocs, kycStatus: 'Flagged' as const };
      }
      return c;
    }));
    this.stateService.showToast(`Document ${docType} rejected. KYC flagged.`, 'error');
  }

  manuallyVerifyKyc(customerId: string) {
    this.stateService.customers.update(prev => prev.map(c => {
      if (c.id === customerId) {
        // Verify all docs
        const updatedDocs = c.documents.map(d => ({ ...d, status: 'Verified' as const }));
        this.stateService.addAuditLog(`Compliance Officer manually verified KYC for customer ID ${customerId}`, 'INFO');
        return { ...c, documents: updatedDocs, kycStatus: 'Verified' as const };
      }
      return c;
    }));
    this.stateService.showToast('KYC status set to Verified.', 'success');
  }

  viewCustomerProfile(id: string) {
    this.router.navigate([`/compliance/customers/${id}`]);
  }
}
