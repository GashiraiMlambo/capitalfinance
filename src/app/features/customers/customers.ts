import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StateService, Customer } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="customers-wrapper anim-fade-in">
      <!-- HEADER ACTIONS -->
      <div class="page-actions-header">
        <h2>Customer Management System</h2>
        <div class="tabs-banking">
          <div class="tab-item" [class.active]="activeTab() === 'list'" (click)="setTab('list')">Customer Directory</div>
          <div class="tab-item" [class.active]="activeTab() === 'register'" (click)="setTab('register')">Register New Customer</div>
        </div>
      </div>

      <!-- TAB 1: CUSTOMER DIRECTORY LIST -->
      <div class="tab-content" *ngIf="activeTab() === 'list'">
        <!-- SEARCH & FILTER BAR -->
        <div class="directory-filter-bar card-banking">
          <div class="search-box">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" placeholder="Search by name, ID number, email..." [(ngModel)]="searchQuery" />
          </div>
          
          <div class="filters">
            <select class="form-control" [(ngModel)]="filterKyc">
              <option value="ALL">All KYC Statuses</option>
              <option value="Approved">Approved Only</option>
              <option value="Pending">Pending Only</option>
              <option value="Rejected">Rejected Only</option>
            </select>

            <select class="form-control" [(ngModel)]="sortField">
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Reg Date</option>
              <option value="balance">Sort by Savings Balance</option>
            </select>
          </div>
        </div>

        <!-- ENTERPRISE CUSTOMERS TABLE -->
        <div class="table-container">
          <div class="table-responsive">
            <table class="table-enterprise">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Full Name</th>
                  <th>Contact Info</th>
                  <th>ID Number</th>
                  <th>KYC Status</th>
                  <th>Savings Balance</th>
                  <th>Loan Balance</th>
                  <th>Reg Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cust of filteredCustomers()" (click)="selectCustomer(cust)">
                  <td><strong>{{ cust.id }}</strong></td>
                  <td>
                    <div class="customer-profile-cell">
                      <div class="circle-placeholder">{{ cust.name[0] }}</div>
                      <span>{{ cust.name }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="contact-cell">
                      <span class="phone">{{ cust.phone }}</span>
                      <span class="email">{{ cust.email }}</span>
                    </div>
                  </td>
                  <td>{{ cust.idNumber }} <small class="text-muted">({{ cust.idType }})</small></td>
                  <td>
                    <span class="chip-status" [class]="'status-' + cust.kycStatus.toLowerCase()">
                      {{ cust.kycStatus }}
                    </span>
                  </td>
                  <td><strong>$ {{ cust.savingsBalance | number:'1.2-2' }}</strong></td>
                  <td><strong class="text-danger">$ {{ cust.loanBalance | number:'1.2-2' }}</strong></td>
                  <td>{{ cust.registeredAt | date:'mediumDate' }}</td>
                  <td>
                    <button class="btn-secondary" (click)="selectCustomer(cust); $event.stopPropagation()">
                      View Details
                    </button>
                  </td>
                </tr>
                <tr *ngIf="filteredCustomers().length === 0">
                  <td colspan="9" class="text-center">
                    <div class="empty-state">
                      <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      <p>No customers found matching the parameters</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: STEPPER REGISTRATION WIZARD -->
      <div class="tab-content" *ngIf="activeTab() === 'register'">
        <div class="card-banking stepper-card">
          <!-- Stepper Header -->
          <div class="stepper-header">
            <div class="step-node" [class.step-active]="wizardStep() === 1" [class.step-completed]="wizardStep() > 1" (click)="goToStep(1)">
              <div class="step-circle">1</div>
              <span class="step-label">Personal details</span>
            </div>
            <div class="step-connector" [class.active]="wizardStep() > 1"></div>
            <div class="step-node" [class.step-active]="wizardStep() === 2" [class.step-completed]="wizardStep() > 2" (click)="goToStep(2)">
              <div class="step-circle">2</div>
              <span class="step-label">KYC documents</span>
            </div>
            <div class="step-connector" [class.active]="wizardStep() > 2"></div>
            <div class="step-node" [class.step-active]="wizardStep() === 3" [class.step-completed]="wizardStep() > 3" (click)="goToStep(3)">
              <div class="step-circle">3</div>
              <span class="step-label">Review & Submit</span>
            </div>
          </div>

          <!-- Auto-Save Ticker Indicator -->
          <div class="autosave-ticker" *ngIf="isFormAutosaving()">
            <span class="dot"></span> Saving draft...
          </div>

          <!-- Wizard Step Content -->
          <div class="wizard-step-content">
            <!-- Step 1: Personal Details Form -->
            <form [formGroup]="personalForm" *ngIf="wizardStep() === 1">
              <div class="grid-container cols-2">
                <div class="form-group">
                  <label>Full Name *</label>
                  <input type="text" class="form-control" formControlName="name" placeholder="John Doe" (input)="triggerAutoSave()" />
                  <div class="error-message" *ngIf="personalForm.get('name')?.touched && personalForm.get('name')?.invalid">
                    Name is required
                  </div>
                </div>

                <div class="form-group">
                  <label>Email Address *</label>
                  <input type="email" class="form-control" formControlName="email" placeholder="j.doe@example.com" (input)="triggerAutoSave()" />
                  <div class="error-message" *ngIf="personalForm.get('email')?.touched && personalForm.get('email')?.invalid">
                    Valid email is required
                  </div>
                </div>

                <div class="form-group">
                  <label>Phone Number *</label>
                  <input type="text" class="form-control" formControlName="phone" placeholder="+263 77 123 4567" (input)="triggerAutoSave()" />
                </div>

                <div class="form-group">
                  <label>Gender *</label>
                  <select class="form-control" formControlName="gender" (change)="triggerAutoSave()">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Date of Birth *</label>
                  <input type="date" class="form-control" formControlName="dob" (change)="triggerAutoSave()" />
                </div>

                <div class="form-group">
                  <label>ID Document Type *</label>
                  <select class="form-control" formControlName="idType" (change)="triggerAutoSave()">
                    <option value="National ID">National ID Card</option>
                    <option value="Passport">International Passport</option>
                    <option value="Driver License">Driver's License</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>ID Document Number *</label>
                  <input type="text" class="form-control" formControlName="idNumber" placeholder="e.g. 63-123456-A-45" (input)="triggerAutoSave()" />
                </div>

                <div class="form-group">
                  <label>Branch Assignment *</label>
                  <select class="form-control" formControlName="branchId" (change)="triggerAutoSave()">
                    <option *ngFor="let br of stateService.branches()" [value]="br.id">{{ br.name }}</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Residential / Business Address *</label>
                <textarea class="form-control" formControlName="address" rows="3" placeholder="74 Borrowdale Rd, Harare..." (input)="triggerAutoSave()"></textarea>
              </div>

              <div class="wizard-footer">
                <button type="button" class="btn-primary" [disabled]="personalForm.invalid" (click)="goToStep(2)">
                  Continue to KYC
                </button>
              </div>
            </form>

            <!-- Step 2: KYC Documents Upload -->
            <div class="kyc-upload-container" *ngIf="wizardStep() === 2">
              <p class="section-desc">Please upload verification scans of the registration documents. Supports PDF, JPEG, PNG.</p>
              
              <div class="upload-dropzone">
                <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                <h4>Drag and drop ID Scan files here</h4>
                <p class="text-muted">or click to browse your desktop computer</p>
                <input type="file" class="hidden-file-input" (change)="onFileUploaded($event)" />
              </div>

              <!-- Uploaded files list mockup -->
              <div class="uploaded-files-list">
                <div class="file-item" *ngFor="let f of uploadedFiles()">
                  <div class="file-name">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
                    <span>{{ f.name }}</span>
                  </div>
                  <span class="file-size">{{ f.size }}</span>
                  <button class="btn-text-action text-danger" (click)="removeUploadedFile(f.name)">Remove</button>
                </div>
              </div>

              <div class="wizard-footer">
                <button type="button" class="btn-secondary" (click)="goToStep(1)">Back</button>
                <button type="button" class="btn-primary" (click)="goToStep(3)">Continue to Review</button>
              </div>
            </div>

            <!-- Step 3: Review & Submit -->
            <div class="review-container" *ngIf="wizardStep() === 3">
              <h4>Review Customer Profile Information</h4>
              <div class="divider"></div>
              
              <div class="grid-container cols-2 review-grid">
                <div><span>Name:</span> <strong>{{ personalForm.value.name }}</strong></div>
                <div><span>Email:</span> <strong>{{ personalForm.value.email }}</strong></div>
                <div><span>Phone:</span> <strong>{{ personalForm.value.phone }}</strong></div>
                <div><span>Gender:</span> <strong>{{ personalForm.value.gender }}</strong></div>
                <div><span>Date of Birth:</span> <strong>{{ personalForm.value.dob }}</strong></div>
                <div><span>ID Details:</span> <strong>{{ personalForm.value.idType }} - {{ personalForm.value.idNumber }}</strong></div>
                <div class="full-width"><span>Address:</span> <strong>{{ personalForm.value.address }}</strong></div>
              </div>

              <div class="uploaded-files-review">
                <h5>Uploaded KYC Files:</h5>
                <ul>
                  <li *ngFor="let f of uploadedFiles()">{{ f.name }} ({{ f.size }})</li>
                  <li *ngIf="uploadedFiles().length === 0" class="text-muted">No documents uploaded. Profile KYC status will default to "Pending".</li>
                </ul>
              </div>

              <div class="wizard-footer">
                <button type="button" class="btn-secondary" (click)="goToStep(2)">Back</button>
                <button type="button" class="btn-primary" (click)="submitCustomer()">Complete Registration</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CUSTOMER DETAIL SLIDE-OUT DRAWER -->
      <div class="modal-overlay" *ngIf="selectedCustomer()" (click)="closeCustomerDetails()">
        <div class="drawer-content" (click)="$event.stopPropagation()">
          <div class="drawer-header">
            <h3>Customer Folder</h3>
            <button class="btn-close" (click)="closeCustomerDetails()">&times;</button>
          </div>

          <div class="drawer-body" *ngIf="selectedCustomer() as cust">
            <!-- Summary Banner -->
            <div class="customer-banner">
              <div class="avatar-placeholder">{{ cust.name[0] }}</div>
              <div class="meta">
                <h4>{{ cust.name }}</h4>
                <span>{{ cust.id }} • <span class="chip-status" [class]="'status-' + cust.kycStatus.toLowerCase()">{{ cust.kycStatus }}</span></span>
              </div>
            </div>

            <!-- Balances Widgets -->
            <div class="drawer-section">
              <h5>Financial Portfolio</h5>
              <div class="financial-widgets">
                <div class="widget bg-light">
                  <span class="label">Savings Deposits</span>
                  <span class="value">$ {{ cust.savingsBalance | number:'1.2-2' }}</span>
                </div>
                <div class="widget bg-light">
                  <span class="label">Outstanding Loan</span>
                  <span class="value text-danger">$ {{ cust.loanBalance | number:'1.2-2' }}</span>
                </div>
                <div class="widget bg-light">
                  <span class="label">Wallet Balance</span>
                  <span class="value">$ {{ cust.walletBalance | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>

            <!-- Tab details inside Drawer -->
            <div class="tabs-banking">
              <div class="tab-item" [class.active]="drawerTab() === 'profile'" (click)="drawerTab.set('profile')">Details</div>
              <div class="tab-item" [class.active]="drawerTab() === 'kyc'" (click)="drawerTab.set('kyc')">KYC Docs</div>
              <div class="tab-item" [class.active]="drawerTab() === 'notes'" (click)="drawerTab.set('notes')">Notes ({{ cust.notes.length }})</div>
              <div class="tab-item" [class.active]="drawerTab() === 'timeline'" (click)="drawerTab.set('timeline')">Timeline</div>
            </div>

            <div class="drawer-tab-content">
              <!-- PROFILE DETAILS -->
              <div *ngIf="drawerTab() === 'profile'" class="profile-details-grid">
                <div><span class="lbl">Phone:</span> {{ cust.phone }}</div>
                <div><span class="lbl">Email:</span> {{ cust.email }}</div>
                <div><span class="lbl">ID Card:</span> {{ cust.idType }} ({{ cust.idNumber }})</div>
                <div><span class="lbl">Gender/DOB:</span> {{ cust.gender }} / {{ cust.dob }}</div>
                <div><span class="lbl">Address:</span> {{ cust.address }}</div>
                <div><span class="lbl">Registered At:</span> {{ cust.registeredAt | date:'medium' }}</div>
              </div>

              <!-- KYC DOCS -->
              <div *ngIf="drawerTab() === 'kyc'" class="kyc-docs-list">
                <div class="doc-item" *ngFor="let doc of cust.documents">
                  <div class="doc-info">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
                    <span>{{ doc.type }}</span>
                  </div>
                  <span class="chip-status" [class]="'status-' + doc.status.toLowerCase()">
                    {{ doc.status }}
                  </span>
                </div>
              </div>

              <!-- NOTES -->
              <div *ngIf="drawerTab() === 'notes'" class="notes-container">
                <!-- Add note form -->
                <div class="add-note-box">
                  <textarea class="form-control" placeholder="Write banking note..." rows="2" [(ngModel)]="newNoteContent"></textarea>
                  <button class="btn-primary" (click)="addCustomerNote()">Add Note</button>
                </div>
                <div class="notes-list">
                  <div class="note-item" *ngFor="let note of cust.notes">
                    <div class="note-meta">
                      <span class="author">{{ note.author }}</span>
                      <span class="date">{{ note.date | date:'shortDate' }}</span>
                    </div>
                    <p class="content">{{ note.content }}</p>
                  </div>
                </div>
              </div>

              <!-- TIMELINE -->
              <div *ngIf="drawerTab() === 'timeline'" class="timeline-container">
                <div class="timeline-item" *ngFor="let event of cust.timeline">
                  <div class="time-node"></div>
                  <div class="time-content">
                    <span class="date">{{ event.date | date:'mediumDate' }}</span>
                    <p class="title">{{ event.title }}</p>
                    <p class="desc">{{ event.desc }}</p>
                  </div>
                </div>
                <div class="empty-state" *ngIf="cust.timeline.length === 0">
                  <p>No activity logs recorded yet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .customers-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-actions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 10px;

      h2 { font-size: 20px; font-family: 'Outfit', sans-serif; }
      .tabs-banking { margin-bottom: 0; border: none; }
    }

    .directory-filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding: 16px;
      margin-bottom: 16px;

      .search-box {
        position: relative;
        display: flex;
        align-items: center;
        width: 320px;

        svg { position: absolute; left: 12px; color: var(--text-muted); }
        input {
          width: 100%;
          background: var(--bg-base);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 8px 12px 8px 38px;
          outline: none;
          color: var(--text-main);
          
          &:focus { border-color: var(--primary); }
        }
      }

      .filters {
        display: flex;
        gap: 12px;
        select {
          min-width: 180px;
        }
      }
    }

    // Table profiles
    .customer-profile-cell {
      display: flex;
      align-items: center;
      gap: 10px;

      .circle-placeholder {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--primary-light);
        color: var(--primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 12px;
      }
    }

    .contact-cell {
      display: flex;
      flex-direction: column;
      .email { font-size: 11px; color: var(--text-muted); }
    }

    .text-center { text-align: center; }

    // Stepper Wizard Card
    .stepper-card {
      padding: 30px;
    }

    .autosave-ticker {
      font-size: 12px;
      color: var(--success);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;

      .dot {
        width: 6px;
        height: 6px;
        background: var(--success);
        border-radius: 50%;
        animation: blink 1s infinite alternate;
      }
    }

    @keyframes blink {
      from { opacity: 0.3; }
      to { opacity: 1; }
    }

    .wizard-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      border-top: 1px solid var(--border-light);
      padding-top: 16px;
    }

    // KYC Upload styles
    .upload-dropzone {
      border: 2px dashed var(--border);
      background: var(--bg-base);
      border-radius: var(--radius-lg);
      padding: 40px;
      text-align: center;
      cursor: pointer;
      position: relative;
      transition: border-color 0.2s;

      svg { color: var(--text-muted); margin-bottom: 12px; }

      &:hover {
        border-color: var(--primary);
      }

      .hidden-file-input {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        opacity: 0;
        cursor: pointer;
      }
    }

    .uploaded-files-list {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .file-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--bg-base);
        padding: 8px 16px;
        border-radius: var(--radius-md);

        .file-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .file-size { font-size: 12px; color: var(--text-muted); }
      }
    }

    // Review grid
    .review-grid {
      background: var(--bg-base);
      padding: 20px;
      border-radius: var(--radius-md);
      margin-top: 16px;

      div {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid var(--border);
        padding: 8px 0;
        span { color: var(--text-muted); }
      }

      .full-width {
        grid-column: span 2;
        @media (max-width: 768px) { grid-column: span 1; }
      }
    }

    .uploaded-files-review {
      margin-top: 20px;
      h5 { margin-bottom: 8px; }
      ul { padding-left: 20px; font-size: 13.5px; }
    }

    // Drawer internal details
    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 12px;

      .btn-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--text-muted);
        &:hover { color: var(--text-main); }
      }
    }

    .customer-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid var(--border-light);

      .avatar-placeholder {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--primary-gradient);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 20px;
      }

      .meta {
        h4 { font-size: 16px; }
        span { font-size: 12px; color: var(--text-muted); }
      }
    }

    .financial-widgets {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 10px;

      .widget {
        padding: 10px;
        border-radius: var(--radius-md);
        display: flex;
        flex-direction: column;
        
        .label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; }
        .value { font-size: 13px; font-weight: 700; }
        
        &.bg-light { background: var(--bg-base); }
      }
    }

    .profile-details-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
      font-size: 13.5px;

      .lbl { font-weight: 600; color: var(--text-muted); width: 100px; display: inline-block; }
    }

    .kyc-docs-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .doc-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: var(--bg-base);
        border-radius: var(--radius-md);

        .doc-info { display: flex; align-items: center; gap: 8px; }
      }
    }

    .notes-container {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .add-note-box {
        display: flex;
        flex-direction: column;
        gap: 8px;
        textarea { resize: none; }
      }

      .notes-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 200px;
        overflow-y: auto;

        .note-item {
          background: var(--bg-base);
          padding: 10px;
          border-radius: var(--radius-md);
          
          .note-meta {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: var(--text-muted);
            margin-bottom: 4px;
            .author { font-weight: 600; }
          }
          .content { font-size: 12.5px; }
        }
      }
    }

    .timeline-container {
      position: relative;
      padding-left: 20px;
      border-left: 2px solid var(--border-light);
      display: flex;
      flex-direction: column;
      gap: 20px;

      .timeline-item {
        position: relative;
        
        .time-node {
          position: absolute;
          left: -26px;
          top: 4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--primary);
          border: 2px solid var(--bg-surface);
        }

        .time-content {
          .date { font-size: 10.5px; color: var(--text-muted); }
          .title { font-size: 13px; font-weight: 600; }
          .desc { font-size: 12px; color: var(--text-muted); }
        }
      }
    }
  `]
})
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
      kycStatus: documents.length > 0 ? 'Pending' : 'Approved', // pending review if documents uploaded
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
