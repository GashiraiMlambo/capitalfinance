import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StateService } from '../services/state.service';

export const authGuard: CanActivateFn = (route, state) => {
  const stateService = inject(StateService);
  const router = inject(Router);

  if (stateService.currentUser()) {
    return true;
  }

  // Not logged in, redirect to login page
  router.navigate(['/login']);
  return false;
};
