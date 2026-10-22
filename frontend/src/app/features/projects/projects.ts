import { Component, ElementRef, HostListener, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DEFAULT_PROJECTS } from '../../core/data/defaults';
import { Project } from '../../core/models/project.model';
import { Api } from '../../core/services/api';
import { I18n } from '../../core/services/i18n';
import { Toast } from '../../core/services/toast';
import { URL_PATTERN, fileToJpegDataUrl } from '../../core/utils/image';
import { Loading } from '../../shared/components/loading/loading';
import { ProjectPreview } from '../../shared/components/project-preview/project-preview';

const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The "Demos" carousel. With `[editable]="true"` (used by the signed-in live editor) every card gets a delete
 * button and a final "Add new project" card opens a dialog — the behaviour of the original olysea-admin.html.
 */
@Component({
  selector: 'app-projects',
  imports: [ReactiveFormsModule, Loading, ProjectPreview],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects {
  readonly editable = input(false);

  protected readonly i18n = inject(I18n);
  private readonly api = inject(Api);
  private readonly toast = inject(Toast);
  private readonly fb = inject(FormBuilder).nonNullable;

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private readonly addDialog = viewChild<ElementRef<HTMLDialogElement>>('addDialog');
  private readonly delDialog = viewChild<ElementRef<HTMLDialogElement>>('delDialog');

  protected readonly colors = ['#ff9ecb', '#8ecbff', '#c4b0ff', '#9aa9ff', '#ffd1e8', '#b9e3ff'];
  protected readonly items = signal<Project[]>([]);
  protected readonly loading = signal(true);
  protected readonly idx = signal(0);
  protected readonly total = computed(() => this.items().length + (this.editable() ? 1 : 0));
  protected readonly counter = computed(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const n = this.items().length;
    return this.idx() < n ? `${pad(this.idx() + 1)} / ${pad(n)}` : `NEW / ${pad(n)}`;
  });
  protected readonly progress = computed(() => ((this.idx() + 1) / Math.max(1, this.total())) * 100);

  // ---- add / delete state ----
  protected readonly form = this.fb.group({ category: '', name: '', description: '', url: '', categoryAr: '', descriptionAr: '' });
  protected readonly errors = signal<Record<string, string>>({});
  protected readonly imageData = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly toDelete = signal<Project | null>(null);

  constructor() {
    this.load();
    // after every data / language / mode change, re-centre the carousel on the active card
    effect(() => {
      this.items();
      this.i18n.lang();
      this.editable();
      setTimeout(() => this.init());
    });
  }

  private load(): void {
    this.api.getProjects().subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: () => {
        if (this.editable()) this.toast.bad('Could not load projects', 'Check that the server is running.');
        else this.items.set(DEFAULT_PROJECTS);
        this.loading.set(false);
      },
    });
  }

  // ---------------- carousel mechanics (direction agnostic: works in LTR and RTL) ----------------
  private cards(): HTMLElement[] {
    return Array.from(this.track()?.nativeElement.querySelectorAll<HTMLElement>('.card') ?? []);
  }

  private init(): void {
    const cards = this.cards();
    if (!cards.length) return;
    this.centerOn(cards[Math.min(this.idx(), cards.length - 1)], true);
    this.update();
  }

  private centerOn(el: HTMLElement, instant = false): void {
    const tr = this.track()?.nativeElement;
    if (!tr) return;
    const r = el.getBoundingClientRect();
    const t = tr.getBoundingClientRect();
    const d = r.left + r.width / 2 - (t.left + t.width / 2);
    if (instant) {
      tr.style.scrollBehavior = 'auto';
      tr.scrollLeft += d;
      tr.style.scrollBehavior = '';
    } else {
      tr.scrollBy({ left: d, behavior: REDUCED ? 'auto' : 'smooth' });
    }
  }

  protected update(): void {
    const tr = this.track()?.nativeElement;
    const cards = this.cards();
    if (!tr || !cards.length) return;
    const t = tr.getBoundingClientRect();
    const c = t.left + t.width / 2;
    let best = 0;
    let bd = Infinity;
    cards.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - c);
      if (d < bd) { bd = d; best = i; }
    });
    this.idx.set(best);
  }

  protected go(i: number): void {
    const cards = this.cards();
    if (!cards.length) return;
    this.centerOn(cards[Math.max(0, Math.min(cards.length - 1, i))]);
  }

  protected onScroll(): void {
    requestAnimationFrame(() => this.update());
  }

  @HostListener('window:resize')
  onResize(): void {
    this.update();
  }

  // mouse drag (touch uses native swipe)
  private down = false;
  private startX = 0;
  private startLeft = 0;
  protected moved = false;
  protected dragging = signal(false);

  protected onDown(e: PointerEvent): void {
    if (e.pointerType !== 'mouse') return;
    this.down = true;
    this.moved = false;
    this.startX = e.clientX;
    this.startLeft = this.track()?.nativeElement.scrollLeft ?? 0;
  }

  @HostListener('window:pointermove', ['$event'])
  onMove(e: PointerEvent): void {
    if (!this.down) return;
    const dx = e.clientX - this.startX;
    if (Math.abs(dx) > 5) { this.moved = true; this.dragging.set(true); }
    const tr = this.track()?.nativeElement;
    if (tr) tr.scrollLeft = this.startLeft - dx;
  }

  @HostListener('window:pointerup')
  @HostListener('window:pointercancel')
  onUp(): void {
    if (!this.down) return;
    this.down = false;
    this.dragging.set(false);
    if (this.moved) this.go(this.idx());
  }

  protected onTrackClick(e: Event): void {
    if (this.moved) { e.preventDefault(); this.moved = false; }
  }

  // ---------------- editing (admin) ----------------
  protected openAdd(): void {
    this.form.reset();
    this.errors.set({});
    this.imageData.set(null);
    this.addDialog()?.nativeElement.showModal();
  }

  protected closeAdd(): void {
    this.addDialog()?.nativeElement.close();
  }

  protected async onFile(e: Event): Promise<void> {
    const file = (e.target as HTMLInputElement).files?.[0];
    this.imageData.set(null);
    this.setError('image', '');
    if (!file) return;
    try {
      this.imageData.set(await fileToJpegDataUrl(file));
    } catch (err) {
      this.setError('image', err instanceof Error ? err.message : 'Could not use that image.');
    }
  }

  private setError(key: string, msg: string): void {
    this.errors.update((e) => ({ ...e, [key]: msg }));
  }

  protected submitAdd(): void {
    if (this.saving()) return;
    const v = this.form.getRawValue();
    const errs: Record<string, string> = {};
    if (!v.category.trim()) errs['category'] = 'Enter a category.';
    if (!v.name.trim()) errs['name'] = 'Enter a project name.';
    if (v.description.trim().length < 10) errs['description'] = 'Write a short description (at least 10 characters).';
    if (!URL_PATTERN.test(v.url.trim())) errs['url'] = 'Enter a full link starting with https://';
    if (!this.imageData()) errs['image'] = 'Add a photo of the demo.';
    this.errors.set(errs);
    if (Object.keys(errs).length) return;

    this.saving.set(true);
    this.api
      .createProject({
        category: v.category.trim(),
        name: v.name.trim(),
        description: v.description.trim(),
        url: v.url.trim(),
        image: this.imageData(),
        previewKey: null,
        categoryAr: v.categoryAr.trim() || null,
        descriptionAr: v.descriptionAr.trim() || null,
      })
      .subscribe({
        next: (created) => {
          this.saving.set(false);
          this.closeAdd();
          this.items.update((l) => [...l, created]);
          this.idx.set(this.items().length - 1);
          this.toast.ok('Project added', `“${created.name}” is now on the website.`);
        },
        error: () => {
          this.saving.set(false);
          this.toast.bad('Couldn’t add project', 'Something went wrong, so nothing was saved. Please try again.');
        },
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
    this.delDialog()?.nativeElement.close();
    this.toDelete.set(null);
    if (!p || p.id == null) return;
    this.api.deleteProject(p.id).subscribe({
      next: () => {
        this.items.update((l) => l.filter((x) => x.id !== p.id));
        this.idx.update((i) => Math.min(i, this.items().length));
        this.toast.ok('Project deleted', `“${p.name}” was removed from the website.`);
      },
      error: () => this.toast.bad('Couldn’t delete project', `Something went wrong, so “${p.name}” was not removed. Please try again.`),
    });
  }
}
