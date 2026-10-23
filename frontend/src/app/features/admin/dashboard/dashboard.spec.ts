import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Dashboard } from './dashboard';
import { Api } from '../../../core/services/api';

describe('Admin Dashboard component', () => {
  let fixture: ComponentFixture<Dashboard>;
  let component: Dashboard;
  let apiMock: {
    adminContacts: ReturnType<typeof vi.fn>;
    adminServices: ReturnType<typeof vi.fn>;
    adminProjects: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    apiMock = {
      adminContacts: vi.fn(),
      adminServices: vi.fn(),
      adminProjects: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: Api, useValue: apiMock },
      ],
    }).compileComponents();
  });

  it('loads metrics and computes counts for new contacts', () => {
    const mockContacts = [
      { id: 1, name: 'Alice', email: 'alice@example.com', type: 'web', message: 'Message from Alice', status: 'NEW', createdAt: '2026-10-20T10:00:00Z' },
      { id: 2, name: 'Bob', email: 'bob@example.com', type: 'mobile', message: 'Message from Bob', status: 'READ', createdAt: '2026-10-21T10:00:00Z' },
      { id: 3, name: 'Charlie', email: 'charlie@example.com', type: 'consulting', message: 'Message from Charlie', status: 'NEW', createdAt: '2026-10-22T10:00:00Z' },
    ];
    apiMock.adminContacts.mockReturnValue(of(mockContacts));
    apiMock.adminServices.mockReturnValue(of([{ id: 1 }, { id: 2 }]));
    apiMock.adminProjects.mockReturnValue(of([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]));

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['loading']()).toBe(false);
    expect(component['failed']()).toBe(false);
    expect(component['projectCount']()).toBe(4);
    expect(component['serviceCount']()).toBe(2);
    expect(component['newCount']()).toBe(2);
    expect(component['recent']().length).toBe(3);
    // Recent should be ordered by createdAt descending (Charlie is first)
    expect(component['recent']()[0].name).toBe('Charlie');
  });

  it('handles API errors by setting failed state', () => {
    apiMock.adminContacts.mockReturnValue(throwError(() => new Error('Forbidden')));
    apiMock.adminServices.mockReturnValue(of([]));
    apiMock.adminProjects.mockReturnValue(of([]));

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['loading']()).toBe(false);
    expect(component['failed']()).toBe(true);
  });
});
