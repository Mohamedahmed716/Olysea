import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CONTACT_TYPES } from '../../core/models/contact-request.model';
import { SITE } from '../../core/data/defaults';
import { Api } from '../../core/services/api';
import { I18n } from '../../core/services/i18n';
import { Toast } from '../../core/services/toast';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  protected readonly i18n = inject(I18n);
  private readonly toast = inject(Toast);
  private readonly api = inject(Api);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly site = SITE;
  protected readonly types = CONTACT_TYPES;
  protected readonly typeDropdownOpen = signal(false);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)]],
    business: [''],
    type: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
    website: [''], // honeypot, real visitors never see or fill this
  });

  protected readonly sending = signal(false);
  /** translation key of the status banner, so it re-translates when the language flips */
  protected readonly statusKey = signal<string | null>(null);
  protected readonly statusOk = signal(false);
  private readonly submitted = signal(false);

  protected readonly status = computed(() => (this.statusKey() ? this.i18n.t(this.statusKey()!) : ''));

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

  /** Error key for a field once it was touched (or after a submit attempt). */
  protected error(field: 'name' | 'email' | 'type' | 'message'): string {
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
    if (v.website) return; // bot

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
