import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DEFAULT_SERVICES } from '../../core/data/defaults';
import { SITE } from '../../core/data/defaults';
import { Api } from '../../core/services/api';
import { I18n } from '../../core/services/i18n';
import { Toast } from '../../core/services/toast';
import { Reveal } from '../../shared/directives/reveal';
import { Projects } from '../projects/projects';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CONTACT_TYPES } from '../../core/models/contact-request.model';
import { Loading } from '../../shared/components/loading/loading';
import { Service } from '../../core/models/service.model';

const REDUCED =
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;
const STEP_MS = 6000;

@Component({
  selector: 'app-home',
  imports: [Reveal, Projects, ReactiveFormsModule, Loading],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly i18n = inject(I18n);
  private readonly toast = inject(Toast);
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(Api);
  private readonly fb = inject(FormBuilder).nonNullable;

  // ---- hero: rotating word ----
  private readonly swapIndex = signal(0);
  protected readonly swapOut = signal(false);
  protected readonly swapPre = signal(false);
  protected readonly swapWord = computed(() => {
    const w = this.i18n.swapWords();
    return w[this.swapIndex() % w.length];
  });

  // ---- hero: parallax + fake card ----
  protected readonly mx = signal(0);
  protected readonly my = signal(0);
  private readonly tick = signal(0);
  protected readonly chips = computed(() =>
    [0, 1, 2].map((i) => Math.max(0, Math.min(3, this.tick() - i * 2)))
  );
  protected readonly progress = computed(
    () => (this.chips().reduce((a, c) => a + c, 0) / 9) * 100
  );
  protected readonly rows = ['ui.r1', 'ui.r2', 'ui.r3'];

  // ---- about: principles ----
  protected readonly principles = [
    { n: 1, color: '#c4b0ff' },
    { n: 2, color: '#8ecbff' },
    { n: 3, color: '#9d8cff' },
    { n: 4, color: '#3a52ff' },
  ];
  protected readonly currentPrinciple = signal(0);
  private principleTimer?: ReturnType<typeof setInterval>;

  // ---- about: lede scroll reveal ----
  private readonly ledeRef = viewChild<ElementRef<HTMLElement>>('ledeRef');
  protected readonly ledeWords = computed(() =>
    this.i18n.t('a.lede').trim().split(/\s+/)
  );
  private readonly ledeProgress = signal(REDUCED ? 1 : 0);
  protected readonly ledeLit = computed(() =>
    Math.round(this.ledeProgress() * this.ledeWords().length)
  );

  // ---- services ----
  protected readonly services = signal<Service[]>([]);
  protected readonly servicesLoading = signal(true);

  // ---- process tabs ----
  protected readonly step = signal(0);
  protected readonly steps = computed(() => this.i18n.steps());
  protected readonly current = computed(() => this.steps()[this.step()]);
  protected readonly stepDur = STEP_MS + 'ms';
  protected readonly isStepsPaused = signal(false);
  private stepTimer?: ReturnType<typeof setTimeout>;
  private stepStartedAt = 0;
  private remainingMs = STEP_MS;

  protected readonly why = [1, 2, 3, 4];

  // ---- contact form ----
  protected readonly site = SITE;
  protected readonly types = CONTACT_TYPES;
  protected readonly typeDropdownOpen = signal(false);
  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/\S/)]],
    email: [
      '',
      [Validators.required, Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)],
    ],
    business: [''],
    type: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
    website: [''],
  });
  protected readonly sending = signal(false);
  protected readonly statusKey = signal<string | null>(null);
  protected readonly statusOk = signal(false);
  private readonly submitted = signal(false);
  protected readonly status = computed(() =>
    this.statusKey() ? this.i18n.t(this.statusKey()!) : ''
  );

  protected readonly selectedType = signal<string>('');
  protected readonly selectedTypeLabel = computed(() => {
    const currentVal = this.selectedType();
    if (!currentVal) return '';
    const match = this.types.find((t) => t.value === currentVal);
    return match ? this.i18n.t(match.key) : currentVal;
  });

  protected toggleTypeDropdown(): void {
    this.typeDropdownOpen.update((v) => !v);
  }

  protected selectType(value: string): void {
    this.selectedType.set(value);
    this.form.controls.type.setValue(value);
    this.form.controls.type.markAsTouched();
    this.typeDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    const target = e.target as HTMLElement | null;
    if (this.typeDropdownOpen() && target && !target.closest('.custom-select-wrap')) {
      this.typeDropdownOpen.set(false);
    }
  }

  constructor() {
    // fetch services
    this.api.getServices().subscribe({
      next: (list) => {
        this.services.set(list);
        this.servicesLoading.set(false);
      },
      error: () => {
        this.services.set(DEFAULT_SERVICES);
        this.servicesLoading.set(false);
      },
    });

    if (!REDUCED) {
      const a = setInterval(() => this.rotateWord(), 2300);
      const b = setInterval(() => this.tick.update((t) => (t + 1) % 10), 1500);
      this.principleTimer = setInterval(
        () => this.currentPrinciple.update((c) => (c + 1) % 4),
        4200
      );
      this.queueStep();
      this.destroyRef.onDestroy(() => {
        clearInterval(a);
        clearInterval(b);
        clearInterval(this.principleTimer);
        clearTimeout(this.stepTimer);
      });
    }

    afterNextRender({
      read: () => this.updateLedeProgress(),
    });
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  updateLedeProgress(): void {
    const el = this.ledeRef()?.nativeElement;
    if (!el || REDUCED) return;
    const r = el.getBoundingClientRect();
    const p = Math.max(
      0,
      Math.min(
        1,
        (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.25)
      )
    );
    this.ledeProgress.set(p);
  }

  // ---- hero word rotation ----
  private rotateWord(): void {
    this.swapOut.set(true);
    setTimeout(() => {
      this.swapIndex.update((i) => i + 1);
      this.swapOut.set(false);
      this.swapPre.set(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => this.swapPre.set(false))
      );
    }, 360);
  }

  protected onPointer(e: PointerEvent, el: HTMLElement): void {
    if (e.pointerType !== 'mouse' || REDUCED) return;
    const r = el.getBoundingClientRect();
    this.mx.set(+((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    this.my.set(+((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  }

  // ---- about principles ----
  protected selectPrinciple(i: number): void {
    clearInterval(this.principleTimer);
    this.currentPrinciple.set(i);
  }

  // ---- process ----
  protected selectStep(i: number): void {
    this.step.set(i);
    this.remainingMs = STEP_MS;
    this.queueStep();
  }

  protected pauseSteps(p: boolean): void {
    if (this.isStepsPaused() === p) return;
    this.isStepsPaused.set(p);

    if (p) {
      // Freezing timer: record elapsed time and cancel scheduled tick
      clearTimeout(this.stepTimer);
      const elapsed = Date.now() - this.stepStartedAt;
      this.remainingMs = Math.max(200, this.remainingMs - elapsed);
    } else {
      // Unfreezing: resume the remainder of the interval
      this.queueStep(this.remainingMs);
    }
  }

  protected onStepKey(e: KeyboardEvent, i: number): void {
    const rtl = this.i18n.isAr();
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    let n: number | null = null;
    if (e.key === fwd || e.key === 'ArrowDown') n = (i + 1) % 4;
    else if (e.key === back || e.key === 'ArrowUp') n = (i + 3) % 4;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = 3;
    if (n !== null) {
      e.preventDefault();
      this.selectStep(n);
      setTimeout(() => document.getElementById('t' + n)?.focus());
    }
  }

  private queueStep(delayMs = STEP_MS): void {
    clearTimeout(this.stepTimer);
    if (REDUCED || this.isStepsPaused()) return;
    this.stepStartedAt = Date.now();
    this.stepTimer = setTimeout(
      () => this.selectStep((this.step() + 1) % 4),
      delayMs
    );
  }

  // ---- contact ----
  protected error(
    field: 'name' | 'email' | 'type' | 'message'
  ): string {
    const c = this.form.controls[field];
    if (!c.invalid || !(c.touched || this.submitted())) return '';
    return 'err.' + (field === 'message' ? 'msg' : field);
  }

  protected submit(): void {
    this.submitted.set(true);
    this.statusKey.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    if (v.website) return;

    this.sending.set(true);
    this.api
      .sendContact({
        name: v.name.trim(),
        email: v.email.trim(),
        business: v.business.trim() || undefined,
        type: v.type,
        message: v.message.trim(),
        website: v.website,
      })
      .subscribe({
        next: () => {
          this.sending.set(false);
          this.form.reset();
          this.selectedType.set('');
          this.submitted.set(false);
          this.statusKey.set(null);
          this.toast.ok(this.i18n.t('m.ok'));
        },
        error: () => {
          this.sending.set(false);
          this.show('m.err', false);
          this.toast.bad(this.i18n.t('m.err'));
        },
      });
  }

  private show(key: string, ok: boolean): void {
    this.statusKey.set(key);
    this.statusOk.set(ok);
  }
}
