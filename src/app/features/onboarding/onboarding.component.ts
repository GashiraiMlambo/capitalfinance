import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StateService } from '../../core/services/state.service';

interface LocalOnboardingDraft {
  id: string;
  name: string;
  nationalId: string;
  timestamp: string;
  formData: any;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',})
export class OnboardingComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  stateService = inject(StateService);
  router = inject(Router);

  onboardForm!: FormGroup;
  isOnline = signal<boolean>(true);

  // Vetting signals
  isVetting = signal<boolean>(false);
  vetStep = signal<number>(1);

  // Local drafts list
  localDrafts = signal<LocalOnboardingDraft[]>([]);

  ngOnInit() {
    this.onboardForm = this.fb.group({
      name: ['', Validators.required],
      nationality: ['Zimbabwean', Validators.required],
      nationalId: ['', Validators.required],
      dob: ['', Validators.required],
      occupation: ['', Validators.required],
      phone: ['', Validators.required],
      email: [''],
      address: ['', Validators.required],
      idDocName: ['national_id.png', Validators.required],
      proofResDocName: ['utility_bill.pdf', Validators.required],
      ofacVerified: [true],
      pepCheck: [true]
    });

    // Detect Online/Offline status
    this.isOnline.set(navigator.onLine);
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    this.loadDraftsFromStorage();
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
  }

  handleOnline() {
    this.isOnline.set(true);
    this.syncLocalDraftsToServer();
  }

  handleOffline() {
    this.isOnline.set(false);
  }

  submitOnboarding() {
    if (this.onboardForm.invalid) return;

    if (!this.isOnline()) {
      this.saveLocalDraft(true);
      alert('Offline. Saved onboarding file to your device and will sync on network restoration.');
      return;
    }

    // Trigger Vetting Simulation (1.5 seconds)
    this.isVetting.set(true);
    this.vetStep.set(1);

    setTimeout(() => {
      this.vetStep.set(2);
      setTimeout(() => {
        this.vetStep.set(3);
        setTimeout(() => {
          this.executeSubmit();
        }, 500);
      }, 500);
    }, 500);
  }

  private executeSubmit() {
    this.isVetting.set(false);
    const formVal = this.onboardForm.value;

    // Check PEP screening rules: if pepCheck is checked and PEP flags are active, or if name contains a flagged pattern
    let kycStatus: 'Verified' | 'Flagged' | 'Pending' = 'Verified';
    let notes = 'Regulatory registry checks succeeded.';

    if (formVal.name.toLowerCase().includes('kofi')) {
      kycStatus = 'Flagged';
      notes = 'Sanctions screening match: Customer flagged due to Name match on AML database.';
    } else if (!formVal.pepCheck) {
      kycStatus = 'Pending';
      notes = 'Awaiting PEP checklist validation.';
    }

    const onboardObj = {
      name: formVal.name,
      nationality: formVal.nationality,
      nationalId: formVal.nationalId,
      phone: formVal.phone,
      email: formVal.email || undefined,
      address: formVal.address,
      dob: formVal.dob,
      occupation: formVal.occupation,
      kycStatus,
      documents: [
        { type: 'National ID Scan', url: formVal.idDocName, status: 'Verified' as const },
        { type: 'Proof of Residence', url: formVal.proofResDocName, status: 'Verified' as const }
      ],
      notes
    };

    const newCust = this.stateService.onboardCustomer(onboardObj);
    alert(`Customer onboarding completed! Status: ${newCust.kycStatus}`);
    
    // Redirect to profile page
    this.router.navigate([`/teller/customers/${newCust.id}`]);
  }

  // LOCAL STORAGE DRAFTS
  loadDraftsFromStorage() {
    const cached = localStorage.getItem('cc_onboarding_drafts');
    if (cached) {
      this.localDrafts.set(JSON.parse(cached));
    }
  }

  saveLocalDraft(silent = false) {
    const name = this.onboardForm.value.name || 'Anonymous';
    const draftId = `DRF-ONB-${Date.now()}`;
    const newDraft: LocalOnboardingDraft = {
      id: draftId,
      name,
      nationalId: this.onboardForm.value.nationalId || 'N/A',
      timestamp: new Date().toISOString(),
      formData: this.onboardForm.value
    };

    this.localDrafts.update(prev => {
      const updated = [newDraft, ...prev];
      localStorage.setItem('cc_onboarding_drafts', JSON.stringify(updated));
      return updated;
    });

    if (!silent) {
      alert('Onboarding profile details saved as local draft.');
    }
  }

  restoreDraft(d: LocalOnboardingDraft) {
    const fields = d.formData;
    this.onboardForm.patchValue({
      name: fields.name,
      nationality: fields.nationality,
      nationalId: fields.nationalId,
      dob: fields.dob,
      occupation: fields.occupation,
      phone: fields.phone,
      email: fields.email,
      address: fields.address,
      idDocName: fields.idDocName,
      proofResDocName: fields.proofResDocName,
      ofacVerified: fields.ofacVerified,
      pepCheck: fields.pepCheck
    });
    this.deleteDraft(d.id);
  }

  deleteDraft(id: string) {
    this.localDrafts.update(prev => {
      const updated = prev.filter(d => d.id !== id);
      localStorage.setItem('cc_onboarding_drafts', JSON.stringify(updated));
      return updated;
    });
  }

  syncLocalDraftsToServer() {
    const drafts = this.localDrafts();
    if (drafts.length === 0) return;

    drafts.forEach(d => {
      const fields = d.formData;
      let kycStatus: 'Verified' | 'Flagged' | 'Pending' = 'Verified';
      let notes = 'Synced automatically from offline cache.';
      if (fields.name.toLowerCase().includes('kofi')) {
        kycStatus = 'Flagged';
        notes = 'Flagged during offline sync - potential watch list match.';
      }

      const onboardObj = {
        name: fields.name,
        nationality: fields.nationality,
        nationalId: fields.nationalId,
        phone: fields.phone,
        email: fields.email || undefined,
        address: fields.address,
        dob: fields.dob,
        occupation: fields.occupation,
        kycStatus,
        documents: [
          { type: 'National ID Scan', url: fields.idDocName || 'id.png', status: 'Verified' as const },
          { type: 'Proof of Residence', url: fields.proofResDocName || 'bill.pdf', status: 'Verified' as const }
        ],
        notes
      };
      this.stateService.onboardCustomer(onboardObj);
    });

    this.localDrafts.set([]);
    localStorage.removeItem('cc_onboarding_drafts');
    this.stateService.addAuditLog(`Synced ${drafts.length} offline customer profiles to server.`);
    alert(`Connection restored! Synchronized ${drafts.length} onboarded profiles to central server.`);
  }
}
