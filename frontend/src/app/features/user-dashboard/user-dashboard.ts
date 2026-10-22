import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { Projects } from '../projects/projects';

/**
 * Live-site editor for signed-in admins: the public Demos carousel with delete (✕) buttons and an
 * "Add new project" card, i.e. the olysea-admin.html experience, saved to the backend.
 */
@Component({
  selector: 'app-user-dashboard',
  imports: [RouterLink, Projects],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard {
  protected readonly auth = inject(Auth);
}
