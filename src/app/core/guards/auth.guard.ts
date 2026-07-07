import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StateService } from '../services/state.service';

export const authGuard: CanActivateFn = (route, state) => {
  const stateService = inject(StateService);
  const router = inject(Router);
  const user = stateService.currentUser();

  if (!user) {
    // Not logged in, redirect to login page
    router.navigate(['/auth/login']);
    return false;
  }

  const role = user.role;
  const url = state.url;

  // Global Admin Bypass (except for Customer Portal home unless previewing)
  if (role === 'System Admin') {
    return true;
  }

  // 1. Teller Routes: /teller/**
  if (url.includes('/teller/dashboard')) {
    if (role === 'Teller' || role === 'Branch Manager') {
      return true;
    }
    return failRedirect(role, router);
  }

  if (url.includes('/teller/exchange/new')) {
    if (role === 'Teller' || role === 'Branch Manager') {
      return true;
    }
    return failRedirect(role, router);
  }

  if (url.includes('/teller/remittance/new')) {
    if (role === 'Teller' || role === 'Branch Manager' || role === 'Field Agent') {
      return true;
    }
    return failRedirect(role, router);
  }

  if (url.includes('/teller/transaction') && url.includes('/receipt')) {
    // Receipt page is read-only or full access for teller, manager, agent, customer (if own)
    if (role === 'Teller' || role === 'Branch Manager' || role === 'Field Agent' || role === 'Compliance Officer' || role === 'Customer (Self-Service)') {
      return true;
    }
    return failRedirect(role, router);
  }

  if (url.includes('/teller/customers/')) {
    if (role === 'Teller' || role === 'Branch Manager' || role === 'Compliance Officer' || role === 'Field Agent' || role === 'Customer (Self-Service)') {
      return true;
    }
    return failRedirect(role, router);
  }

  // 2. Onboarding Routes: /onboarding/new
  if (url.includes('/onboarding/new')) {
    if (role !== 'Compliance Officer') {
      return true;
    }
    return failRedirect(role, router);
  }

  // 3. Branch Routes: /branch/**
  if (url.includes('/branch/dashboard')) {
    if (role === 'Branch Manager' || role === 'Compliance Officer') {
      return true;
    }
    return failRedirect(role, router);
  }

  if (url.includes('/branch/transactions') && url.includes('/review')) {
    if (role === 'Branch Manager' || role === 'Compliance Officer') {
      return true;
    }
    return failRedirect(role, router);
  }

  if (url.includes('/branch/rates')) {
    if (role === 'Branch Manager' || role === 'Teller') {
      return true;
    }
    return failRedirect(role, router);
  }

  // 4. Compliance Routes: /compliance/**
  if (url.includes('/compliance/dashboard')) {
    if (role === 'Compliance Officer') {
      return true;
    }
    return failRedirect(role, router);
  }

  if (url.includes('/compliance/rbz-reporting')) {
    if (role === 'Compliance Officer' || role === 'Branch Manager') {
      return true;
    }
    return failRedirect(role, router);
  }

  // 5. Customer Self-Service: /portal/**
  if (url.includes('/portal/')) {
    if (role === 'Customer (Self-Service)') {
      return true;
    }
    return failRedirect(role, router);
  }

  // 6. Admin Routes: /admin/**
  if (url.includes('/admin/')) {
    if (role === 'System Admin') {
      return true;
    }
    return failRedirect(role, router);
  }

  return true;
};

function failRedirect(role: string, router: Router): boolean {
  // Direct to default route based on role
  switch (role) {
    case 'Teller':
      router.navigate(['/teller/dashboard']);
      break;
    case 'Branch Manager':
      router.navigate(['/branch/dashboard']);
      break;
    case 'Compliance Officer':
      router.navigate(['/compliance/dashboard']);
      break;
    case 'System Admin':
      router.navigate(['/admin/users']);
      break;
    case 'Field Agent':
      router.navigate(['/onboarding/new']);
      break;
    case 'Customer (Self-Service)':
      router.navigate(['/portal/home']);
      break;
    default:
      router.navigate(['/auth/login']);
  }
  return false;
}
