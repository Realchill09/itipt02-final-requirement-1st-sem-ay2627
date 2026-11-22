
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { Auth } from '../services/auth';

// Protect routes that require a login or administrator access.
export const authGuard: CanActivateFn = (route, state) => {

  const auth = inject(Auth);
  const router = inject(Router);

  return auth.checkSession().pipe(
    map(isLoggedIn => {
      if (!isLoggedIn) {
        return router.createUrlTree(['/login']);
      }

      if (route.data['adminOnly'] && !auth.isAdmin()) {
        return router.createUrlTree(['/home']);
      }

      return true;
    })
  );
};