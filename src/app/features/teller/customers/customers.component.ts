import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StateService, Customer } from '../../../core/services/state.service';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent {
  stateService = inject(StateService);
  private router = inject(Router);

  searchQuery = signal<string>('');
  kycFilter = signal<string>('ALL');

  filteredCustomers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.kycFilter();
    let list = this.stateService.customers();

    if (query) {
      list = list.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.idNumber.toLowerCase().includes(query) ||
        (c.email && c.email.toLowerCase().includes(query))
      );
    }

    if (filter !== 'ALL') {
      list = list.filter(c => c.kycStatus === filter);
    }

    return list;
  });

  viewProfile(id: string) {
    // Navigate to profile page depending on whether the current user is Teller or Compliance
    const userRole = this.stateService.currentUser()?.role;
    if (userRole === 'Compliance Officer') {
      this.router.navigate([`/compliance/customers/${id}`]);
    } else {
      this.router.navigate([`/teller/customers/${id}`]);
    }
  }

  onboardCustomer() {
    this.router.navigate(['/onboarding/new']);
  }
}
