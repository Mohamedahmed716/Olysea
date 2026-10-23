import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Services } from './services';
import { DEFAULT_SERVICES } from '../../core/data/defaults';
import { Api } from '../../core/services/api';
import { I18n } from '../../core/services/i18n';

describe('Services component', () => {
  let fixture: ComponentFixture<Services>;
  let component: Services;
  let apiMock: {
    getServices: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    apiMock = {
      getServices: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Services],
      providers: [
        { provide: Api, useValue: apiMock },
        I18n,
      ],
    }).compileComponents();
  });

  it('loads and stores services from the API', () => {
    const mockServices = [
      { id: 1, title: 'Web App Engineering', description: 'Modern web platforms' },
      { id: 2, title: 'Cloud Infrastructure', description: 'DevOps & AWS' },
    ];
    apiMock.getServices.mockReturnValue(of(mockServices));

    fixture = TestBed.createComponent(Services);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['loading']()).toBe(false);
    expect(component['items']().length).toBe(2);
    expect(component['items']()[0].title).toBe('Web App Engineering');
  });

  it('falls back to DEFAULT_SERVICES when backend fails', () => {
    apiMock.getServices.mockReturnValue(throwError(() => new Error('Service unavailable')));

    fixture = TestBed.createComponent(Services);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['loading']()).toBe(false);
    expect(component['items']().length).toBe(DEFAULT_SERVICES.length);
  });
});
