import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Lang, MARQUEE, ProcessStep, STEPS, SWAP, TX } from '../data/translations';

const KEY = 'olysea-lang';

/** English / Arabic (RTL) switching, mirrors the language engine of the original olysea.html. */
@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly doc = inject(DOCUMENT);
  private fontLoaded = false;

  readonly lang = signal<Lang>(this.read());
  readonly isAr = computed(() => this.lang() === 'ar');

  constructor() {
    effect(() => {
      const l = this.lang();
      const root = this.doc.documentElement;
      root.lang = l;
      root.dir = l === 'ar' ? 'rtl' : 'ltr';
      if (l === 'ar' && !this.fontLoaded) {
        this.fontLoaded = true;
        const link = this.doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;700;800&display=swap';
        this.doc.head.appendChild(link);
      }
      try {
        localStorage.setItem(KEY, l);
      } catch {
        /* storage can be blocked; the language still works for this visit */
      }
    });
  }

  /** Translate a key; falls back to English, then to the key itself. */
  t(key: string): string {
    return TX[this.lang()][key] ?? TX.en[key] ?? key;
  }

  /** Pick the Arabic value when the site is in Arabic and one exists. */
  pick(en: string | null | undefined, ar?: string | null): string {
    const base = en ?? '';
    return this.isAr() && ar ? ar : base;
  }

  swapWords(): string[] {
    return SWAP[this.lang()];
  }

  marquee(): string[] {
    return MARQUEE[this.lang()];
  }

  steps(): ProcessStep[] {
    return STEPS[this.lang()];
  }

  toggle(): void {
    this.lang.set(this.lang() === 'ar' ? 'en' : 'ar');
  }

  private read(): Lang {
    try {
      return localStorage.getItem(KEY) === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  }
}
