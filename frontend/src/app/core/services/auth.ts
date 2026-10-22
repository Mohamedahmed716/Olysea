import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { AdminUser, LoginRequest, LoginResponse } from '../models/admin-user.model';
import { Api } from './api';

/** Session state. The session itself is a server-side cookie; this only mirrors "who am I". */
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly api = inject(Api);
  private readonly router = inject(Router);

  readonly user = signal<AdminUser | null>(null);
  readonly isLoggedIn = computed(() => this.user() !== null);
  private checked = false;

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.api.login(body).pipe(
      tap((res) => {
        if (res?.success) {
          this.user.set(res.user ?? { email: body.email });
          this.checked = true;
        }
      }),
    );
  }

  /** Asks the server whether the session cookie is still valid (cached after the first check). */
  check(force = false): Observable<boolean> {
    if (this.checked && !force) return of(this.isLoggedIn());
    return this.api.me().pipe(
      tap((u) => this.user.set(u)),
      map(() => true),
      catchError(() => {
        this.user.set(null);
        return of(false);
      }),
      tap(() => (this.checked = true)),
    );
  }

  logout(): void {
    const done = () => {
      this.user.set(null);
      this.checked = true;
      this.router.navigateByUrl('/admin/login');
    };
    this.api.logout().subscribe({ next: done, error: done });
  }

  /** Called by the interceptor when the server answers 401 on an admin call. */
  expire(): void {
    this.user.set(null);
    this.checked = true;
  }
}
