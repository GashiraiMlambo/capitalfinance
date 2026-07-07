import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StateService, Customer } from '../../core/services/state.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',})
export class CustomersComponent implements OnInit {
  stateService = inject(StateService);
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);

  activeTab = signal<'list' | 'register'>('list');
  wizardStep = signal<number>(1);
  selectedCustomer = signal<Customer | null>(null);
  drawerTab = signal<'profile' | 'kyc' | 'notes' | 'timeline'>('profile');

  // Directory search/filters
  searchQuery = '';
  filterKyc = 'ALL';
  sortField = 'name';

  // Forms & Uploads
  personalForm!: FormGroup;
  isFormAutosaving = signal<boolean>(false);
  uploadedFiles = signal<{ name: string; size: string }[]>([]);
  
  // Note Form
  newNoteContent = '';

  ngOnInit() {
    this.initForm();

    // Check for query parameters (e.g. global search routing)
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
        this.setTab('list');
      }
    });

    // Check for auto-saved draft on initialization
    const draft = localStorage.getItem('customer-registration-draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        this.personalForm.patchValue(parsed);
      } catch (e) {
        // ignore draft parse error
      }
    }
  }

  initForm() {
    this.personalForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      gender: ['', Validators.required],
      dob: ['', Validators.required],
      idType: ['National ID', Validators.required],
      idNumber: ['', Validators.required],
      branchId: ['BR-101', Validators.required],
      address: ['', Validators.required]
    });
  }

  setTab(tab: 'list' | 'register') {
    this.activeTab.set(tab);
    if (tab === 'register') {
      this.wizardStep.set(1);
    }
  }

  goToStep(step: number) {
    this.wizardStep.set(step);
  }

  triggerAutoSave() {
    this.isFormAutosaving.set(true);
    localStorage.setItem('customer-registration-draft', JSON.stringify(personalFormValue(this.personalForm)));
    setTimeout(() => {
      this.isFormAutosaving.set(false);
    }, 1000);
  }

  onFileUploaded(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newFile = {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      };
      this.uploadedFiles.update(prev => [...prev, newFile]);
      this.triggerAutoSave();
    }
  }

  removeUploadedFile(name: string) {
    this.uploadedFiles.update(prev => prev.filter(f => f.name !== name));
    this.triggerAutoSave();
  }

  submitCustomer() {
    const formVals = this.personalForm.value;
    const documents = this.uploadedFiles().map(f => ({
      type: f.name.toLowerCase().includes('passport') ? 'Passport Scan' : 'ID Card Scan',
      url: f.name,
      status: 'Pending' as const
    }));

    const registered = this.stateService.registerCustomer({
      name: formVals.name,
      email: formVals.email,
      phone: formVals.phone,
      address: formVals.address,
      idType: formVals.idType,
      idNumber: formVals.idNumber,
      kycStatus: 'Pending', // All new registrations must be verified by Risk
      gender: formVals.gender,
      dob: formVals.dob,
      branchId: formVals.branchId,
      documents: documents,
      notes: [],
      timeline: [
        { date: new Date().toISOString().split('T')[0], title: 'Registered Customer', desc: 'Customer folder initialized', icon: 'user' }
      ]
    });

    // Clear Draft
    localStorage.removeItem('customer-registration-draft');
    this.personalForm.reset({ idType: 'National ID', branchId: 'BR-101' });
    this.uploadedFiles.set([]);

    // Open newly registered customer folder
    this.setTab('list');
    this.selectCustomer(registered);
  }

  // Directory computing
  filteredCustomers = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    const status = this.filterKyc;
    const sort = this.sortField;
    let list = [...this.stateService.customers()];

    // filter by search
    if (query) {
      list = list.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.id.toLowerCase().includes(query) || 
        c.idNumber.toLowerCase().includes(query) || 
        c.email.toLowerCase().includes(query)
      );
    }

    // filter by kyc
    if (status !== 'ALL') {
      list = list.filter(c => c.kycStatus === status);
    }

    // sorting
    list.sort((a, b) => {
      if (sort === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sort === 'date') {
        return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
      } else if (sort === 'balance') {
        return b.savingsBalance - a.savingsBalance;
      }
      return 0;
    });

    return list;
  });

  selectCustomer(cust: Customer) {
    this.selectedCustomer.set(cust);
    this.drawerTab.set('profile');
    this.newNoteContent = '';
  }

  closeCustomerDetails() {
    this.selectedCustomer.set(null);
  }

  addCustomerNote() {
    const cust = this.selectedCustomer();
    if (!cust || !this.newNoteContent.trim()) return;

    const newNote = {
      date: new Date().toISOString().split('T')[0],
      author: this.stateService.currentUser()?.name || 'Staff',
      content: this.newNoteContent
    };

    // Mutate state in service
    this.stateService.customers.update(custs => {
      return custs.map(c => {
        if (c.id === cust.id) {
          return {
            ...c,
            notes: [newNote, ...c.notes]
          };
        }
        return c;
      });
    });

    // Update locally selected customer to refresh UI
    this.selectedCustomer.update(c => {
      if (!c) return null;
      return {
        ...c,
        notes: [newNote, ...c.notes]
      };
    });

    this.stateService.addAuditLog(`Added customer note for ${cust.name}`);
    this.newNoteContent = '';
  }
}

// Helper function to safely read form details for saving
function personalFormValue(form: FormGroup) {
  return {
    name: form.value.name,
    email: form.value.email,
    phone: form.value.phone,
    gender: form.value.gender,
    dob: form.value.dob,
    idType: form.value.idType,
    idNumber: form.value.idNumber,
    branchId: form.value.branchId,
    address: form.value.address
  };
}
