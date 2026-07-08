import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  stateService = inject(StateService);
  router = inject(Router);

  onboardForm!: FormGroup;
  isOnline = signal<boolean>(true);

  // Stepper state
  activeStep = signal<number>(1);

  // Vetting signals
  isVetting = signal<boolean>(false);
  vetStep = signal<number>(1);

  // Local drafts list
  localDrafts = signal<LocalOnboardingDraft[]>([]);

  ngOnInit() {
    this.onboardForm = this.fb.group({
      // Step 1: Personal Details
      title: ['Mr'],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      gender: ['Male'],
      dob: ['', Validators.required],
      race: ['African'],
      countryOfBirth: ['Zimbabwe'],
      nationality: ['Zimbabwean', Validators.required],
      citizenship: ['Zimbabwean'],
      maritalStatus: ['Single'],
      maidenName: [''],
      phone: ['', Validators.required],
      otherPhone: [''],
      email: [''],
      isUsPersonFatca: [false],
      residentialAddress: ['', Validators.required],
      postalAddressSame: [true],
      postalAddress: [''],
      commPreference: ['SMS'],
      nextOfKinName: [''],
      nextOfKinRel: [''],
      nextOfKinPhone: [''],
      nextOfKinAddress: [''],
      nationalId: ['', Validators.required],

      // Step 2: Employment Details
      employmentStatus: ['Employed'],
      jobTitle: [''],
      industry: [''],
      employer: [''],
      employerAddress: [''],
      grossIncome: [''],
      netIncome: [''],
      currency: ['USD'],
      sourceOfFunds: this.fb.array([this.fb.control('Salary')]),

      // Step 3: Documents Upload
      passportPhotoName: [''],
      passportPhotoLater: [false],
      idPassportName: [''],
      idPassportLater: [false],
      proofResName: [''],
      proofResLater: [false],
      specimenSigName: [''],
      specimenSigLater: [false],
      foreignStatementName: [''],
      foreignStatementLater: [false],
      proofIncomeName: [''],
      proofIncomeLater: [false],
      marriageCertName: [''],
      marriageCertLater: [false],
      usFatcaName: [''],
      usFatcaLater: [false],
      highRiskDeclName: [''],
      highRiskDeclLater: [false],
      optionalFilesName: [''],

      // Screening
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

  // Stepper navigation
  nextStep() {
    if (this.activeStep() < 3) {
      this.activeStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.activeStep() > 1) {
      this.activeStep.update(s => s - 1);
    }
  }

  // Dynamic sources of funds FormArray getters & setters
  get sourceOfFundsArray() {
    return this.onboardForm.get('sourceOfFunds') as FormArray;
  }

  addSourceOfFunds(value = '') {
    this.sourceOfFundsArray.push(this.fb.control(value));
  }

  removeSourceOfFunds(index: number) {
    if (this.sourceOfFundsArray.length > 1) {
      this.sourceOfFundsArray.removeAt(index);
    }
  }

  onFileSelected(event: any, controlName: string) {
    const file = event.target.files?.[0];
    if (file) {
      this.onboardForm.get(controlName)?.setValue(file.name);
    }
  }

  submitOnboarding() {
    // Note: User requested that we allow navigation/submit even if fields are empty, 
    // so we don't guard submission with this.onboardForm.invalid.
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
    const name = `${formVal.firstName || ''} ${formVal.middleName ? formVal.middleName + ' ' : ''}${formVal.lastName || ''}`.trim() || 'Unnamed Customer';

    // Check PEP screening rules
    let kycStatus: 'Verified' | 'Flagged' | 'Pending' = 'Verified';
    let notes = 'Regulatory registry checks succeeded.';

    if (name.toLowerCase().includes('kofi')) {
      kycStatus = 'Flagged';
      notes = 'Sanctions screening match: Customer flagged due to Name match on AML database.';
    } else if (!formVal.pepCheck) {
      kycStatus = 'Pending';
      notes = 'Awaiting PEP checklist validation.';
    }

    // Build the documents list for stateService
    const documents: { type: string; url: string; status: 'Verified' | 'Pending' | 'Rejected' }[] = [];
    if (formVal.passportPhotoName || formVal.passportPhotoLater) {
      documents.push({ type: 'Passport Photo', url: formVal.passportPhotoLater ? 'Upload Later' : (formVal.passportPhotoName || ''), status: formVal.passportPhotoLater ? 'Pending' : 'Verified' });
    }
    if (formVal.idPassportName || formVal.idPassportLater) {
      documents.push({ type: 'National ID Scan', url: formVal.idPassportLater ? 'Upload Later' : (formVal.idPassportName || ''), status: formVal.idPassportLater ? 'Pending' : 'Verified' });
    }
    if (formVal.proofResName || formVal.proofResLater) {
      documents.push({ type: 'Proof of Residence', url: formVal.proofResLater ? 'Upload Later' : (formVal.proofResName || ''), status: formVal.proofResLater ? 'Pending' : 'Verified' });
    }
    if (formVal.specimenSigName || formVal.specimenSigLater) {
      documents.push({ type: 'Specimen Signature', url: formVal.specimenSigLater ? 'Upload Later' : (formVal.specimenSigName || ''), status: formVal.specimenSigLater ? 'Pending' : 'Verified' });
    }

    const onboardObj = {
      name,
      nationality: formVal.nationality || 'Zimbabwean',
      nationalId: formVal.nationalId || 'N/A',
      phone: formVal.phone || 'N/A',
      email: formVal.email || undefined,
      address: formVal.residentialAddress || 'N/A',
      dob: formVal.dob || 'N/A',
      occupation: formVal.jobTitle || 'N/A',
      kycStatus,
      documents,
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
    const formVal = this.onboardForm.value;
    const name = `${formVal.firstName || ''} ${formVal.lastName || ''}`.trim() || 'Anonymous';
    const draftId = `DRF-ONB-${Date.now()}`;
    const newDraft: LocalOnboardingDraft = {
      id: draftId,
      name,
      nationalId: formVal.nationalId || 'N/A',
      timestamp: new Date().toISOString(),
      formData: formVal
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
    
    // Clear and rebuild sourceOfFunds FormArray
    const sourceArray = this.onboardForm.get('sourceOfFunds') as FormArray;
    sourceArray.clear();
    if (fields.sourceOfFunds && Array.isArray(fields.sourceOfFunds)) {
      fields.sourceOfFunds.forEach((val: string) => {
        sourceArray.push(this.fb.control(val));
      });
    } else {
      sourceArray.push(this.fb.control('Salary'));
    }

    this.onboardForm.patchValue(fields);
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
      const name = `${fields.firstName || ''} ${fields.lastName || ''}`.trim() || 'Anonymous';
      
      let kycStatus: 'Verified' | 'Flagged' | 'Pending' = 'Verified';
      let notes = 'Synced automatically from offline cache.';
      if (name.toLowerCase().includes('kofi')) {
        kycStatus = 'Flagged';
        notes = 'Flagged during offline sync - potential watch list match.';
      }

      const onboardObj = {
        name,
        nationality: fields.nationality || 'Zimbabwean',
        nationalId: fields.nationalId || 'N/A',
        phone: fields.phone || 'N/A',
        email: fields.email || undefined,
        address: fields.residentialAddress || 'N/A',
        dob: fields.dob || 'N/A',
        occupation: fields.jobTitle || 'N/A',
        kycStatus,
        documents: [
          { type: 'National ID Scan', url: fields.idPassportName || 'id.png', status: (fields.idPassportLater ? 'Pending' : 'Verified') as 'Pending' | 'Verified' | 'Rejected' },
          { type: 'Proof of Residence', url: fields.proofResName || 'bill.pdf', status: (fields.proofResLater ? 'Pending' : 'Verified') as 'Pending' | 'Verified' | 'Rejected' }
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
