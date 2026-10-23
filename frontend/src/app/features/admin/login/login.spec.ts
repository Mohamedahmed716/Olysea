import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { Auth } from '../../../core/services/auth';

describe('Login component', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let authMock: {
    check: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    authMock = {
      check: vi.fn().mockReturnValue(of(false)),
      login: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: authMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockReturnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('redirects to /admin immediately if user is already authenticated', () => {
    authMock.check.mockReturnValue(of(true));
    TestBed.createComponent(Login);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin');
  });

  it('rejects invalid email formats without calling login API', () => {
    component['form'].setValue({ email: 'bad-email', password: 'SecretPassword123', remember: false });

    component['submit']();

    expect(authMock.login).not.toHaveBeenCalled();
    expect(component['message']()).toBe('Enter a valid admin email address.');
  });

  it('rejects empty password without calling login API', () => {
    component['form'].setValue({ email: 'admin@olysea.tech', password: '', remember: false });

    component['submit']();

    expect(authMock.login).not.toHaveBeenCalled();
    expect(component['message']()).toBe('Enter your password to continue.');
  });

  it('performs login and navigates to admin dashboard on success', () => {
    authMock.login.mockReturnValue(of({ success: true, redirect: '/admin' }));
    component['form'].setValue({ email: 'admin@olysea.tech', password: 'AdminPassword123!', remember: true });

    component['submit']();

    expect(authMock.login).toHaveBeenCalledWith({
      email: 'admin@olysea.tech',
      password: 'AdminPassword123!',
      remember: true,
    });
    expect(component['ok']()).toBe(true);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin');
  });

  it('displays error message when credentials are invalid (401)', () => {
    authMock.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401, error: { message: 'Unauthorized' } }))
    );
    component['form'].setValue({ email: 'admin@olysea.tech', password: 'WrongPassword', remember: false });

    component['submit']();

    expect(component['ok']()).toBe(false);
    expect(component['message']()).toBe('That email or password doesn’t match. Please try again.');
    expect(component['form'].controls.password.value).toBe('');
  });

  it('displays connection error message on network failure (status 0)', () => {
    authMock.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 0, error: 'Network Error' }))
    );
    component['form'].setValue({ email: 'admin@olysea.tech', password: 'Password123!', remember: false });

    component['submit']();

    expect(component['ok']()).toBe(false);
    expect(component['message']()).toBe('Could not connect to the sign-in service. Check that the server is running.');
  });
});
