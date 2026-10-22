import { Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PREVIEWS } from '../../../core/data/previews';
import { Project } from '../../../core/models/project.model';

/**
 * Browser-window mock showing a demo site. Uses the uploaded screenshot when there is one, otherwise a built-in
 * illustrated preview picked by `previewKey`.
 *
 * SECURITY: the illustrated previews are static HTML written in core/data/previews.ts and are the ONLY strings
 * trusted as HTML here. Anything that comes from the API (name, url, image) is bound as text / src and never as HTML.
 */
@Component({
  selector: 'app-project-preview',
  templateUrl: './project-preview.html',
  styleUrl: './project-preview.css',
  encapsulation: ViewEncapsulation.None,
})
export class ProjectPreview {
  private readonly sanitizer = inject(DomSanitizer);

  readonly project = input.required<Project>();

  protected readonly host = computed(() => this.project().url.replace(/^https?:\/\//, ''));

  protected readonly image = computed(() => {
    const img = this.project().image;
    // only allow image data URLs or http(s) URLs
    return img && /^(data:image\/|https?:\/\/)/i.test(img) ? img : null;
  });

  protected readonly illustration = computed<SafeHtml | null>(() => {
    const key = this.project().previewKey;
    const html = key ? PREVIEWS[key] : undefined;
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : null;
  });
}
