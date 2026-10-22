import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../../core/data/defaults';
import { I18n } from '../../../core/services/i18n';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly i18n = inject(I18n);
  protected readonly site = SITE;
  protected readonly year = new Date().getFullYear();
}
