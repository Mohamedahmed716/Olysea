import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminProjects } from './projects';
import { Project } from '../../../core/models/project.model';
import { Api } from '../../../core/services/api';
import { Toast } from '../../../core/services/toast';

describe('AdminProjects component', () => {
  let fixture: ComponentFixture<AdminProjects>;
  let component: AdminProjects;
  let apiMock: {
    adminProjects: ReturnType<typeof vi.fn>;
    createProject: ReturnType<typeof vi.fn>;
    updateProject: ReturnType<typeof vi.fn>;
    deleteProject: ReturnType<typeof vi.fn>;
  };
  let toastMock: {
    ok: ReturnType<typeof vi.fn>;
    bad: ReturnType<typeof vi.fn>;
  };

  const initialProjects: Project[] = [
    { id: 1, name: 'Project Alpha', description: 'Enterprise management platform.', category: 'Web', url: 'https://alpha.example.com', previewKey: 'dental' },
    { id: 2, name: 'Project Beta', description: 'Mobile health tracking application.', category: 'Mobile', url: 'https://beta.example.com', previewKey: 'order' },
  ];

  beforeEach(async () => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();

    apiMock = {
      adminProjects: vi.fn().mockReturnValue(of(initialProjects)),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProject: vi.fn(),
    };
    toastMock = {
      ok: vi.fn(),
      bad: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AdminProjects],
      providers: [
        { provide: Api, useValue: apiMock },
        { provide: Toast, useValue: toastMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProjects);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads projects on initialization', () => {
    expect(component['loading']()).toBe(false);
    expect(component['items']().length).toBe(2);
    expect(component['items']()[0].name).toBe('Project Alpha');
  });

  it('handles project loading failure', () => {
    apiMock.adminProjects.mockReturnValue(throwError(() => new Error('Forbidden')));
    const newFixture = TestBed.createComponent(AdminProjects);
    const newComp = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComp['failed']()).toBe(true);
    expect(newComp['loading']()).toBe(false);
  });

  it('creates a new project when valid with previewKey', () => {
    const created: Project = {
      id: 3,
      name: 'Project Gamma',
      description: 'Analytics dashboard suite.',
      category: 'Analytics',
      url: 'https://gamma.example.com',
      previewKey: 'dental',
    };
    apiMock.createProject.mockReturnValue(of(created));

    component['form'].setValue({
      name: 'Project Gamma',
      description: 'Analytics dashboard suite.',
      category: 'Analytics',
      url: 'https://gamma.example.com',
      previewKey: 'dental',
      categoryAr: '',
      descriptionAr: '',
    });

    component['save']();

    expect(apiMock.createProject).toHaveBeenCalled();
    expect(component['items']().length).toBe(3);
    expect(toastMock.ok).toHaveBeenCalled();
  });

  it('updates an existing project when editing is set', () => {
    const updated: Project = {
      id: 1,
      name: 'Updated Alpha',
      description: 'Updated enterprise management platform.',
      category: 'Web App',
      url: 'https://alpha.example.com',
      previewKey: 'dental',
    };
    apiMock.updateProject.mockReturnValue(of(updated));

    component['editing'].set(initialProjects[0]);
    component['form'].setValue({
      name: 'Updated Alpha',
      description: 'Updated enterprise management platform.',
      category: 'Web App',
      url: 'https://alpha.example.com',
      previewKey: 'dental',
      categoryAr: '',
      descriptionAr: '',
    });

    component['save']();

    expect(apiMock.updateProject).toHaveBeenCalledWith(1, {
      name: 'Updated Alpha',
      description: 'Updated enterprise management platform.',
      category: 'Web App',
      url: 'https://alpha.example.com',
      image: null,
      previewKey: 'dental',
      categoryAr: null,
      descriptionAr: null,
    });
    expect(component['items']().find((p) => p.id === 1)?.name).toBe('Updated Alpha');
    expect(toastMock.ok).toHaveBeenCalled();
  });

  it('deletes a project via confirmDelete()', () => {
    apiMock.deleteProject.mockReturnValue(of({}));
    component['toDelete'].set(initialProjects[0]);

    component['confirmDelete']();

    expect(apiMock.deleteProject).toHaveBeenCalledWith(1);
    expect(component['items']().length).toBe(1);
    expect(component['items']().find((p) => p.id === 1)).toBeUndefined();
    expect(toastMock.ok).toHaveBeenCalled();
  });
});
