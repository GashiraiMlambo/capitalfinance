import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StateService, User } from '../../../core/services/state.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',})
export class UserManagementComponent {
  stateService = inject(StateService);
  fb = inject(FormBuilder);

  showModal = signal(false);
  isEditMode = signal(false);
  editingUserId = signal<string | null>(null);

  userForm!: FormGroup;

  constructor() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['Teller', Validators.required],
      branchId: ['BR-101'],
      password: ['']
    });
  }

  openAddUserModal() {
    this.isEditMode.set(false);
    this.editingUserId.set(null);
    this.userForm.reset({
      role: 'Teller',
      branchId: 'BR-101'
    });
    this.userForm.get('password')?.setValidators([Validators.required]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  editUser(u: User) {
    this.isEditMode.set(true);
    this.editingUserId.set(u.id);
    this.userForm.patchValue({
      name: u.name,
      email: u.email,
      role: u.role,
      branchId: u.branchId
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveUser() {
    if (this.userForm.invalid) return;

    const val = this.userForm.value;

    if (this.isEditMode()) {
      const uId = this.editingUserId();
      this.stateService.users.update(list => list.map(u => {
        if (u.id === uId) {
          this.stateService.addAuditLog(`Updated user metadata for: ${uId}`);
          return {
            ...u,
            name: val.name,
            email: val.email,
            role: val.role,
            branchId: val.branchId
          };
        }
        return u;
      }));
      alert('User credentials updated successfully.');
    } else {
      const newId = `USR-${Math.floor(100 + Math.random() * 900)}`;
      const newUser: User = {
        id: newId,
        name: val.name,
        email: val.email,
        role: val.role,
        branchId: val.branchId || undefined,
        active: true
      };
      this.stateService.users.update(list => [...list, newUser]);
      this.stateService.addAuditLog(`Registered new user account: ${newId} (${newUser.role})`);
      alert(`User registered with ID: ${newId}`);
    }

    this.showModal.set(false);
  }

  toggleUserActive(id: string) {
    this.stateService.users.update(list => list.map(u => {
      if (u.id === id) {
        const nextState = !u.active;
        this.stateService.addAuditLog(`${nextState ? 'Activated' : 'Suspended'} user session: ${id}`);
        return { ...u, active: nextState };
      }
      return u;
    }));
  }
}
