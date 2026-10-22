import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../../core/services/auth';

/** Admin layout: sidebar navigation + the routed admin page. */
@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  protected readonly auth = inject(Auth);
  protected readonly links = [
    { path: '/admin', label: 'Overview', exact: true },
    { path: '/admin/contacts', label: 'Messages', exact: false },
    { path: '/admin/services', label: 'Services', exact: false },
    { path: '/admin/projects', label: 'Projects', exact: false },
  ];
}
