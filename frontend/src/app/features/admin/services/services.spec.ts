import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminServices } from './services';
import { Service } from '../../../core/models/service.model';
import { Api } from '../../../core/services/api';
import { Toast } from '../../../core/services/toast';

describe('AdminServices component', () => {
  let fixture: ComponentFixture<AdminServices>;
  let component: AdminServices;
  let apiMock: {
    adminServices: ReturnType<typeof vi.fn>;
    createService: ReturnType<typeof vi.fn>;
    updateService: ReturnType<typeof vi.fn>;
    deleteService: ReturnType<typeof vi.fn>;
  };
  let toastMock: {
    ok: ReturnType<typeof vi.fn>;
    bad: ReturnType<typeof vi.fn>;
  };

  const initialServices: Service[] = [
    { id: 1, title: 'Web Development', description: 'Modern responsive websites and web applications' },
    { id: 2, title: 'Mobile Apps', description: 'Cross-platform mobile applications for iOS and Android' },
  ];

  beforeEach(async () => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();

    apiMock = {
      adminServices: vi.fn().mockReturnValue(of(initialServices)),
      createService: vi.fn(),
      updateService: vi.fn(),
      deleteService: vi.fn(),
    };
    toastMock = {
      ok: vi.fn(),
      bad: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AdminServices],
      providers: [
        { provide: Api, useValue: apiMock },
        { provide: Toast, useValue: toastMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminServices);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads services on initialization', () => {
    expect(component['loading']()).toBe(false);
    expect(component['items']().length).toBe(2);
    expect(component['items']()[0].title).toBe('Web Development');
  });

  it('handles service loading error', () => {
    apiMock.adminServices.mockReturnValue(throwError(() => new Error('Error')));
    const newFixture = TestBed.createComponent(AdminServices);
    const newComp = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComp['failed']()).toBe(true);
    expect(newComp['loading']()).toBe(false);
  });

  it('saves a new service when form is valid', () => {
    const createdService: Service = {
      id: 3,
      title: 'UI/UX Design',
      description: 'User interface and experience design services',
    };
    apiMock.createService.mockReturnValue(of(createdService));

    component['form'].setValue({
      title: 'UI/UX Design',
      description: 'User interface and experience design services',
      extra: '',
      titleAr: '',
      descriptionAr: '',
      extraAr: '',
    });

    component['save']();

    expect(apiMock.createService).toHaveBeenCalled();
    expect(component['items']().length).toBe(3);
    expect(toastMock.ok).toHaveBeenCalled();
  });

  it('updates an existing service when editing is set', () => {
    const updated: Service = {
      id: 1,
      title: 'Advanced Web Development',
      description: 'Modern responsive full-stack websites and web applications',
    };
    apiMock.updateService.mockReturnValue(of(updated));

    component['editing'].set(initialServices[0]);
    component['form'].setValue({
      title: 'Advanced Web Development',
      description: 'Modern responsive full-stack websites and web applications',
      extra: '',
      titleAr: '',
      descriptionAr: '',
      extraAr: '',
    });

    component['save']();

    expect(apiMock.updateService).toHaveBeenCalledWith(1, {
      title: 'Advanced Web Development',
      description: 'Modern responsive full-stack websites and web applications',
      extra: null,
      titleAr: null,
      descriptionAr: null,
      extraAr: null,
    });
    expect(component['items']().find((s) => s.id === 1)?.title).toBe('Advanced Web Development');
    expect(toastMock.ok).toHaveBeenCalled();
  });

  it('deletes a service via confirmDelete()', () => {
    apiMock.deleteService.mockReturnValue(of({}));
    component['toDelete'].set(initialServices[0]);

    component['confirmDelete']();

    expect(apiMock.deleteService).toHaveBeenCalledWith(1);
    expect(component['items']().length).toBe(1);
    expect(component['items']().find((s) => s.id === 1)).toBeUndefined();
    expect(toastMock.ok).toHaveBeenCalled();
  });
});
