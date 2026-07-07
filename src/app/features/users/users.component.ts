import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, User } from '../../core/services/state.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',})
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
