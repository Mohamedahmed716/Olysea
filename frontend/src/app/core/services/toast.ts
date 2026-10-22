import { Injectable, signal } from '@angular/core';

export interface ToastItem {
  id: number;
  kind: 'ok' | 'bad';
  title: string;
  message: string;
  leaving?: boolean;
}

@Injectable({ providedIn: 'root' })
export class Toast {
  readonly items = signal<ToastItem[]>([]);
  private next = 1;

  ok(title: string, message = ''): void {
    this.push('ok', title, message, 4200);
  }

  bad(title: string, message = ''): void {
    this.push('bad', title, message, 7000);
  }

  dismiss(id: number): void {
    // Mark as leaving to trigger the rocket fly-out animation
    const current = this.items().find((t) => t.id === id);
    if (!current || current.leaving) return;

    this.items.update((l) =>
      l.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    );

    // Remove from DOM after the smooth rocket animation finishes (600ms)
    setTimeout(() => {
      this.items.update((l) => l.filter((t) => t.id !== id));
    }, 600);
  }

  private push(kind: 'ok' | 'bad', title: string, message: string, ms: number): void {
    const id = this.next++;
    this.items.update((l) => [...l, { id, kind, title, message, leaving: false }]);
    setTimeout(() => this.dismiss(id), ms);
  }
}
