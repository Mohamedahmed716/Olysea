import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ContactRequest } from '../../../core/models/contact-request.model';
import { Api } from '../../../core/services/api';
import { Loading } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, DatePipe, Loading],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly api = inject(Api);

  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly contacts = signal<ContactRequest[]>([]);
  protected readonly serviceCount = signal(0);
  protected readonly projectCount = signal(0);

  protected readonly newCount = computed(() => this.contacts().filter((c) => (c.status ?? 'NEW') === 'NEW').length);
  protected readonly recent = computed(() =>
    [...this.contacts()].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')).slice(0, 3),
  );

  constructor() {
    forkJoin({
      contacts: this.api.adminContacts(),
      services: this.api.adminServices(),
      projects: this.api.adminProjects(),
    }).subscribe({
      next: (r) => {
        this.contacts.set(r.contacts);
        this.serviceCount.set(r.services.length);
        this.projectCount.set(r.projects.length);
        this.loading.set(false);
      },
      error: () => {
        this.failed.set(true);
        this.loading.set(false);
      },
    });
  }
}
