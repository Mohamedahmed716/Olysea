import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Auth } from '../services/auth';
import { csrfInterceptor } from './csrf-interceptor';

describe('csrfInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let authMock: {
    expire: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authMock = {
      expire: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([csrfInterceptor])),
        provideHttpClientTesting(),
        { provide: Auth, useValue: authMock },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);

    // Clear document cookies before each test
    document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/';
  });

  afterEach(() => {
    httpTesting.verify();
    document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/';
  });

  it('passes non-api requests unchanged without withCredentials', () => {
    httpClient.get('/assets/i18n/en.json').subscribe();

    const req = httpTesting.expectOne('/assets/i18n/en.json');
    expect(req.request.withCredentials).toBe(false);
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
    req.flush({});
  });

  it('attaches withCredentials to GET /api requests without CSRF token header', () => {
    document.cookie = 'XSRF-TOKEN=test-csrf-token; path=/';

    httpClient.get('/api/projects').subscribe();

    const req = httpTesting.expectOne('/api/projects');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
    req.flush([]);
  });

  it('attaches X-XSRF-TOKEN header to unsafe POST requests when cookie is present', () => {
    document.cookie = 'XSRF-TOKEN=secret-csrf-1234; path=/';

    httpClient.post('/api/contact', { name: 'Test' }).subscribe();

    const req = httpTesting.expectOne('/api/contact');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('secret-csrf-1234');
    req.flush({ success: true });
  });

  it('calls auth.expire() when protected admin endpoint returns 401', () => {
    httpClient.get('/api/admin/services').subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(401);
      },
    });

    const req = httpTesting.expectOne('/api/admin/services');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authMock.expire).toHaveBeenCalledTimes(1);
  });

  it('does not call auth.expire() on 401 from /api/admin/login', () => {
    httpClient.post('/api/admin/login', { email: 'bad@login.com' }).subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(401);
      },
    });

    const req = httpTesting.expectOne('/api/admin/login');
    req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });

    expect(authMock.expire).not.toHaveBeenCalled();
  });
});
