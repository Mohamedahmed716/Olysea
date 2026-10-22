import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { I18n } from '../../../core/services/i18n';

const SECTIONS = ['home', 'about', 'services', 'demos', 'contact'];

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly i18n = inject(I18n);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly open = signal(false);
  protected readonly small = signal(false);
  protected readonly activeSection = signal('home');

  @HostListener('window:scroll')
  onScroll(): void {
    this.small.set(window.scrollY > 60);
    this.updateActiveSection();
  }

  private updateActiveSection(): void {
    const offset = 120;
    let current = 'home';
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= offset) {
        current = id;
      }
    }
    this.activeSection.set(current);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(e.target as Node)) this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected close(target?: string, event?: Event): void {
    this.open.set(false);
    if (target === 'home' && event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', ' ');
    }
  }
}
