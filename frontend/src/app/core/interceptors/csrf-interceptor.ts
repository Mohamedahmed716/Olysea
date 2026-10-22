import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * - Sends the session cookie with every /api call.
 * - Copies Spring Security's XSRF-TOKEN cookie into the X-XSRF-TOKEN header on state-changing requests.
 * - Clears the local session when an admin call comes back 401.
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) return next(req);

  const auth = inject(Auth);
  const unsafe = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  const token = unsafe ? readCookie('XSRF-TOKEN') : null;

  const cloned = req.clone({
    withCredentials: true,
    setHeaders: token ? { 'X-XSRF-TOKEN': token } : {},
  });

  return next(cloned).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && req.url.includes('/admin/') && !req.url.endsWith('/admin/login')) {
        auth.expire();
      }
      return throwError(() => err);
    }),
  );
};
