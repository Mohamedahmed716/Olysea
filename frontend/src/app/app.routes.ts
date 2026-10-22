import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // ---- public site (single scrolling page) ----
  { path: '', title: 'Olysea — Independent Digital Solutions Platform', loadComponent: () => import('./features/home/home').then((m) => m.Home) },

  // ---- signed-in admin: live-site editor ----
  { path: 'dashboard', title: 'Live editor — Olysea', canActivate: [authGuard], loadComponent: () => import('./features/user-dashboard/user-dashboard').then((m) => m.UserDashboard) },

  // ---- admin ----
  { path: 'admin/login', title: 'Admin sign in — Olysea', loadComponent: () => import('./features/admin/login/login').then((m) => m.Login) },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', title: 'Overview — Olysea admin', loadComponent: () => import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'contacts', title: 'Messages — Olysea admin', loadComponent: () => import('./features/admin/contacts/contacts').then((m) => m.Contacts) },
      { path: 'services', title: 'Services — Olysea admin', loadComponent: () => import('./features/admin/services/services').then((m) => m.AdminServices) },
      { path: 'projects', title: 'Projects — Olysea admin', loadComponent: () => import('./features/admin/projects/projects').then((m) => m.AdminProjects) },
    ],
  },

  { path: '**', redirectTo: '' },
];
