import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Projects } from './projects';
import { DEFAULT_PROJECTS } from '../../core/data/defaults';
import { Api } from '../../core/services/api';
import { I18n } from '../../core/services/i18n';
import { Toast } from '../../core/services/toast';

describe('Projects component', () => {
  let fixture: ComponentFixture<Projects>;
  let component: Projects;
  let apiMock: {
    getProjects: ReturnType<typeof vi.fn>;
  };
  let toastMock: {
    bad: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    apiMock = {
      getProjects: vi.fn(),
    };
    toastMock = {
      bad: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Projects],
      providers: [
        { provide: Api, useValue: apiMock },
        { provide: Toast, useValue: toastMock },
        I18n,
      ],
    }).compileComponents();
  });

  it('loads and renders projects from the API', () => {
    const mockList = [
      { id: 1, name: 'Project Alpha', description: 'Alpha Desc', category: 'Web' },
      { id: 2, name: 'Project Beta', description: 'Beta Desc', category: 'Mobile' },
    ];
    apiMock.getProjects.mockReturnValue(of(mockList));

    fixture = TestBed.createComponent(Projects);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['loading']()).toBe(false);
    expect(component['items']().length).toBe(2);
    expect(component['items']()[0].name).toBe('Project Alpha');
  });

  it('falls back to DEFAULT_PROJECTS when API call fails in public mode', () => {
    apiMock.getProjects.mockReturnValue(throwError(() => new Error('Server offline')));

    fixture = TestBed.createComponent(Projects);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['loading']()).toBe(false);
    expect(component['items']().length).toBe(DEFAULT_PROJECTS.length);
  });
});
