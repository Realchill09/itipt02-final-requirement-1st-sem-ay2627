import type { Routes } from '@angular/router';

import { authGuard } from './guards/guards.page';

// Map application URLs to their pages and access requirements.
export const routes: Routes = [
  // Login
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.Login),
  },

  // Registration
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then((m) => m.Register),
  },

  // Home - logged-in users only
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },

  // Recipe Details - logged-in users only
  {
    path: 'recipe-details/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./recipe-details/recipe-details.page').then((m) => m.RecipeDetailsPage),
  },

  // Profile - logged-in users only
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./profile/profile.page').then((m) => m.ProfilePage),
  },

  // Collections - logged-in users only
  {
    path: 'collections',
    canActivate: [authGuard],
    loadComponent: () => import('./collections/collections.page').then((m) => m.CollectionsPage),
  },

  // Admin Dashboard - admin only
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { adminOnly: true },
    loadComponent: () => import('./admin/admin.page').then((m) => m.Admin),
  },

  // Default route
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  // Unknown routes
  {
    path: '**',
    redirectTo: 'login',
  },
];
