import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Api } from './api';

describe('Api service', () => {
  let service: Api;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        Api,
      ],
    });

    service = TestBed.inject(Api);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('getServices sends GET request to /api/services', () => {
    service.getServices().subscribe((res) => {
      expect(res).toEqual([{ id: 1, title: 'Web App', description: 'Custom App' }]);
    });

    const req = httpTesting.expectOne('/api/services');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, title: 'Web App', description: 'Custom App' }]);
  });

  it('getProjects sends GET request to /api/projects', () => {
    service.getProjects().subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].name).toBe('Olysea Platform');
    });

    const req = httpTesting.expectOne('/api/projects');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'Olysea Platform', description: 'Platform' }]);
  });

  it('sendContact sends POST request to /api/contact', () => {
    const payload = {
      name: 'Mohamed',
      email: 'm@example.com',
      type: 'General',
      message: 'Hello Olysea team.',
    };

    service.sendContact(payload).subscribe();

    const req = httpTesting.expectOne('/api/contact');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });

  it('login sends POST request to /api/admin/login', () => {
    service.login({ email: 'admin@olysea.tech', password: 'secret', remember: true }).subscribe((res) => {
      expect(res.success).toBe(true);
    });

    const req = httpTesting.expectOne('/api/admin/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'admin@olysea.tech', password: 'secret', remember: true });
    req.flush({ success: true });
  });

  it('logout sends POST request to /api/admin/logout', () => {
    service.logout().subscribe();

    const req = httpTesting.expectOne('/api/admin/logout');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('me sends GET request to /api/admin/me', () => {
    service.me().subscribe((user) => {
      expect(user.email).toBe('admin@olysea.tech');
    });

    const req = httpTesting.expectOne('/api/admin/me');
    expect(req.request.method).toBe('GET');
    req.flush({ email: 'admin@olysea.tech' });
  });

  it('adminServices sends GET request to /api/admin/services', () => {
    service.adminServices().subscribe((res) => {
      expect(res.length).toBe(1);
    });

    const req = httpTesting.expectOne('/api/admin/services');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 2, title: 'UI/UX', description: 'Design' }]);
  });

  it('createService sends POST request with service input', () => {
    const input = { title: 'Mobile Dev', description: 'Flutter apps' };
    service.createService(input).subscribe((res) => {
      expect(res.id).toBe(10);
    });

    const req = httpTesting.expectOne('/api/admin/services');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input);
    req.flush({ id: 10, ...input });
  });

  it('updateService sends PUT request to /api/admin/services/:id', () => {
    const input = { title: 'Updated Title', description: 'Updated Desc' };
    service.updateService(5, input).subscribe();

    const req = httpTesting.expectOne('/api/admin/services/5');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(input);
    req.flush({ id: 5, ...input });
  });

  it('deleteService sends DELETE request to /api/admin/services/:id', () => {
    service.deleteService(5).subscribe();

    const req = httpTesting.expectOne('/api/admin/services/5');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('adminProjects sends GET request to /api/admin/projects', () => {
    service.adminProjects().subscribe((res) => {
      expect(res.length).toBe(2);
    });

    const req = httpTesting.expectOne('/api/admin/projects');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }, { id: 2 }]);
  });

  it('createProject sends POST request with project input', () => {
    const input = { name: 'New Site', description: 'Description', category: 'Web', url: 'https://example.com' };
    service.createProject(input).subscribe((res) => {
      expect(res.id).toBe(15);
    });

    const req = httpTesting.expectOne('/api/admin/projects');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input);
    req.flush({ id: 15, ...input });
  });

  it('updateProject sends PUT request to /api/admin/projects/:id', () => {
    const input = { name: 'Renamed', description: 'Description', category: 'Web', url: 'https://example.com' };
    service.updateProject(8, input).subscribe();

    const req = httpTesting.expectOne('/api/admin/projects/8');
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 8, ...input });
  });

  it('deleteProject sends DELETE request to /api/admin/projects/:id', () => {
    service.deleteProject(8).subscribe();

    const req = httpTesting.expectOne('/api/admin/projects/8');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('adminContacts sends GET request to /api/admin/contacts', () => {
    service.adminContacts().subscribe((res) => {
      expect(res.length).toBe(1);
    });

    const req = httpTesting.expectOne('/api/admin/contacts');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 20, name: 'Alice', email: 'alice@example.com' }]);
  });

  it('setContactStatus sends PATCH request to update status', () => {
    service.setContactStatus(20, 'READ').subscribe();

    const req = httpTesting.expectOne('/api/admin/contacts/20');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'READ' });
    req.flush({ id: 20, status: 'READ' });
  });

  it('deleteContact sends DELETE request to /api/admin/contacts/:id', () => {
    service.deleteContact(20).subscribe();

    const req = httpTesting.expectOne('/api/admin/contacts/20');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
