import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StateService } from '../../core/services/state.service';

interface FeatureRecord {
  id: string;
  reference: string;
  name: string;
  category: string;
  type: string;
  amount?: number;
  currency?: string;
  status: 'Completed' | 'Pending' | 'Flagged' | 'Active' | 'Verified';
  date: string;
  details: string;
}

@Component({
  selector: 'app-generic-feature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="feature-page-container anim-fade-in">
      <!-- HEADER -->
      <div class="feature-header card-banking">
        <div class="header-left">
          <div class="badge-tag">{{ categoryTitle() }}</div>
          <h2>{{ pageTitle() }}</h2>
          <p class="subtitle">{{ pageDescription() }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="refreshData()">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Refresh
          </button>
          <button class="btn-secondary" (click)="exportReport('CSV')">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Export CSV
          </button>
          <button *ngIf="!isReadOnly()" class="btn-primary" (click)="openNewRecordModal()">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            New Action
          </button>
          <span *ngIf="isReadOnly()" class="read-only-tag">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Read-Only Report
          </span>
        </div>
      </div>

      <!-- METRICS GRID -->
      <div class="grid-container cols-4 mt-4">
        <div class="card-banking metric-card">
          <div class="metric-icon primary">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          </div>
          <div class="metric-info">
            <span class="label">Total Records</span>
            <h3 class="value">{{ filteredRecords().length }}</h3>
            <span class="trend positive">+12.4% vs last month</span>
          </div>
        </div>

        <div class="card-banking metric-card">
          <div class="metric-icon success">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div class="metric-info">
            <span class="label">Verified & Active</span>
            <h3 class="value">{{ activeCount() }}</h3>
            <span class="sub-label">98.2% Compliance Rate</span>
          </div>
        </div>

        <div class="card-banking metric-card">
          <div class="metric-icon warning">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div class="metric-info">
            <span class="label">Pending Action</span>
            <h3 class="value">{{ pendingCount() }}</h3>
            <span class="sub-label">Avg response: 14m</span>
          </div>
        </div>

        <div class="card-banking metric-card">
          <div class="metric-icon danger">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <div class="metric-info">
            <span class="label">Flagged / Exceptions</span>
            <h3 class="value">{{ flaggedCount() }}</h3>
            <span class="sub-label">Requires Review</span>
          </div>
        </div>
      </div>

      <!-- FILTER & DATA TABLE -->
      <div class="card-banking table-card mt-4">
        <div class="table-header-controls">
          <div class="search-box">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search reference, name or details..." 
              [value]="searchQuery()" 
              (input)="updateSearch($event)"
            />
          </div>

          <div class="filter-tabs">
            <button [class.active]="selectedFilter() === 'ALL'" (click)="selectedFilter.set('ALL')">All</button>
            <button [class.active]="selectedFilter() === 'Active'" (click)="selectedFilter.set('Active')">Active</button>
            <button [class.active]="selectedFilter() === 'Pending'" (click)="selectedFilter.set('Pending')">Pending</button>
            <button [class.active]="selectedFilter() === 'Flagged'" (click)="selectedFilter.set('Flagged')">Flagged</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table-enterprise">
            <thead>
              <tr>
                <th>Ref ID</th>
                <th>Entity / Subject</th>
                <th>Category</th>
                <th>Details</th>
                <th>Amount / Value</th>
                <th>Status</th>
                <th>Date</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rec of filteredRecords()">
                <td class="font-mono bold-text">{{ rec.reference }}</td>
                <td>
                  <div class="entity-name">{{ rec.name }}</div>
                  <div class="entity-sub">{{ rec.type }}</div>
                </td>
                <td><span class="tag-category">{{ rec.category }}</span></td>
                <td class="text-muted">{{ rec.details }}</td>
                <td>
                  <span *ngIf="rec.amount" class="amount-val">
                    {{ rec.currency || '$' }}{{ rec.amount | number:'1.2-2' }}
                  </span>
                  <span *ngIf="!rec.amount" class="text-muted">N/A</span>
                </td>
                <td>
                  <span class="chip-status" [class]="getStatusClass(rec.status)">
                    {{ rec.status }}
                  </span>
                </td>
                <td class="text-muted">{{ rec.date }}</td>
                <td style="text-align: right;">
                  <button class="btn-text-action" (click)="viewDetails(rec)">
                    {{ isReadOnly() ? 'View Details' : 'View' }}
                  </button>
                  <button *ngIf="!isReadOnly()" class="btn-text-action" (click)="processRecord(rec)">
                    Manage
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredRecords().length === 0">
                <td colspan="8">
                  <div class="empty-state">
                    <p>No matching records found for "{{ searchQuery() }}"</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL -->
      <div class="modal-overlay" *ngIf="showModal()">
        <div class="modal-content">
          <h3>{{ isReadOnly() ? ('Report Record: ' + (activeModalRecord?.reference || 'N/A')) : (activeModalRecord ? 'Manage Record: ' + activeModalRecord.reference : 'New System Entry') }}</h3>
          <p class="text-muted mb-4">
            {{ isReadOnly() ? 'Official read-only financial audit record. Report entries cannot be modified.' : 'Perform workflow updates, compliance verification, or status overrides.' }}
          </p>
          
          <div class="form-group" *ngIf="activeModalRecord">
            <label>Entity / Customer Name</label>
            <input type="text" class="form-control" [value]="activeModalRecord.name" readonly />
          </div>

          <div class="form-group">
            <label>Action Notes / Justification</label>
            <textarea class="form-control" rows="3" [(ngModel)]="modalNotes" [readonly]="isReadOnly()" [placeholder]="isReadOnly() ? 'Read-only report details' : 'Enter auditor or operator remarks...'"></textarea>
          </div>

          <div class="form-group">
            <label>Status</label>
            <div *ngIf="isReadOnly()">
              <input type="text" class="form-control" [value]="modalStatus" readonly />
            </div>
            <select *ngIf="!isReadOnly()" class="form-control" [(ngModel)]="modalStatus">
              <option value="Verified">Verified & Approved</option>
              <option value="Pending">Pending Audit</option>
              <option value="Flagged">Flag Exception</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div class="modal-actions mt-4">
            <button class="btn-secondary" (click)="closeModal()">{{ isReadOnly() ? 'Close' : 'Cancel' }}</button>
            <button *ngIf="!isReadOnly()" class="btn-primary" (click)="saveModalChanges()">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .feature-page-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .feature-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding: 24px;
      
      .badge-tag {
        display: inline-block;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--primary);
        background: var(--primary-light);
        padding: 4px 10px;
        border-radius: 9999px;
        margin-bottom: 6px;
      }

      h2 {
        font-size: 22px;
        margin-bottom: 4px;
      }

      .subtitle {
        color: var(--text-muted);
        font-size: 13px;
      }

      .header-actions {
        display: flex;
        gap: 10px;
      }
    }

    .metric-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;

      .metric-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;

        &.primary { background: var(--primary-light); color: var(--primary); }
        &.success { background: var(--success-light); color: var(--success); }
        &.warning { background: var(--warning-light); color: var(--warning); }
        &.danger { background: var(--danger-light); color: var(--danger); }
      }

      .metric-info {
        display: flex;
        flex-direction: column;

        .label {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .value {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-main);
          margin: 2px 0;
        }

        .trend {
          font-size: 11px;
          font-weight: 600;
          &.positive { color: var(--success); }
        }

        .sub-label {
          font-size: 11px;
          color: var(--text-muted);
        }
      }
    }

    .table-card {
      padding: 0;
      overflow: hidden;

      .table-header-controls {
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        border-bottom: 1px solid var(--border-light);

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          width: 320px;
          max-width: 100%;

          svg {
            position: absolute;
            left: 12px;
            color: var(--text-muted);
          }

          input {
            width: 100%;
            padding: 8px 12px 8px 36px;
            background: var(--bg-base);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            font-size: 13px;
            color: var(--text-main);
            outline: none;

            &:focus {
              border-color: var(--primary);
            }
          }
        }

        .filter-tabs {
          display: flex;
          gap: 6px;

          button {
            background: transparent;
            border: 1px solid var(--border-light);
            color: var(--text-muted);
            padding: 6px 14px;
            border-radius: var(--radius-md);
            font-size: 12.5px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              background: var(--border-light);
              color: var(--text-main);
            }

            &.active {
              background: var(--primary);
              color: white;
              border-color: var(--primary);
            }
          }
        }
      }
    }

    .font-mono {
      font-family: monospace;
      font-weight: 600;
    }

    .bold-text {
      color: var(--primary);
    }

    .entity-name {
      font-weight: 600;
      color: var(--text-main);
    }

    .entity-sub {
      font-size: 11px;
      color: var(--text-muted);
    }

    .tag-category {
      background: var(--border-light);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
    }

    .amount-val {
      font-weight: 700;
      color: var(--text-main);
    }

    .read-only-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: var(--warning-light);
      color: var(--warning);
      border: 1px solid rgba(217, 119, 6, 0.25);
      border-radius: var(--radius-md);
      font-size: 12.5px;
      font-weight: 600;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .mt-4 { margin-top: 16px; }
    .mb-4 { margin-bottom: 16px; }
  `]
})
export class GenericFeatureComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  stateService = inject(StateService);

  categoryTitle = signal<string>('SYSTEM MODULE');
  pageTitle = signal<string>('Feature Management');
  pageDescription = signal<string>('Real-time operational monitoring and management portal.');

  searchQuery = signal<string>('');
  selectedFilter = signal<string>('ALL');

  records = signal<FeatureRecord[]>([]);

  showModal = signal<boolean>(false);
  activeModalRecord: FeatureRecord | null = null;
  modalNotes: string = '';
  modalStatus: 'Completed' | 'Pending' | 'Flagged' | 'Active' | 'Verified' = 'Verified';

  isReportPage = computed(() => {
    const cat = (this.categoryTitle() || '').toUpperCase();
    const title = (this.pageTitle() || '').toLowerCase();
    const url = (this.router.url || '').toLowerCase();
    return cat === 'REPORTS' || title.includes('report') || title.includes('summary') || title.includes('ledger') || url.includes('/reports');
  });

  isTeller = computed(() => {
    return this.stateService.currentUser()?.role === 'Teller';
  });

  isReadOnly = computed(() => {
    // Reports are strictly read-only / non-editable across the board (especially for tellers)
    return this.isReportPage();
  });

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data['title']) this.pageTitle.set(data['title']);
      if (data['category']) this.categoryTitle.set(data['category']);
      if (data['description']) this.pageDescription.set(data['description']);
      this.generateMockRecords(this.pageTitle());
    });
  }

  updateSearch(event: any) {
    this.searchQuery.set(event.target.value);
  }

  filteredRecords = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const filter = this.selectedFilter();
    let list = this.records();

    if (filter !== 'ALL') {
      list = list.filter(r => r.status === filter);
    }

    if (q) {
      list = list.filter(r =>
        r.reference.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.details.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }
    return list;
  });

  activeCount = computed(() => this.records().filter(r => r.status === 'Active' || r.status === 'Verified' || r.status === 'Completed').length);
  pendingCount = computed(() => this.records().filter(r => r.status === 'Pending').length);
  flaggedCount = computed(() => this.records().filter(r => r.status === 'Flagged').length);

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
      case 'Verified':
      case 'Active':
        return 'status-approved';
      case 'Pending':
        return 'status-pending';
      case 'Flagged':
        return 'status-rejected';
      default:
        return 'status-info';
    }
  }

  refreshData() {
    this.generateMockRecords(this.pageTitle());
    this.stateService.showToast('Data view updated successfully', 'info');
  }

  exportReport(format: string) {
    this.stateService.addAuditLog(`Exported report for ${this.pageTitle()} in ${format} format`);
    this.stateService.showToast(`Exported ${this.pageTitle()} as ${format}`, 'success');
  }

  openNewRecordModal() {
    this.activeModalRecord = null;
    this.modalNotes = '';
    this.modalStatus = 'Verified';
    this.showModal.set(true);
  }

  viewDetails(rec: FeatureRecord) {
    this.activeModalRecord = rec;
    this.modalNotes = `Inspection note for ${rec.reference}`;
    this.modalStatus = rec.status;
    this.showModal.set(true);
  }

  processRecord(rec: FeatureRecord) {
    this.activeModalRecord = rec;
    this.modalNotes = `Processing queue request for ${rec.name}`;
    this.modalStatus = 'Verified';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveModalChanges() {
    if (this.activeModalRecord) {
      const targetId = this.activeModalRecord.id;
      this.records.update(prev => prev.map(r => r.id === targetId ? { ...r, status: this.modalStatus } : r));
      this.stateService.addAuditLog(`Updated record ${this.activeModalRecord.reference} to ${this.modalStatus}`);
      this.stateService.showToast(`Record ${this.activeModalRecord.reference} updated to ${this.modalStatus}`, 'success');
    } else {
      const newRec: FeatureRecord = {
        id: 'REC-' + Math.floor(Math.random() * 90000 + 10000),
        reference: 'REF-' + Math.floor(Math.random() * 900000 + 100000),
        name: 'New Custom Entry',
        category: this.categoryTitle(),
        type: 'Manual Registration',
        amount: 250.00,
        currency: 'USD',
        status: this.modalStatus,
        date: new Date().toLocaleDateString(),
        details: this.modalNotes || 'Created via admin quick-action interface'
      };
      this.records.update(prev => [newRec, ...prev]);
      this.stateService.addAuditLog(`Created new record ${newRec.reference} in ${this.pageTitle()}`);
      this.stateService.showToast(`New record ${newRec.reference} created successfully`, 'success');
    }
    this.showModal.set(false);
  }

  private generateMockRecords(title: string) {
    const mockData: FeatureRecord[] = [
      {
        id: '1',
        reference: 'REF-884912',
        name: 'Tendai Mutasa',
        category: 'Personal Account',
        type: 'Individual',
        amount: 1450.00,
        currency: 'USD',
        status: 'Verified',
        date: '2026-08-14',
        details: 'Standard KYC identity verified against national DB'
      },
      {
        id: '2',
        reference: 'REF-992314',
        name: 'Harare Central Logistics Ltd',
        category: 'Corporate Entity',
        type: 'Business Account',
        amount: 12500.00,
        currency: 'USD',
        status: 'Active',
        date: '2026-08-14',
        details: 'High-volume commercial remittance corridor'
      },
      {
        id: '3',
        reference: 'REF-341908',
        name: 'Farai Chiwenga',
        category: 'Mobile Money Gateway',
        type: 'EcoCash Transfer',
        amount: 320.00,
        currency: 'USD',
        status: 'Pending',
        date: '2026-08-13',
        details: 'Awaiting mobile money API webhook settlement'
      },
      {
        id: '4',
        reference: 'REF-119283',
        name: 'Kudzai Moyo',
        category: 'Compliance Review',
        type: 'Sanctions Check',
        amount: 4900.00,
        currency: 'USD',
        status: 'Flagged',
        date: '2026-08-12',
        details: 'Automated AML threshold alert - potential PEP match'
      },
      {
        id: '5',
        reference: 'REF-559102',
        name: 'Mukuru Exchange Gateway',
        category: 'Partner Network',
        type: 'Integration Hub',
        amount: 45000.00,
        currency: 'USD',
        status: 'Completed',
        date: '2026-08-11',
        details: 'Batch settlement successfully reconciled'
      }
    ];

    this.records.set(mockData);
  }
}
