import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { authGuard } from './auth-guard';
import { Auth } from '../services/auth';

describe('authGuard', () => {
  let authMock: {
    check: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(() => {
    authMock = {
      check: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: authMock },
      ],
    });

    router = TestBed.inject(Router);
  });

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

  it('allows activation when user session is valid', () => {
    authMock.check.mockReturnValue(of(true));

    const result$ = runGuard() as Observable<boolean | UrlTree>;
    result$.subscribe((result: boolean | UrlTree) => {
      expect(result).toBe(true);
    });
  });

  it('redirects to /admin/login when user session is invalid', () => {
    authMock.check.mockReturnValue(of(false));

    const result$ = runGuard() as Observable<boolean | UrlTree>;
    result$.subscribe((result: boolean | UrlTree) => {
      expect(result instanceof UrlTree).toBe(true);
      expect((result as UrlTree).toString()).toBe('/admin/login');
    });
  });
});
