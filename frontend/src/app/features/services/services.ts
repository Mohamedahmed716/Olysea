import { Component, inject, signal } from '@angular/core';
import { DEFAULT_SERVICES } from '../../core/data/defaults';
import { Service } from '../../core/models/service.model';
import { Api } from '../../core/services/api';
import { I18n } from '../../core/services/i18n';
import { Loading } from '../../shared/components/loading/loading';
import { Reveal } from '../../shared/directives/reveal';

@Component({
  selector: 'app-services',
  imports: [Loading, Reveal],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services {
  protected readonly i18n = inject(I18n);
  private readonly api = inject(Api);

  protected readonly items = signal<Service[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.api.getServices().subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      // backend not reachable (e.g. design work without the server): show the starter content
      error: () => {
        this.items.set(DEFAULT_SERVICES);
        this.loading.set(false);
      },
    });
  }
}
