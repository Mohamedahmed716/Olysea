import { Component, computed, inject, afterNextRender } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { Toast } from './core/services/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  readonly toast = inject(Toast);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: '/' }
  );

  // Hides public header/footer on /admin routes, shows them everywhere else
  readonly showChrome = computed(() => {
    const url = this.currentUrl() || '/';
    return !url.startsWith('/admin');
  });

  constructor() {
    afterNextRender(() => {
      this.initScrollReveal();
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(() => {
          setTimeout(() => this.observeRevealElements(), 50);
        });
    });
  }

  private observer?: IntersectionObserver;

  private initScrollReveal(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }
    document.documentElement.classList.add('js-rv');
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    this.observeRevealElements();
  }

  private observeRevealElements(): void {
    if (!this.observer) return;
    document.querySelectorAll('.rv:not(.in)').forEach((el) => {
      this.observer!.observe(el);
    });
  }
}
