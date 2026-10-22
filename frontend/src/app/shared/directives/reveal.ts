import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';

/** Fades/slides an element in the first time it scrolls into view (the `.rv` effect of the original site). */
@Directive({ selector: '[appReveal]', host: { class: 'rv' } })
export class Reveal implements OnInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private io?: IntersectionObserver;

  ngOnInit(): void {
    const node = this.el.nativeElement;
    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('in');
      return;
    }
    this.io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            node.classList.add('in');
            this.io?.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    this.io.observe(node);
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }
}
