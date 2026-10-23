import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { CONTACT_STATUSES, ContactRequest, ContactStatus } from '../../../core/models/contact-request.model';
import { Api } from '../../../core/services/api';
import { Toast } from '../../../core/services/toast';
import { Loading } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-admin-contacts',
  imports: [DatePipe, Loading],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css',
})
export class Contacts {
  private readonly api = inject(Api);
  private readonly toast = inject(Toast);

  protected readonly statuses = CONTACT_STATUSES;
  protected readonly tabs: { value: ContactStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All' },
    ...CONTACT_STATUSES.map((s) => ({ value: s, label: s.charAt(0) + s.slice(1).toLowerCase() })),
  ];
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly items = signal<ContactRequest[]>([]);
  protected readonly filter = signal<ContactStatus | 'ALL'>('ALL');
  protected readonly open = signal<number | null>(null);
  protected readonly pendingDelete = signal<ContactRequest | null>(null);

  protected readonly shown = computed(() => {
    const f = this.filter();
    return [...this.items()]
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
      .filter((c) => f === 'ALL' || (c.status ?? 'NEW') === f);
  });

  constructor() {
    this.api.adminContacts().subscribe({
      next: (list) => { this.items.set(list); this.loading.set(false); },
      error: () => { this.failed.set(true); this.loading.set(false); },
    });
  }

  protected count(s: ContactStatus | 'ALL'): number {
    return s === 'ALL' ? this.items().length : this.items().filter((c) => (c.status ?? 'NEW') === s).length;
  }

  protected toggle(c: ContactRequest): void {
    const isOpen = this.open() === c.id;
    this.open.set(isOpen ? null : (c.id ?? null));
    // opening a new message marks it as read
    if (!isOpen && (c.status ?? 'NEW') === 'NEW') this.setStatus(c, 'READ', true);
  }

  protected setStatus(c: ContactRequest, status: ContactStatus, silent = false): void {
    if (c.id == null) return;
    this.api.setContactStatus(c.id, status).subscribe({
      next: () => {
        this.items.update((l) => l.map((x) => (x.id === c.id ? { ...x, status } : x)));
        if (!silent) this.toast.ok('Status updated', `Marked as ${status.toLowerCase()}.`);
      },
      error: () => this.toast.bad('Couldn’t update status', 'Please try again.'),
    });
  }

  protected reply(c: ContactRequest): string {
    const safeEmail = encodeURIComponent(c.email || '').replace(/%40/g, '@');
    const safeType = encodeURIComponent(c.type || 'General');
    return 'mailto:' + safeEmail + '?subject=' + encodeURIComponent('Re: your Olysea enquiry (' + safeType + ')');
  }

  protected remove(): void {
    const c = this.pendingDelete();
    this.pendingDelete.set(null);
    if (!c || c.id == null) return;
    this.api.deleteContact(c.id).subscribe({
      next: () => {
        this.items.update((l) => l.filter((x) => x.id !== c.id));
        this.toast.ok('Message deleted');
      },
      error: () => this.toast.bad('Couldn’t delete message', 'Please try again.'),
    });
  }
}
