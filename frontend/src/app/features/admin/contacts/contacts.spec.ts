import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Contacts } from './contacts';
import { ContactRequest } from '../../../core/models/contact-request.model';
import { Api } from '../../../core/services/api';
import { Toast } from '../../../core/services/toast';

describe('Admin Contacts component', () => {
  let fixture: ComponentFixture<Contacts>;
  let component: Contacts;
  let apiMock: {
    adminContacts: ReturnType<typeof vi.fn>;
    setContactStatus: ReturnType<typeof vi.fn>;
    deleteContact: ReturnType<typeof vi.fn>;
  };
  let toastMock: {
    ok: ReturnType<typeof vi.fn>;
    bad: ReturnType<typeof vi.fn>;
  };

  const initialContacts: ContactRequest[] = [
    { id: 1, name: 'Client A', email: 'a@example.com', type: 'web', message: 'Message A', status: 'NEW', createdAt: '2026-10-20' },
    { id: 2, name: 'Client B', email: 'b@example.com', type: 'mobile', message: 'Message B', status: 'READ', createdAt: '2026-10-21' },
    { id: 3, name: 'Client C', email: 'c@example.com', type: 'consulting', message: 'Message C', status: 'REPLIED', createdAt: '2026-10-22' },
  ];

  beforeEach(async () => {
    apiMock = {
      adminContacts: vi.fn().mockReturnValue(of(initialContacts)),
      setContactStatus: vi.fn().mockReturnValue(of({})),
      deleteContact: vi.fn().mockReturnValue(of({})),
    };
    toastMock = {
      ok: vi.fn(),
      bad: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Contacts],
      providers: [
        { provide: Api, useValue: apiMock },
        { provide: Toast, useValue: toastMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Contacts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads contacts and computes tab counts correctly', () => {
    expect(component['items']().length).toBe(3);
    expect(component['count']('ALL')).toBe(3);
    expect(component['count']('NEW')).toBe(1);
    expect(component['count']('READ')).toBe(1);
    expect(component['count']('REPLIED')).toBe(1);
  });

  it('filters shown contacts according to active filter', () => {
    component['filter'].set('NEW');
    expect(component['shown']().length).toBe(1);
    expect(component['shown']()[0].name).toBe('Client A');

    component['filter'].set('ALL');
    expect(component['shown']().length).toBe(3);
  });

  it('updates contact status via setStatus()', () => {
    const contact = initialContacts[0];
    component['setStatus'](contact, 'ARCHIVED');

    expect(apiMock.setContactStatus).toHaveBeenCalledWith(1, 'ARCHIVED');
    expect(component['items']().find((c) => c.id === 1)?.status).toBe('ARCHIVED');
    expect(toastMock.ok).toHaveBeenCalled();
  });

  it('removes contact via remove()', () => {
    component['pendingDelete'].set(initialContacts[1]);
    component['remove']();

    expect(apiMock.deleteContact).toHaveBeenCalledWith(2);
    expect(component['items']().length).toBe(2);
    expect(component['items']().find((c) => c.id === 2)).toBeUndefined();
    expect(toastMock.ok).toHaveBeenCalled();
  });
});
