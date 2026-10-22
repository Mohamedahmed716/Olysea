import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { Auth } from '../services/auth';

/** Protects /admin/** and /dashboard. Sends visitors without a valid session to the login page. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  return auth.check().pipe(map((ok) => (ok ? true : router.createUrlTree(['/admin/login']))));
};
