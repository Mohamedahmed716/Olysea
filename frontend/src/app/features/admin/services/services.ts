import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DEFAULT_SERVICES } from '../../../core/data/defaults';
import { Service } from '../../../core/models/service.model';
import { Api } from '../../../core/services/api';
import { Toast } from '../../../core/services/toast';
import { Loading } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-admin-services',
  imports: [ReactiveFormsModule, Loading],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class AdminServices {
  private readonly api = inject(Api);
  private readonly toast = inject(Toast);
  private readonly fb = inject(FormBuilder).nonNullable;

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  private readonly delDialog = viewChild<ElementRef<HTMLDialogElement>>('delDialog');

  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly items = signal<Service[]>([]);
  protected readonly editing = signal<Service | null>(null);
  protected readonly toDelete = signal<Service | null>(null);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.group({
    title: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    extra: '',
    titleAr: '',
    descriptionAr: '',
    extraAr: '',
  });

  constructor() {
    this.reload();
  }

  private reload(): void {
    this.loading.set(true);
    this.api.adminServices().subscribe({
      next: (l) => { this.items.set(l); this.failed.set(false); this.loading.set(false); },
      error: () => { this.failed.set(true); this.loading.set(false); },
    });
  }

  protected invalid(name: 'title' | 'description'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  protected openForm(s: Service | null): void {
    this.editing.set(s);
    this.submitted.set(false);
    this.form.reset({
      title: s?.title ?? '', description: s?.description ?? '', extra: s?.extra ?? '',
      titleAr: s?.titleAr ?? '', descriptionAr: s?.descriptionAr ?? '', extraAr: s?.extraAr ?? '',
    });
    this.dialog()?.nativeElement.showModal();
  }

  protected closeForm(): void {
    this.dialog()?.nativeElement.close();
  }

  protected save(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const body = {
      title: v.title.trim(), description: v.description.trim(), extra: v.extra.trim() || null,
      titleAr: v.titleAr.trim() || null, descriptionAr: v.descriptionAr.trim() || null, extraAr: v.extraAr.trim() || null,
    };
    const editing = this.editing();
    this.saving.set(true);
    const call = editing?.id != null ? this.api.updateService(editing.id, body) : this.api.createService(body);
    call.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.closeForm();
        this.items.update((l) => (editing ? l.map((x) => (x.id === saved.id ? saved : x)) : [...l, saved]));
        this.toast.ok(editing ? 'Service updated' : 'Service added', `“${saved.title}” is saved.`);
      },
      error: () => { this.saving.set(false); this.toast.bad('Couldn’t save service', 'Nothing was changed. Please try again.'); },
    });
  }

  protected askDelete(s: Service): void {
    this.toDelete.set(s);
    this.delDialog()?.nativeElement.showModal();
  }

  protected cancelDelete(): void {
    this.toDelete.set(null);
    this.delDialog()?.nativeElement.close();
  }

  protected confirmDelete(): void {
    const s = this.toDelete();
    this.cancelDelete();
    if (!s || s.id == null) return;
    this.api.deleteService(s.id).subscribe({
      next: () => { this.items.update((l) => l.filter((x) => x.id !== s.id)); this.toast.ok('Service deleted', `“${s.title}” was removed.`); },
      error: () => this.toast.bad('Couldn’t delete service', 'Please try again.'),
    });
  }

  /** Fills an empty database with the five starter services from the original design. */
  protected importDefaults(): void {
    this.loading.set(true);
    forkJoin(DEFAULT_SERVICES.map((s) => this.api.createService(s))).subscribe({
      next: (created) => { this.items.set(created); this.loading.set(false); this.toast.ok('Starter services imported'); },
      error: () => { this.loading.set(false); this.toast.bad('Import failed', 'Some services may not have been created.'); this.reload(); },
    });
  }
}
