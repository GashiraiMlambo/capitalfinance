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

  // Global Admin Bypass (except for Customer Portal)
  if (role === 'Branch Manager') {
    if (url.includes('/portal/')) {
      return failRedirect(role, router);
    }
    return true;
  }

  // 1. Teller Routes: /teller/**
  if (url.includes('/teller/dashboard')) {
    if (role === 'Teller') {
      return true;
    }
    return failRedirect(role, router);
  }

  if (url.includes('/teller/exchange/new')) {
    if (role === 'Teller') {
      return true;
    }
    return failRedirect(role, router);
  }

  if (url.includes('/teller/remittance/new')) {
    if (role === 'Teller') {
      return true;
    }
    return failRedirect(role, router);
  }

  if (url.includes('/teller/transaction') && url.includes('/receipt')) {
    if (role === 'Teller' || role === 'Compliance Officer') {
      return true;
    }
    return failRedirect(role, router);
  }

  if (url.includes('/teller/customers')) {
    if (role === 'Teller' || role === 'Compliance Officer') {
      return true;
    }
    return failRedirect(role, router);
  }

  // 2. Onboarding Routes: /onboarding/new
  if (url.includes('/onboarding/new')) {
    if (role === 'Teller') {
      return true;
    }
    return failRedirect(role, router);
  }

  // 3. Branch Routes: /branch/**
  if (url.includes('/branch/dashboard')) {
    if (role === 'Compliance Officer') {
      return true;
    }
    return failRedirect(role, router);
  }

  if (url.includes('/branch/transactions') && url.includes('/review')) {
    if (role === 'Compliance Officer') {
      return true;
    }
    return failRedirect(role, router);
  }

  if (url.includes('/branch/rates')) {
    if (role === 'Teller') {
      return true;
    }
    return failRedirect(role, router);
  }

  // 4. Compliance Routes: /compliance/**
  if (url.includes('/compliance/')) {
    if (role === 'Compliance Officer') {
      return true;
    }
    return failRedirect(role, router);
  }

  // 5. Customer Self-Service: /portal/**
  if (url.includes('/portal/')) {
    const permittedRoles = ['Teller', 'Compliance Officer', 'Branch Manager'];
    if (permittedRoles.includes(role)) {
      return true;
    }
    return failRedirect(role, router);
  }

  // 6. Admin Routes: /admin/**
  if (url.includes('/admin/')) {
    if (role === 'Branch Manager') {
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
    case 'Compliance Officer':
      router.navigate(['/compliance/dashboard']);
      break;
    case 'Branch Manager':
      router.navigate(['/admin/dashboard']);
      break;
    default:
      router.navigate(['/auth/login']);
  }
  return false;
}
