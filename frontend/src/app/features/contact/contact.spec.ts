import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Contact } from './contact';
import { Api } from '../../core/services/api';
import { I18n } from '../../core/services/i18n';
import { Toast } from '../../core/services/toast';

describe('Contact component', () => {
  let fixture: ComponentFixture<Contact>;
  let component: Contact;
  let apiMock: {
    sendContact: ReturnType<typeof vi.fn>;
  };
  let toastMock: {
    ok: ReturnType<typeof vi.fn>;
    bad: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    apiMock = {
      sendContact: vi.fn(),
    };
    toastMock = {
      ok: vi.fn(),
      bad: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: [
        { provide: Api, useValue: apiMock },
        { provide: Toast, useValue: toastMock },
        I18n,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initializes with an invalid empty form', () => {
    expect(component['form'].valid).toBe(false);
    expect(component['form'].controls.name.value).toBe('');
    expect(component['form'].controls.email.value).toBe('');
    expect(component['form'].controls.type.value).toBe('');
    expect(component['form'].controls.message.value).toBe('');
  });

  it('validates required fields and email format', () => {
    const { name, email, type, message } = component['form'].controls;

    name.setValue('   ');
    expect(name.invalid).toBe(true);
    name.setValue('Mohamed');
    expect(name.valid).toBe(true);

    email.setValue('invalid-email');
    expect(email.invalid).toBe(true);
    email.setValue('test@example.com');
    expect(email.valid).toBe(true);

    type.setValue('');
    expect(type.invalid).toBe(true);
    component['selectType']('web');
    expect(type.value).toBe('web');
    expect(type.valid).toBe(true);

    message.setValue('short');
    expect(message.invalid).toBe(true);
    message.setValue('This is a sufficiently long message for contact enquiry.');
    expect(message.valid).toBe(true);

    expect(component['form'].valid).toBe(true);
  });

  it('does not send API request when form is submitted invalid', () => {
    component['submit']();

    expect(apiMock.sendContact).not.toHaveBeenCalled();
    expect(component['form'].controls.name.touched).toBe(true);
    expect(component['form'].controls.email.touched).toBe(true);
  });

  it('silently ignores submission when honeypot website field is populated', () => {
    component['form'].setValue({
      name: 'Bot Spammer',
      email: 'spammer@example.com',
      business: 'Spam Co',
      type: 'web',
      message: 'This is spam message exceeding 10 characters',
      website: 'http://spam.com',
    });

    component['submit']();

    expect(apiMock.sendContact).not.toHaveBeenCalled();
  });

  it('submits valid form to API and resets form upon success', () => {
    apiMock.sendContact.mockReturnValue(of({ success: true }));

    component['form'].setValue({
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      business: 'Cyberdyne',
      type: 'mobile',
      message: 'Looking for a reliable mobile solution for our team.',
      website: '',
    });

    component['submit']();

    expect(apiMock.sendContact).toHaveBeenCalledWith({
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      business: 'Cyberdyne',
      type: 'mobile',
      message: 'Looking for a reliable mobile solution for our team.',
      website: '',
    });

    expect(component['form'].controls.name.value).toBe('');
    expect(toastMock.ok).toHaveBeenCalled();
  });

  it('handles API submission failure by displaying error toast', () => {
    apiMock.sendContact.mockReturnValue(throwError(() => new Error('Server error')));

    component['form'].setValue({
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      business: '',
      type: 'web',
      message: 'Looking for a reliable web solution for our team.',
      website: '',
    });

    component['submit']();

    expect(apiMock.sendContact).toHaveBeenCalled();
    expect(component['statusOk']()).toBe(false);
    expect(toastMock.bad).toHaveBeenCalled();
  });
});
