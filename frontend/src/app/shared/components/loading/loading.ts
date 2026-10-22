import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class Loading {
  readonly label = input('Loading…');
  /** Use on dark backgrounds (the demos section). */
  readonly light = input(false);
}
