import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Api } from './api';
import { Auth } from './auth';

describe('Auth service', () => {
  let auth: Auth;
  let apiMock: {
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    me: ReturnType<typeof vi.fn>;
  };
  let routerMock: {
    navigateByUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    apiMock = {
      login: vi.fn(),
      logout: vi.fn(),
      me: vi.fn(),
    };
    routerMock = {
      navigateByUrl: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        Auth,
        { provide: Api, useValue: apiMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    auth = TestBed.inject(Auth);
  });

  it('initially has no user and isLoggedIn is false', () => {
    expect(auth.user()).toBeNull();
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('login sets user signal on successful response', () => {
    apiMock.login.mockReturnValue(of({ success: true, user: { email: 'admin@olysea.tech' } }));

    auth.login({ email: 'admin@olysea.tech', password: 'secret', remember: true }).subscribe();

    expect(auth.user()).toEqual({ email: 'admin@olysea.tech' });
    expect(auth.isLoggedIn()).toBe(true);
  });

  it('check verifies session with server and updates user signal', () => {
    apiMock.me.mockReturnValue(of({ email: 'admin@olysea.tech' }));

    let result: boolean | undefined;
    auth.check().subscribe((res) => (result = res));

    expect(result).toBe(true);
    expect(auth.user()).toEqual({ email: 'admin@olysea.tech' });
    expect(auth.isLoggedIn()).toBe(true);
    expect(apiMock.me).toHaveBeenCalledTimes(1);

    // Second check should use cached status
    auth.check().subscribe();
    expect(apiMock.me).toHaveBeenCalledTimes(1);

    // Force check should re-query api.me()
    auth.check(true).subscribe();
    expect(apiMock.me).toHaveBeenCalledTimes(2);
  });

  it('check handles server error and resets user signal to null', () => {
    apiMock.me.mockReturnValue(throwError(() => new Error('Unauthorized')));

    let result: boolean | undefined;
    auth.check().subscribe((res) => (result = res));

    expect(result).toBe(false);
    expect(auth.user()).toBeNull();
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('logout calls api.logout, clears user signal, and redirects to /admin/login', () => {
    apiMock.logout.mockReturnValue(of({}));
    auth.user.set({ email: 'admin@olysea.tech' });

    auth.logout();

    expect(apiMock.logout).toHaveBeenCalledTimes(1);
    expect(auth.user()).toBeNull();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/admin/login');
  });

  it('expire sets user to null', () => {
    auth.user.set({ email: 'admin@olysea.tech' });
    expect(auth.isLoggedIn()).toBe(true);

    auth.expire();

    expect(auth.user()).toBeNull();
    expect(auth.isLoggedIn()).toBe(false);
  });
});
