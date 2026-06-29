import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, User } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="users-wrapper anim-fade-in">
      <div class="page-actions-header">
        <h2>Institutional User Accounts & Role Permissions</h2>
      </div>

      <!-- Users Table -->
      <div class="table-container mt-4">
        <table class="table-enterprise">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Access Group / Role</th>
              <th>Account Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of stateService.users()">
              <td><strong>{{ u.id }}</strong></td>
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td>
                <span class="chip-status status-info">{{ u.role }}</span>
              </td>
              <td><span class="chip-status status-approved">Active</span></td>
              <td>
                <button class="btn-secondary" (click)="openEditRole(u)">Modify Access</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODIFY ACCESS MODAL -->
      <div class="modal-overlay" *ngIf="showEditModal()" (click)="showEditModal.set(false)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Modify Access Permissions</h3>
          <p class="section-desc">Alter the security credentials and access permissions for <strong>{{ selectedUser()?.name }}</strong>.</p>

          <form (submit)="updateUserRole(); $event.preventDefault()">
            <div class="form-group">
              <label>Select Access Role *</label>
              <select class="form-control" [(ngModel)]="newRole" name="role" required>
                <option value="Super Admin">Super Admin (Full Read/Write/Override)</option>
                <option value="Credit Underwriter">Credit Underwriter (Approve/Underwrite credit)</option>
                <option value="Field Collector">Field Collector (Collections tracking only)</option>
              </select>
            </div>

            <div class="btn-group mt-4">
              <button type="button" class="btn-secondary" (click)="showEditModal.set(false)">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="!newRole">
                Update Credentials
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .users-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-actions-header {
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 10px;
      h2 { font-size: 20px; font-family: 'Outfit', sans-serif; }
    }

    .section-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    .btn-group {
      display: flex;
      gap: 12px;
      button { flex: 1; justify-content: center; }
    }
  `]
})
export class UsersComponent {
  stateService = inject(StateService);

  showEditModal = signal<boolean>(false);
  selectedUser = signal<User | null>(null);
  newRole = '';

  openEditRole(user: User) {
    this.selectedUser.set(user);
    this.newRole = user.role;
    this.showEditModal.set(true);
  }

  updateUserRole() {
    const user = this.selectedUser();
    if (!user || !this.newRole) return;

    this.stateService.users.update(list => {
      return list.map(u => {
        if (u.id === user.id) {
          this.stateService.addAuditLog(`Altered user ${u.name} role access to ${this.newRole}`);
          return {
            ...u,
            role: this.newRole as any
          };
        }
        return u;
      });
    });

    this.showEditModal.set(false);
  }
}
