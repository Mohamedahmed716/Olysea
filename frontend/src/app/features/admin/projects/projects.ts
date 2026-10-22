import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DEFAULT_PROJECTS } from '../../../core/data/defaults';
import { PREVIEWS } from '../../../core/data/previews';
import { Project } from '../../../core/models/project.model';
import { Api } from '../../../core/services/api';
import { Toast } from '../../../core/services/toast';
import { URL_PATTERN, fileToJpegDataUrl } from '../../../core/utils/image';
import { Loading } from '../../../shared/components/loading/loading';
import { ProjectPreview } from '../../../shared/components/project-preview/project-preview';

@Component({
  selector: 'app-admin-projects',
  imports: [ReactiveFormsModule, Loading, ProjectPreview],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class AdminProjects {
  private readonly api = inject(Api);
  private readonly toast = inject(Toast);
  private readonly fb = inject(FormBuilder).nonNullable;

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  private readonly delDialog = viewChild<ElementRef<HTMLDialogElement>>('delDialog');

  protected readonly previewKeys = Object.keys(PREVIEWS);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly items = signal<Project[]>([]);
  protected readonly editing = signal<Project | null>(null);
  protected readonly toDelete = signal<Project | null>(null);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly image = signal<string | null>(null);
  protected readonly imageError = signal('');

  protected readonly form = this.fb.group({
    category: ['', Validators.required],
    name: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    url: ['', [Validators.required, Validators.pattern(URL_PATTERN)]],
    previewKey: '',
    categoryAr: '',
    descriptionAr: '',
  });

  constructor() {
    this.reload();
  }

  private reload(): void {
    this.loading.set(true);
    this.api.adminProjects().subscribe({
      next: (l) => { this.items.set(l); this.failed.set(false); this.loading.set(false); },
      error: () => { this.failed.set(true); this.loading.set(false); },
    });
  }

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  protected openForm(p: Project | null): void {
    this.editing.set(p);
    this.submitted.set(false);
    this.imageError.set('');
    this.image.set(p?.image ?? null);
    this.form.reset({
      category: p?.category ?? '', name: p?.name ?? '', description: p?.description ?? '', url: p?.url ?? '',
      previewKey: p?.previewKey ?? '', categoryAr: p?.categoryAr ?? '', descriptionAr: p?.descriptionAr ?? '',
    });
    this.dialog()?.nativeElement.showModal();
  }

  protected closeForm(): void {
    this.dialog()?.nativeElement.close();
  }

  protected async onFile(e: Event): Promise<void> {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.imageError.set('');
    try {
      this.image.set(await fileToJpegDataUrl(file));
    } catch (err) {
      this.imageError.set(err instanceof Error ? err.message : 'Could not use that image.');
    }
  }

  protected clearImage(): void {
    this.image.set(null);
  }

  protected save(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    if (!this.image() && !v.previewKey) {
      this.imageError.set('Add a photo, or pick one of the built-in previews.');
      return;
    }
    const body = {
      category: v.category.trim(), name: v.name.trim(), description: v.description.trim(), url: v.url.trim(),
      image: this.image(), previewKey: v.previewKey || null,
      categoryAr: v.categoryAr.trim() || null, descriptionAr: v.descriptionAr.trim() || null,
    };
    const editing = this.editing();
    this.saving.set(true);
    const call = editing?.id != null ? this.api.updateProject(editing.id, body) : this.api.createProject(body);
    call.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.closeForm();
        this.items.update((l) => (editing ? l.map((x) => (x.id === saved.id ? saved : x)) : [...l, saved]));
        this.toast.ok(editing ? 'Project updated' : 'Project added', `“${saved.name}” is saved.`);
      },
      error: () => { this.saving.set(false); this.toast.bad('Couldn’t save project', 'Nothing was changed. Please try again.'); },
    });
  }

  protected askDelete(p: Project): void {
    this.toDelete.set(p);
    this.delDialog()?.nativeElement.showModal();
  }

  protected cancelDelete(): void {
    this.toDelete.set(null);
    this.delDialog()?.nativeElement.close();
  }

  protected confirmDelete(): void {
    const p = this.toDelete();
    this.cancelDelete();
    if (!p || p.id == null) return;
    this.api.deleteProject(p.id).subscribe({
      next: () => { this.items.update((l) => l.filter((x) => x.id !== p.id)); this.toast.ok('Project deleted', `“${p.name}” was removed.`); },
      error: () => this.toast.bad('Couldn’t delete project', 'Please try again.'),
    });
  }

  /** Fills an empty database with the six starter demos from the original design. */
  protected importDefaults(): void {
    this.loading.set(true);
    forkJoin(DEFAULT_PROJECTS.map((p) => this.api.createProject(p))).subscribe({
      next: (created) => { this.items.set(created); this.loading.set(false); this.toast.ok('Starter projects imported'); },
      error: () => { this.loading.set(false); this.toast.bad('Import failed', 'Some projects may not have been created.'); this.reload(); },
    });
  }
}
