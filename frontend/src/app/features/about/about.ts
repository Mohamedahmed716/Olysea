import { Component, DestroyRef, ElementRef, HostListener, computed, inject, signal, viewChild } from '@angular/core';
import { I18n } from '../../core/services/i18n';
import { Reveal } from '../../shared/directives/reveal';

const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

@Component({
  selector: 'app-about',
  imports: [Reveal],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  protected readonly i18n = inject(I18n);
  private readonly destroyRef = inject(DestroyRef);
  private readonly lede = viewChild<ElementRef<HTMLElement>>('lede');

  protected readonly principles = [
    { n: 1, color: '#c4b0ff' },
    { n: 2, color: '#8ecbff' },
    { n: 3, color: '#9d8cff' },
    { n: 4, color: '#3a52ff' },
  ];
  protected readonly current = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  /** The lede is split into words that light up as the reader scrolls. */
  protected readonly words = computed(() => this.i18n.t('a.lede').trim().split(/\s+/));
  private readonly progress = signal(REDUCED ? 1 : 0);
  protected readonly lit = computed(() => Math.round(this.progress() * this.words().length));

  constructor() {
    if (!REDUCED) {
      this.timer = setInterval(() => this.current.update((c) => (c + 1) % 4), 4200);
      this.destroyRef.onDestroy(() => clearInterval(this.timer));
    }
    setTimeout(() => this.onScroll());
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScroll(): void {
    const el = this.lede()?.nativeElement;
    if (!el || REDUCED) return;
    const r = el.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.25)));
    this.progress.set(p);
  }

  protected select(i: number): void {
    clearInterval(this.timer);
    this.current.set(i);
  }
}
